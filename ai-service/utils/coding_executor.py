"""
coding_executor.py — Code Execution Engine
==========================================
Supports: Python, JavaScript (Node.js), Java, C#
Strategy: subprocess-based local execution with timeout + memory tracking.
Docker-based execution can be swapped in by replacing _run_subprocess.

Output comparison:
  - Try parse JSON → compare as normalized JSON (order-independent for objects)
  - Try parse as number → compare with epsilon tolerance
  - Fallback → strip + lowercase string comparison
"""

import subprocess
import tempfile
import os
import json
import time
import shutil
from typing import Optional
import httpx

# ─────────────────────────────────────────────
# Optional: psutil for real memory measurement
# ─────────────────────────────────────────────
try:
    import psutil
    _PSUTIL_AVAILABLE = True
except ImportError:
    _PSUTIL_AVAILABLE = False


TIMEOUT_SECONDS = 5.0  # per test case


# ═══════════════════════════════════════════════
# Output Normalization
# ═══════════════════════════════════════════════

def _normalize_output(raw: str) -> str:
    """
    Normalize execution output for comparison.
    Strategy (in order):
      1. Try parse as JSON → re-serialize with sorted keys, no extra spaces
      2. Try parse as number → canonical float string
      3. Fallback → strip whitespace, collapse internal newlines
    """
    s = raw.strip()
    if not s:
        return ""

    # 1. JSON parse attempt
    try:
        parsed = json.loads(s)
        # Re-serialize: sort_keys for dicts, compact separators
        return json.dumps(parsed, sort_keys=True, separators=(',', ':'), ensure_ascii=False)
    except (json.JSONDecodeError, ValueError):
        pass

    # 2. Numeric parse attempt
    try:
        f = float(s)
        # Integer-like floats: "9.0" == "9"
        if f == int(f) and '.' not in s:
            return str(int(f))
        return str(f)
    except (ValueError, OverflowError):
        pass

    # 3. String normalize: strip each line, join with \n
    lines = [line.strip() for line in s.splitlines()]
    return '\n'.join(line for line in lines if line != '')


def _outputs_match(actual: str, expected: str) -> bool:
    """Return True if normalized actual == normalized expected."""
    return _normalize_output(actual) == _normalize_output(expected)


# ═══════════════════════════════════════════════
# Memory measurement helper
# ═══════════════════════════════════════════════

def _get_peak_memory_mb(proc: subprocess.Popen) -> float:
    """
    Try to get peak memory (RSS) of a completed process via psutil.
    Returns 0.0 if psutil not available or process already gone.
    """
    if not _PSUTIL_AVAILABLE:
        return 0.0
    try:
        p = psutil.Process(proc.pid)
        mem = p.memory_info().rss / (1024 * 1024)
        return round(mem, 2)
    except (psutil.NoSuchProcess, psutil.AccessDenied):
        return 0.0


# ═══════════════════════════════════════════════
# Generic subprocess runner
# ═══════════════════════════════════════════════

def _run_subprocess(cmd: list[str], stdin_data: str, timeout: float) -> dict:
    """
    Run a command with stdin, capture stdout/stderr, measure time + memory.
    Returns: {stdout, stderr, returncode, elapsed_ms, memory_mb}
    """
    start = time.perf_counter()
    memory_mb = 0.0

    try:
        proc = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding='utf-8',
            errors='replace',
        )

        try:
            stdout, stderr = proc.communicate(input=stdin_data, timeout=timeout)
        except subprocess.TimeoutExpired:
            proc.kill()
            proc.communicate()
            elapsed = (time.perf_counter() - start) * 1000
            return {
                'stdout': '',
                'stderr': 'Time Limit Exceeded',
                'returncode': -1,
                'elapsed_ms': round(elapsed, 2),
                'memory_mb': 0.0,
                'timed_out': True,
            }

        # Try to get memory before process exits fully
        if _PSUTIL_AVAILABLE:
            try:
                p = psutil.Process(proc.pid)
                memory_mb = round(p.memory_info().rss / (1024 * 1024), 2)
            except Exception:
                memory_mb = 0.0

        elapsed = (time.perf_counter() - start) * 1000
        return {
            'stdout': stdout,
            'stderr': stderr,
            'returncode': proc.returncode,
            'elapsed_ms': round(elapsed, 2),
            'memory_mb': memory_mb,
            'timed_out': False,
        }

    except FileNotFoundError as e:
        elapsed = (time.perf_counter() - start) * 1000
        return {
            'stdout': '',
            'stderr': f'ExecutorNotFound: {e}',
            'returncode': -2,
            'elapsed_ms': round(elapsed, 2),
            'memory_mb': 0.0,
            'timed_out': False,
        }

PISTON_URL = "https://emkc.org/api/v2/piston/execute"
PISTON_LANGUAGE_MAP = {
    "python": "python",
    "javascript": "javascript",
    "java": "java",
}

async def _run_piston(language: str, code: str, stdin_data: str, timeout: float) -> dict:
    """
    Chạy code qua Piston API thay vì subprocess local.
    Trả về cùng format với _run_subprocess để không phải sửa code gọi.
    """
    piston_lang = PISTON_LANGUAGE_MAP.get(language.lower(), language.lower())
    start = time.perf_counter()

    try:
        async with httpx.AsyncClient(timeout=timeout + 5) as client:
            response = await client.post(PISTON_URL, json={
                "language": piston_lang,
                "version": "*",
                "files": [{"content": code}],
                "stdin": stdin_data,
            })
            response.raise_for_status()
            data = response.json()

        run_data = data.get("run", {})
        elapsed = (time.perf_counter() - start) * 1000

        return {
            "stdout": run_data.get("stdout", ""),
            "stderr": run_data.get("stderr", ""),
            "returncode": run_data.get("code", 0) or 0,
            "elapsed_ms": round(elapsed, 2),
            "memory_mb": 0.0,  # Piston không trả memory usage
            "timed_out": False,
        }
    except httpx.TimeoutException:
        elapsed = (time.perf_counter() - start) * 1000
        return {
            "stdout": "", "stderr": "Time Limit Exceeded", "returncode": -1,
            "elapsed_ms": round(elapsed, 2), "memory_mb": 0.0, "timed_out": True,
        }
    except Exception as e:
        elapsed = (time.perf_counter() - start) * 1000
        return {
            "stdout": "", "stderr": f"ExecutionError: {str(e)}", "returncode": -2,
            "elapsed_ms": round(elapsed, 2), "memory_mb": 0.0, "timed_out": False,
        }


# ═══════════════════════════════════════════════
# Result builder
# ═══════════════════════════════════════════════

def _build_result(idx: int, tc_input: str, tc_expected: str, run_result: dict) -> dict:
    """Build a standardized test case result dict from subprocess output."""
    if run_result['timed_out']:
        return {
            'testCaseIndex': idx + 1,
            'input': tc_input,
            'expectedOutput': tc_expected,
            'actualOutput': '',
            'status': 'Timeout',
            'passed': False,
            'executionTimeMs': run_result['elapsed_ms'],
            'memoryMb': 0.0,
        }

    stdout = run_result['stdout'].strip()
    stderr = run_result['stderr'].strip()
    returncode = run_result['returncode']

    if returncode != 0 or (stderr and not stdout):
        # Classify as compile error vs runtime error by inspecting stderr
        err_lower = stderr.lower()
        if any(k in err_lower for k in ['syntaxerror', 'nameerror at compile', 'compileerror',
                                          'error:', 'cannot find symbol', 'expected']):
            status = 'CompileError'
        else:
            status = 'RuntimeError'
        err_preview = stderr[:800] if stderr else f'Process exited with code {returncode}'
        return {
            'testCaseIndex': idx + 1,
            'input': tc_input,
            'expectedOutput': tc_expected,
            'actualOutput': err_preview,
            'status': status,
            'passed': False,
            'executionTimeMs': run_result['elapsed_ms'],
            'memoryMb': run_result['memory_mb'],
        }

    passed = _outputs_match(stdout, tc_expected)
    return {
        'testCaseIndex': idx + 1,
        'input': tc_input,
        'expectedOutput': tc_expected,
        'actualOutput': stdout,
        'status': 'Passed' if passed else 'WrongAnswer',
        'passed': passed,
        'executionTimeMs': run_result['elapsed_ms'],
        'memoryMb': run_result['memory_mb'],
    }


# ═══════════════════════════════════════════════
# Helper Signature parser and JSON comparer
# ═══════════════════════════════════════════════

import re
from collections import deque

def parse_java_signature(signature: str):
    if not signature:
        return None
    match = re.match(r'^([\w<>\[\]\s]+)\s+(\w+)\s*\((.*)\)$', signature.strip())
    if not match:
        return None
    return_type = match.group(1).strip()
    func_name = match.group(2).strip()
    params_str = match.group(3).strip()
    
    params = []
    if params_str:
        parts = []
        current = []
        depth = 0
        for char in params_str:
            if char == '<':
                depth += 1
            elif char == '>':
                depth -= 1
            if char == ',' and depth == 0:
                parts.append(''.join(current).strip())
                current = []
            else:
                current.append(char)
        if current:
            parts.append(''.join(current).strip())
            
        for part in parts:
            p_parts = part.rsplit(maxsplit=1)
            if len(p_parts) == 2:
                params.append({'type': p_parts[0].strip(), 'name': p_parts[1].strip()})
    return {
        'return_type': return_type,
        'func_name': func_name,
        'params': params
    }


def _is_int_token(token: str) -> bool:
    try:
        int(token)
        return True
    except Exception:
        return False


def _to_typed_value(token: str, val_type: str):
    t = val_type.strip().lower()
    if t in ('int', 'integer'):
        return int(token)
    if t in ('double', 'float'):
        return float(token)
    if t in ('boolean', 'bool'):
        return str(token).strip().lower() in ('true', '1', 'yes')
    # String / fallback
    return token


def _parse_text_args_with_signature(tc_input: str, sig_info: dict):
    """
    Parse non-JSON testcase input into function arguments by method signature.
    Supports common competitive format, e.g.:
      int[] nums, int target  <= "3 3 2 4 6"  (n + nums + target)
    """
    params = sig_info.get('params', []) if sig_info else []
    tokens = deque(tc_input.replace('\n', ' ').split())
    out = {}

    for idx, p in enumerate(params):
        p_name = p['name']
        p_type = p['type'].strip()
        p_type_lower = p_type.lower()
        is_array = p_type_lower.endswith('[]')
        rest_params = params[idx + 1:]
        # Conservative min tokens needed for remaining scalar params
        min_tokens_for_rest = sum(1 for rp in rest_params if not rp['type'].strip().lower().endswith('[]'))

        if is_array:
            elem_type = p_type[:-2].strip()
            if not tokens:
                out[p_name] = []
                continue

            # Heuristic A: first token is declared length n
            use_declared_n = False
            n = 0
            if _is_int_token(tokens[0]):
                n = int(tokens[0])
                if n >= 0 and (len(tokens) - 1) >= (n + min_tokens_for_rest):
                    use_declared_n = True

            arr_vals = []
            if use_declared_n:
                tokens.popleft()  # remove declared length
                for _ in range(n):
                    if not tokens:
                        break
                    arr_vals.append(_to_typed_value(tokens.popleft(), elem_type))
            else:
                # Heuristic B: take all tokens except the minimum needed by remaining params
                take = max(0, len(tokens) - min_tokens_for_rest)
                for _ in range(take):
                    arr_vals.append(_to_typed_value(tokens.popleft(), elem_type))

            out[p_name] = arr_vals
        else:
            if tokens:
                out[p_name] = _to_typed_value(tokens.popleft(), p_type)
            else:
                # Fallback defaults by type
                if p_type_lower in ('int', 'integer'):
                    out[p_name] = 0
                elif p_type_lower in ('double', 'float'):
                    out[p_name] = 0.0
                elif p_type_lower in ('boolean', 'bool'):
                    out[p_name] = False
                else:
                    out[p_name] = ""

    return out


def _build_args_dict(tc_input: str, method_signature: str):
    sig_info = parse_java_signature(method_signature) if method_signature else None

    # 1) JSON path first
    try:
        parsed = json.loads(tc_input)
        if isinstance(parsed, dict):
            return parsed
        if isinstance(parsed, list) and sig_info and sig_info.get('params'):
            names = [p['name'] for p in sig_info['params']]
            return {names[i]: parsed[i] for i in range(min(len(names), len(parsed)))}
    except Exception:
        pass

    # 2) Plain text path based on signature
    if sig_info and sig_info.get('params'):
        return _parse_text_args_with_signature(tc_input, sig_info)

    # 3) No signature => empty args (stdin mode should be used upstream)
    return {}


def to_java_literal(val, val_type: str) -> str:
    val_type = val_type.strip()
    if val is None or val == "null":
        return "null"
    if val_type == 'int':
        return str(int(val))
    elif val_type == 'double':
        return str(float(val))
    elif val_type in ('boolean', 'bool'):
        return 'true' if val else 'false'
    elif val_type in ('String', 'string'):
        escaped = str(val).replace('"', '\\"')
        return f'"{escaped}"'
    elif val_type == 'int[]':
        if not isinstance(val, list):
            val = [val]
        items = ', '.join(str(int(x)) for x in val)
        return f'new int[]{{{items}}}'
    elif val_type in ('String[]', 'string[]'):
        if not isinstance(val, list):
            val = [val]
        items = ', '.join(f'"{str(x).replace(chr(34), chr(92)+chr(34))}"' for x in val)
        return f'new String[]{{{items}}}'
    elif val_type == 'List<Integer>':
        if not isinstance(val, list):
            val = [val]
        items = ', '.join(str(int(x)) for x in val)
        return f'java.util.Arrays.asList({items})'
    elif val_type == 'List<String>':
        if not isinstance(val, list):
            val = [val]
        items = ', '.join(f'"{str(x).replace(chr(34), chr(92)+chr(34))}"' for x in val)
        return f'java.util.Arrays.asList({items})'
    elif isinstance(val, dict):
        pairs = []
        for k, v in val.items():
            k_lit = to_java_literal(k, 'String')
            v_type = 'int' if isinstance(v, int) else ('double' if isinstance(v, float) else ('bool' if isinstance(v, bool) else 'String'))
            v_lit = to_java_literal(v, v_type)
            pairs.append(f"{k_lit}, {v_lit}")
        return f"java.util.Map.of({', '.join(pairs)})"
    return str(val)


def _deep_compare(val1, val2) -> bool:
    if isinstance(val1, list) and isinstance(val2, list):
        if len(val1) != len(val2):
            return False
        return all(_deep_compare(x, y) for x, y in zip(val1, val2))
    elif isinstance(val1, dict) and isinstance(val2, dict):
        if len(val1) != len(val2):
            return False
        return all(k in val2 and _deep_compare(val1[k], val2[k]) for k in val1)
    else:
        if isinstance(val1, (int, float)) and isinstance(val2, (int, float)):
            return abs(float(val1) - float(val2)) < 1e-6
        return str(val1).strip() == str(val2).strip()


def _parse_loose_value(text: str):
    s = text.strip()
    if not s:
        return ""

    try:
        return json.loads(s)
    except Exception:
        pass

    tokens = s.replace('\n', ' ').split()
    if len(tokens) > 1:
        vals = []
        all_numeric = True
        for t in tokens:
            try:
                if '.' in t:
                    vals.append(float(t))
                else:
                    vals.append(int(t))
            except Exception:
                all_numeric = False
                vals.append(t)
        return vals if all_numeric else tokens

    # single scalar fallback
    t = tokens[0]
    if t.lower() in ('true', 'false'):
        return t.lower() == 'true'
    try:
        if '.' in t:
            return float(t)
        return int(t)
    except Exception:
        return t


def _outputs_match_json(actual: str, expected: str) -> bool:
    act = actual.strip()
    exp = expected.strip()
    try:
        val1 = json.loads(act)
        val2 = json.loads(exp)
        return _deep_compare(val1, val2)
    except Exception:
        # Loose parser fallback: allows "[1,2]" vs "1 2", multi-line scalars, etc.
        return _deep_compare(_parse_loose_value(act), _parse_loose_value(exp))


# ═══════════════════════════════════════════════
# Python Executor
# ═══════════════════════════════════════════════

def _build_python_runner(code: str, tc_input: str, func_name: str, method_signature: str) -> str:
    args_dict = _build_args_dict(tc_input, method_signature)

    sig_info = parse_java_signature(method_signature) if method_signature else None
    if sig_info and sig_info['params']:
        param_names = [p['name'] for p in sig_info['params']]
    else:
        param_names = list(args_dict.keys())

    args_declarations = []
    call_args = []
    for p_name in param_names:
        val = args_dict.get(p_name)
        args_declarations.append(f"{p_name} = {repr(val)}")
        call_args.append(p_name)

    args_block = "\n".join(args_declarations)
    call_args_str = ", ".join(call_args)
    call_stmt = f"Solution().{func_name}({call_args_str})" if "class Solution" in code else f"{func_name}({call_args_str})"

    wrapper = (
        f"{code}\n\n"
        "import json as _json, sys as _sys\n"
        f"{args_block}\n"
        "try:\n"
        f"    _res = {call_stmt}\n"
        "    if isinstance(_res, (list, dict, tuple)):\n"
        "        print(_json.dumps(_res))\n"
        "    elif _res is None:\n"
        "        print('null')\n"
        "    else:\n"
        "        print(_json.dumps(_res))\n"
        "except Exception as _e:\n"
        "    import traceback\n"
        "    traceback.print_exc(file=_sys.stderr)\n"
        "    _sys.exit(1)\n"
    )
    return wrapper


async def execute_python(code: str, test_cases: list, func_name: Optional[str] = None, method_signature: Optional[str] = None) -> list:
    results = []
    for idx, tc in enumerate(test_cases):
        tc_input = tc.get('input', '').strip()
        tc_expected = tc.get('expectedOutput', '').strip()

        if func_name:
            runner_code = _build_python_runner(code, tc_input, func_name, method_signature)
        else:
            runner_code = code

        try:
            run_result = await _run_piston(
                'python', runner_code,
                stdin_data='' if func_name else tc_input,
                timeout=TIMEOUT_SECONDS,
            )
            # Use json-aware matcher
            passed = _outputs_match_json(run_result['stdout'], tc_expected)
            res = _build_result(idx, tc_input, tc_expected, run_result)
            res['passed'] = passed
            res['status'] = 'Passed' if passed else ('WrongAnswer' if res['status'] == 'WrongAnswer' else res['status'])
            results.append(res)
        except Exception as e:
            results.append({
                'testCaseIndex': idx + 1,
                'input': tc_input,
                'expectedOutput': tc_expected,
                'actualOutput': '',
                'status': 'RuntimeError',
                'passed': False,
                'executionTimeMs': 0.0,
                'memoryMb': 0.0,
            })

    return results


# ═══════════════════════════════════════════════
# JavaScript (Node.js) Executor
# ═══════════════════════════════════════════════

def _build_js_runner(code: str, tc_input: str, func_name: str, method_signature: str) -> str:
    args_dict = _build_args_dict(tc_input, method_signature)

    sig_info = parse_java_signature(method_signature) if method_signature else None
    if sig_info and sig_info['params']:
        param_names = [p['name'] for p in sig_info['params']]
    else:
        param_names = list(args_dict.keys())

    args_declarations = []
    call_args = []
    for p_name in param_names:
        val = args_dict.get(p_name)
        args_declarations.append(f"const {p_name} = {json.dumps(val)};")
        call_args.append(p_name)

    args_block = "\n".join(args_declarations)
    call_args_str = ", ".join(call_args)

    wrapper = (
        f"{code}\n\n"
        f"{args_block}\n"
        "try {\n"
        f"    const _res = {func_name}({call_args_str});\n"
        "    if (_res !== null && _res !== undefined) {\n"
        "        console.log(JSON.stringify(_res));\n"
        "    } else {\n"
        "        console.log('null');\n"
        "    }\n"
        "} catch (e) {\n"
        "    process.stderr.write('RuntimeError: ' + e.stack + '\\n');\n"
        "    process.exit(1);\n"
        "}\n"
    )
    return wrapper


async def execute_javascript(code: str, test_cases: list, func_name: Optional[str] = None, method_signature: Optional[str] = None) -> list:
    results = []
    for idx, tc in enumerate(test_cases):
        tc_input = tc.get('input', '').strip()
        tc_expected = tc.get('expectedOutput', '').strip()

        if func_name:
            runner_code = _build_js_runner(code, tc_input, func_name, method_signature)
        else:
            runner_code = code

        try:
            run_result = await _run_piston(
                'javascript', runner_code,
                stdin_data='' if func_name else tc_input,
                timeout=TIMEOUT_SECONDS,
            )
            passed = _outputs_match_json(run_result['stdout'], tc_expected)
            res = _build_result(idx, tc_input, tc_expected, run_result)
            res['passed'] = passed
            res['status'] = 'Passed' if passed else ('WrongAnswer' if res['status'] == 'WrongAnswer' else res['status'])
            results.append(res)
        except Exception as e:
            results.append({
                'testCaseIndex': idx + 1,
                'input': tc_input,
                'expectedOutput': tc_expected,
                'actualOutput': '',
                'status': 'RuntimeError',
                'passed': False,
                'executionTimeMs': 0.0,
                'memoryMb': 0.0,
            })

    return results


# ═══════════════════════════════════════════════
# Java Executor
# ═══════════════════════════════════════════════

_JAVA_UTIL_TYPES = (
    'Map', 'HashMap', 'List', 'ArrayList', 'Set', 'HashSet',
    'Queue', 'Deque', 'PriorityQueue', 'LinkedList', 'Arrays',
    'Collections', 'Stack', 'TreeMap', 'TreeSet',
)


def _ensure_java_imports(code: str) -> str:
    """Inject java.util.* when user code references common collection types without imports."""
    if re.search(r'^\s*import\s+java\.util', code, re.MULTILINE):
        return code
    if any(re.search(rf'\b{t}\b', code) for t in _JAVA_UTIL_TYPES):
        return 'import java.util.*;\n' + code
    return code


def _normalize_java_signature(ret_type: str, name: str, params_raw: str) -> str:
    ret_type = re.sub(r'^(?:public|protected|private)\s+', '', ret_type.strip())
    ret_type = re.sub(r'^static\s+', '', ret_type.strip())
    return f"{ret_type} {name}({params_raw.strip()})"


def _resolve_java_metadata(
    code: str,
    func_name: Optional[str] = None,
    method_signature: Optional[str] = None,
) -> tuple[Optional[str], Optional[str]]:
    """
    Resolve Java function metadata from problem config or by parsing user code.
    Falls back to inference when DB fields are empty (common for legacy problems).
    """
    fn = (func_name or '').strip()
    sig = (method_signature or '').strip()
    if fn and sig:
        return fn, sig

    if re.search(r'public\s+static\s+void\s+main\s*\(', code):
        return fn or None, sig or None

    method_re = re.compile(
        r'(?:public|protected|private)?\s*(?:static\s+)?'
        r'([\w<>\[\],\s\.]+?)\s+(\w+)\s*\(([^)]*)\)',
        re.MULTILINE,
    )
    candidates: list[tuple[str, str]] = []
    for match in method_re.finditer(code):
        ret_type = match.group(1).strip()
        name = match.group(2).strip()
        params_raw = match.group(3).strip()
        if name == 'main':
            continue
        if fn and name != fn:
            continue
        candidates.append((name, _normalize_java_signature(ret_type, name, params_raw)))

    if not candidates:
        return fn or None, sig or None

    if fn:
        for name, signature in candidates:
            if name == fn:
                return name, signature
        return fn, sig or None

    for preferred in ('solution', 'twoSum', 'solve'):
        for name, signature in candidates:
            if name == preferred:
                return name, signature

    return candidates[0]


def _build_java_runner(code: str, class_name: str, tc_input: str, func_name: str, method_signature: str) -> str:
    args_dict = _build_args_dict(tc_input, method_signature)

    sig_info = parse_java_signature(method_signature)
    if not sig_info:
        raise ValueError(f"Invalid Java method signature: {method_signature}")

    param_declarations = []
    call_args = []
    for p in sig_info['params']:
        p_name = p['name']
        p_type = p['type']
        val = args_dict.get(p_name)
        lit = to_java_literal(val, p_type)
        param_declarations.append(f"        {p_type} {p_name} = {lit};")
        call_args.append(p_name)

    params_block = "\n".join(param_declarations)
    call_args_str = ", ".join(call_args)

    # Let's generate Main wrapper
    main_class = f"""
class Main {{
    public static void printResult(Object obj) {{
        if (obj == null) {{
            System.out.print("null");
            return;
        }}
        if (obj instanceof int[]) {{
            int[] arr = (int[]) obj;
            System.out.print("[");
            for (int i = 0; i < arr.length; i++) {{
                System.out.print(arr[i]);
                if (i < arr.length - 1) System.out.print(",");
            }}
            System.out.print("]");
        }} else if (obj instanceof double[]) {{
            double[] arr = (double[]) obj;
            System.out.print("[");
            for (int i = 0; i < arr.length; i++) {{
                System.out.print(arr[i]);
                if (i < arr.length - 1) System.out.print(",");
            }}
            System.out.print("]");
        }} else if (obj instanceof boolean[]) {{
            boolean[] arr = (boolean[]) obj;
            System.out.print("[");
            for (int i = 0; i < arr.length; i++) {{
                System.out.print(arr[i] ? "true" : "false");
                if (i < arr.length - 1) System.out.print(",");
            }}
            System.out.print("]");
        }} else if (obj instanceof String[]) {{
            String[] arr = (String[]) obj;
            System.out.print("[");
            for (int i = 0; i < arr.length; i++) {{
                System.out.print("\\"" + arr[i].replace("\\"", "\\\\\\\"") + "\\"");
                if (i < arr.length - 1) System.out.print(",");
            }}
            System.out.print("]");
        }} else if (obj instanceof java.util.List) {{
            java.util.List<?> list = (java.util.List<?>) obj;
            System.out.print("[");
            for (int i = 0; i < list.size(); i++) {{
                Object item = list.get(i);
                if (item instanceof String) {{
                    System.out.print("\\"" + ((String) item).replace("\\"", "\\\\\\\"") + "\\"");
                }} else {{
                    printResult(item);
                }}
                if (i < list.size() - 1) System.out.print(",");
            }}
            System.out.print("]");
        }} else if (obj instanceof java.util.Map) {{
            java.util.Map<?, ?> map = (java.util.Map<?, ?>) obj;
            System.out.print("{{");
            int count = 0;
            for (java.util.Map.Entry<?, ?> entry : map.entrySet()) {{
                System.out.print("\\"" + entry.getKey().toString().replace("\\"", "\\\\\\\"") + "\\":");
                Object val = entry.getValue();
                if (val instanceof String) {{
                    System.out.print("\\"" + ((String) val).replace("\\"", "\\\\\\\"") + "\\"");
                }} else {{
                    printResult(val);
                }}
                if (++count < map.size()) System.out.print(",");
            }}
            System.out.print("}}");
        }} else if (obj instanceof String) {{
            System.out.print("\\"" + ((String) obj).replace("\\"", "\\\\\\\"") + "\\"");
        }} else {{
            System.out.print(obj.toString());
        }}
    }}

    public static void main(String[] args) {{
        try {{
{params_block}
            Solution solver = new Solution();
            Object res = solver.{func_name}({call_args_str});
            printResult(res);
        }} catch (Exception e) {{
            e.printStackTrace();
            System.exit(1);
        }}
    }}
}}
"""
    return code + "\n\n" + main_class

async def execute_java(code: str, test_cases: list, func_name: Optional[str] = None, method_signature: Optional[str] = None) -> list:
    results = []
    clean_code = _ensure_java_imports(code.replace("public class Solution", "class Solution"))
    func_name, method_signature = _resolve_java_metadata(clean_code, func_name, method_signature)

    for idx, tc in enumerate(test_cases):
        tc_input = tc.get('input', '').strip()
        tc_expected = tc.get('expectedOutput', '').strip()

        if not (func_name and method_signature and 'public static void main' not in clean_code):
            runner_code = clean_code
            stdin_data = tc_input + '\n'
        else:
            runner_code = _build_java_runner(clean_code, 'Solution', tc_input, func_name, method_signature)
            stdin_data = ''

        try:
            run_result = await _run_piston(
                'java', runner_code,
                stdin_data=stdin_data,
                timeout=TIMEOUT_SECONDS,
            )
            passed = _outputs_match_json(run_result['stdout'], tc_expected)
            res = _build_result(idx, tc_input, tc_expected, run_result)
            res['passed'] = passed
            res['status'] = 'Passed' if passed else ('WrongAnswer' if res['status'] == 'WrongAnswer' else res['status'])
            results.append(res)
        except Exception as e:
            results.append({
                'testCaseIndex': idx + 1,
                'input': tc_input,
                'expectedOutput': tc_expected,
                'actualOutput': '',
                'status': 'RuntimeError',
                'passed': False,
                'executionTimeMs': 0.0,
                'memoryMb': 0.0,
            })

    return results


# ═══════════════════════════════════════════════
# Unsupported language fallback
# ═══════════════════════════════════════════════

def _unsupported_language_results(language: str, test_cases: list) -> list:
    return [
        {
            'testCaseIndex': idx + 1,
            'input': tc.get('input', '').strip(),
            'expectedOutput': tc.get('expectedOutput', '').strip(),
            'actualOutput': '',
            'status': 'CompileError',
            'passed': False,
            'executionTimeMs': 0.0,
            'memoryMb': 0.0,
        }
        for idx, tc in enumerate(test_cases)
    ]


# ═══════════════════════════════════════════════
# Main entry point
# ═══════════════════════════════════════════════

async def execute_code(language: str, code: str, test_cases: list, function_name: Optional[str] = None, method_signature: Optional[str] = None, return_type: Optional[str] = None) -> list:
    lang = language.lower().strip()

    if 'java' in lang and 'script' not in lang:
        function_name, method_signature = _resolve_java_metadata(code, function_name, method_signature)

    # 1. Validation for FunctionName presence
    if function_name:
        fn = function_name.strip()
        found = False
        if 'python' in lang:
            found = bool(re.search(rf"\bdef\s+{fn}\b", code))
        elif 'javascript' in lang or lang == 'js':
            found = bool(re.search(rf"\b{fn}\b", code))
        elif 'java' in lang and 'script' not in lang:
            found = bool(re.search(rf"\b{fn}\b", code))

        if not found:
            return [
                {
                    'testCaseIndex': idx + 1,
                    'input': tc.get('input', '').strip(),
                    'expectedOutput': tc.get('expectedOutput', '').strip(),
                    'actualOutput': '',
                    'status': 'CompileError',
                    'passed': False,
                    'executionTimeMs': 0.0,
                    'memoryMb': 0.0,
                }
                for idx, tc in enumerate(test_cases)
            ]

    # 2. Delegate execution
    if 'python' in lang:
        return await execute_python(code, test_cases, function_name, method_signature)

    elif 'javascript' in lang or lang == 'js':
        return await execute_javascript(code, test_cases, function_name, method_signature)

    elif 'java' in lang and 'script' not in lang:
        return await execute_java(code, test_cases, function_name, method_signature)

    else:
        return _unsupported_language_results(language, test_cases)

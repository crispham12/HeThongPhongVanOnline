import ast
import re

def analyze_code_metrics(language: str, code: str) -> dict:
    """
    Analyzes code metrics statically to offload simple AST/regex parsing from AI.
    Returns: {
        "namingQuality": "Good" | "Needs Improvement",
        "namingFeedback": [],
        "functionLengthLines": int,
        "magicNumbersCount": int,
        "deadCodeDetected": bool,
        "exceptionHandlingQuality": "Good" | "Weak",
        "cyclomaticComplexity": int,
    }
    """
    lang = language.lower().strip()
    metrics = {
        "namingQuality": "Good",
        "namingFeedback": [],
        "functionLengthLines": 0,
        "magicNumbersCount": 0,
        "deadCodeDetected": False,
        "exceptionHandlingQuality": "Good",
        "cyclomaticComplexity": 1,
    }
    
    if not code or not code.strip():
        return metrics

    # Basic line count
    lines = code.splitlines()
    metrics["functionLengthLines"] = len([l for l in lines if l.strip()])

    if "python" in lang:
        try:
            tree = ast.parse(code)
            magic_nums = 0
            has_try = False
            complexity = 1
            
            for node in ast.walk(tree):
                # Count magic numbers (constants except 0, 1, -1, None, True, False, "", or docstrings)
                if isinstance(node, ast.Constant):
                    val = node.value
                    if isinstance(val, (int, float)) and val not in (0, 1, -1):
                        magic_nums += 1
                
                # Check naming convention (snake_case in Python variables/functions)
                if isinstance(node, ast.FunctionDef):
                    if not re.match(r"^[a-z_][a-z0-9_]*$", node.name):
                        metrics["namingFeedback"].append(f"Function name '{node.name}' is not in snake_case.")
                elif isinstance(node, ast.Name):
                    if isinstance(node.ctx, ast.Store):
                        if not re.match(r"^[a-z_][a-z0-9_]*$", node.id) and len(node.id) > 1:
                            metrics["namingFeedback"].append(f"Variable name '{node.id}' should follow snake_case.")
                
                # Exception Handling
                if isinstance(node, ast.Try):
                    has_try = True
                    for handler in node.handlers:
                        # Empty except block or broad Exception without logic
                        if not handler.body or (len(handler.body) == 1 and isinstance(handler.body[0], ast.Pass)):
                            metrics["exceptionHandlingQuality"] = "Weak"
                            metrics["namingFeedback"].append("Empty try-except block detected (silent failure).")
                
                # Complexity estimations (Ifs, Loops, boolean operators)
                if isinstance(node, (ast.If, ast.For, ast.While, ast.And, ast.Or)):
                    complexity += 1
            
            metrics["magicNumbersCount"] = magic_nums
            metrics["cyclomaticComplexity"] = complexity
            if not has_try and "except" not in code:
                metrics["exceptionHandlingQuality"] = "Weak"
                
        except Exception:
            # Fallback to regex analysis if AST parsing fails (due to syntax errors in unfinished draft)
            pass

    # Regex-based analysis for JS, Java, C#
    if not metrics["namingFeedback"]:
        # Match variables declared like: int score, let score, String temp
        var_declarations = re.findall(r"\b(?:let|const|var|int|double|float|String|boolean)\s+([a-zA-Z_]\w*)", code)
        for var_name in var_declarations:
            if "javascript" in lang or "js" in lang or "java" in lang:
                # Expect camelCase
                if re.search(r"_[a-z]", var_name) or var_name.isupper():
                    metrics["namingFeedback"].append(f"Variable name '{var_name}' does not follow camelCase.")
            elif "c#" in lang or "csharp" in lang:
                # Expect camelCase for local variables, PascalCase for methods/classes
                if re.search(r"_[a-z]", var_name):
                    metrics["namingFeedback"].append(f"Variable name '{var_name}' should follow camelCase.")

    # Magic numbers via regex
    if metrics["magicNumbersCount"] == 0:
        nums = re.findall(r"\b\d+(?:\.\d+)?\b", code)
        magic_nums = len([n for n in nums if n not in ("0", "1", "100", "0.0", "1.0")])
        metrics["magicNumbersCount"] = magic_nums

    # Exception Handling check via regex
    if "try" not in code:
        metrics["exceptionHandlingQuality"] = "Weak"
    elif re.search(r"catch\s*\(\s*\w+\s*\)\s*\{\s*\}", code) or re.search(r"except\s*:\s*pass", code):
        metrics["exceptionHandlingQuality"] = "Weak"
        metrics["namingFeedback"].append("Empty catch block blocks exceptions completely.")

    # Dead code simple check
    if re.search(r"return\b", code):
        # If there is code after a return statement in the same block
        parts = code.split("return")
        for part in parts[1:]:
            stripped = part.lstrip()
            if stripped and not stripped.startswith(";") and not stripped.startswith("}") and "\n" in stripped:
                lines_after = [l.strip() for l in stripped.splitlines() if l.strip()]
                if lines_after and not lines_after[0].startswith("catch") and not lines_after[0].startswith("finally") and not lines_after[0].startswith("}"):
                    metrics["deadCodeDetected"] = True

    if metrics["namingFeedback"]:
        metrics["namingQuality"] = "Needs Improvement"

    return metrics

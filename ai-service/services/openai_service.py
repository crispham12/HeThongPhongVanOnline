import json
import os
from typing import Tuple
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv(override=True)
api_key = os.getenv("OPENAI_API_KEY")

# Tự động nhận diện: Nếu key bắt đầu bằng "sk-" thì dùng OpenAI, ngược lại dùng Gemini
is_gemini = api_key and not api_key.startswith("sk-")

if is_gemini:
    print("[AI Service] Gemini API Key detected. Using Gemini compatibility layer.")
    client = AsyncOpenAI(
        api_key=api_key,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        max_retries=0
    )
else:
    print("[AI Service] Standard OpenAI Key detected.")
    client = AsyncOpenAI(api_key=api_key, max_retries=0)


async def call_openai(prompt: str, model: str = "gpt-4o-mini") -> dict:
    """
    Call OpenAI/Gemini and parse JSON response.
    Returns the parsed result dict. Usage data is stored in result["usage"] and result["model"].
    """
    # Chuyển sang gemini-3.5-flash vì 3.6 đang bị quá tải (503 High Demand)
    actual_model = "gemini-3.5-flash" if is_gemini else model

    try:
        response = await client.chat.completions.create(
            model=actual_model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        
        usage = response.usage if hasattr(response, "usage") else None
        if usage:
            print(f"\n[AI Success] Connected successfully! Model: {actual_model} | Prompt Tokens: {usage.prompt_tokens} | Completion Tokens: {usage.completion_tokens} | Total: {usage.total_tokens}")
        else:
            print(f"\n[AI Success] Connected successfully! Model: {actual_model}")

        content_str = response.choices[0].message.content.strip()
        
        # Remove markdown code block fences if AI returns them
        import re
        match = re.search(r"```(?:json)?\s*(.*?)\s*```", content_str, re.DOTALL)
        if match:
            content_str = match.group(1)
            
        result = json.loads(content_str)

        # Always inject usage metadata so callers can extract it
        if isinstance(result, dict):
            result["usage"] = {
                "inputTokens": usage.prompt_tokens if usage else 0,
                "outputTokens": usage.completion_tokens if usage else 0,
                "totalTokens": usage.total_tokens if usage else 0,
            }
            result["model"] = actual_model

        return result
    except Exception as e:
        error_msg = str(e)
        print(f"\n[AI Error] Connection/API failed: {error_msg}")
        raise


async def call_openai_with_usage(prompt: str, model: str = "gpt-4o-mini") -> Tuple[dict, dict]:
    """
    Call OpenAI/Gemini and return (result_dict, usage_dict) as a tuple.
    usage_dict contains: inputTokens, outputTokens, totalTokens, model.
    """
    # Override model. gemini-3.6-flash confirmed working via live tests (OpenAI compat + JSON).
    actual_model = "gemini-3.6-flash" if is_gemini else model
    result = await call_openai(prompt, actual_model)
    usage = result.pop("usage", {"inputTokens": 0, "outputTokens": 0, "totalTokens": 0})
    model_used = result.pop("model", actual_model)
    usage["model"] = model_used
    return result, usage


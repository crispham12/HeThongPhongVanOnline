"""
Final test: gemini-3.6-flash voi JSON format - chinh xac nhu call_openai su dung
"""
import asyncio, os, sys, json
from dotenv import load_dotenv
from openai import AsyncOpenAI

sys.stdout.reconfigure(encoding='utf-8')
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

client = AsyncOpenAI(
    api_key=api_key,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
    max_retries=0
)

async def main():
    print("=" * 60)
    print("Test: gemini-3.6-flash voi JSON response_format")
    print("=" * 60)
    
    # Test giong nhu call_openai() trong he thong
    try:
        r = await client.chat.completions.create(
            model="gemini-3.6-flash",
            messages=[{"role": "user", "content": 'Return a JSON object: {"quality_score": 25, "complexity_score": 18, "feedback": "Good code", "code_quality_notes": "Clean", "complexity_notes": "O(n)", "improvement_suggestions": ["Add comments"]}'}],
            temperature=0.7,
            response_format={"type": "json_object"},
        )
        content = r.choices[0].message.content
        print(f"  finish_reason: {r.choices[0].finish_reason}")
        print(f"  content: {content}")
        
        if content:
            parsed = json.loads(content)
            print(f"  PARSED OK: quality_score={parsed.get('quality_score')}, complexity_score={parsed.get('complexity_score')}")
            print("\n  RESULT: gemini-3.6-flash FULLY COMPATIBLE - san sang thay the!")
        else:
            print("  RESULT: content is None/empty")
    except Exception as e:
        print(f"  ERROR: {e}")

asyncio.run(main())

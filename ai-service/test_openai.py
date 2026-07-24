import os
import asyncio
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

async def test_openai_sdk():
    client = AsyncOpenAI(
        api_key=api_key,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
    )
    try:
        response = await client.chat.completions.create(
            model="gemini-2.5-flash",
            messages=[{"role": "user", "content": "Return a JSON object with key 'status' and value 'ok'. Must be valid JSON."}],
            response_format={"type": "json_object"}
        )
        print("SDK JSON Success!")
        print(response.choices[0].message.content)
    except Exception as e:
        print(f"SDK JSON Error: {e}")

asyncio.run(test_openai_sdk())

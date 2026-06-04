import os
import asyncio
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

async def test():
    api_key = os.getenv("OPENAI_API_KEY")
    print(f"API Key starting with: {api_key[:15]}... length: {len(api_key)}")
    client = AsyncOpenAI(api_key=api_key)
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": "say hi"}],
            max_tokens=5
        )
        print("Success!")
        print(response.choices[0].message.content)
    except Exception as e:
        print(f"Error: {e}")

asyncio.run(test())

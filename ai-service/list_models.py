import os
from dotenv import load_dotenv
import requests

load_dotenv()
api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    print("API key not found")
    exit()

url = f'https://generativelanguage.googleapis.com/v1beta/models?key={api_key}'
res = requests.get(url).json()

if 'models' in res:
    print("Available Models:")
    for m in res['models']:
        print(m['name'])
else:
    print("Error:", res)

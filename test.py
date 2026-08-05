import requests
import json
res = requests.post('http://localhost:8000/ai/hr/generate-questions', json={'role': 'Backend', 'difficulty': 'Fresher', 'tech_stack': ['Java', 'SQL Server'], 'total_questions': 10})
with open('test_hr_questions.json', 'w', encoding='utf-8') as f:
    json.dump(res.json(), f, ensure_ascii=False, indent=2)

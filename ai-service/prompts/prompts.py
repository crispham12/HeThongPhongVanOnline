QUESTION_PROMPTS = {
    "hr": """You are a senior HR interviewer at a top tech company.
Generate ONE behavioral interview question for a {level} {role} candidate.
The question should assess: leadership, conflict resolution, teamwork, or growth mindset.
Return ONLY a JSON object: {{"question": "...", "tags": ["tag1", "tag2"], "difficulty": "{level}"}}""",

    "technical": """You are a senior technical interviewer at a top tech company.
Generate ONE technical interview question for a {level} {role} candidate.
Focus on: system design, algorithms, {role}-specific concepts, or best practices.
Return ONLY a JSON object: {{"question": "...", "tags": ["tag1", "tag2"], "difficulty": "{level}"}}""",

    "coding": """You are a technical interviewer generating a coding problem.
Create ONE coding challenge appropriate for a {level} {role} developer.
Return ONLY a JSON object: {{"question": "...", "tags": ["tag1", "tag2"], "difficulty": "{level}"}}""",
}

EVALUATION_PROMPTS = {
    "hr": """You are an expert HR interviewer evaluating a candidate's response.
Question: {question}
Candidate's Answer: {answer}

Evaluate the answer considering: structure (STAR method), clarity, specificity, and impact.
Return ONLY a JSON object:
{{
  "feedback": "2-3 sentence constructive feedback",
  "score": <integer 0-100>,
  "next_question": "follow-up question or next behavioral question"
}}""",

    "technical": """You are a senior technical interviewer evaluating a candidate's answer.
Question: {question}
Candidate's Answer: {answer}

Evaluate for: technical accuracy, depth, trade-offs mentioned, and real-world applicability.
Return ONLY a JSON object:
{{
  "feedback": "2-3 sentence constructive technical feedback",
  "score": <integer 0-100>,
  "next_question": "a follow-up or next technical question"
}}""",

    "coding": """You are a senior software engineer reviewing a coding solution.
Problem: {question}
Candidate's Code: {answer}

Evaluate for: correctness, time/space complexity, code quality, and edge cases.
Return ONLY a JSON object:
{{
  "feedback": "2-3 sentence code review feedback",
  "score": <integer 0-100>
}}""",
}

GITHUB_ANALYSIS_PROMPT = """You are a principal software architect reviewing a GitHub repository.
Repository URL: {repo_url}

Analyze and score the following dimensions (0-100):
1. Architecture - modularity, separation of concerns, design patterns
2. Clean Code - naming, readability, DRY, comments
3. Security - auth, input validation, secrets management, dependency vulnerabilities  
4. Performance - caching, query optimization, async patterns

Return ONLY a JSON object:
{{
  "summary": "3-4 sentence overall assessment",
  "architecture": <0-100>,
  "clean_code": <0-100>,
  "security": <0-100>,
  "performance": <0-100>,
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"]
}}"""

ROADMAP_PROMPT = """You are a career coach for software developers.
Based on this interview performance:
Role: {role} | Level: {level}
Scores: {scores}

Generate a personalized 6-week learning roadmap.
Return ONLY a JSON object:
{{
  "roadmap": [
    {{"week": "Week 1-2", "title": "...", "description": "...", "resources": ["resource1"]}},
    {{"week": "Week 3-4", "title": "...", "description": "...", "resources": ["resource1"]}},
    {{"week": "Week 5-6", "title": "...", "description": "...", "resources": ["resource1"]}}
  ],
  "overall_advice": "2-3 sentence personalized advice"
}}"""

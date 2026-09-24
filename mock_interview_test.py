import requests
import time
import json
import os

BASE_URL = "http://localhost:8000"

def run_test():
    print("Starting full mock interview test...")
    
    # 1. Generate Questions
    print("1. Generating 10 HR questions...")
    gen_req = {
        "role": "Lập trình viên Backend",
        "difficulty": "Fresher",
        "tech_stack": ["Java", "Spring Boot"],
        "total_questions": 10
    }
    
    try:
        res = requests.post(f"{BASE_URL}/ai/hr/generate-questions", json=gen_req)
        res.raise_for_status()
        questions_data = res.json()
        questions = questions_data.get("questions", [])
        print(f"   => Generated {len(questions)} questions.")
        
        usage = questions_data.get("usage", {})
        print(f"   => Usage: {usage}")
        
    except requests.exceptions.RequestException as e:
        print(f"Failed to generate questions: {e}")
        return

    answers_summary = []
    
    # 2. Evaluate each answer
    print("2. Evaluating answers for 10 questions...")
    for i, q in enumerate(questions):
        print(f"   --- Question {i+1} ---")
        q_text = q.get("questionText", "")
        # Dummy answer that has at least 30 chars and some STAR structure
        dummy_answer = f"Trong dự án trước, tôi gặp tình huống liên quan đến câu hỏi này. Nhiệm vụ của tôi là xử lý logic Backend bằng Java và Spring Boot. Tôi đã áp dụng các kiến trúc tốt nhất để tối ưu code. Kết quả là hệ thống chạy ổn định và mượt mà hơn."
        
        eval_req = {
            "role": "Lập trình viên Backend",
            "difficulty": "Fresher",
            "tech_stack": ["Java", "Spring Boot"],
            "question": q_text,
            "answer": dummy_answer
        }
        
        try:
            eval_res = requests.post(f"{BASE_URL}/ai/hr/evaluate-answer", json=eval_req)
            eval_res.raise_for_status()
            eval_data = eval_res.json()
            
            # Extract score
            star_comp = eval_data.get("starCompletion", 0)
            print(f"   => Evaluated. Star Completion: {star_comp}%")
            
            answers_summary.append({
                "question": q_text,
                "answer": dummy_answer,
                "transcript": dummy_answer,
                "durationSeconds": 60,
                "wordCount": len(dummy_answer.split()),
                "fillerWords": 1,
                "score": star_comp / 10.0, # Dummy conversion to 1-10
                "feedback": eval_data.get("summary", "")
            })
            
            time.sleep(1) # Sleep to avoid rate limiting
        except requests.exceptions.RequestException as e:
            print(f"Failed to evaluate answer {i+1}: {e}")
            return
            
    # 3. Final Evaluation
    print("3. Generating final evaluation...")
    final_req = {
        "session_id": "test-session-123",
        "role": "Lập trình viên Backend",
        "difficulty": "Fresher",
        "answers": answers_summary
    }
    
    try:
        final_res = requests.post(f"{BASE_URL}/ai/hr/final-evaluation", json=final_req)
        final_res.raise_for_status()
        final_data = final_res.json()
        print("   => Final Evaluation successful.")
        
        comp_scores = final_data.get("compositeScores", {})
        print(f"   => Scores: {comp_scores}")
        print("Test completed successfully! Enough tokens available for a full round.")
        
    except requests.exceptions.RequestException as e:
        print(f"Failed to generate final evaluation: {e}")

if __name__ == "__main__":
    run_test()

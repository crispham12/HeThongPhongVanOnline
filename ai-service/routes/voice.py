from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List

router = APIRouter(prefix="/ai/voice", tags=["Voice Analysis"])

class VoiceAnalysisRequest(BaseModel):
    transcript: str = Field(..., description="Văn bản từ Web Speech API")
    duration_seconds: int = Field(..., description="Thời gian nói tính bằng giây")
    language: str = Field(default="vi", description="Ngôn ngữ: vi | en")

class VoiceAnalysisResponse(BaseModel):
    speaking_rate: str          # "chậm" | "vừa" | "nhanh"
    words_per_minute: float     # Số từ/phút
    filler_word_count: int      # Tổng số filler words
    filler_word_list: List[str] # Danh sách filler words tìm thấy (unique)
    filler_percentage: float    # % filler words / tổng từ
    clarity_score: int          # 0-100, tính từ logic dưới đây
    pause_analysis: str         # "Dừng hợp lý" | "Dừng quá nhiều" | "Nói quá liên tục"
    feedback: str               # 1-2 câu nhận xét tiếng Việt

@router.post("/analyze", response_model=VoiceAnalysisResponse)
async def analyze_voice(request: VoiceAnalysisRequest):
    if not request.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript không được để trống")
    if request.duration_seconds <= 0:
        raise HTTPException(status_code=400, detail="Thời gian không hợp lệ")

    # 1. words_per_minute
    words = request.transcript.strip().split()
    total_words = len(words)
    words_per_minute = round((total_words / request.duration_seconds) * 60, 1)

    # 2. speaking_rate
    if words_per_minute < 100:
        speaking_rate = "chậm"
    elif words_per_minute <= 160:
        speaking_rate = "vừa"
    else:
        speaking_rate = "nhanh"

    # 3. filler_words — danh sách tiếng Việt + tiếng Anh phổ biến
    FILLER_WORDS_VI = [
        "ừm", "ừ", "à", "ờ", "ơ", "cái",
        "kiểu như", "thì là", "vân vân", "ý là", "tức là",
        "như là", "thật ra", "thực ra", "nói chung"
    ]
    FILLER_WORDS_EN = ["um", "uh", "like", "you know", "basically", "literally", "actually", "so"]

    filler_list = FILLER_WORDS_VI if request.language == "vi" else FILLER_WORDS_EN
    transcript_lower = request.transcript.lower()

    found_fillers = []
    filler_count = 0
    for filler in filler_list:
        count = transcript_lower.count(filler)
        if count > 0:
            found_fillers.append(filler)
            filler_count += count

    filler_percentage = round((filler_count / total_words * 100), 1) if total_words > 0 else 0

    # 4. clarity_score (0-100)
    # Bắt đầu từ 100, trừ điểm theo các yếu tố:
    clarity_score = 100
    # Trừ theo tỷ lệ filler words (tối đa -40 điểm)
    clarity_score -= min(40, int(filler_percentage * 2))
    # Trừ nếu nói quá nhanh hoặc quá chậm (tối đa -20 điểm)
    if words_per_minute > 180 or words_per_minute < 80:
        clarity_score -= 20
    elif words_per_minute > 160 or words_per_minute < 100:
        clarity_score -= 10
    # Trừ nếu câu trả lời quá ngắn < 30 từ (tối đa -20 điểm)
    if total_words < 30:
        clarity_score -= 20
    elif total_words < 50:
        clarity_score -= 10
    clarity_score = max(0, clarity_score)

    # 5. pause_analysis — tính từ tỷ lệ từ/giây
    words_per_second = total_words / request.duration_seconds
    if words_per_second < 1.2:
        pause_analysis = "Dừng quá nhiều"
    elif words_per_second > 2.5:
        pause_analysis = "Nói quá liên tục"
    else:
        pause_analysis = "Dừng hợp lý"

    # 6. feedback — sinh từ logic, KHÔNG gọi OpenAI
    feedback_parts = []
    if speaking_rate == "nhanh":
        feedback_parts.append("Bạn nói hơi nhanh, hãy thử nói chậm lại để người nghe dễ theo dõi hơn.")
    elif speaking_rate == "chậm":
        feedback_parts.append("Tốc độ nói hơi chậm, hãy cố gắng tự tin hơn và nói với nhịp điệu tự nhiên hơn.")

    if filler_percentage > 10:
        feedback_parts.append(f"Bạn dùng nhiều filler words ({filler_count} lần). Hãy tập dừng lại thay vì dùng 'ừm', 'à'.")
    elif filler_percentage > 5:
        feedback_parts.append(f"Có một vài filler words ({filler_count} lần) — hãy cố gắng giảm dần.")

    if not feedback_parts:
        feedback_parts.append("Giọng nói tự nhiên và rõ ràng. Tiếp tục duy trì phong cách này!")

    feedback = " ".join(feedback_parts)

    return VoiceAnalysisResponse(
        speaking_rate=speaking_rate,
        words_per_minute=words_per_minute,
        filler_word_count=filler_count,
        filler_word_list=found_fillers,
        filler_percentage=filler_percentage,
        clarity_score=clarity_score,
        pause_analysis=pause_analysis,
        feedback=feedback
    )

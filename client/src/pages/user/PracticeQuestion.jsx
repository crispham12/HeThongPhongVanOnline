import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Sparkles, CheckCircle2, AlertCircle,
  HelpCircle, Settings, Bell, BookOpen, Clock, Play, Award,
  Check, RefreshCw, Loader2, Key, Lightbulb, Compass, Star,
  TrendingUp, Users, History, Shield, Mic, Square
} from 'lucide-react';

import { practiceQuestionApi } from '../../services/questionBankApi';
import { useAuth } from '../../context/AuthContext';

export default function PracticeQuestion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [question, setQuestion] = useState(null);
  const [relatedQuestions, setRelatedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [wordCount, setWordCount] = useState(0);

  // Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          // Stop all tracks to release microphone
          stream.getTracks().forEach(track => track.stop());

          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          setIsTranscribing(true);
          try {
            const transcribedText = await practiceQuestionApi.transcribeAudio(audioBlob);
            setAnswer((prev) => (prev ? prev + ' ' + transcribedText : transcribedText));
          } catch (error) {
            console.error("Transcription error:", error);
            alert("Lỗi khi nhận diện giọng nói. Vui lòng thử lại.");
          } finally {
            setIsTranscribing(false);
          }
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
        setIsRecording(true);
      } catch (err) {
        alert("Không thể truy cập microphone. Vui lòng cấp quyền trong trình duyệt.");
        console.error("Mic error:", err);
      }
    }
  };

  // Load question and related questions
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const qData = await practiceQuestionApi.getById(id);
        setQuestion(qData);
        if (qData.userAnswer) {
          setAnswer(qData.userAnswer);
        }

        // Fetch related questions (other questions in the bank)
        const allQuestions = await practiceQuestionApi.getAll({ pageSize: 5 });
        const filtered = (allQuestions.items || []).filter(item => String(item.id) !== String(id));
        setRelatedQuestions(filtered.slice(0, 3));
      } catch (error) {
        console.error('Error fetching question data', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // Reset status when ID changes
    setResult(null);
  }, [id]);

  useEffect(() => {
    const words = answer && answer.trim() ? answer.trim().split(/\s+/).length : 0;
    setWordCount(words);
  }, [answer]);

  const handleSubmit = async () => {
    if (!answer || !answer.trim()) return;
    setSubmitting(true);
    try {
      const res = await practiceQuestionApi.submitAnswer(id, answer);

      // Parse strengths, weaknesses, suggestions if they are JSON strings
      let strengths = [];
      let weaknesses = [];
      let improvements = [];
      try {
        const parsed = JSON.parse(res.strengthsJson);
        strengths = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        strengths = Array.isArray(res.strengthsJson) ? res.strengthsJson : [];
      }
      try {
        const parsed = JSON.parse(res.weaknessesJson);
        weaknesses = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        weaknesses = Array.isArray(res.weaknessesJson) ? res.weaknessesJson : [];
      }
      try {
        const parsed = JSON.parse(res.improvementSuggestionsJson);
        improvements = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        improvements = Array.isArray(res.improvementSuggestionsJson) ? res.improvementSuggestionsJson : [];
      }

      setResult({
        score: res.score,
        feedback: res.feedback,
        strengths: strengths,
        weaknesses: weaknesses,
        improvements: improvements,
        starCompletion: res.starCompletion,
        starChecklist: res.starChecklist,
        starAnalysis: res.starAnalysis,
        improvedAnswer: res.improvedAnswer,
        nextRecommendation: res.nextRecommendation,
        technicalScores: res.technicalScores
      });
    } catch (error) {
      console.error('Error submitting answer', error);
      alert(error?.response?.data?.message || 'Có lỗi xảy ra khi chấm điểm AI. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyBadgeColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'dễ':
      case 'easy':
      case 'intern':
      case 'fresher':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'trung bình':
      case 'medium':
      case 'junior':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'khó':
      case 'hard':
      case 'middle':
      case 'senior':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const isTechnical = question?.category === 'Technical' || question?.category === 'Kỹ thuật';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Đang tải câu hỏi luyện tập...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-gray-200 shadow-sm">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy câu hỏi</h2>
        <button onClick={() => navigate('/question-bank')} className="px-4 py-2 bg-[#B4F290] text-[#111827] rounded-lg hover:bg-[#9de675] transition-colors">
          Quay lại Ngân hàng câu hỏi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Left Back Button and Breadcrumb */}
      <div className="flex flex-col gap-3">
        <div>
          <button
            onClick={() => navigate('/question-bank')}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-650 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
          <Link to="/question-bank" className="hover:text-gray-900 transition-colors">Ngân hàng câu hỏi</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-500">Câu hỏi {question.category}</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900">Luyện tập</span>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start pb-20">

        {/* Left Column */}
        <div className="space-y-6">

          {/* Question Info Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-lg">
                Câu hỏi {question.category}
              </span>
              <span className={`text-xs font-bold border px-3 py-1 rounded-lg ${getDifficultyBadgeColor(question.difficulty)}`}>
                Độ khó: {question.difficulty}
              </span>
              {question.role && (
                <span className="text-xs font-bold text-gray-600 bg-gray-100 border border-gray-200 px-3 py-1 rounded-lg">
                  Vị trí: {question.role}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-snug mb-3">
              {question.title}
            </h1>

            <p className="text-sm font-medium text-gray-500 leading-relaxed">
              {question.content}
            </p>
          </div>

          {/* Method Card */}
          {isTechnical ? (
            <div className="bg-emerald-50/40 rounded-2xl border border-emerald-100 p-6 shadow-sm">
              <h3 className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Lightbulb className="w-4.5 h-4.5 text-emerald-600" />
                TIÊU CHÍ ĐÁNH GIÁ KỸ THUẬT
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-xl border border-emerald-50 shadow-sm flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">1</div>
                  <span className="text-xs font-bold text-gray-700">Kiến thức kỹ thuật</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-50 shadow-sm flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">2</div>
                  <span className="text-xs font-bold text-gray-700">Giải quyết vấn đề</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-50 shadow-sm flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">3</div>
                  <span className="text-xs font-bold text-gray-700">Kinh nghiệm thực tế</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-50 shadow-sm flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">4</div>
                  <span className="text-xs font-bold text-gray-700">Thiết kế hệ thống</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-50 shadow-sm flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">5</div>
                  <span className="text-xs font-bold text-gray-700">Giao tiếp</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-50 shadow-sm flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">6</div>
                  <span className="text-xs font-bold text-gray-700">Thực hành tốt</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50/40 rounded-2xl border border-blue-100 p-6 shadow-sm">
              <h3 className="text-xs font-extrabold text-[#2563EB] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Lightbulb className="w-4.5 h-4.5 text-[#2563EB]" />
                PHƯƠNG PHÁP STAR (GỢI Ý)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-blue-50 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-xl font-extrabold text-blue-600">S</span>
                    <h4 className="text-[11px] font-bold text-gray-800 mt-1">Situation</h4>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2 font-medium leading-relaxed">Mô tả bối cảnh cụ thể của tình huống.</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-blue-50 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-xl font-extrabold text-blue-600">T</span>
                    <h4 className="text-[11px] font-bold text-gray-800 mt-1">Task</h4>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2 font-medium leading-relaxed">Nhiệm vụ chính bạn cần thực hiện là gì?</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-blue-50 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-xl font-extrabold text-blue-600">A</span>
                    <h4 className="text-[11px] font-bold text-gray-800 mt-1">Action</h4>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2 font-medium leading-relaxed">Bạn đã làm những gì để xử lý deadline?</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-blue-50 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-xl font-extrabold text-blue-600">R</span>
                    <h4 className="text-[11px] font-bold text-gray-800 mt-1">Result</h4>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2 font-medium leading-relaxed">Kết quả cuối cùng và bài học rút ra.</p>
                </div>
              </div>
            </div>
          )}

          {/* Textarea Input Section */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-gray-900">Câu trả lời của bạn</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleRecording}
                  disabled={isTranscribing}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] uppercase tracking-wider font-bold transition-all ${isTranscribing ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-sm' : isRecording ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse shadow-sm shadow-red-100' : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 shadow-sm'}`}
                >
                  {isTranscribing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isRecording ? <Square className="w-3.5 h-3.5 fill-red-600 text-red-600" /> : <Mic className="w-3.5 h-3.5" />}
                  {isTranscribing ? 'Đang nhận diện...' : isRecording ? 'Dừng ghi âm' : 'Ghi âm trả lời'}
                </button>
                <span className={`text-xs font-semibold ${wordCount >= 200 && wordCount <= 500 ? 'text-emerald-500' : 'text-gray-400'}`}>
                  Gợi ý: 200 - 500 từ ({wordCount} từ)
                </span>
              </div>
            </div>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              readOnly={true}
              placeholder="Vui lòng nhấn nút 'Ghi âm trả lời' ở trên. (Hệ thống yêu cầu trả lời bằng giọng nói thay vì nhập văn bản)..."
              className="w-full min-h-[220px] p-4 border rounded-xl text-sm font-medium outline-none transition-all resize-y bg-gray-100 border-gray-200 text-gray-700 cursor-not-allowed"
            />

            {/* Sparkle submission button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={handleSubmit}
                disabled={submitting || !answer || !answer.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-[#B4F290] text-[#111827] hover:bg-[#9de675] disabled:opacity-50 disabled:hover:bg-[#B4F290] disabled:hover:translate-y-0 font-bold text-sm rounded-xl shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang chấm điểm AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4.5 h-4.5" />
                    Gửi câu trả lời & nhận đánh giá AI
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Evaluation results rendering */}
          {result && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-fade-in space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Award className="w-5.5 h-5.5 text-[#2563EB]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-gray-900">Kết quả đánh giá AI</h4>
                    <p className="text-[11px] text-gray-400 font-medium">Báo cáo tự động dựa trên câu trả lời</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-400">Điểm số</p>
                  <p className="text-2xl font-black text-[#2563EB]">{Number(result.score).toFixed(1)} <span className="text-sm text-gray-400 font-bold">/ 10</span></p>
                </div>
              </div>

              <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                <p className="text-xs font-semibold text-blue-800 leading-relaxed">
                  &ldquo;{result.feedback}&rdquo;
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50/30 border border-emerald-100 p-4 rounded-xl space-y-2">
                  <p className="text-xs font-extrabold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4.5 h-4.5" /> Điểm mạnh
                  </p>
                  <ul className="space-y-1.5">
                    {result.strengths.map((str, idx) => (
                      <li key={idx} className="text-xs font-medium text-gray-600 flex items-start gap-1.5 leading-relaxed">
                        <span className="text-emerald-500 mt-0.5">•</span> {str}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-50/30 border border-amber-100 p-4 rounded-xl space-y-2">
                  <p className="text-xs font-extrabold text-amber-700 flex items-center gap-1.5">
                    <AlertCircle className="w-4.5 h-4.5" /> Điểm cần cải thiện
                  </p>
                  <ul className="space-y-1.5">
                    {result.weaknesses.map((weak, idx) => (
                      <li key={idx} className="text-xs font-medium text-gray-600 flex items-start gap-1.5 leading-relaxed">
                        <span className="text-amber-500 mt-0.5">•</span> {weak}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h5 className="text-xs font-extrabold text-gray-800 mb-2">🚀 Gợi ý nâng cấp bài nói</h5>
                <ul className="space-y-2">
                  {result.improvements.map((imp, idx) => (
                    <li key={idx} className="text-xs font-medium text-gray-600 bg-gray-50 border border-gray-150 p-2.5 rounded-lg flex items-start gap-2 leading-relaxed">
                      <span className="text-primary-600 font-bold">#{idx + 1}</span> {imp}
                    </li>
                  ))}
                </ul>
              </div>

              {result.improvedAnswer && (result.improvedAnswer.situation || result.improvedAnswer.task || result.improvedAnswer.action || result.improvedAnswer.result) && !isTechnical && (
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <h5 className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Gợi ý câu trả lời theo chuẩn STAR
                  </h5>
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-3.5 shadow-inner">
                    {result.improvedAnswer.situation && (
                      <div className="space-y-1">
                        <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Situation</p>
                        <p className="text-xs font-medium text-slate-700 leading-relaxed bg-white border border-slate-100 p-2.5 rounded-lg">{result.improvedAnswer.situation}</p>
                      </div>
                    )}
                    {result.improvedAnswer.task && (
                      <div className="space-y-1">
                        <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Task</p>
                        <p className="text-xs font-medium text-slate-700 leading-relaxed bg-white border border-slate-100 p-2.5 rounded-lg">{result.improvedAnswer.task}</p>
                      </div>
                    )}
                    {result.improvedAnswer.action && (
                      <div className="space-y-1">
                        <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Action</p>
                        <p className="text-xs font-medium text-slate-700 leading-relaxed bg-white border border-slate-100 p-2.5 rounded-lg">{result.improvedAnswer.action}</p>
                      </div>
                    )}
                    {result.improvedAnswer.result && (
                      <div className="space-y-1">
                        <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Result</p>
                        <p className="text-xs font-medium text-slate-700 leading-relaxed bg-white border border-slate-100 p-2.5 rounded-lg">{result.improvedAnswer.result}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column */}
        <div className="space-y-6">

          {/* Practice Progress Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4 animate-fade-in">
            <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest border-b border-gray-100 pb-2">
              Tiến độ luyện tập
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-400">Trạng thái</span>
                <span className={`font-extrabold ${result || question.practiceStatus === 'Practiced' || question.practiceStatus === 'Completed' ? 'text-emerald-600' : 'text-primary-600'}`}>
                  {result || question.practiceStatus === 'Practiced' || question.practiceStatus === 'Completed' ? 'Đã làm' : 'Đang làm'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-400">Điểm cao nhất</span>
                <span className="font-extrabold text-gray-800">
                  {(() => {
                    const currentScore = result ? result.score : null;
                    const prevMax = question.highestScore;
                    if (currentScore != null && prevMax != null) {
                      return `${Number(Math.max(currentScore, prevMax)).toFixed(1)} / 10`;
                    }
                    if (currentScore != null) return `${Number(currentScore).toFixed(1)} / 10`;
                    if (prevMax != null) return `${Number(prevMax).toFixed(1)} / 10`;
                    return '-- / 10';
                  })()}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-400">Lần cuối</span>
                <span className="font-extrabold text-gray-850">
                  {result ? 'Vừa xong' : (question.lastAttemptAt || 'Chưa thực hiện')}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest border-b border-gray-100 pb-2 flex items-center gap-1.5">
              <Star className={`w-3.5 h-3.5 ${isTechnical ? 'text-emerald-400 fill-emerald-400' : 'text-amber-400 fill-amber-400'}`} />
              {isTechnical ? 'Đánh giá kỹ thuật' : 'Star Progress'}
              {result && typeof result.starCompletion === 'number' && !isTechnical && (
                <span className="ml-auto text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-extrabold">
                  Đạt {result.starCompletion}%
                </span>
              )}
            </h3>

            <div className="space-y-3">
              {(isTechnical ? [
                {
                  label: 'Kiến thức kỹ thuật',
                  value: result?.technicalScores?.technicalKnowledge ? Math.round(result.technicalScores.technicalKnowledge * 10) : 0,
                  color: 'bg-emerald-500',
                  trackColor: 'bg-emerald-100',
                  textColor: 'text-emerald-600',
                },
                {
                  label: 'Giải quyết vấn đề',
                  value: result?.technicalScores?.problemSolving ? Math.round(result.technicalScores.problemSolving * 10) : 0,
                  color: 'bg-amber-400',
                  trackColor: 'bg-amber-100',
                  textColor: 'text-amber-600',
                },
                {
                  label: 'Kinh nghiệm thực tế',
                  value: result?.technicalScores?.practicalExperience ? Math.round(result.technicalScores.practicalExperience * 10) : 0,
                  color: 'bg-blue-500',
                  trackColor: 'bg-blue-100',
                  textColor: 'text-blue-600',
                },
                {
                  label: 'Thiết kế hệ thống',
                  value: result?.technicalScores?.systemDesign ? Math.round(result.technicalScores.systemDesign * 10) : 0,
                  color: 'bg-indigo-500',
                  trackColor: 'bg-indigo-100',
                  textColor: 'text-indigo-600',
                },
                {
                  label: 'Giao tiếp',
                  value: result?.technicalScores?.communication ? Math.round(result.technicalScores.communication * 10) : 0,
                  color: 'bg-purple-500',
                  trackColor: 'bg-purple-100',
                  textColor: 'text-purple-600',
                },
                {
                  label: 'Thực hành chuẩn',
                  value: result?.technicalScores?.bestPractices ? Math.round(result.technicalScores.bestPractices * 10) : 0,
                  color: 'bg-rose-500',
                  trackColor: 'bg-rose-100',
                  textColor: 'text-rose-600',
                },
              ] : [
                {
                  label: 'Situation',
                  value: result?.starAnalysis?.situation?.score ? Math.round(result.starAnalysis.situation.score * 10) : 0,
                  feedback: result?.starAnalysis?.situation?.feedback || '',
                  checked: result?.starChecklist?.situation || false,
                  color: 'bg-emerald-500',
                  trackColor: 'bg-emerald-100',
                  textColor: 'text-emerald-600',
                },
                {
                  label: 'Task',
                  value: result?.starAnalysis?.task?.score ? Math.round(result.starAnalysis.task.score * 10) : 0,
                  feedback: result?.starAnalysis?.task?.feedback || '',
                  checked: result?.starChecklist?.task || false,
                  color: 'bg-amber-400',
                  trackColor: 'bg-amber-100',
                  textColor: 'text-amber-600',
                },
                {
                  label: 'Action',
                  value: result?.starAnalysis?.action?.score ? Math.round(result.starAnalysis.action.score * 10) : 0,
                  feedback: result?.starAnalysis?.action?.feedback || '',
                  checked: result?.starChecklist?.action || false,
                  color: 'bg-blue-500',
                  trackColor: 'bg-blue-100',
                  textColor: 'text-blue-600',
                },
                {
                  label: 'Result',
                  value: result?.starAnalysis?.result?.score ? Math.round(result.starAnalysis.result.score * 10) : 0,
                  feedback: result?.starAnalysis?.result?.feedback || '',
                  checked: result?.starChecklist?.result || false,
                  color: result?.score >= 6 ? 'bg-emerald-500' : 'bg-rose-500',
                  trackColor: result?.score >= 6 ? 'bg-emerald-100' : 'bg-rose-100',
                  textColor: result?.score >= 6 ? 'text-emerald-600' : 'text-rose-600',
                },
              ]).map(({ label, value, feedback, checked, color, trackColor, textColor }) => (
                <div key={label} className="space-y-1.5 border-b border-gray-50 pb-2 last:border-0 last:pb-0 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-600 flex items-center gap-1">
                      {result && !isTechnical && (
                        checked ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />
                        ) : (
                          <span className="text-rose-500 font-extrabold w-3.5 text-center">×</span>
                        )
                      )}
                      {label}
                    </span>
                    <span className={`text-[11px] font-extrabold ${textColor}`}>{value}%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${trackColor} overflow-hidden`}>
                    <div
                      className={`h-2 rounded-full ${color} transition-all duration-700 ease-out`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  {result && feedback && !isTechnical && (
                    <p className="text-[10px] text-gray-400 font-medium italic pl-1 leading-normal">
                      {feedback}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {!result && (
              <p className="text-[10px] font-semibold text-gray-400 text-center pt-1">
                Gửi câu trả lời để xem kết quả đánh giá
              </p>
            )}
          </div>

          {/* Best Tips Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest border-b border-gray-100 pb-2">
              Mẹo trả lời tốt
            </h3>

            <ul className="space-y-3.5">
              <li className="flex gap-2.5 items-start">
                <div className="w-4.5 h-4.5 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-[#2563EB] stroke-[3]" />
                </div>
                <p className="text-[11px] font-bold text-gray-500 leading-relaxed">Hãy trung thực, không phóng đại quá mức.</p>
              </li>

              <li className="flex gap-2.5 items-start">
                <div className="w-4.5 h-4.5 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-[#2563EB] stroke-[3]" />
                </div>
                <p className="text-[11px] font-bold text-gray-500 leading-relaxed">Tập trung vào hành động CỦA BẠN, không phải của nhóm.</p>
              </li>

              <li className="flex gap-2.5 items-start">
                <div className="w-4.5 h-4.5 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-[#2563EB] stroke-[3]" />
                </div>
                <p className="text-[11px] font-bold text-gray-500 leading-relaxed">Kết thúc bằng một bài học tích cực.</p>
              </li>
            </ul>
          </div>

          {/* Related Questions Card */}
          {relatedQuestions.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest border-b border-gray-100 pb-2">
                Câu hỏi liên quan
              </h3>

              <div className="space-y-3">
                {relatedQuestions.map((q) => (
                  <div key={q.id} className="p-3 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/10 transition-all space-y-2">
                    <p className="text-[11px] font-extrabold text-gray-800 line-clamp-2 leading-relaxed">
                      {q.title}
                    </p>
                    <Link
                      to={`/question-bank/practice/${q.id}`}
                      className="text-[10px] font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1.5 transition-colors"
                    >
                      Luyện tập ngay <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Example Answer Card — appears after user submits */}
          {result && question.exampleAnswer && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3 animate-fade-in">
              <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest border-b border-gray-100 pb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                Ví dụ câu trả lời mẫu
              </h3>
              <p className="text-[11px] font-medium text-gray-600 leading-relaxed whitespace-pre-wrap bg-indigo-50/40 border border-indigo-100 rounded-xl p-3">
                {question.exampleAnswer}
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

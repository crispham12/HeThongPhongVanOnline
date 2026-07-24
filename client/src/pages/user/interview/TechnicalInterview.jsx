import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BrainCircuit, Timer, ChevronRight, Loader2, CheckCircle, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../lib/axios';

export default function TechnicalInterview({ fullMockMode = false, role, difficulty, stack, onComplete, onQuestionChange }) {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [sessionId, setSessionId] = useState(state?.sessionId || null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [qCount, setQCount] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(3);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  const toggleVoiceInput = () => {
    if (!SpeechRecognition) {
      alert('Trình duyệt không hỗ trợ ghi âm. Vui lòng dùng Chrome.');
      return;
    }
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        let text = '';
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        setAnswer(text); // Điền thẳng vào answer textarea
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    }
  };

  const createTechnicalSession = async () => {
    try {
      const { data } = await api.post('/interview/start', {
        role: role,
        stack: stack,
        difficulty: difficulty,
        type: 'technical',
      });
      setSessionId(data.sessionId);
      if (data.totalQuestions) setTotalQuestions(data.totalQuestions);
    } catch (error) {
      alert('Không thể tạo phiên Technical. Vui lòng thử lại.');
    }
  };

  useEffect(() => {
    if (fullMockMode && !sessionId) {
      createTechnicalSession();
    } else if (!fullMockMode && !state?.sessionId) {
      navigate('/setup');
    } else if (sessionId) {
      fetchNextQuestion(sessionId);
    }
    return () => {
      recognitionRef.current?.stop();
    };
  }, [sessionId]);

  useEffect(() => {
    if (onQuestionChange) {
      onQuestionChange(qCount, totalQuestions);
    }
  }, [qCount, totalQuestions, onQuestionChange]);

  const fetchNextQuestion = async (sid) => {
    const activeSid = sid || sessionId;
    if (!activeSid) return;
    setLoading(true);
    try {
      const response = await api.get(`/interview/next-question/${activeSid}`);
      setQuestion(response.data.question);
      setAnswer('');
      if (response.data.totalQuestions) {
        setTotalQuestions(response.data.totalQuestions);
      } else if (response.data.session?.totalQuestions) {
        setTotalQuestions(response.data.session.totalQuestions);
      }
    } catch (error) {
      console.error("Lỗi lấy câu hỏi:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInterviewComplete = (completedSessionId) => {
    if (fullMockMode && onComplete) {
      onComplete(String(completedSessionId));
    } else {
      navigate(`/interview/analysis/${completedSessionId}`);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post('/interview/submit-answer', {
        sessionId: sessionId,
        questionContent: question,
        answer: answer
      });

      if (qCount >= totalQuestions) {
        handleInterviewComplete(sessionId);
      } else {
        setQCount(p => p + 1);
        fetchNextQuestion(sessionId);
      }
    } catch (error) {
      alert("Lỗi nộp bài.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      <p className="text-gray-500 font-bold animate-pulse">AI đang phân tích cấu hình & soạn câu hỏi...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-primary-600" /> Phỏng vấn chuyên sâu
          </h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">
            Giai đoạn: {role || state?.role} • {difficulty || state?.level}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-gray-400 block mb-1">CÂU HỎI {qCount}/{totalQuestions}</span>
          <div className="flex gap-1">
            {Array.from({ length: totalQuestions }).map((_, idx) => {
              const i = idx + 1;
              return (
                <div key={i} className={`h-1.5 w-8 rounded-full ${i <= qCount ? 'bg-primary-600' : 'bg-gray-100'}`} />
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={qCount}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-100 p-10 shadow-xl shadow-gray-50 min-h-[450px] flex flex-col"
        >
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 leading-relaxed">
              {question}
            </h2>
          </div>

          <div className="flex-1 relative">
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Nhập câu trả lời chi tiết của bạn tại đây..."
              className="w-full h-48 p-6 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-100 text-gray-700 resize-none transition-all pr-12"
            />
            {SpeechRecognition && (
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`absolute bottom-3 right-3 p-1.5 rounded-lg transition-all ${
                  isRecording
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-slate-100 text-slate-400 hover:text-slate-600'
                }`}
                title={isRecording ? 'Dừng ghi âm' : 'Nói để nhập câu trả lời'}
              >
                <Mic className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!answer.trim() || submitting}
              className={`btn-primary px-10 py-3.5 flex items-center gap-2 ${submitting ? 'opacity-70' : ''}`}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Gửi câu trả lời'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BrainCircuit, Timer, ChevronRight, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/axios';

export default function TechnicalInterview() {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [qCount, setQCount] = useState(1);

  // Lấy câu hỏi đầu tiên khi vào trang
  useEffect(() => {
    fetchNextQuestion();
  }, []);

  const fetchNextQuestion = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/interview/next-question/${state.sessionId}`);
      setQuestion(response.data.question);
      setAnswer('');
    } catch (error) {
      console.error("Lỗi lấy câu hỏi:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post('/interview/submit-answer', {
        sessionId: state.sessionId,
        questionContent: question,
        answer: answer
      });

      if (qCount >= 3) { // Giả định phỏng vấn 3 câu
        navigate(`/result/${state.sessionId}`);
      } else {
        setQCount(p => p + 1);
        fetchNextQuestion();
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
            Giai đoạn: {state?.role} • {state?.level}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-gray-400 block mb-1">CÂU HỎI {qCount}/3</span>
          <div className="flex gap-1">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 w-8 rounded-full ${i <= qCount ? 'bg-primary-600' : 'bg-gray-100'}`} />
            ))}
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

          <div className="flex-1">
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Nhập câu trả lời chi tiết của bạn tại đây..."
              className="w-full h-48 p-6 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-100 text-gray-700 resize-none transition-all"
            />
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

import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, User, Bot, Loader2, Timer, CheckCircle, ArrowRight } from 'lucide-react';
import api from '../../../lib/axios';

export default function HRInterview() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const sessionId = state?.sessionId;

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 mins
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(t => t > 0 ? t - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch session questions on load
  useEffect(() => {
    if (!sessionId) return;
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/hr-interviews/${sessionId}`);
        const list = response.data.questions || [];
        setQuestions(list);
        if (list.length > 0) {
          setMessages([
            {
              role: 'assistant',
              content: `Chào bạn! Tôi là trợ lý HR AI. Hãy cùng bắt đầu buổi phỏng vấn cho vị trí ${response.data.role} (${response.data.difficulty}).\n\nCâu 1 (${list[0].category}): ${list[0].questionText}`
            }
          ]);
        }
      } catch (error) {
        console.error(error);
        alert("Không thể tải danh sách câu hỏi phỏng vấn HR.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [sessionId]);

  const handleSend = async () => {
    if (!input.trim() || loading || currentQuestionIndex >= questions.length) return;

    const userMsg = input;
    const currentQ = questions[currentQuestionIndex];
    
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      // Gửi câu trả lời lên server C# để AI đánh giá
      const response = await api.post(`/hr-interviews/${sessionId}/answers`, {
        questionId: currentQ.questionId,
        answerText: userMsg
      });

      const data = response.data;
      const nextIdx = currentQuestionIndex + 1;

      if (data.isCompleted || nextIdx >= questions.length) {
        // Hoàn thành buổi phỏng vấn
        setMessages(prev => [
          ...prev,
          { 
            role: 'assistant', 
            content: `Cảm ơn câu trả lời của bạn!\n\nChúc mừng bạn đã hoàn thành xuất sắc tất cả ${questions.length} câu hỏi phỏng vấn HR. Hệ thống đã tổng hợp kết quả chi tiết. Vui lòng bấm nút "Xem kết quả đánh giá" bên dưới.`
          }
        ]);
        setCurrentQuestionIndex(questions.length);
      } else {
        // Sang câu hỏi tiếp theo
        const nextQ = questions[nextIdx];
        setMessages(prev => [
          ...prev,
          { 
            role: 'assistant', 
            content: `[Nhận xét nhanh của AI: ${data.feedback} - Điểm: ${data.questionScore}/10]\n\nCâu ${nextIdx + 1} (${nextQ.category}): ${nextQ.questionText}`
          }
        ]);
        setCurrentQuestionIndex(nextIdx);
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Lỗi khi gửi câu trả lời.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary-600" /> Phỏng vấn HR Behavioral
          </h1>
          <p className="text-sm text-gray-500">Đang phỏng vấn cấp độ: <span className="font-semibold text-primary-600 uppercase">{state?.level}</span></p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-orange-50 border border-orange-100 rounded-xl flex items-center gap-2 text-orange-700 font-mono font-bold">
            <Timer className="w-4 h-4" /> {formatTime(timeLeft)}
          </div>
          {currentQuestionIndex >= questions.length && questions.length > 0 ? (
            <button 
              onClick={() => navigate(`/evaluation/${sessionId}`)} 
              className="btn-primary bg-primary-600 hover:bg-primary-700 border-primary-700 font-bold px-6 py-2 rounded-xl text-white animate-bounce"
            >
              Xem kết quả đánh giá <ArrowRight className="w-4 h-4 inline-block ml-1" />
            </button>
          ) : (
            <button 
              onClick={() => {
                if (window.confirm("Bạn có chắc chắn muốn thoát? Kết quả sẽ không được lưu nếu chưa hoàn thành 10 câu hỏi.")) {
                  navigate('/dashboard');
                }
              }} 
              className="btn-primary bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-600 font-bold px-4 py-2 rounded-xl"
            >
              Thoát phỏng vấn
            </button>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto card p-0 flex flex-col mb-4">
        <div className="flex-1 p-6 space-y-6">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-primary-600' : 'bg-gray-100'}`}>
                  {m.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-gray-600" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'}`}>
                  {m.content}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-pulse">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl rounded-tl-none text-xs text-gray-400 italic">
                  AI đang suy nghĩ...
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="relative">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Nhập câu trả lời của bạn tại đây... (Shift + Enter để xuống dòng)"
              className="input pr-12 min-h-[60px] py-3 resize-none"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="absolute right-2 bottom-2 w-8 h-8 bg-primary-600 text-white rounded-lg flex items-center justify-center hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center">Buổi phỏng vấn được ghi lại và phân tích bởi trí tuệ nhân tạo InterviewPro.</p>
        </div>
      </div>
    </div>
  );
}

import { Users } from 'lucide-react';

import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, User, Bot, Loader2, Timer, CheckCircle, ArrowRight } from 'lucide-react';

export default function HRInterview() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Chào bạn! Tôi là trợ lý HR AI. Rất vui được phỏng vấn bạn cho vị trí ${state?.role || 'Developer'}. Bạn đã sẵn sàng chưa?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(t => t > 0 ? t - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    // Simulated AI response (In real app, call aiApi)
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: "Cảm ơn câu trả lời của bạn. Bạn có thể chia sẻ thêm về một tình huống cụ thể mà bạn đã giải quyết xung đột trong nhóm không?" }]);
      setLoading(false);
    }, 1500);
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
          <button onClick={() => navigate('/evaluation/123')} className="btn-primary bg-green-600 hover:bg-green-700 border-green-700">
            Hoàn thành buổi phỏng vấn
          </button>
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

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, TrendingUp, AlertTriangle, BookOpen, 
  ChevronDown, ChevronUp, Download, RotateCcw, 
  LayoutDashboard, CheckCircle2, AlertCircle
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

const radarData = [
  { subject: 'Giao tiếp', score: 85 },
  { subject: 'Độ rõ ràng', score: 78 },
  { subject: 'Cấu trúc STAR', score: 70 },
  { subject: 'chuyên nghiệp', score: 88 },
  { subject: 'tự quan', score: 75 },
];

const roadmapItems = [
  { 
    id: 1, 
    title: 'Luyện STAR method', 
    desc: 'Tập trung vào việc trình bày theo đúng 4 bước: Tình huống, Nhiệm vụ, Hành động, Kết quả.' 
  },
  { 
    id: 2, 
    title: 'Bổ dung ví dụ thực tế', 
    desc: 'Chuẩn bị sẵn 3-5 câu chuyện thực tế có dữ liệu hoặc kết quả cụ thể để chứng minh năng lực.' 
  },
  { 
    id: 3, 
    title: 'Mock interview', 
    desc: 'Thử sức với các buổi phỏng vấn giả định để tăng cường phản xạ và tâm lý phòng thi.' 
  },
];

const questionsReview = [
  {
    num: '1/10',
    question: 'Hãy giới thiệu đôi chút về bản thân bạn?',
    time: '2p 15s',
    score: '7.5',
    feedback: 'Câu trả lời mạch lạc, cấu trúc tốt. Tuy nhiên cần tập trung làm nổi bật hơn các thành tựu nổi bật gần nhất thay vì liệt kê quá nhiều công việc cũ.',
    answer: 'Chào anh/chị, em là một lập trình viên với 2 năm kinh nghiệm làm việc chủ yếu với Java và Spring Boot. Tại dự án gần nhất, em đã tham gia phát triển một hệ thống quản lý giao dịch và tối ưu hóa câu lệnh SQL giúp cải thiện tốc độ tải trang 20%...'
  },
  {
    num: '2/10',
    question: 'Bạn xử lý thế nào khi có mâu thuẫn với đồng nghiệp?',
    time: '3p 40s',
    score: '8.5',
    feedback: 'Cách giải quyết mang tính xây dựng cao, thể hiện sự thấu hiểu và tinh thần đồng đội tốt. Áp dụng chuẩn phương pháp trao đổi thẳng thắn tìm gốc rễ vấn đề.',
    answer: 'Khi có bất đồng ý kiến, trước hết em sẽ chủ động hẹn một buổi trao đổi riêng 1-1 trên tinh thần xây dựng. Em sẽ lắng nghe góc nhìn của đồng nghiệp trước để hiểu nguyên nhân tại sao họ lựa chọn giải pháp đó, sau đó cùng phân tích các mặt lợi/hại dựa trên dữ liệu thực tế thay vì cảm xúc cá nhân.'
  },
  {
    num: '3/10',
    question: 'Mục tiêu 5 năm tới của bạn là gì?',
    time: '1p 50s',
    score: '7.0',
    feedback: 'Mục tiêu cá nhân rõ ràng nhưng cần liên kết chặt chẽ hơn với định hướng phát triển chung của công ty để nhà tuyển dụng thấy được sự cam kết lâu dài.',
    answer: 'Mục tiêu ngắn hạn của em là làm quen nhanh với dự án và quy trình làm việc của công ty, cống hiến hết mình để đem lại giá trị. Về dài hạn trong 5 năm tới, em mong muốn tích lũy đủ kinh nghiệm chuyên môn sâu rộng để hướng tới vị trí Tech Lead hoặc Software Architect.'
  }
];

export default function EvaluationResult() {
  const navigate = useNavigate();
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const toggleQuestion = (index) => {
    setExpandedQuestion(expandedQuestion === index ? null : index);
  };

  const downloadPDF = () => {
    const element = document.getElementById('evaluation-report-content');
    const opt = {
      margin:       [10, 10, 10, 10],
      filename:     'RecruitAI_HR_Evaluation_Report.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (8.1 / 10) * circumference;

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-24 px-8 pt-6 animate-fade-in">
      <div id="evaluation-report-content" className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Kết quả phỏng vấn HR</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-lg">Session ID: #HR-9921</span>
              <span className="flex items-center gap-1.5 text-xs font-black text-blue-600 uppercase">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                Trạng thái: Hoàn thành
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={downloadPDF}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-755 text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Download className="w-4 h-4 text-gray-500" /> Tải báo cáo (PDF)
            </button>
            <button 
              onClick={() => navigate('/setup')}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-755 text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <RotateCcw className="w-4 h-4 text-gray-500" /> Làm lại phỏng vấn
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-md shadow-primary-200 transition-all"
            >
              <LayoutDashboard className="w-4 h-4" /> Về Dashboard
            </button>
          </div>
        </div>

        {/* Dashboard Grid (Score & Skills Chart) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* HR Final Score Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm flex flex-col items-center text-center justify-between">
            <div className="w-full">
              <div className="text-left w-full mb-6">
                <h2 className="text-sm font-black text-gray-900 tracking-wider uppercase mb-2">HR Final Score</h2>
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-100">
                  <span>Tốt</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[11px]">Sẵn sàng phỏng vấn Fresher</span>
                </div>
              </div>
            </div>

            {/* Circular Progress */}
            <div className="relative flex items-center justify-center my-4">
              <svg className="w-36 h-36 transform -rotate-90">
                <circle 
                  cx="72" cy="72" r={radius} 
                  className="stroke-gray-100 fill-none" 
                  strokeWidth="10" 
                />
                <circle 
                  cx="72" cy="72" r={radius} 
                  className="stroke-primary-600 fill-none transition-all duration-1000 ease-out" 
                  strokeWidth="10" 
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-gray-900">8.1</span>
                <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase">trên 10</span>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-50 pt-6 w-full">
              <p className="text-xs text-gray-500 italic leading-relaxed text-left">
                "Ứng viên có kỹ năng giao tiếp tốt, tư duy làm việc nhóm ổn và thể hiện thái độ học hỏi tích cực."
              </p>
            </div>
          </div>

          {/* Skills Analysis Radar Chart Card */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h2 className="text-sm font-black text-gray-900 tracking-wider uppercase mb-6">Skills Analysis</h2>
            <div className="flex justify-center items-center h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#f1f5f9" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: '700' }} 
                  />
                  <Radar 
                    name="Skills" 
                    dataKey="score" 
                    stroke="#2563eb" 
                    fill="#3b82f6" 
                    fillOpacity={0.12} 
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Strengths & Areas to Improve */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Strengths Card */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-black text-gray-900 uppercase mb-5 tracking-wider">
              <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              </div>
              Điểm mạnh
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                <div>
                  <h4 className="text-xs font-black text-gray-800">Giao tiếp rõ ràng</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">Biết cách sử dụng từ ngữ mạch lạc, tránh lạm dụng thuật ngữ phức tạp.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                <div>
                  <h4 className="text-xs font-black text-gray-800">Tinh thần học hỏi</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">Thái độ cầu tiến, sẵn sàng tiếp nhận feedback từ người phỏng vấn.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Areas to Improve Card */}
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-black text-gray-900 uppercase mb-5 tracking-wider">
              <div className="w-5 h-5 rounded-full bg-orange-50 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-orange-600" />
              </div>
              Cần cải thiện
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-2 shrink-0" />
                <div>
                  <h4 className="text-xs font-black text-gray-800">Thiếu kết quả cụ thể (Result)</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">Thường xuyên bỏ qua phần định lượng kết quả trong các dự án cũ.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-2 shrink-0" />
                <div>
                  <h4 className="text-xs font-black text-gray-800">Cần cải thiện cấu trúc STAR</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">Đôi khi sa đà vào kể lể Task mà quên mô tả Situation ban đầu.</p>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Improvement Roadmap */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-black text-gray-900 uppercase mb-6 tracking-wider">
            <BookOpen className="w-4 h-4 text-primary-600" />
            Lộ trình cải thiện (Improvement Roadmap)
          </h3>
          <div className="relative pl-6 border-l border-gray-100 space-y-6">
            {roadmapItems.map((item, index) => (
              <div key={item.id} className="relative">
                {/* Number node */}
                <div className="absolute -left-[37px] top-0.5 w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-white text-[10px] font-black shadow-sm shadow-primary-200">
                  {item.id}
                </div>
                <div className="pl-2">
                  <h4 className="text-xs font-extrabold text-gray-800">{item.title}</h4>
                  <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail Question Review Accordion */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-2">Review chi tiết từng câu hỏi</h3>
          
          <div className="space-y-3">
            {questionsReview.map((q, idx) => {
              const isExpanded = expandedQuestion === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => toggleQuestion(idx)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2 py-1 rounded-md min-w-[40px] text-center">
                        {q.num}
                      </span>
                      <div>
                        <h4 className="text-xs font-extrabold text-gray-800">{q.question}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">Thời gian trả lời: {q.time}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs font-black text-primary-600">{q.score}</span>
                        <span className="text-[9px] font-bold text-gray-400 block uppercase">Điểm số</span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-gray-50 bg-gray-50/30 px-6 py-5 space-y-4 text-xs"
                      >
                        <div>
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mb-1.5">Câu trả lời của bạn</span>
                          <p className="text-[11px] text-gray-600 leading-relaxed bg-white border border-gray-100 p-3 rounded-xl shadow-inner">
                            {q.answer}
                          </p>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-blue-600 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                            <Trophy className="w-3.5 h-3.5" /> Phản hồi từ AI
                          </span>
                          <p className="text-[11px] text-gray-700 leading-relaxed bg-blue-50/40 border border-blue-50 p-3 rounded-xl">
                            {q.feedback}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between text-[10px] text-gray-400 gap-4">
          <p>Báo cáo được tạo tự động bởi RecruitAI Engine v4.2.0</p>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Điều khoản sử dụng</a>
            <span>|</span>
            <a href="#" className="hover:underline">Bảo mật dữ liệu</a>
          </div>
        </div>

      </div>
    </div>
  );
}

import { useState } from 'react';
import { Search, GitBranch, ShieldCheck, Zap, Code2, Loader2, Star, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const ScoreItem = ({ label, score, desc, icon: Icon, color }) => (
  <div className="card p-5 border border-gray-100 hover:border-primary-100 transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shadow-sm`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-right">
        <span className="text-2xl font-bold text-gray-900">{score}%</span>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Chỉ số</p>
      </div>
    </div>
    <h4 className="font-bold text-gray-900 text-sm mb-1">{label}</h4>
    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
    <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full ${color.replace('bg-', 'bg-').split(' ')[0]} transition-all duration-1000`} style={{ width: `${score}%` }} />
    </div>
  </div>
);

export default function GithubAnalysis() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = () => {
    if (!url) return;
    setLoading(true);
    setTimeout(() => {
      setResult({
        repoName: 'awesome-fullstack-app',
        overallScore: 84,
        metrics: [
          { label: 'Kiến trúc mã nguồn', score: 88, desc: 'Cấu trúc thư mục rõ ràng, tuân thủ các nguyên tắc thiết kế.', icon: Code2, color: 'bg-blue-600' },
          { label: 'Mã nguồn sạch', score: 82, desc: 'Đặt tên biến tốt, hàm ngắn gọn nhưng cần thêm comment.', icon: Star, color: 'bg-purple-600' },
          { label: 'Bảo mật', score: 75, desc: 'Phát hiện 2 dependencies cũ cần cập nhật bản vá.', icon: ShieldCheck, color: 'bg-red-600' },
          { label: 'Hiệu năng', score: 91, desc: 'Thuật toán tối ưu, không phát hiện rò rỉ bộ nhớ.', icon: Zap, color: 'bg-orange-600' },
        ]
      });
      setLoading(false);
    }, 2500);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Phân tích Repo GitHub bằng AI</h1>
        <p className="text-gray-500 mt-2 max-w-2xl mx-auto">
          Nhập đường dẫn Repository để AI đánh giá chất lượng mã nguồn, kiến trúc hệ thống và các vấn đề bảo mật của bạn.
        </p>
      </div>

      <div className="max-w-2xl mx-auto mb-12">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="https://github.com/username/repository"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="input pl-12 py-4 text-base shadow-sm"
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading || !url}
            className="btn-primary px-8 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <GitBranch className="w-5 h-5" />}
            {loading ? 'Đang phân tích...' : 'Phân tích ngay'}
          </button>
        </div>
        <p className="text-[11px] text-gray-400 mt-3 text-center">Hỗ trợ các kho chứa công khai (Public Repositories).</p>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Overall Result */}
          <div className="card bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 border-none relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-center md:text-left">
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Dự án</p>
                <h2 className="text-3xl font-bold mb-4">{result.repoName}</h2>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Vượt qua kiểm thử</span>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-yellow-400" /> 2 Cảnh báo bảo mật</span>
                </div>
              </div>
              <div className="relative">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="58" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                  <circle cx="64" cy="64" r="58" stroke="#2563eb" strokeWidth="8" strokeDasharray={364.4} strokeDashoffset={364.4 * (1 - result.overallScore / 100)} strokeLinecap="round" fill="none" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black">{result.overallScore}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Điểm tổng</span>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {result.metrics.map((m, i) => <ScoreItem key={i} {...m} />)}
          </div>

          <div className="flex justify-center">
            <button className="flex items-center gap-2 text-primary-600 font-bold hover:underline">
              Tải báo cáo phân tích chi tiết (PDF) <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

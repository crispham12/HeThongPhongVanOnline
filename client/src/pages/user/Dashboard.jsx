import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/ui/StatCard';
import { Trophy, Target, Zap, Star, BrainCircuit, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis } from 'recharts';

const data = [
  { name: 'Phản biện', score: 85 },
  { name: 'Kỹ thuật', score: 72 },
  { name: 'Tư duy', score: 90 },
  { name: 'Giao tiếp', score: 78 },
  { name: 'Code', score: 82 },
];

const radarData = [
  { subject: 'React', A: 120, fullMark: 150 },
  { subject: 'Node.js', A: 98, fullMark: 150 },
  { subject: 'SQL', A: 86, fullMark: 150 },
  { subject: 'System', A: 99, fullMark: 150 },
  { subject: 'Soft Skills', A: 85, fullMark: 150 },
];

const mockStats = {
  totalInterviews: 12,
  averageScore: 78.5,
  streak: 4,
  recentHistory: [
    { id: 1, role: 'Backend Developer', type: 'Technical', level: 'Junior', totalScore: 82, createdAt: new Date().toISOString() },
    { id: 2, role: 'Frontend Developer', type: 'HR Behavioral', level: 'Fresher', totalScore: 75, createdAt: new Date().toISOString() },
    { id: 3, role: 'AI Engineer', type: 'Coding Task', level: 'Intern', totalScore: 91, createdAt: new Date().toISOString() },
  ]
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const stats = mockStats; // In real app, fetch from API

  return (
    <div className="animate-fade-in pb-16 bg-white min-h-screen text-neutral-800">
      {/* Header section with command feel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-100 pb-6 mb-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">Chào buổi sáng, {user?.name}</h1>
          <p className="text-xs text-neutral-400 mt-1">Theo dõi hoạt động, phân tích kỹ năng và lịch sử phỏng vấn trực tuyến của bạn.</p>
        </div>
        <button 
          id="btn-start-interview" 
          onClick={() => navigate('/setup')} 
          className="inline-flex items-center justify-center gap-2 bg-[#333333] hover:bg-[#1a1a1a] text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-all duration-150 shadow-sm active:scale-[0.98] w-full sm:w-auto"
        >
          <span>Bắt đầu phỏng vấn</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Tổng số buổi" value={stats.totalInterviews} icon={Trophy} trend="+2 tuần này" />
        <StatCard title="Điểm trung bình" value={`${stats.averageScore}%`} icon={Target} trend="+5.4% tháng này" />
        <StatCard title="Chuỗi ngày" value={`${stats.streak} ngày`} icon={Zap} trend="Duy trì tốt!" />
        <StatCard title="Kỹ năng cao nhất" value="React" icon={Star} trend="Backend cần cải thiện" />
      </div>

      {/* Analytics & Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Skills Progress Card */}
          <div className="bg-white border border-neutral-200/80 rounded-xl p-6">
            <div className="mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Tiến độ kỹ năng</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">Điểm số phân loại dựa theo các khía cạnh phỏng vấn</p>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888888' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888888' }} />
                  <Tooltip 
                    cursor={{ fill: '#fafafa' }} 
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: '1px solid #e5e5e5', 
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                      fontSize: '11px',
                      fontFamily: 'Inter, sans-serif'
                    }} 
                  />
                  <Bar dataKey="score" fill="#333333" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent History Card */}
          <div className="bg-white border border-neutral-200/80 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Lịch sử gần đây</h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">Các phiên luyện tập gần nhất</p>
              </div>
              <button 
                id="btn-view-all" 
                onClick={() => navigate('/history')} 
                className="text-xs text-neutral-500 hover:text-neutral-900 font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="divide-y divide-neutral-100">
              {stats.recentHistory.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 hover:bg-neutral-50/50 transition-colors px-2 rounded-lg -mx-2">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center text-neutral-600">
                      <BrainCircuit className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">{item.role}</p>
                      <p className="text-[10px] text-neutral-400 font-medium tracking-wide uppercase mt-0.5">{item.type} • {item.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-neutral-800">{item.totalScore}%</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Capability Map */}
        <div className="bg-white border border-neutral-200/80 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-6">Bản đồ năng lực AI</h3>
            <div className="h-[260px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#e5e5e5" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#737373', fontWeight: 500 }} />
                  <Radar name="Kỹ năng" dataKey="A" stroke="#333333" fill="#333333" fillOpacity={0.15} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-6 p-4 bg-neutral-50 border border-neutral-100 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                AI
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Dựa trên phân tích AI, kỹ năng <strong>Frontend</strong> của bạn rất tốt. Bạn nên tập trung vào <strong>System Design</strong> để nâng cấp lên vị trí Senior.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


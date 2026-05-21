import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/ui/StatCard';
import { Trophy, Target, Zap, Star, BrainCircuit } from 'lucide-react';
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
    <div className="animate-fade-in pb-12">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chào buổi sáng, {user?.name}</h1>
          <p className="text-sm text-gray-500 mt-1">Đây là kết quả luyện tập và tiến độ của bạn.</p>
        </div>
        <button id="btn-start-interview" onClick={() => navigate('/setup')} className="btn-primary">
          Bắt đầu phỏng vấn
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Tổng số buổi" value={stats.totalInterviews} icon={Trophy} trend="+2 tuần này" />
        <StatCard title="Điểm trung bình" value={`${stats.averageScore}%`} icon={Target} trend="+5.4% tháng này" color="text-green-600 bg-green-50" />
        <StatCard title="Chuỗi ngày" value={`${stats.streak} ngày`} icon={Zap} trend="Duy trì tốt!" color="text-orange-600 bg-orange-50" />
        <StatCard title="Kỹ năng cao nhất" value="React" icon={Star} trend="Backend cần cải thiện" color="text-purple-600 bg-purple-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-900 mb-6">Tiến độ kỹ năng</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="score" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-semibold text-gray-900">Lịch sử gần đây</h3>
              <button id="btn-view-all" onClick={() => navigate('/history')} className="text-xs text-primary-600 font-medium hover:underline">Xem tất cả</button>
            </div>
            <div className="space-y-4">
              {stats.recentHistory.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                      <BrainCircuit className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.role}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{item.type} • {item.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{item.totalScore}%</p>
                    <p className="text-[10px] text-gray-400 font-medium">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-6">Bản đồ năng lực AI</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <Radar name="Kỹ năng" dataKey="A" stroke="#2563eb" fill="#2563eb" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 p-4 bg-primary-50 rounded-xl">
            <p className="text-xs text-primary-700 font-medium leading-relaxed">
              Dựa trên phân tích AI, kỹ năng <strong>Frontend</strong> của bạn rất tốt. Bạn nên tập trung vào <strong>System Design</strong> để nâng cấp lên Senior.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

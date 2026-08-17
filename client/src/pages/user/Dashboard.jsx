import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/ui/StatCard';
import { Trophy, Target, Zap, Star, BrainCircuit, ArrowRight, Crown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis } from 'recharts';
import { quotaApi } from '../../services/quotaApi';
import { userDashboardApi } from '../../services/userDashboardApi';

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

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalInterviews: 0,
    averageScore: 0,
    streak: 0,
    recentHistory: [],
    skillProgress: [],
    radarData: []
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [quota, setQuota] = useState(null);
  const [quotaLoading, setQuotaLoading] = useState(true);

  useEffect(() => {
    const fetchQuota = async () => {
      try {
        const { data } = await quotaApi.getQuotaStatus();
        setQuota(data);
      } catch (err) {
        console.error('Không thể lấy thông tin quota:', err);
      } finally {
        setQuotaLoading(false);
      }
    };
    
    const fetchStats = async () => {
      try {
        const { data } = await userDashboardApi.getStats();
        setStats(data);
      } catch (err) {
        console.error('Không thể lấy thống kê:', err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchQuota();
    fetchStats();
  }, []);

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
          disabled={quotaLoading || (!quota?.isUnlimited && quota?.remaining === 0)}
          className={`inline-flex items-center justify-center gap-2 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-all duration-150 shadow-sm active:scale-[0.98] w-full sm:w-auto
            ${(quotaLoading || (!quota?.isUnlimited && quota?.remaining === 0))
              ? 'bg-neutral-300 cursor-not-allowed opacity-60'
              : 'bg-[#333333] hover:bg-[#1a1a1a] cursor-pointer'
            }`}
        >
          <span>Bắt đầu phỏng vấn</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quota Banner */}
      {quotaLoading ? (
        <div className="h-10 bg-neutral-100 rounded-lg animate-pulse mb-6" />
      ) : quota && (
        <div className="mb-6">
          {quota.isUnlimited ? (
            // Premium badge
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
              <Crown className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">
                Premium
                {quota.premiumExpiresAt && (
                  <span className="font-normal ml-1 text-emerald-600">
                    — hết hạn {new Date(quota.premiumExpiresAt).toLocaleDateString('vi-VN')}
                  </span>
                )}
              </span>
            </div>
          ) : quota.remaining === 0 ? (
            // Hết quota — cảnh báo
            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="text-xs font-semibold text-red-700">Đã dùng hết 3/3 buổi hôm nay</span>
                </div>
                <span className="text-[10px] text-red-500 block mt-1">Reset lúc 00:00</span>
              </div>
              <button
                onClick={() => navigate('/upgrade')}
                className="ml-4 px-3 py-1.5 bg-[#B4F290] text-[#111827] text-[10px] font-bold rounded-lg shrink-0"
              >
                Nâng cấp
              </button>
            </div>
          ) : (
            // Còn quota — progress bar
            <div className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-neutral-700">Buổi luyện tập hôm nay</span>
                  <span className="text-xs font-bold text-neutral-900">{quota.dailyUsed}/{quota.dailyLimit}</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-1.5">
                  <div
                    className="bg-neutral-800 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${(quota.dailyUsed / quota.dailyLimit) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-neutral-400 mt-1.5">
                  Còn <strong className="text-neutral-700">{quota.remaining} buổi</strong> — Reset lúc 00:00 mỗi ngày
                </p>
              </div>
              <button
                onClick={() => navigate('/upgrade')}
                className="ml-4 px-3 py-1.5 bg-[#B4F290] text-[#111827] text-[10px] font-bold rounded-lg shrink-0"
              >
                Nâng cấp
              </button>
            </div>
          )}
        </div>
      )}

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
                <BarChart data={stats.skillProgress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888888' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888888' }} domain={[0, 100]} />
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
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.radarData}>
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


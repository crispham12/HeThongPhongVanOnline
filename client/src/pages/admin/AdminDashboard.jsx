import { Calendar, Download, Users, BarChart3, Banknote, Zap, ShieldCheck, MoreVertical } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const chartData = [
  { name: 'T2', phongVan: 80, doanhThu: 120 },
  { name: 'T3', phongVan: 120, doanhThu: 190 },
  { name: 'T4', phongVan: 100, doanhThu: 150 },
  { name: 'T5', phongVan: 180, doanhThu: 250 },
  { name: 'T6', phongVan: 150, doanhThu: 220 },
  { name: 'T7', phongVan: 240, doanhThu: 310 },
  { name: 'CN', phongVan: 210, doanhThu: 280 },
];

const recentInterviews = [
  { id: '#IV-20931', avatar: 'AN', name: 'Nguyễn Văn An', role: 'Frontend Developer', score: '85/100', status: 'Hoàn thành', statusColor: 'text-green-700 bg-green-100', avatarColor: 'bg-blue-100 text-blue-700' },
  { id: '#IV-20930', avatar: 'TH', name: 'Trần Thị Hoa', role: 'UI/UX Designer', score: '92/100', status: 'Hoàn thành', statusColor: 'text-green-700 bg-green-100', avatarColor: 'bg-indigo-100 text-indigo-700' },
  { id: '#IV-20929', avatar: 'LM', name: 'Lê Minh', role: 'Data Scientist', score: '--/100', status: 'Đang phỏng vấn', statusColor: 'text-blue-700 bg-blue-100', avatarColor: 'bg-purple-100 text-purple-700' },
  { id: '#IV-20928', avatar: 'PB', name: 'Phạm Bình', role: 'Project Manager', score: '78/100', status: 'Hoàn thành', statusColor: 'text-green-700 bg-green-100', avatarColor: 'bg-pink-100 text-pink-700' },
];

function StatCard({ title, value, icon: Icon, trend, trendUp, iconColor, iconBg }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className={`text-sm font-bold flex items-center gap-1 ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
          {trendUp ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m19 12-7 7-7-7"/><path d="M12 5v14"/></svg>
          )}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
    </div>
  );
}

function ProgressBar({ label, value, color }) {
  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-900">{value}%</span>
      </div>
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="animate-fade-in max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan hệ thống</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Chào mừng trở lại, đây là dữ liệu mới nhất trong 24 giờ qua.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
            <Calendar className="w-4 h-4" />
            Hôm nay
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Tổng người dùng" value="12,543" icon={Users} trend="12%" trendUp={true} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatCard title="Tổng phỏng vấn" value="45,890" icon={BarChart3} trend="8.4%" trendUp={true} iconColor="text-indigo-600" iconBg="bg-indigo-50" />
        <StatCard title="Doanh thu (VNĐ)" value="845,000,000" icon={Banknote} trend="15.2%" trendUp={true} iconColor="text-gray-600" iconBg="bg-gray-100" />
        <StatCard title="AI Requests" value="1.2M" icon={Zap} trend="2.1%" trendUp={false} iconColor="text-red-500" iconBg="bg-red-50" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-gray-900">Xu hướng phỏng vấn & Doanh thu</h3>
            <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>Phỏng vấn</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div>Doanh thu</div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDoanhThu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 600 }} dx={-10} />
                <Tooltip cursor={{ stroke: '#e5e7eb', strokeWidth: 1, strokeDasharray: '4 4' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="phongVan" stroke="#2563eb" strokeWidth={3} fill="none" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="doanhThu" stroke="#60a5fa" strokeWidth={3} fillOpacity={1} fill="url(#colorDoanhThu)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-gray-900 mb-6">Trạng thái hệ thống</h3>
          
          <div className="flex-1">
            <ProgressBar label="Đang xử lý (Active)" value={88} color="bg-blue-600" />
            <ProgressBar label="Server Load" value={42} color="bg-blue-500" />
            <ProgressBar label="User Retention" value={65} color="bg-slate-600" />
          </div>

          <div className="mt-4 border border-gray-100 bg-gray-50 rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Bảo trì hệ thống</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Lần cuối: 2h trước</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Phiên phỏng vấn gần đây</h3>
          <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">Xem tất cả</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Mã phiên</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Người dùng</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Vai trò</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Điểm tổng</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentInterviews.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-xs font-bold text-gray-900">{item.id}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold ${item.avatarColor}`}>
                        {item.avatar}
                      </div>
                      <span className="text-sm font-bold text-gray-700">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm font-medium text-gray-600">{item.role}</td>
                  <td className="py-4 px-6 text-sm font-bold text-blue-600">{item.score}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${item.statusColor}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

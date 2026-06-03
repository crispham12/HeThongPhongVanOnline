import { useState } from 'react';
import { Download, ClipboardList, Users, Code2, LayoutGrid, Star, Filter, X } from 'lucide-react';

const mockInterviews = [
  {
    id: '#INT-8842', avatar: 'NL', name: 'Nguyễn Văn Lộc', role: 'Frontend Dev',
    type: 'TECHNICAL', typeColor: 'bg-indigo-100 text-indigo-700',
    hr: 82, tech: 90, coding: 95, total: 89,
    status: 'Hoàn thành', avatarColor: 'bg-blue-100 text-blue-700'
  },
  {
    id: '#INT-8841', avatar: 'TT', name: 'Trần Thanh Thảo', role: 'UI/UX Designer',
    type: 'HR', typeColor: 'bg-purple-100 text-purple-700',
    hr: 75, tech: null, coding: null, total: 75,
    status: 'Đang phỏng vấn', avatarColor: 'bg-indigo-100 text-indigo-700'
  },
  {
    id: '#INT-8840', avatar: 'LT', name: 'Lê Minh Tâm', role: 'Backend Dev',
    type: 'COMPREHENSIVE', typeColor: 'bg-green-100 text-green-700',
    hr: 68, tech: 72, coding: 80, total: 73,
    status: 'Hoàn thành', avatarColor: 'bg-orange-100 text-orange-700'
  },
  {
    id: '#INT-8839', avatar: 'PH', name: 'Phạm Hoàng', role: 'Project Manager',
    type: 'HR', typeColor: 'bg-purple-100 text-purple-700',
    hr: 95, tech: null, coding: null, total: 95,
    status: 'Hoàn thành', avatarColor: 'bg-red-100 text-red-700'
  },
];

function StatCard({ title, value, icon: Icon, trend, trendUp, iconColor, iconBg, highlight, sub }) {
  if (highlight) {
    return (
      <div className="bg-blue-600 rounded-2xl p-6 border border-blue-500 shadow-sm shadow-blue-200 flex flex-col justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500 mb-4`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-blue-100 mb-1">{title}</p>
          <h3 className="text-3xl font-black text-white leading-none">{value}<span className="text-lg font-bold text-blue-200">/100</span></h3>
          {sub && <p className="text-[10px] font-bold text-blue-200 mt-2 uppercase tracking-widest">{sub}</p>}
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      <div>
        <p className="text-sm font-bold text-gray-700 mb-1">{title}</p>
        <h3 className="text-2xl font-black text-gray-900">{value}</h3>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold mt-2 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trendUp ? (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
            ) : (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m19 12-7 7-7-7"/><path d="M12 5v14"/></svg>
            )}
            {trend}
          </div>
        )}
        {!trend && <div className="h-1 w-12 bg-blue-600 rounded-full mt-3"></div>}
      </div>
    </div>
  );
}

export default function AdminInterviewData() {
  const [scoreMin, setScoreMin] = useState('');
  const [scoreMax, setScoreMax] = useState('');

  return (
    <div className="animate-fade-in max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Quản lý dữ liệu phỏng vấn</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Phân tích và theo dõi chất lượng ứng viên qua các đợt đánh giá AI.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
          <Download className="w-4 h-4" />
          Xuất báo cáo (CSV)
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
        <StatCard title="Tổng phiên" value="12,543" icon={ClipboardList} trend="+12% tháng này" trendUp={true} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatCard title="HR" value="5,200" icon={Users} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatCard title="Kỹ thuật" value="4,100" icon={Code2} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatCard title="Toàn diện" value="3,243" icon={LayoutGrid} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatCard title="Điểm trung bình" value="78" icon={Star} highlight={true} sub="TOP 15% ỨNG VIÊN" />
      </div>

      {/* Filter Box */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
        <div className="flex flex-wrap gap-5 items-end">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 tracking-wide">Role</label>
            <select className="py-2.5 pl-3 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 appearance-none cursor-pointer w-48">
              <option>Tất cả Role</option>
              <option>Frontend Dev</option>
              <option>Backend Dev</option>
              <option>UI/UX Designer</option>
              <option>Project Manager</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 tracking-wide">Loại phỏng vấn</label>
            <select className="py-2.5 pl-3 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 appearance-none cursor-pointer w-48">
              <option>Tất cả loại</option>
              <option>HR</option>
              <option>Technical</option>
              <option>Comprehensive</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 tracking-wide">Khoảng điểm</label>
            <div className="flex items-center gap-2">
              <input
                type="number" placeholder="Min"
                value={scoreMin} onChange={(e) => setScoreMin(e.target.value)}
                className="w-20 py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
              <span className="text-gray-400 font-bold">-</span>
              <input
                type="number" placeholder="Max"
                value={scoreMax} onChange={(e) => setScoreMax(e.target.value)}
                className="w-20 py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 tracking-wide">Ngày</label>
            <input
              type="date"
              className="py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 border border-blue-200 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-100 transition-colors">
            <Filter className="w-4 h-4" /> Lọc
          </button>
        </div>
        <div className="mt-4">
          <button
            onClick={() => { setScoreMin(''); setScoreMax(''); }}
            className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Xóa lọc
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-5 px-5 text-xs font-black text-gray-500 uppercase tracking-wider w-28">Mã Phiên</th>
                <th className="py-5 px-5 text-xs font-black text-gray-500 uppercase tracking-wider">Người Dùng</th>
                <th className="py-5 px-5 text-xs font-black text-gray-500 uppercase tracking-wider">Vai Trò</th>
                <th className="py-5 px-5 text-xs font-black text-gray-500 uppercase tracking-wider">Loại</th>
                <th className="py-5 px-5 text-xs font-black text-gray-500 uppercase tracking-wider text-center">HR</th>
                <th className="py-5 px-5 text-xs font-black text-gray-500 uppercase tracking-wider text-center">Kỹ Thuật</th>
                <th className="py-5 px-5 text-xs font-black text-gray-500 uppercase tracking-wider text-center">Coding</th>
                <th className="py-5 px-5 text-xs font-black text-gray-500 uppercase tracking-wider text-center">Tổng</th>
                <th className="py-5 px-5 text-xs font-black text-gray-500 uppercase tracking-wider">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockInterviews.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-5 px-5">
                    <span className="text-sm font-bold text-blue-600 cursor-pointer hover:underline">{item.id}</span>
                  </td>
                  <td className="py-5 px-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${item.avatarColor}`}>
                        {item.avatar}
                      </div>
                      <span className="text-sm font-bold text-gray-900">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-5 px-5 text-sm font-semibold text-gray-700">{item.role}</td>
                  <td className="py-5 px-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-wider ${item.typeColor}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="py-5 px-5 text-center text-sm font-bold text-gray-900">{item.hr ?? '--'}</td>
                  <td className="py-5 px-5 text-center text-sm font-bold text-gray-900">{item.tech !== null ? item.tech : '--'}</td>
                  <td className="py-5 px-5 text-center text-sm font-bold text-gray-900">{item.coding !== null ? item.coding : '--'}</td>
                  <td className="py-5 px-5 text-center">
                    <span className="text-lg font-black text-blue-600">{item.total}</span>
                  </td>
                  <td className="py-5 px-5">
                    <div className={`flex items-center gap-1.5 text-sm font-bold ${item.status === 'Hoàn thành' ? 'text-green-600' : 'text-blue-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Hoàn thành' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></div>
                      {item.status}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
          <p className="text-sm font-medium text-gray-500">
            Hiển thị <span className="font-bold text-gray-900">1 - 4</span> trên <span className="font-bold text-gray-900">12,543</span> kết quả
          </p>
          <div className="flex gap-1.5">
            <button className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 border border-gray-200 hover:bg-gray-50 font-bold text-sm transition-colors">{'<'}</button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm shadow-md shadow-blue-200">1</button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 border border-gray-200 hover:bg-gray-50 font-bold text-sm transition-colors">2</button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 border border-gray-200 hover:bg-gray-50 font-bold text-sm transition-colors">3</button>
            <span className="w-9 h-9 flex items-center justify-center text-gray-400 font-bold text-sm">...</span>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 border border-gray-200 hover:bg-gray-50 font-bold text-sm transition-colors">{'>'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

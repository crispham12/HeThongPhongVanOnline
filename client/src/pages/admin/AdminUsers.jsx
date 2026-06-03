import { useState } from 'react';
import { Download, Users, UserPlus, Ban, Activity, Award, Search, Filter, MoreVertical, RefreshCw } from 'lucide-react';

const mockUsers = [
  { id: '#USR-8241', avatar: 'NV', name: 'Nguyễn Văn A', email: 'vana.nguyen@example.com', package: 'PREMIUM', status: 'Hoạt động', date: '12/05/2023', avatarColor: 'bg-blue-100 text-blue-700' },
  { id: '#USR-7129', avatar: 'TH', name: 'Trần Thị H', email: 'h.tranthi@gmail.com', package: 'FREE', status: 'Hoạt động', date: '20/08/2023', avatarColor: 'bg-indigo-100 text-indigo-700' },
  { id: '#USR-4592', avatar: 'LM', name: 'Lê Minh', email: 'minh.le@outlook.com', package: 'PREMIUM', status: 'Bị khóa', date: '05/11/2023', avatarColor: 'bg-gray-200 text-gray-700' },
  { id: '#USR-2204', avatar: 'PT', name: 'Phạm Thu T', email: 'thut@edu.vn', package: 'FREE', status: 'Hoạt động', date: '15/01/2024', avatarColor: 'bg-blue-100 text-blue-700' },
  { id: '#USR-9938', avatar: 'VH', name: 'Võ Hoàng Y', email: 'y.vohoang@company.com', package: 'PREMIUM', status: 'Hoạt động', date: '02/02/2024', avatarColor: 'bg-blue-600 text-white' },
];

function StatCard({ title, value, icon: Icon, subtext, subtextUp, iconColor, iconBg }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-bold text-gray-700 mb-1">{title}</p>
          <h3 className="text-2xl font-black text-gray-900">{value}</h3>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      <div className={`text-xs font-semibold ${subtextUp === true ? 'text-green-600' : subtextUp === false ? 'text-red-600' : 'text-gray-500'} flex items-center gap-1`}>
        {subtextUp === true && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>}
        {subtext}
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="animate-fade-in max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Quản lý Người dùng</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Xem danh sách, phân quyền và quản lý trạng thái tài khoản hệ thống.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
            <UserPlus className="w-4 h-4" />
            Thêm người dùng
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Tổng người dùng" value="12,842" icon={Users} subtext="+12% tháng này" subtextUp={true} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatCard title="Gói Premium" value="3,120" icon={Award} subtext="24% tổng số người dùng" subtextUp={null} iconColor="text-amber-500" iconBg="bg-amber-50" />
        <StatCard title="Đang hoạt động" value="842" icon={Activity} subtext="Trong 30 phút qua" subtextUp={null} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatCard title="Tài khoản bị khóa" value="45" icon={Ban} subtext="Vi phạm chính sách" subtextUp={null} iconColor="text-red-600" iconBg="bg-red-50" />
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Tìm theo tên hoặc email..." 
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-700">Gói:</span>
              <select className="py-2.5 pl-3 pr-8 bg-gray-100/50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none">
                <option>Tất cả</option>
                <option>Premium</option>
                <option>Free</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-700">Trạng thái:</span>
              <select className="py-2.5 pl-3 pr-8 bg-gray-100/50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none">
                <option>Tất cả</option>
                <option>Hoạt động</option>
                <option>Bị khóa</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button className="p-2.5 text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2.5 text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="py-5 px-6 text-xs font-black text-gray-600 uppercase tracking-wider">ID</th>
                <th className="py-5 px-6 text-xs font-black text-gray-600 uppercase tracking-wider">Người dùng</th>
                <th className="py-5 px-6 text-xs font-black text-gray-600 uppercase tracking-wider">Gói dịch vụ</th>
                <th className="py-5 px-6 text-xs font-black text-gray-600 uppercase tracking-wider">Trạng thái</th>
                <th className="py-5 px-6 text-xs font-black text-gray-600 uppercase tracking-wider">Ngày tạo</th>
                <th className="py-5 px-6 text-xs font-black text-gray-600 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockUsers.map((user, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-xs font-bold text-gray-500">{user.id}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${user.avatarColor}`}>
                        {user.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{user.name}</p>
                        <p className="text-xs font-medium text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {user.package === 'PREMIUM' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-700 tracking-wider">
                        ☆ PREMIUM
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black bg-gray-100 text-gray-600 tracking-wider">
                        FREE
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className={`flex items-center gap-1.5 text-sm font-bold ${user.status === 'Hoạt động' ? 'text-green-600' : 'text-red-600'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Hoạt động' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      {user.status}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm font-semibold text-gray-600">{user.date}</td>
                  <td className="py-4 px-6 text-right">
                    <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
          <p className="text-sm font-medium text-gray-500">Hiển thị <span className="font-bold text-gray-900">1-10</span> trong số <span className="font-bold text-gray-900">12,842</span> người dùng</p>
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 font-bold text-sm transition-colors">{'<'}</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm shadow-md shadow-blue-200">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-bold text-sm transition-colors">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-bold text-sm transition-colors">3</button>
            <span className="w-8 h-8 flex items-center justify-center text-gray-400 font-bold text-sm">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-bold text-sm transition-colors">1284</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 font-bold text-sm transition-colors">{'>'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

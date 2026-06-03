import { useState } from 'react';
import { Download, TrendingUp, Users, RefreshCw, AlertCircle, MoreVertical, CheckCircle2, XCircle, Clock } from 'lucide-react';

const recentTransactions = [
  { id: '#RAI-12894', avatar: 'TN', name: 'Trần Nam', email: 'nam.tran@email.com', plan: 'Monthly', amount: '199.000đ', method: 'Momo', methodColor: 'bg-pink-500', status: 'Thành công', statusColor: 'text-green-700 bg-green-100', date: '24/05/2024', time: '14:30', avatarColor: 'bg-blue-100 text-blue-700' },
  { id: '#RAI-12893', avatar: 'LH', name: 'Lê Hoa', email: 'hoa.le@email.com', plan: 'Yearly', amount: '1.690.000đ', method: 'Visa Card', methodColor: 'bg-blue-600', status: 'Đang xử lý', statusColor: 'text-amber-700 bg-amber-100', date: '24/05/2024', time: '12:15', avatarColor: 'bg-indigo-100 text-indigo-700' },
  { id: '#RAI-12892', avatar: 'PA', name: 'Phạm Anh', email: 'anh.pham@email.com', plan: 'Monthly', amount: '199.000đ', method: 'ZaloPay', methodColor: 'bg-blue-500', status: 'Thất bại', statusColor: 'text-red-700 bg-red-100', date: '24/05/2024', time: '09:45', avatarColor: 'bg-purple-100 text-purple-700' },
  { id: '#RAI-12891', avatar: 'DV', name: 'Đỗ Văn', email: 'van.do@email.com', plan: 'Yearly', amount: '1.690.000đ', method: 'Banking', methodColor: 'bg-gray-600', status: 'Thành công', statusColor: 'text-green-700 bg-green-100', date: '23/05/2024', time: '22:10', avatarColor: 'bg-green-100 text-green-700' },
];

function StatusIcon({ status }) {
  if (status === 'Thành công') return <CheckCircle2 className="w-3.5 h-3.5" />;
  if (status === 'Thất bại') return <XCircle className="w-3.5 h-3.5" />;
  return <Clock className="w-3.5 h-3.5" />;
}

function StatCard({ title, value, icon: Icon, trend, trendUp, iconColor, iconBg, sub }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-6">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {trend && (
          <span className={`text-xs font-bold flex items-center gap-1 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trendUp ? (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
            ) : (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m19 12-7 7-7-7"/><path d="M12 5v14"/></svg>
            )}
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-bold text-gray-700 mb-1">{title}</p>
        <h3 className="text-2xl font-black text-gray-900 leading-tight">{value}</h3>
        {sub && <p className="text-xs text-gray-500 font-medium mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminPayments() {
  const [txFilter, setTxFilter] = useState('all');

  const filtered = txFilter === 'all' ? recentTransactions
    : txFilter === 'success' ? recentTransactions.filter(t => t.status === 'Thành công')
    : recentTransactions.filter(t => t.status === 'Thất bại');

  return (
    <div className="animate-fade-in max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Thanh toán & Gói dịch vụ</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Quản lý doanh thu, các gói đăng ký và lịch sử giao dịch toàn hệ thống.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Tổng doanh thu" value="845.000.000 VNĐ" icon={TrendingUp} trend="+12.5%" trendUp={true} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatCard title="Premium Users" value="3,120" icon={Users} trend="+8%" trendUp={true} iconColor="text-amber-500" iconBg="bg-amber-50" />
        <StatCard title="Subscription đang hoạt động" value="2,850" icon={RefreshCw} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatCard title="Thanh toán thất bại" value="12" icon={AlertCircle} iconColor="text-red-500" iconBg="bg-red-50" />
      </div>

      {/* Pricing Plans */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Cấu hình Gói dịch vụ</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col">
            <div className="mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Cơ bản</span>
              <h3 className="text-xl font-bold text-gray-900 mt-2">Free</h3>
              <div className="flex items-baseline gap-1 mt-3">
                <span className="text-4xl font-black text-gray-900">0đ</span>
                <span className="text-sm font-semibold text-gray-500">/ vĩnh viễn</span>
              </div>
            </div>
            <ul className="space-y-3 flex-1 mb-6">
              {['1 CV mẫu cơ bản', 'Xuất file PDF (có watermark)', 'Lưu trữ 1 bản thảo'].map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm font-medium text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <button className="w-full py-2.5 border-2 border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors">
              Chỉnh sửa gói
            </button>
          </div>

          {/* Premium Monthly - featured */}
          <div className="bg-white rounded-2xl p-6 border-2 border-blue-500 shadow-lg shadow-blue-100 flex flex-col relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="px-4 py-1 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-md shadow-blue-200">Phổ biến nhất</span>
            </div>
            <div className="mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Nâng cao</span>
              <h3 className="text-xl font-bold text-gray-900 mt-2">Premium Monthly</h3>
              <div className="flex items-baseline gap-1 mt-3">
                <span className="text-4xl font-black text-gray-900">199k</span>
                <span className="text-sm font-semibold text-gray-500">/ tháng</span>
              </div>
            </div>
            <ul className="space-y-3 flex-1 mb-6">
              {['Truy cập toàn bộ 50+ CV mẫu', 'Phân tích CV bằng AI (20 lần/tháng)', 'Xuất file chất lượng cao (No watermark)', 'Ưu tiên hỗ trợ 24/7'].map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm font-medium text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <button className="w-full py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-200">
              Quản lý đăng ký
            </button>
          </div>

          {/* Premium Yearly */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col">
            <div className="mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Tiết kiệm 30%</span>
              <h3 className="text-xl font-bold text-gray-900 mt-2">Premium Yearly</h3>
              <div className="flex items-baseline gap-1 mt-3">
                <span className="text-4xl font-black text-gray-900">1.69tr</span>
                <span className="text-sm font-semibold text-gray-500">/ năm</span>
              </div>
            </div>
            <ul className="space-y-3 flex-1 mb-6">
              {['Toàn bộ tính năng Premium Monthly', 'Phân tích CV bằng AI (Không giới hạn)', 'Tặng 1 buổi Review CV cùng chuyên gia'].map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm font-medium text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <button className="w-full py-2.5 border-2 border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors">
              Chỉnh sửa gói
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-gray-100 gap-4">
          <h3 className="text-base font-bold text-gray-900">Giao dịch gần đây</h3>
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {[['all', 'Tất cả'], ['success', 'Thành công'], ['failed', 'Thất bại']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setTxFilter(val)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${txFilter === val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-5 px-6 text-xs font-black text-gray-500 uppercase tracking-wider">Mã Giao Dịch</th>
                <th className="py-5 px-6 text-xs font-black text-gray-500 uppercase tracking-wider">Người Dùng</th>
                <th className="py-5 px-6 text-xs font-black text-gray-500 uppercase tracking-wider">Gói</th>
                <th className="py-5 px-6 text-xs font-black text-gray-500 uppercase tracking-wider">Số Tiền</th>
                <th className="py-5 px-6 text-xs font-black text-gray-500 uppercase tracking-wider">Cổng Thanh Toán</th>
                <th className="py-5 px-6 text-xs font-black text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                <th className="py-5 px-6 text-xs font-black text-gray-500 uppercase tracking-wider">Ngày Thanh Toán</th>
                <th className="py-5 px-6 text-xs font-black text-gray-500 uppercase tracking-wider text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((tx, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-xs font-bold text-gray-500">{tx.id}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${tx.avatarColor}`}>
                        {tx.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{tx.name}</p>
                        <p className="text-xs text-gray-500 font-medium">{tx.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-sm font-bold ${tx.plan === 'Yearly' ? 'text-green-600' : 'text-blue-600'}`}>{tx.plan}</span>
                  </td>
                  <td className="py-4 px-6 text-sm font-black text-gray-900">{tx.amount}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-sm ${tx.methodColor}`}></div>
                      <span className="text-sm font-semibold text-gray-700">{tx.method}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${tx.statusColor}`}>
                      <StatusIcon status={tx.status} />
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-semibold text-gray-900">{tx.date}</p>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">{tx.time}</p>
                  </td>
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
          <p className="text-sm font-medium text-gray-500">Hiển thị <span className="font-bold text-gray-900">1-10</span> của <span className="font-bold text-gray-900">1,280</span> giao dịch</p>
          <div className="flex gap-1.5">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 border border-gray-200 hover:bg-gray-50 font-bold text-sm transition-colors">{'<'}</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm shadow-md shadow-blue-200">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 border border-gray-200 hover:bg-gray-50 font-bold text-sm transition-colors">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 border border-gray-200 hover:bg-gray-50 font-bold text-sm transition-colors">3</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 border border-gray-200 hover:bg-gray-50 font-bold text-sm transition-colors">{'>'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

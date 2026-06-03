import { useState } from 'react';
import { Download, Zap, Timer, BarChart4, CreditCard, Activity } from 'lucide-react';

const recentLogs = [
  { user: 'Nguyễn Văn A', feature: 'Tạo câu hỏi phỏng vấn', status: 'Thành công', token: '450', responseTime: '1.2s', time: 'Vừa xong' },
  { user: 'Trần Thị H', feature: 'Phân tích CV', status: 'Thành công', token: '1,200', responseTime: '3.4s', time: '5 phút trước' },
  { user: 'Lê Minh', feature: 'Tư vấn nghề nghiệp', status: 'Lỗi API', token: '0', responseTime: '0.8s', time: '12 phút trước', isError: true },
  { user: 'Phạm Thu T', feature: 'Đánh giá ứng viên', status: 'Thành công', token: '850', responseTime: '2.1s', time: '20 phút trước' },
  { user: 'Hệ thống', feature: 'Auto-scoring', status: 'Thành công', token: '2,100', responseTime: '4.5s', time: '35 phút trước' },
];

function StatCard({ title, value, icon: Icon, trend, trendUp, iconColor, iconBg, subtitle }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-6">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {trend && (
          <div className={`text-xs font-bold flex items-center gap-1 ${trendUp ? 'text-blue-600' : 'text-blue-600'}`}>
            {trendUp ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m19 12-7 7-7-7"/><path d="M12 5v14"/></svg>
            )}
            {trend}
          </div>
        )}
        {subtitle && (
          <div className="text-xs font-bold text-gray-900">{subtitle}</div>
        )}
      </div>
      <div>
        <p className="text-sm font-bold text-gray-700 mb-1">{title}</p>
        <h3 className="text-2xl font-black text-gray-900">{value}</h3>
      </div>
    </div>
  );
}

export default function AdminAIMonitor() {
  const [timeFilter, setTimeFilter] = useState('24h');

  return (
    <div className="animate-fade-in max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Giám sát hệ thống AI</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Theo dõi hiệu năng và chi phí vận hành mô hình ngôn ngữ lớn (LLM)</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            <button 
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${timeFilter === '24h' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setTimeFilter('24h')}
            >
              24 Giờ
            </button>
            <button 
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${timeFilter === '7d' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setTimeFilter('7d')}
            >
              7 Ngày
            </button>
            <button 
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${timeFilter === '30d' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setTimeFilter('30d')}
            >
              30 Ngày
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Tổng AI Requests" value="42,892" icon={Zap} trend="+12.5%" trendUp={true} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatCard title="Thời gian phản hồi TB" value="1.8s" icon={Timer} trend="+0.2s" trendUp={true} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatCard title="Token đã dùng" value="8,241,500" icon={BarChart4} trend="-4.1%" trendUp={false} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatCard title="Chi phí ước tính" value="$164.82" icon={CreditCard} subtitle="Tháng này" iconColor="text-red-500" iconBg="bg-red-50" />
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column: Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Lưu lượng Token theo ngày</h3>
            <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>Input</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-300"></div>Output</div>
            </div>
          </div>
          <div className="flex-1 min-h-[300px] border-b border-l border-gray-100 relative mt-4">
            <div className="absolute bottom-0 w-full flex justify-between text-[11px] text-gray-500 font-semibold px-4 translate-y-6">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
        </div>

        {/* Right Column: Status & Top Features */}
        <div className="flex flex-col gap-6">
          {/* Status Box */}
          <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-sm shadow-blue-200">
            <h3 className="text-lg font-bold mb-6">Tình trạng hệ thống</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-blue-500/50 pb-4">
                <span className="text-blue-100 text-sm font-semibold">API Status</span>
                <span className="px-2.5 py-1 bg-green-500 text-white text-[10px] font-bold rounded-md tracking-wider">HOẠT ĐỘNG</span>
              </div>
              <div className="flex justify-between items-center border-b border-blue-500/50 pb-4">
                <span className="text-blue-100 text-sm font-semibold">GPT-4 Limit</span>
                <span className="text-white text-sm font-bold tracking-wide">82% Used</span>
              </div>
              <div className="flex justify-between items-center pb-4">
                <span className="text-blue-100 text-sm font-semibold">System Latency</span>
                <span className="text-white text-sm font-bold tracking-wide">45ms</span>
              </div>
            </div>
            
            <div className="mt-2">
              <div className="w-full h-2 bg-blue-500 rounded-full overflow-hidden mb-3">
                <div className="w-[82%] h-full bg-white rounded-full shadow-sm"></div>
              </div>
              <p className="text-[11px] text-blue-100 italic text-center font-medium">Hệ thống đang hoạt động trong ngưỡng an toàn.</p>
            </div>
          </div>

          {/* Top Features */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Top tính năng dùng AI</h3>
            
            <div className="space-y-5">
              {[
                { name: 'Tạo câu hỏi phỏng vấn', val: 75, color: 'bg-blue-600' },
                { name: 'Phân tích CV', val: 42, color: 'bg-blue-500' },
                { name: 'Tư vấn nghề nghiệp', val: 18, color: 'bg-blue-800' },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-900 shrink-0">
                      {idx + 1}
                    </div>
                    <span className="text-sm font-bold text-gray-900 flex-1">{item.name}</span>
                    <span className="text-sm font-black text-gray-900">{item.val}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.val}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Logs Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Nhật ký request gần đây</h3>
          <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">Xem tất cả</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-wider">Người Dùng</th>
                <th className="py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-wider">Tính Năng</th>
                <th className="py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                <th className="py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-wider">Token</th>
                <th className="py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-wider">Phản Hồi</th>
                <th className="py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-wider text-right">Thời Gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-sm font-bold text-gray-900">{log.user}</td>
                  <td className="py-4 px-6 text-sm font-semibold text-gray-600">{log.feature}</td>
                  <td className="py-4 px-6">
                    <span className={`text-sm font-bold ${log.isError ? 'text-red-500' : 'text-gray-900'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm font-bold text-gray-900">{log.token}</td>
                  <td className="py-4 px-6 text-sm font-bold text-gray-900">{log.responseTime}</td>
                  <td className="py-4 px-6 text-sm font-semibold text-gray-500 text-right">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

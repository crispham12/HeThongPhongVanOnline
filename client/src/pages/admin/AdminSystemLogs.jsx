import { useState } from 'react';
import { Download, RefreshCw, CheckCircle2, AlertTriangle, AlertCircle, Info, SlidersHorizontal, Settings2 } from 'lucide-react';

const statusCards = [
  { label: 'API Status', status: 'Hoạt động', sub: '100% Uptime', type: 'ok', icon: CheckCircle2 },
  { label: 'AI Service', status: 'Hoạt động', sub: 'Latency: 240ms', type: 'ok', icon: CheckCircle2 },
  { label: 'Database', status: 'Hoạt động', sub: 'Storage: 42% used', type: 'ok', icon: CheckCircle2 },
  { label: 'Payment Service', status: 'Cảnh báo', sub: 'Timeout issues detected', type: 'warn', icon: AlertTriangle },
  { label: 'Error Rate', status: '0.02%', sub: 'Bình thường', type: 'info', icon: Info },
];

const rpmBars = [
  { label: '00:00', h: 55 }, { label: '', h: 65 }, { label: '', h: 60 },
  { label: '06:00', h: 40 }, { label: '', h: 38 }, { label: '', h: 52 },
  { label: '12:00', h: 85 }, { label: '', h: 90 }, { label: '', h: 75 },
  { label: '18:00', h: 70 }, { label: '', h: 65 }, { label: '', h: 58 },
  { label: '23:59', h: 50 },
];

const logs = [
  { id: '#LOG-8291', level: 'CRITICAL', levelColor: 'bg-red-500 text-white', service: 'Auth-Service', message: 'Multiple failed login attempts detected from IP 192.168.1.45 (Potential Brute Force)', time: 'Vừa xong 4s' },
  { id: '#LOG-8289', level: 'WARNING', levelColor: 'bg-amber-400 text-white', service: 'Payment-Gateway', message: 'Stripe API returned 402: Insufficient funds for transaction TX_9921', time: '2 phút trước' },
  { id: '#LOG-8288', level: 'INFO', levelColor: 'bg-green-500 text-white', service: 'AI-Engine', message: 'CV analysis completed successfully for User: hoang.nguyen (3.2s)', time: '5 phút trước' },
  { id: '#LOG-8285', level: 'ERROR', levelColor: 'bg-red-600 text-white', service: 'Database-Node-2', message: "Connection pool exceeded maximum capacity for 'recruit_prod' database", time: '12 phút trước' },
  { id: '#LOG-8282', level: 'INFO', levelColor: 'bg-green-500 text-white', service: 'Cloud-Storage', message: 'New profile image uploaded: profile_user_882.png', time: '18 phút trước' },
];

export default function AdminSystemLogs() {
  const [levelFilter, setLevelFilter] = useState('All Levels');

  const levelOptions = ['All Levels', 'CRITICAL', 'ERROR', 'WARNING', 'INFO'];

  return (
    <div className="animate-fade-in max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Nhật ký hệ thống</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Giám sát và theo dõi hoạt động của hạ tầng trong thời gian thực.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Tải xuống Log
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
            <RefreshCw className="w-4 h-4" />
            Làm mới dữ liệu
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statusCards.map((card, idx) => (
          <div key={idx} className={`bg-white rounded-2xl p-5 border shadow-sm flex flex-col justify-between ${card.type === 'warn' ? 'border-amber-300 shadow-amber-100' : 'border-gray-100'}`}>
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{card.label}</p>
              <card.icon className={`w-4 h-4 shrink-0 ${card.type === 'ok' ? 'text-green-500' : card.type === 'warn' ? 'text-amber-500' : 'text-blue-500'}`} />
            </div>
            <div>
              <p className={`text-xl font-black ${card.type === 'warn' ? 'text-amber-600' : 'text-gray-900'}`}>{card.status}</p>
              <p className={`text-xs font-semibold mt-1 ${card.type === 'ok' ? 'text-green-600' : card.type === 'warn' ? 'text-amber-500' : 'text-gray-500'}`}>{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* RPM Bar Chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-1">
            <div>
              <h3 className="text-base font-bold text-gray-900">Requests Per Minute (RPM)</h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Lưu lượng truy cập hệ thống 24h qua</p>
            </div>
            <select className="text-xs font-bold text-gray-700 bg-gray-100 border-none rounded-lg px-3 py-1.5 focus:outline-none">
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="mt-6 flex items-end gap-2 h-[180px]">
            {rpmBars.map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg overflow-hidden flex flex-col-reverse" style={{ height: '160px' }}>
                  <div className="bg-blue-600 rounded-t-lg w-full" style={{ height: `${bar.h}%` }}></div>
                </div>
                {bar.label && <span className="text-[10px] text-gray-400 font-semibold whitespace-nowrap">{bar.label}</span>}
                {!bar.label && <span className="text-[10px] invisible">-</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Error Rate Line Chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-1">
            <div>
              <h3 className="text-base font-bold text-gray-900">Tỉ lệ lỗi (Error Rate)</h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Tỉ lệ phản hồi 4xx và 5xx</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              Current: 0.02%
            </div>
          </div>
          <div className="mt-4 h-[180px] relative">
            <svg viewBox="0 0 400 160" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="errorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,130 C40,125 60,120 80,105 C120,80 140,40 180,35 C220,30 240,60 280,80 C320,100 360,50 400,45" stroke="#ef4444" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M0,130 C40,125 60,120 80,105 C120,80 140,40 180,35 C220,30 240,60 280,80 C320,100 360,50 400,45 L400,160 L0,160 Z" fill="url(#errorGrad)" />
              {[{cx:80,cy:105},{cx:180,cy:35},{cx:280,cy:80},{cx:400,cy:45}].map((p,i)=>(
                <circle key={i} cx={p.cx} cy={p.cy} r="4" fill="#ef4444" stroke="white" strokeWidth="2" />
              ))}
            </svg>
            <div className="absolute bottom-0 w-full flex justify-between text-[10px] text-gray-400 font-semibold">
              <span>00:00</span><span>08:00</span><span>16:00</span><span>Now</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live System Logs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-gray-900">Live System Logs</h3>
            <span className="text-sm text-gray-500 font-medium">Show:</span>
            <div className="flex gap-1">
              {levelOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => setLevelFilter(opt)}
                  className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${levelFilter === opt ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2.5 text-gray-500 hover:text-gray-900 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button className="p-2.5 text-gray-500 hover:text-gray-900 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-wider w-28">ID</th>
                <th className="py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-wider w-32">Level</th>
                <th className="py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-wider w-40">Service</th>
                <th className="py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-wider">Nội Dung Tin Nhắn</th>
                <th className="py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-wider w-36">Thời Gian</th>
                <th className="py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-wider text-right w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs
                .filter(l => levelFilter === 'All Levels' || l.level === levelFilter)
                .map((log, idx) => (
                  <tr key={idx} className={`hover:bg-gray-50/50 transition-colors ${log.level === 'CRITICAL' ? 'bg-red-50/30' : log.level === 'WARNING' ? 'bg-amber-50/30' : ''}`}>
                    <td className="py-4 px-6 text-xs font-bold text-gray-500 font-mono">{log.id}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider ${log.levelColor}`}>
                        {log.level}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-gray-900">{log.service}</td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-700 leading-relaxed max-w-sm">{log.message}</td>
                    <td className="py-4 px-6 text-xs font-semibold text-gray-500">{log.time}</td>
                    <td className="py-4 px-6 text-right">
                      <button className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">Chi tiết</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
          <p className="text-sm font-medium text-gray-500">Hiển thị <span className="font-bold text-gray-900">5</span> của <span className="font-bold text-gray-900">1,248</span> nhật ký</p>
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

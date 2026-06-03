import { useState } from 'react';
import { SlidersHorizontal, Lock, Package, BrainCircuit, CreditCard, Bell, Shield, CheckCircle2, Cloud, BarChart3 } from 'lucide-react';

const tabs = [
  { key: 'general', label: 'Chung', icon: SlidersHorizontal },
  { key: 'auth', label: 'Xác thực', icon: Lock },
  { key: 'free-limit', label: 'Giới hạn gói Free', icon: Package },
  { key: 'ai', label: 'Cấu hình AI', icon: BrainCircuit },
  { key: 'payment', label: 'Cổng thanh toán', icon: CreditCard },
  { key: 'notification', label: 'Thông báo', icon: Bell },
  { key: 'security', label: 'Bảo mật', icon: Shield },
];

function AIConfigTab() {
  const [selectedModel, setSelectedModel] = useState('gpt4o');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [timeout, setTimeout_] = useState(30);
  const [retries, setRetries] = useState(3);

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Model Selection */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-base font-bold text-gray-900">Mô hình AI chính</h3>
            <p className="text-sm text-gray-500 font-medium mt-1">Chọn mô hình ngôn ngữ lớn để xử lý dữ liệu CV và phỏng vấn.</p>
          </div>
          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-black rounded-full border border-blue-100">Đang hoạt động</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-5">
          {/* GPT-4o */}
          <button
            onClick={() => setSelectedModel('gpt4o')}
            className={`text-left p-5 rounded-2xl border-2 transition-all ${selectedModel === 'gpt4o' ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200 hover:border-gray-300'}`}
          >
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-lg font-black text-gray-900">GPT-4o</h4>
              {selectedModel === 'gpt4o' ? (
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
              )}
            </div>
            <p className="text-xs font-medium text-gray-600 mb-4 leading-relaxed">Mô hình mạnh nhất của OpenAI, tối ưu cho phân tích CV phức tạp.</p>
            <div className="flex gap-2">
              <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded-md tracking-wide">PREMIUM</span>
              <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-[10px] font-black rounded-md tracking-wide">MULTIMODAL</span>
            </div>
          </button>

          {/* GPT-3.5 Turbo */}
          <button
            onClick={() => setSelectedModel('gpt35')}
            className={`text-left p-5 rounded-2xl border-2 transition-all ${selectedModel === 'gpt35' ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200 hover:border-gray-300'}`}
          >
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-lg font-black text-gray-900">GPT-3.5 Turbo</h4>
              {selectedModel === 'gpt35' ? (
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
              )}
            </div>
            <p className="text-xs font-medium text-gray-600 mb-4 leading-relaxed">Cân bằng giữa tốc độ và chi phí, phù hợp cho các tác vụ tóm tắt nhanh.</p>
            <div className="flex gap-2">
              <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-[10px] font-black rounded-md tracking-wide">STANDARD</span>
              <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-md tracking-wide">FAST</span>
            </div>
          </button>
        </div>
      </div>

      {/* Parameters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 mb-6">Tham số cấu hình</h3>

        {/* Temperature */}
        <div className="mb-7">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-bold text-gray-900">Temperature (Độ sáng tạo)</label>
            <span className="text-sm font-black text-blue-600">{temperature.toFixed(1)}</span>
          </div>
          <input
            type="range" min="0" max="1" step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[11px] text-gray-500 font-semibold mt-2">
            <span>Chính xác (0.0)</span>
            <span>Sáng tạo (1.0)</span>
          </div>
        </div>

        {/* Other params */}
        <div className="grid grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Max Tokens</label>
            <div className="relative">
              <input
                type="number" value={maxTokens}
                onChange={(e) => setMaxTokens(e.target.value)}
                className="w-full py-3 px-4 pr-14 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">tkns</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Timeout (Giây)</label>
            <div className="relative">
              <input
                type="number" value={timeout}
                onChange={(e) => setTimeout_(e.target.value)}
                className="w-full py-3 px-4 pr-8 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">s</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Số lần thử lại</label>
            <select
              value={retries}
              onChange={(e) => setRetries(e.target.value)}
              className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={5}>5</option>
            </select>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
            <Cloud className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">API Status</p>
            <p className="text-sm font-bold text-green-600 mt-0.5">Healthy • 124ms Latency</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Usage (Current Month)</p>
            <p className="text-sm font-bold text-gray-700 mt-0.5">$142.40 / $500 Limit</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-2">
        <button className="px-6 py-3 border-2 border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors">
          Khôi phục mặc định
        </button>
        <button className="px-8 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-200">
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}

function GeneralTab() {
  return (
    <div className="flex-1 flex flex-col gap-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 mb-6">Thông tin hệ thống</h3>
        <div className="space-y-5">
          {[
            { label: 'Tên hệ thống', value: 'InterviewPro AI' },
            { label: 'Email liên hệ', value: 'admin@interviewpro.ai' },
            { label: 'Múi giờ', value: 'Asia/Ho_Chi_Minh (UTC+7)' },
            { label: 'Ngôn ngữ mặc định', value: 'Tiếng Việt' },
          ].map((field, i) => (
            <div key={i}>
              <label className="block text-sm font-bold text-gray-700 mb-2">{field.label}</label>
              <input defaultValue={field.value} className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-4">
        <button className="px-6 py-3 border-2 border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors">Hủy bỏ</button>
        <button className="px-8 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-200">Lưu thay đổi</button>
      </div>
    </div>
  );
}

function PlaceholderTab({ label }) {
  return (
    <div className="flex-1">
      <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Settings2 className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Cấu hình {label}</h3>
        <p className="text-sm text-gray-500 font-medium">Chức năng này đang được phát triển.</p>
      </div>
    </div>
  );
}

function Settings2({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>
    </svg>
  );
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('ai');

  const renderContent = () => {
    if (activeTab === 'ai') return <AIConfigTab />;
    if (activeTab === 'general') return <GeneralTab />;
    return <PlaceholderTab label={tabs.find(t => t.key === activeTab)?.label} />;
  };

  return (
    <div className="animate-fade-in max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Cài đặt hệ thống</h1>
        <p className="text-sm text-gray-500 mt-2 font-medium">Quản lý cấu hình toàn cục, tích hợp AI và bảo mật hệ thống.</p>
      </div>

      <div className="flex gap-6 items-start">
        {/* Settings Sidebar */}
        <div className="w-56 shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <nav className="p-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all mb-0.5 text-left ${
                  activeTab === tab.key
                    ? 'bg-blue-50 text-blue-600 font-bold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
}

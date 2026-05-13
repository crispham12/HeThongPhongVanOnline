import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Database, Layout, Layers, BrainCircuit, RotateCcw,
  ArrowRight, CheckCircle2, Code2, Cpu, Globe, Server
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/axios';

const roles = [
  { id: 'backend', name: 'Backend Developer', icon: Server, desc: 'Tập trung vào hệ thống, API và cơ sở dữ liệu.' },
  { id: 'frontend', name: 'Frontend Developer', icon: Globe, desc: 'Kiến trúc UI/UX và tối ưu hóa hiệu năng render.' },
  { id: 'fullstack', name: 'Fullstack Developer', icon: Layers, desc: 'Phát triển end-to-end từ UI đến Serverless.' },
  { id: 'ai', name: 'AI Engineer', icon: BrainCircuit, desc: 'Xây dựng mô hình học máy và xử lý dữ liệu lớn.' },
];

const techOptions = {
  backend: [
    { category: 'Programming Language', options: ['C#', 'Java', 'Node.js', 'Python', 'Go'] },
    { category: 'Backend Framework', options: ['ASP.NET Core', 'Spring Boot', 'ExpressJS', 'FastAPI', 'Gin'] },
    { category: 'Database', options: ['PostgreSQL', 'MySQL', 'MongoDB', 'SQL Server'] },
  ],
  frontend: [
    { category: 'Languages', options: ['JavaScript', 'TypeScript'] },
    { category: 'Frameworks', options: ['React', 'Vue', 'Angular', 'Next.js'] },
  ],
  fullstack: [
    { category: 'Frontend Stack', options: ['React', 'Next.js', 'TypeScript'] },
    { category: 'Backend Stack', options: ['Node.js', 'ASP.NET Core', 'Python'] },
    { category: 'Database', options: ['PostgreSQL', 'MongoDB', 'SQL Server'] },
  ],
  ai: [
    { category: 'Core Languages', options: ['Python', 'C++', 'R'] },
    { category: 'Frameworks', options: ['PyTorch', 'TensorFlow', 'Scikit-learn'] },
    { category: 'Tools', options: ['Docker', 'Kubernetes', 'HuggingFace'] },
  ]
};

const levels = [
  { id: 'intern', label: 'Level 01', name: 'Intern' },
  { id: 'fresher', label: 'Level 02', name: 'Fresher' },
  { id: 'junior', label: 'Level 03', name: 'Junior' },
  { id: 'senior', label: 'Level 04', name: 'Senior' },
];

const types = [
  { id: 'hr', name: 'Phỏng vấn HR', desc: 'Văn hóa, kỹ năng mềm & lãnh đạo.', path: '/interview/hr' },
  { id: 'technical', name: 'Phỏng vấn Kỹ thuật', desc: 'Thuật toán & Hệ thống.', path: '/interview/technical' },
  { id: 'coding', name: 'Đánh giá toàn diện', desc: 'Toàn bộ quy trình 9 bước AI.', path: '/interview/coding', recommended: true },
];

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [config, setConfig] = useState({ 
    role: 'backend', 
    stack: [], 
    level: 'fresher', 
    type: 'technical' 
  });

  const toggleStack = (tech) => {
    setConfig(prev => ({
      ...prev,
      stack: prev.stack.includes(tech) 
        ? prev.stack.filter(s => s !== tech) 
        : [...prev.stack, tech]
    }));
  };

  const handleStart = async () => {
    try {
      const response = await api.post('/interview/start', {
        role: config.role,
        stack: config.stack,
        difficulty: config.level,
        type: config.type
      });
      const { sessionId } = response.data;
      const target = types.find(t => t.id === config.type)?.path;
      navigate(target, { state: { ...config, sessionId } });
    } catch (error) {
      alert("Lỗi khởi tạo phiên phỏng vấn.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] pb-32 pt-12 px-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Thiết lập phỏng vấn AI</h1>
          <p className="text-gray-500 max-w-xl text-sm">Tùy chỉnh lộ trình để AI tạo ra các câu hỏi sát với thực tế công việc của bạn nhất.</p>
        </header>

        {/* Step 1: Role */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold text-xs">01</span>
            <h2 className="font-bold text-lg text-gray-900 uppercase tracking-wider">Chọn vai trò</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {roles.map(r => (
              <button
                key={r.id}
                onClick={() => setConfig(p => ({ ...p, role: r.id, stack: [] }))}
                className={`p-6 rounded-2xl border-2 transition-all text-left relative ${
                  config.role === r.id ? 'border-primary-600 bg-white shadow-xl ring-4 ring-primary-50' : 'border-gray-100 bg-white'
                }`}
              >
                <r.icon className={`w-8 h-8 mb-4 ${config.role === r.id ? 'text-primary-600' : 'text-gray-300'}`} />
                <h3 className="font-bold text-gray-900 mb-1">{r.name}</h3>
                <p className="text-[11px] text-gray-500 leading-tight">{r.desc}</p>
                {config.role === r.id && <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-primary-600" />}
              </button>
            ))}
          </div>
        </section>

        {/* Step 2: Tech Stack (Dynamic) */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold text-xs">02</span>
            <h2 className="font-bold text-lg text-gray-900 uppercase tracking-wider">Ngôn ngữ & Công nghệ</h2>
          </div>
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {techOptions[config.role].map((cat, i) => (
                <div key={i}>
                  <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-4">{cat.category}</p>
                  <div className="flex flex-wrap gap-2">
                    {cat.options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => toggleStack(opt)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                          config.stack.includes(opt) 
                            ? 'bg-primary-600 border-primary-600 text-white' 
                            : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {config.stack.length === 0 && (
              <div className="mt-8 pt-6 border-t border-gray-50 flex items-center gap-2 text-amber-500">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <p className="text-[11px] font-bold">Vui lòng chọn ít nhất 1 công nghệ để AI có thể đặt câu hỏi kỹ thuật.</p>
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Step 3: Difficulty */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold text-xs">03</span>
              <h2 className="font-bold text-lg text-gray-900 uppercase tracking-wider">Mức độ</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {levels.map(l => (
                <button
                  key={l.id}
                  onClick={() => setConfig(p => ({ ...p, level: l.id }))}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    config.level === l.id ? 'border-primary-600 bg-white ring-2 ring-primary-50' : 'border-gray-100 bg-white'
                  }`}
                >
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-1">{l.label}</p>
                  <p className="font-bold text-sm text-gray-900">{l.name}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Step 4: Type */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold text-xs">04</span>
              <h2 className="font-bold text-lg text-gray-900 uppercase tracking-wider">Hình thức</h2>
            </div>
            <div className="space-y-3">
              {types.map(t => (
                <button
                  key={t.id}
                  onClick={() => setConfig(p => ({ ...p, type: t.id }))}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                    config.type === t.id ? 'border-primary-600 bg-white ring-2 ring-primary-50' : 'border-gray-100 bg-white'
                  }`}
                >
                  <div>
                    <p className="font-bold text-sm text-gray-900">{t.name}</p>
                    <p className="text-[10px] text-gray-500">{t.desc}</p>
                  </div>
                  {config.type === t.id && <CheckCircle2 className="w-5 h-5 text-primary-600" />}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Bottom Floating Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 z-50 py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-gray-50 rounded-lg">
              <span className="text-[10px] font-bold text-gray-400 block uppercase">Bạn đã chọn</span>
              <span className="text-xs font-bold text-gray-900">
                {roles.find(r => r.id === config.role)?.name} • {config.stack.length} Công nghệ
              </span>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setConfig({ role: 'backend', stack: [], level: 'fresher', type: 'technical' })} className="px-6 py-3 font-bold text-gray-400 hover:text-gray-900 text-sm flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
            <button
              onClick={handleStart}
              disabled={config.stack.length === 0}
              className={`px-12 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                config.stack.length > 0 
                ? 'bg-primary-600 text-white shadow-xl shadow-primary-200 hover:-translate-y-0.5 active:translate-y-0' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Bắt đầu phỏng vấn <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

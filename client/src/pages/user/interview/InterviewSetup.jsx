import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database, Layers, BrainCircuit, RotateCcw,
  ArrowRight, ArrowLeft, Check, Globe, Server, Code2, Cpu
} from 'lucide-react';
import api from '../../../lib/axios';

const roles = [
  { id: 'backend', name: 'Backend Developer', icon: Server, desc: 'Tập trung vào hệ thống, API và cơ sở dữ liệu.' },
  { id: 'frontend', name: 'Frontend Developer', icon: Globe, desc: 'Kiến trúc UI/UX và tối ưu hóa hiệu năng render.' },
  { id: 'fullstack', name: 'Fullstack Developer', icon: Layers, desc: 'Phát triển end-to-end từ UI đến Serverless.' },
  { id: 'ai', name: 'AI Engineer', icon: BrainCircuit, desc: 'Xây dựng mô hình học máy và xử lý dữ liệu lớn.' },
];

const techOptions = {
  backend: [
    { category: 'Programming Language', label: 'Ngôn ngữ', options: ['C#', 'Java', 'Node.js', 'Python', 'Go'] },
    { category: 'Backend Framework', label: 'Frameworks', options: ['ASP.NET Core', 'Spring Boot', 'ExpressJS', 'FastAPI', 'Gin'] },
    { category: 'Database', label: 'Database', options: ['PostgreSQL', 'MySQL', 'MongoDB', 'SQL Server'] },
  ],
  frontend: [
    { category: 'Languages', label: 'Ngôn ngữ', options: ['JavaScript', 'TypeScript'] },
    { category: 'Frameworks', label: 'Frameworks', options: ['React', 'Vue', 'Angular', 'Next.js'] },
  ],
  fullstack: [
    { category: 'Frontend Stack', label: 'Ngôn ngữ', options: ['React', 'Next.js', 'TypeScript'] },
    { category: 'Backend Stack', label: 'Frameworks', options: ['Node.js', 'ASP.NET Core', 'Python'] },
    { category: 'Database', label: 'Database', options: ['PostgreSQL', 'MongoDB', 'SQL Server'] },
  ],
  ai: [
    { category: 'Core Languages', label: 'Ngôn ngữ', options: ['Python', 'C++', 'R'] },
    { category: 'Frameworks', label: 'Frameworks', options: ['PyTorch', 'TensorFlow', 'Scikit-learn'] },
    { category: 'Tools', label: 'Database', options: ['Docker', 'Kubernetes', 'HuggingFace'] },
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

const LANG_TO_FRAMEWORK = {
  'C#': 'ASP.NET Core',
  'Java': 'Spring Boot',
  'Node.js': 'ExpressJS',
  'Python': 'FastAPI',
  'Go': 'Gin'
};

const FRAMEWORK_TO_LANG = {
  'ASP.NET Core': 'C#',
  'Spring Boot': 'Java',
  'ExpressJS': 'Node.js',
  'FastAPI': 'Python',
  'Gin': 'Go'
};

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState({
    role: 'ai',
    stack: [],
    level: 'fresher',
    type: 'technical'
  });

  const isOptionDisabled = (opt) => {
    if (LANG_TO_FRAMEWORK[opt]) {
      const selectedFrameworks = config.stack.filter(item => FRAMEWORK_TO_LANG[item]);
      if (selectedFrameworks.length > 0) {
        const allowedLangs = selectedFrameworks.map(f => FRAMEWORK_TO_LANG[f]);
        return !allowedLangs.includes(opt);
      }
    }
    if (FRAMEWORK_TO_LANG[opt]) {
      const selectedLangs = config.stack.filter(item => LANG_TO_FRAMEWORK[item]);
      if (selectedLangs.length > 0) {
        const allowedFrameworks = selectedLangs.map(l => LANG_TO_FRAMEWORK[l]);
        return !allowedFrameworks.includes(opt);
      }
    }

    // Ràng buộc bổ sung cho vai trò Fullstack (React/Next.js không đi với ASP.NET Core/Python)
    if (config.role === 'fullstack') {
      if (opt === 'ASP.NET Core' || opt === 'Python') {
        if (config.stack.includes('React') || config.stack.includes('Next.js')) {
          return true;
        }
      }
      if (opt === 'React' || opt === 'Next.js') {
        if (config.stack.includes('ASP.NET Core') || config.stack.includes('Python')) {
          return true;
        }
      }
    }

    return false;
  };

  const toggleStack = (tech) => {
    setConfig(prev => ({
      ...prev,
      stack: prev.stack.includes(tech)
        ? prev.stack.filter(s => s !== tech)
        : [...prev.stack, tech]
    }));
  };

  const handleSelectChange = (cat, val) => {
    setConfig(prev => {
      // 1. Loại bỏ lựa chọn cũ của category hiện tại
      let newStack = prev.stack.filter(item => !cat.options.includes(item));

      if (val) {
        newStack.push(val);

        // 2. Tự động chọn Framework tương ứng khi chọn Ngôn ngữ
        if (LANG_TO_FRAMEWORK[val]) {
          const targetFramework = LANG_TO_FRAMEWORK[val];
          const roleCats = techOptions[prev.role];
          const frameworkCat = roleCats.find(c => c.category.toLowerCase().includes('framework') || c.category.toLowerCase().includes('backend stack'));
          if (frameworkCat && frameworkCat.options.includes(targetFramework)) {
            newStack = newStack.filter(item => !frameworkCat.options.includes(item));
            newStack.push(targetFramework);
          }
        }

        // 3. Tự động chọn Ngôn ngữ tương ứng khi chọn Framework
        if (FRAMEWORK_TO_LANG[val]) {
          const targetLang = FRAMEWORK_TO_LANG[val];
          const roleCats = techOptions[prev.role];
          const langCat = roleCats.find(c =>
            c.category.toLowerCase().includes('language') ||
            c.category.toLowerCase().includes('lang') ||
            c.category.toLowerCase().includes('frontend stack')
          );
          if (langCat && langCat.options.includes(targetLang)) {
            newStack = newStack.filter(item => !langCat.options.includes(item));
            newStack.push(targetLang);
          }
        }
      } else {
        // Nếu chọn trống, tự động hủy bỏ lựa chọn liên đới để người dùng chọn lại thoải mái
        const roleCats = techOptions[prev.role];
        const currentCatIsLang = cat.category.toLowerCase().includes('language') || cat.category.toLowerCase().includes('lang') || cat.category.toLowerCase().includes('frontend stack');
        const currentCatIsFramework = cat.category.toLowerCase().includes('framework') || cat.category.toLowerCase().includes('backend stack');

        if (currentCatIsLang) {
          const frameworkCat = roleCats.find(c => c.category.toLowerCase().includes('framework') || c.category.toLowerCase().includes('backend stack'));
          if (frameworkCat) {
            newStack = newStack.filter(item => !frameworkCat.options.includes(item));
          }
        } else if (currentCatIsFramework) {
          const langCat = roleCats.find(c =>
            c.category.toLowerCase().includes('language') ||
            c.category.toLowerCase().includes('lang') ||
            c.category.toLowerCase().includes('frontend stack')
          );
          if (langCat) {
            newStack = newStack.filter(item => !langCat.options.includes(item));
          }
        }
      }

      return {
        ...prev,
        stack: newStack
      };
    });
  };

  const canStartInterview = () => {
    if (!config.role || !config.level || !config.type) return false;
    if (config.type === 'hr') return true;
    if (config.type === 'technical' || config.type === 'coding') {
      return config.stack.length > 0;
    }
    return false;
  };

  const handleStart = async () => {
    try {
      if (config.type === 'hr') {
        const response = await api.post('/hr-interviews/start', {
          role: config.role,
          techStack: [],
          difficulty: config.level
        });
        const { sessionId } = response.data;
        const target = types.find(t => t.id === config.type)?.path;
        navigate(target, { state: { ...config, sessionId } });
      } else {
        const response = await api.post('/interview/start', {
          role: config.role,
          stack: config.stack,
          difficulty: config.level,
          type: config.type
        });
        const { sessionId } = response.data;
        const target = types.find(t => t.id === config.type)?.path;
        navigate(target, { state: { ...config, sessionId } });
      }
    } catch (error) {
      if (error.response && error.response.status === 402) {
        alert(error.response.data.message || "Bạn đã dùng hết 3 lượt phỏng vấn miễn phí hôm nay. Vui lòng nâng cấp Premium để tiếp tục.");
      } else {
        alert("Lỗi từ Server: " + JSON.stringify(error.response?.data || {}));
      }
    }
  };

  return (
    <div className="w-full bg-white pb-6 pt-0 px-2">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 mt-0">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Thiết lập kỹ năng</h1>
          <p className="text-slate-400 text-xs font-medium">Tùy chỉnh kỹ năng của bạn để AI tạo ra bộ câu hỏi phù hợp nhất</p>
        </header>

        {/* STEP 1: CHỌN VAI TRÒ */}
        {currentStep === 1 && (
          <section className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">01</span>
              <h2 className="font-extrabold text-[12px] text-slate-800 uppercase tracking-widest">CHỌN VAI TRÒ</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              {roles.map(r => {
                const Icon = r.icon;
                const isSelected = config.role === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setConfig(p => ({ ...p, role: r.id, stack: [] }))}
                    className={`p-8 rounded-2xl border text-left relative transition-all duration-300 ${isSelected
                      ? 'border-slate-800 bg-white shadow-lg ring-1 ring-slate-800'
                      : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                  >
                    <Icon className={`w-8 h-8 mb-5 ${isSelected ? 'text-slate-900' : 'text-slate-400'}`} />
                    <h3 className="font-bold text-slate-800 text-base mb-1.5">{r.name}</h3>
                    <p className="text-[12px] text-slate-400 font-medium leading-relaxed">{r.desc}</p>
                    {isSelected && (
                      <div className="absolute top-5 right-5 w-4.5 h-4.5 rounded-full border border-slate-900 flex items-center justify-center bg-transparent">
                        <Check className="w-2.5 h-2.5 text-slate-900 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end items-center mt-12">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-8 py-3 bg-[#b2f396] hover:bg-[#a1e285] text-slate-900 text-sm font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm shadow-[#b2f396]/20"
              >
                Tiếp tục <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>
        )}

        {/* STEP 2: NGÔN NGỮ & CÔNG NGHỆ */}
        {currentStep === 2 && (
          <section className="animate-fade-in">
            <div className="flex items-center gap-3 mb-10">
              <span className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">02</span>
              <h2 className="font-extrabold text-[12px] text-slate-800 uppercase tracking-widest">NGÔN NGỮ & CÔNG NGHỆ</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16 max-w-3xl mx-auto justify-items-center">
              {techOptions[config.role].map((cat, i) => {
                const currentVal = config.stack.find(item => cat.options.includes(item)) || '';
                return (
                  <div key={i} className="flex flex-col gap-3 w-full items-start max-w-[170px]">
                    <label className="text-sm font-bold text-slate-950 ml-1">{cat.label}</label>
                    <div className="relative w-full">
                      <select
                        value={currentVal}
                        onChange={(e) => handleSelectChange(cat, e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-800 font-bold text-sm focus:border-slate-800 focus:outline-none appearance-none pr-10 cursor-pointer text-left"
                      >
                        {!currentVal && <option value="">Chọn...</option>}
                        {cat.options.filter(opt => !isOptionDisabled(opt) || currentVal === opt).map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 font-bold text-[10px]">
                        v
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end items-center mt-12">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-8 py-3 bg-[#F1F3F5] hover:bg-slate-200 text-slate-800 text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all mr-4 min-w-[130px]"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Quay lại
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="px-8 py-3 bg-[#b2f396] hover:bg-[#a1e285] text-slate-900 text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-[#b2f396]/20 min-w-[130px]"
              >
                Tiếp tục <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>
        )}

        {/* STEP 3: MỨC ĐỘ */}
        {currentStep === 3 && (
          <section className="animate-fade-in">
            <div className="flex items-center gap-3 mb-8">
              <span className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">03</span>
              <h2 className="font-extrabold text-[12px] text-slate-800 uppercase tracking-widest">MỨC ĐỘ</h2>
            </div>

            <div className="max-w-2xl mx-auto mb-16">
              <div className="grid grid-cols-2 gap-4">
                {levels.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setConfig(p => ({ ...p, level: l.id }))}
                    className={`p-6 rounded-xl border text-left transition-all duration-300 ${config.level === l.id
                        ? 'border-slate-800 bg-white ring-1 ring-slate-800 shadow-md'
                        : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                  >
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1.5">{l.label}</p>
                    <p className="font-bold text-base text-slate-900">{l.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end items-center mt-12">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-8 py-3 bg-[#F1F3F5] hover:bg-slate-200 text-slate-800 text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all mr-4 min-w-[130px]"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Quay lại
              </button>
              <button
                onClick={handleStart}
                disabled={!canStartInterview()}
                className={`px-8 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-all min-w-[160px] ${canStartInterview()
                    ? 'bg-[#b2f396] hover:bg-[#a1e285] text-slate-900 shadow-sm shadow-[#b2f396]/20'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
              >
                Bắt đầu phỏng vấn <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}

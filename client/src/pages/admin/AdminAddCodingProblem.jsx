import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'
import {
  Plus, X, Check, Loader2, Code2, BookOpen, TestTube2, Zap,
  Globe, Lock, Save, AlertCircle, Eye, EyeOff, ToggleRight,
  Shuffle, ChevronLeft, ChevronRight, Hash,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminCodingBankApi } from '../../services/codingBankApi';

// ─────────────────────────────────────────
// Constants
// ─────────────────────────────────────────
const DIFF_STYLES = {
  Easy: 'bg-emerald-100 text-emerald-700',
  Medium: 'bg-amber-100  text-amber-700',
  Hard: 'bg-rose-100   text-rose-700',
};

const SUPPORTED_LANGS = ['Python', 'Java', 'C#', 'C++', 'TypeScript', 'JavaScript'];

const ALL_TARGET_SKILLS = [
  'Array', 'String', 'Hash Table', 'Stack', 'Queue', 'Linked List',
  'Tree', 'Binary Tree', 'Binary Search Tree', 'Heap / Priority Queue',
  'Graph', 'DFS', 'BFS', 'Union Find', 'Trie', 'Recursion', 'Backtracking',
  'Greedy', 'Dynamic Programming', 'Sliding Window', 'Two Pointers',
  'Prefix Sum', 'Bit Manipulation', 'Sorting', 'Searching', 'Binary Search',
  'Matrix', 'Math', 'Simulation', 'Design', 'Problem Solving',
  'Time Complexity Analysis',
];

const LANG_COLOR = {
  Python: 'bg-blue-100 text-blue-700 border-blue-200',
  Java: 'bg-orange-100 text-orange-700 border-orange-200',
  'C#': 'bg-purple-100 text-purple-700 border-purple-200',
  'C++': 'bg-red-100 text-red-700 border-red-200',
  TypeScript: 'bg-sky-100 text-sky-700 border-sky-200',
  JavaScript: 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

const DEFAULT_STARTER = {
  Python: `def solution():\n    # Your code here\n    pass`,
  Java: `import java.util.*;\n\nclass Solution {\n    public int[] solution(int[] nums, int target) {\n        // Your code here\n        return new int[]{};\n    }\n}`,
  'C#': `public class Solution {\n    public void Solve() {\n        // Your code here\n    }\n}`,
  'C++': `#include <bits/stdc++.h>\nusing namespace std;\n\nvoid solution() {\n    // Your code here\n}`,
  TypeScript: `function solution(): void {\n    // Your code here\n}`,
  JavaScript: `function solution() {\n    // Your code here\n}`,
};

// ─────────────────────────────────────────
// Toast Component (local)
// ─────────────────────────────────────────
function Toast({ toast }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -24, scale: 0.94 }}
          className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border ${toast.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}
        >
          <div className={`p-1.5 rounded-full ${toast.type === 'success' ? 'bg-emerald-500 text-white'
            : toast.type === 'error' ? 'bg-rose-500 text-white'
              : 'bg-blue-500 text-white'
            }`}>
            {toast.type === 'success' ? <Check className="w-3.5 h-3.5" />
              : toast.type === 'error' ? <X className="w-3.5 h-3.5" />
                : <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          </div>
          <span className="text-sm font-bold">{toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────
// Section Card Component
// ─────────────────────────────────────────
function SectionCard({ icon: Icon, title, iconColor = 'text-blue-500', iconBg = 'bg-blue-50', children, action }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 ${iconBg} rounded-lg flex items-center justify-center`}>
            <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
          </div>
          <span className="text-sm font-extrabold text-gray-800">{title}</span>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────
// Rich Text Toolbar
// ─────────────────────────────────────────
function RichToolbar({ onBold, onItalic, onCode }) {
  return (
    <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-100 bg-gray-50/60">
      <button type="button" onClick={onBold} className="p-1 rounded hover:bg-gray-200 text-gray-600 text-xs font-black">B</button>
      <button type="button" onClick={onItalic} className="p-1 rounded hover:bg-gray-200 text-gray-600 text-xs italic">I</button>
      <button type="button" onClick={onCode} className="p-1 rounded hover:bg-gray-200 text-gray-600 text-xs font-mono">{"<>"}</button>
    </div>
  );
}

// ─────────────────────────────────────────
// Standalone Page Component
// ─────────────────────────────────────────
export default function AdminAddCodingProblem() {
  const navigate = useNavigate();
  const { id } = useParams();
  const problemId = id || null;

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [toast, setToast] = useState(null);

  // ── Basic Info
  const [problemCode, setProblemCode] = useState('');
  const [title, setTitle] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [desc, setDesc] = useState('');

  // ── Classification
  const [diff, setDiff] = useState('Easy');
  const [categories, setCategories] = useState('');
  const [targetSkills, setTargetSkills] = useState([]);
  const [estimatedMinutes, setEstimatedMinutes] = useState(15);
  const [recommendedLevel, setRecommendedLevel] = useState('Intern');

  // ── Input/Output
  const [inputFormat, setInputFormat] = useState('');
  const [outputFormat, setOutputFormat] = useState('');

  // ── Constraints
  const [constraints, setConstraints] = useState(['']);

  // ── Examples
  const [examples, setExamples] = useState([{ input: '', output: '', explanation: '' }]);

  // ── Test Cases
  const [publicTC, setPublicTC] = useState([{ input: '', expectedOutput: '' }]);
  const [hiddenTC, setHiddenTC] = useState([{ input: '', expectedOutput: '' }]);
  const [tcTab, setTcTab] = useState('public');

  // ── Languages
  const [selectedLangs, setSelectedLangs] = useState(['Python', 'Java']);

  // ── Starter Code
  const [starterCode, setStarterCode] = useState({ Python: DEFAULT_STARTER.Python, Java: DEFAULT_STARTER.Java });
  const [starterLang, setStarterLang] = useState('Python');

  // ── Solution
  const [solutionIdea, setSolutionIdea] = useState('');
  const [timeComplexity, setTimeComplexity] = useState('');
  const [spaceComplexity, setSpaceComplexity] = useState('');
  const [solutionCode, setSolutionCode] = useState('// Solution code here');

  // ── Settings
  const [status, setStatus] = useState('Draft');
  const [isClientVisible, setIsClientVisible] = useState(true);
  const [allowRandom, setAllowRandom] = useState(true);

  // Client Preview
  const [showPreview, setShowPreview] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (!problemId) return;
    const fetchDetails = async () => {
      setLoadingDetails(true);
      try {
        const p = await adminCodingBankApi.getById(problemId);
        if (p) {
          setProblemCode(p.problemCode || '');
          setTitle(p.title || '');
          setShortDesc(p.shortDescription || '');
          setDesc(p.description || '');
          setDiff(p.difficulty || 'Easy');
          setCategories(Array.isArray(p.categories) ? p.categories.join(', ') : '');
          setTargetSkills(Array.isArray(p.targetSkills) ? p.targetSkills : []);
          setEstimatedMinutes(p.estimatedMinutes || 15);
          setRecommendedLevel(p.recommendedLevel || 'Intern');
          setInputFormat(p.inputFormat || '');
          setOutputFormat(p.outputFormat || '');
          setConstraints(Array.isArray(p.constraints) && p.constraints.length > 0 ? p.constraints : ['']);
          setExamples(Array.isArray(p.examples) && p.examples.length > 0 ? p.examples : [{ input: '', output: '', explanation: '' }]);

          if (Array.isArray(p.publicTestCases) && p.publicTestCases.length > 0) {
            setPublicTC(p.publicTestCases);
          }
          if (Array.isArray(p.hiddenTestCases) && p.hiddenTestCases.length > 0) {
            setHiddenTC(p.hiddenTestCases);
          }
          if (Array.isArray(p.supportedLanguages)) {
            setSelectedLangs(p.supportedLanguages);
            if (p.supportedLanguages.length > 0) {
              setStarterLang(p.supportedLanguages[0]);
            }
          }
          if (p.starterCode) {
            setStarterCode(p.starterCode);
          }
          if (p.solution) {
            setSolutionIdea(p.solution.idea || '');
            setTimeComplexity(p.solution.timeComplexity || '');
            setSpaceComplexity(p.solution.spaceComplexity || '');
            setSolutionCode(p.solution.code || '');
          }
          setStatus(p.status || 'Draft');
          setIsClientVisible(p.isClientVisible ?? true);
          setAllowRandom(p.allowRandomSelection ?? true);
        }
      } catch (err) {
        setToast({ type: 'error', message: 'Không thể tải chi tiết bài toán.' });
      } finally {
        setLoadingDetails(false);
      }
    };
    fetchDetails();
  }, [problemId]);

  // ── Helpers
  const toggleLang = (lang) => {
    setSelectedLangs(prev => {
      if (prev.includes(lang)) return prev.filter(l => l !== lang);
      const next = [...prev, lang];
      setStarterCode(sc => ({ ...sc, [lang]: sc[lang] || DEFAULT_STARTER[lang] || '' }));
      return next;
    });
  };

  const addConstraint = () => setConstraints(c => [...c, '']);
  const removeConstraint = (i) => setConstraints(c => c.filter((_, idx) => idx !== i));
  const updateConstraint = (i, val) => setConstraints(c => c.map((x, idx) => idx === i ? val : x));

  const addExample = () => setExamples(e => [...e, { input: '', output: '', explanation: '' }]);
  const removeExample = (i) => setExamples(e => e.filter((_, idx) => idx !== i));
  const updateExample = (i, field, val) => setExamples(e => e.map((x, idx) => idx === i ? { ...x, [field]: val } : x));

  const addTC = (type) => {
    if (type === 'public') setPublicTC(t => [...t, { input: '', expectedOutput: '' }]);
    else setHiddenTC(t => [...t, { input: '', expectedOutput: '' }]);
  };
  const removeTC = (type, i) => {
    if (type === 'public') setPublicTC(t => t.filter((_, idx) => idx !== i));
    else setHiddenTC(t => t.filter((_, idx) => idx !== i));
  };
  const updateTC = (type, i, field, val) => {
    const setter = type === 'public' ? setPublicTC : setHiddenTC;
    setter(t => t.map((x, idx) => idx === i ? { ...x, [field]: val } : x));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setToast({ type: 'error', message: 'Vui lòng nhập tiêu đề bài toán!' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        problemCode: problemCode || `PROB-${Date.now()}`,
        title,
        shortDescription: shortDesc,
        description: desc || title,
        difficulty: diff,
        categories: categories.split(',').map(c => c.trim()).filter(Boolean),
        recommendedLevel,
        targetSkills: targetSkills,
        estimatedMinutes: parseInt(estimatedMinutes) || 15,
        inputFormat: inputFormat || null,
        outputFormat: outputFormat || null,
        constraints: constraints.filter(c => c.trim()),
        examples: examples.filter(e => e.input || e.output),
        publicTestCases: publicTC.filter(t => t.input || t.expectedOutput).map(t => ({ ...t, isHidden: false })),
        hiddenTestCases: hiddenTC.filter(t => t.input || t.expectedOutput).map(t => ({ ...t, isHidden: true })),
        supportedLanguages: selectedLangs,
        starterCode,
        solution: {
          idea: solutionIdea,
          timeComplexity,
          spaceComplexity,
          code: solutionCode,
        },
        status,
        allowRandomSelection: allowRandom,
        isClientVisible,
      };

      let result;
      if (problemId) {
        result = await adminCodingBankApi.update(problemId, payload);
      } else {
        result = await adminCodingBankApi.create(payload);
      }

      if (status === 'Published' && result?.id) {
        await adminCodingBankApi.publish(result.id);
      }

      // Redirect back with toast info
      navigate('/admin/coding-bank', {
        state: {
          toast: {
            type: 'success',
            message: problemId ? `Đã cập nhật bài "${title}" thành công!` : `Đã tạo bài "${title}" thành công!`
          }
        }
      });
    } catch (err) {
      setToast({ type: 'error', message: err?.response?.data?.message || 'Lưu thất bại.' });
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: 'basic', label: 'Thông tin cơ bản', icon: BookOpen },
    { id: 'classify', label: 'Phân loại', icon: Hash },
    { id: 'io', label: 'Input/Output', icon: Hash },
    { id: 'constraints', label: 'Ràng buộc', icon: AlertCircle },
    { id: 'examples', label: 'Ví dụ', icon: Eye },
    { id: 'testcases', label: 'Test Cases', icon: TestTube2 },
    { id: 'languages', label: 'Ngôn ngữ & Code', icon: Code2 },
    { id: 'solution', label: 'Giải pháp', icon: Zap },
    { id: 'settings', label: 'Cài đặt', icon: ToggleRight },
  ];

  if (loadingDetails) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-4 relative text-[#0F172A]">
      <Toast toast={toast} />

      {/* ── Breadcrumb & Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate('/admin/coding-bank')}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Quay lại ngân hàng bài coding
          </button>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-2">
            {problemId ? 'Chỉnh sửa bài Coding' : 'Thêm bài Coding mới'}
          </h1>
        </div>
      </div>

      {/* ── Editor Workspace Layout ── */}
      <div className="flex items-stretch gap-6 h-[calc(100vh-210px)] min-h-[500px]">
        {/* Left Form Panel */}
        <form onSubmit={handleSave} className={`flex flex-col bg-white border border-gray-150 rounded-2xl shadow-sm overflow-hidden transition-all ${showPreview ? 'w-[58%]' : 'w-full'}`}>
          {/* Tab Selector */}
          <div className="flex overflow-x-auto border-b border-gray-100 bg-gray-50/50 shrink-0 px-2 gap-0.5">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-700 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-750 hover:bg-gray-100/50'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
            {/* ── BASIC INFO ── */}
            {activeTab === 'basic' && (
              <SectionCard icon={Hash} title="Thông tin cơ bản" iconColor="text-blue-500" iconBg="bg-blue-50">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Mã bài (Problem Code)</label>
                    <input
                      value={problemCode}
                      onChange={e => setProblemCode(e.target.value)}
                      placeholder="VD: Two-Sum, Find-Missing-Number..."
                      className="w-full px-3.5 py-2 border border-gray-250 rounded-xl text-xs font-mono focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:outline-none bg-gray-50/70"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Tiêu đề hiển thị (Client-facing title) *</label>
                    <input
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      required
                      placeholder="Tóm tắt yêu cầu đề bài trong 1 câu ngắn..."
                      className="w-full px-3.5 py-2 border border-gray-255 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Mô tả ngắn (Short description)</label>
                    <input
                      value={shortDesc}
                      onChange={e => setShortDesc(e.target.value)}
                      placeholder="Mô tả ngắn thêm thông tin cho admin..."
                      className="w-full px-3.5 py-2 border border-gray-250 rounded-xl text-xs font-medium focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:outline-none bg-gray-50/70"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Mô tả đầy đủ bài toán</label>
                    <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-4 focus-within:ring-blue-100 focus-within:border-blue-400">
                      <RichToolbar
                        onBold={() => setDesc(d => d + '**text**')}
                        onItalic={() => setDesc(d => d + '_text_')}
                        onCode={() => setDesc(d => d + '`code`')}
                      />
                      <textarea
                        value={desc}
                        onChange={e => setDesc(e.target.value)}
                        rows={8}
                        placeholder="Mô tả chi tiết bài toán, yêu cầu, ngữ cảnh..."
                        className="w-full px-3.5 py-2 text-xs font-medium focus:outline-none resize-none min-h-[150px]"
                      />
                    </div>
                  </div>
                </div>
              </SectionCard>
            )}

            {/* ── CLASSIFY ── */}
            {activeTab === 'classify' && (
              <SectionCard icon={Shuffle} title="Phân loại & Trình độ" iconColor="text-violet-500" iconBg="bg-violet-50">
                <div className="space-y-5">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">Độ khó</label>
                      <div className="flex flex-col gap-2">
                        {['Easy', 'Medium', 'Hard'].map(d => (
                          <label key={d} className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border cursor-pointer transition-all text-xs font-bold ${diff === d
                            ? d === 'Easy' ? 'bg-emerald-50 border-emerald-350 text-emerald-700'
                              : d === 'Medium' ? 'bg-amber-50 border-amber-350 text-amber-700'
                                : 'bg-rose-50 border-rose-350 text-rose-700'
                            : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                            }`}>
                            <input type="radio" name="diff" value={d} checked={diff === d} onChange={() => setDiff(d)} className="sr-only" />
                            <span className={`w-2.5 h-2.5 rounded-full ${diff === d
                              ? d === 'Easy' ? 'bg-emerald-500' : d === 'Medium' ? 'bg-amber-500' : 'bg-rose-500'
                              : 'bg-gray-300'
                              }`} />
                            {d}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">Chủ đề (Categories)</label>
                      <textarea
                        value={categories}
                        onChange={e => setCategories(e.target.value)}
                        rows={4}
                        placeholder="Array, HashMap, Two Pointers..."
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:ring-4 focus:ring-blue-100 focus:outline-none resize-none"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">Phân cách bằng dấu phẩy</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">Trình độ gợi ý (Recommended Level)</label>
                      <select
                        value={recommendedLevel}
                        onChange={e => setRecommendedLevel(e.target.value)}
                        className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white"
                      >
                        <option value="Intern">Intern</option>
                        <option value="Fresher">Fresher</option>
                        <option value="Junior">Junior</option>
                        <option value="Middle">Middle</option>
                        <option value="Senior">Senior</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">Kỹ năng mục tiêu (Target Skills)</label>
                      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden focus-within:ring-4 focus-within:ring-violet-100 focus-within:border-violet-400">
                        <div className="flex flex-wrap gap-1.5 p-2 min-h-[38px]">
                          {targetSkills.map((s) => (
                            <span key={s} className="flex items-center gap-1 px-2 py-0.5 bg-violet-100 text-violet-700 rounded-lg text-[10px] font-bold">
                              {s}
                              <button type="button" onClick={() => setTargetSkills(prev => prev.filter(x => x !== s))} className="hover:text-red-500 transition-colors">
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <select
                          className="w-full px-3 py-1.5 border-t border-gray-100 text-xs font-medium text-gray-500 bg-gray-50/50 focus:outline-none cursor-pointer"
                          value=""
                          onChange={e => {
                            const val = e.target.value;
                            if (val && !targetSkills.includes(val)) {
                              setTargetSkills(prev => [...prev, val]);
                            }
                          }}
                        >
                          <option value="">+ Thêm kỹ năng...</option>
                          {ALL_TARGET_SKILLS.filter(s => !targetSkills.includes(s)).map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">Chọn từ danh sách, có thể chọn nhiều</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">Thời gian làm bài dự kiến (Phút)</label>
                      <input
                        type="number"
                        value={estimatedMinutes}
                        onChange={e => setEstimatedMinutes(e.target.value)}
                        min="1"
                        className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white"
                      />
                    </div>
                  </div>
                </div>
              </SectionCard>
            )}

            {/* ── INPUT/OUTPUT ── */}
            {activeTab === 'io' && (
              <SectionCard icon={Hash} title="Định dạng Input/Output" iconColor="text-teal-500" iconBg="bg-teal-50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Định dạng Input</label>
                    <textarea
                      value={inputFormat}
                      onChange={e => setInputFormat(e.target.value)}
                      rows={5}
                      placeholder="VD: Dòng đầu tiên chứa số nguyên n..."
                      className="w-full px-3.5 py-2 border border-gray-250 rounded-xl text-xs font-medium focus:ring-4 focus:ring-blue-100 focus:outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Định dạng Output</label>
                    <textarea
                      value={outputFormat}
                      onChange={e => setOutputFormat(e.target.value)}
                      rows={5}
                      placeholder="VD: In ra số nguyên là tổng của hai số..."
                      className="w-full px-3.5 py-2 border border-gray-255 rounded-xl text-xs font-medium focus:ring-4 focus:ring-blue-100 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </SectionCard>
            )}

            {/* ── CONSTRAINTS ── */}
            {activeTab === 'constraints' && (
              <SectionCard
                icon={AlertCircle}
                title="Ràng buộc (Constraints)"
                iconColor="text-orange-500"
                iconBg="bg-orange-50"
                action={
                  <button type="button" onClick={addConstraint}
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Thêm ràng buộc
                  </button>
                }
              >
                <div className="space-y-3">
                  {constraints.map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-405 w-5">{i + 1}</span>
                      <input
                        value={c}
                        onChange={e => updateConstraint(i, e.target.value)}
                        placeholder="VD: 2 <= nums.length <= 10^4"
                        className="flex-1 px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-mono focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:outline-none"
                      />
                      <button type="button" onClick={() => removeConstraint(i)}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {constraints.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-6">Chưa có ràng buộc nào. Nhấn "+ Thêm ràng buộc".</p>
                  )}
                </div>
              </SectionCard>
            )}

            {/* ── EXAMPLES ── */}
            {activeTab === 'examples' && (
              <SectionCard
                icon={Eye}
                title="Ví dụ minh họa"
                iconColor="text-indigo-500"
                iconBg="bg-indigo-50"
                action={
                  <button type="button" onClick={addExample}
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800">
                    <Plus className="w-3.5 h-3.5" /> Thêm ví dụ
                  </button>
                }
              >
                <div className="space-y-4">
                  {examples.map((ex, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-150 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-gray-550 uppercase tracking-wide">Ví dụ {i + 1}</span>
                        <button type="button" onClick={() => removeExample(i)}
                          className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Input</label>
                          <textarea
                            value={ex.input}
                            onChange={e => updateExample(i, 'input', e.target.value)}
                            rows={2.5}
                            placeholder="nums = [2, 7, 11, 15], target = 9"
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono focus:ring-4 focus:ring-blue-100 focus:outline-none resize-none bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Output</label>
                          <textarea
                            value={ex.output}
                            onChange={e => updateExample(i, 'output', e.target.value)}
                            rows={2.5}
                            placeholder="[0, 1]"
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono focus:ring-4 focus:ring-blue-100 focus:outline-none resize-none bg-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Giải thích</label>
                        <input
                          value={ex.explanation}
                          onChange={e => updateExample(i, 'explanation', e.target.value)}
                          placeholder="nums[0] + nums[1] = 2 + 7 = 9, so we return [0, 1]."
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* ── TEST CASES ── */}
            {activeTab === 'testcases' && (
              <SectionCard icon={TestTube2} title="Test Cases" iconColor="text-green-600" iconBg="bg-green-50">
                <div className="flex gap-1.5 mb-4">
                  <button type="button"
                    onClick={() => setTcTab('public')}
                    className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${tcTab === 'public' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                      }`}>
                    <Globe className="w-4 h-4" />
                    Public Test Cases ({publicTC.length})
                  </button>
                  <button type="button"
                    onClick={() => setTcTab('hidden')}
                    className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${tcTab === 'hidden' ? 'bg-gray-100 border-gray-405 text-gray-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                      }`}>
                    <Lock className="w-4 h-4" />
                    Hidden Test Cases ({hiddenTC.length})
                  </button>
                </div>

                <div className="space-y-3">
                  {(tcTab === 'public' ? publicTC : hiddenTC).map((tc, i) => (
                    <div key={i} className={`border rounded-xl p-4.5 space-y-2.5 ${tcTab === 'public' ? 'border-emerald-100 bg-emerald-50/40' : 'border-gray-100 bg-gray-50/40'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black text-gray-500 uppercase">Test #{i + 1}</span>
                        <button type="button" onClick={() => removeTC(tcTab, i)}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-55/60 rounded-lg transition-all">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-1">Input</label>
                          <textarea
                            value={tc.input}
                            onChange={e => updateTC(tcTab, i, 'input', e.target.value)}
                            rows={3}
                            placeholder="3&#10;7 1/10 param"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-100 focus:outline-none resize-none bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-1">Expected Output</label>
                          <textarea
                            value={tc.expectedOutput}
                            onChange={e => updateTC(tcTab, i, 'expectedOutput', e.target.value)}
                            rows={3}
                            placeholder="8 1"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-100 focus:outline-none resize-none bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => addTC(tcTab)}
                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-xs font-bold text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-all flex items-center justify-center gap-1.5">
                    <Plus className="w-4 h-4" /> Thêm Test Case mới
                  </button>
                </div>
              </SectionCard>
            )}

            {/* ── LANGUAGES & STARTER CODE ── */}
            {activeTab === 'languages' && (
              <div className="space-y-4">
                <SectionCard icon={Globe} title="Ngôn ngữ hỗ trợ" iconColor="text-blue-500" iconBg="bg-blue-50">
                  <div className="flex flex-wrap gap-2.5">
                    {SUPPORTED_LANGS.map(lang => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLang(lang)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${selectedLangs.includes(lang)
                          ? `${LANG_COLOR[lang]} border`
                          : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'
                          }`}
                      >
                        {selectedLangs.includes(lang) && <Check className="w-3 h-3 inline mr-1.5" />}
                        {lang}
                      </button>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard icon={Code2} title="Code khởi tạo (Starter Code)" iconColor="text-gray-600" iconBg="bg-gray-100">
                  <div className="flex gap-1.5 mb-3 flex-wrap">
                    {selectedLangs.map(lang => (
                      <button key={lang} type="button" onClick={() => setStarterLang(lang)}
                        className={`px-3.5 py-2 rounded-lg text-xs font-bold border transition-all ${starterLang === lang ? `${LANG_COLOR[lang]} border` : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                          }`}>
                        {lang}
                      </button>
                    ))}
                  </div>
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <div className="flex items-center justify-between px-3.5 py-2 bg-gray-800 text-gray-400">
                      <span className="text-[10px] font-mono">{starterLang}</span>
                      <button type="button" onClick={() => setStarterCode(sc => ({ ...sc, [starterLang]: DEFAULT_STARTER[starterLang] || '' }))}
                        className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors">Reset</button>
                    </div>
                    <textarea
                      value={starterCode[starterLang] || ''}
                      onChange={e => setStarterCode(sc => ({ ...sc, [starterLang]: e.target.value }))}
                      rows={10}
                      className="w-full bg-gray-950 text-white text-xs font-mono p-4 resize-y focus:outline-none min-h-[200px]"
                    />
                  </div>
                </SectionCard>
              </div>
            )}

            {/* ── SOLUTION ── */}
            {activeTab === 'solution' && (
              <SectionCard icon={Zap} title="Lời giải mẫu & Độ phức tạp" iconColor="text-amber-500" iconBg="bg-amber-50">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Hướng giải quyết (Solution idea)</label>
                    <textarea
                      value={solutionIdea}
                      onChange={e => setSolutionIdea(e.target.value)}
                      rows={4}
                      placeholder="Mô tả ý tưởng giải (VD: Sử dụng HashMap để lưu trữ…One-pass Hash-Table)."
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-medium focus:ring-4 focus:ring-blue-100 focus:outline-none resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">Time Complexity</label>
                      <input
                        value={timeComplexity}
                        onChange={e => setTimeComplexity(e.target.value)}
                        placeholder="O(n)"
                        className="w-full px-3.5 py-2 border border-gray-250 rounded-xl text-xs font-mono focus:ring-4 focus:ring-blue-100 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">Space Complexity</label>
                      <input
                        value={spaceComplexity}
                        onChange={e => setSpaceComplexity(e.target.value)}
                        placeholder="O(1)"
                        className="w-full px-3.5 py-2 border border-gray-255 rounded-xl text-xs font-mono focus:ring-4 focus:ring-blue-100 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Code lời giải (Solution code)</label>
                    <div className="rounded-xl overflow-hidden border border-gray-200">
                      <div className="px-3.5 py-2 bg-gray-800 text-[10px] font-mono text-gray-400">solution.py</div>
                      <textarea
                        value={solutionCode}
                        onChange={e => setSolutionCode(e.target.value)}
                        rows={10}
                        className="w-full bg-gray-950 text-gray-100 text-xs font-mono p-4 resize-y focus:outline-none min-h-[200px]"
                      />
                    </div>
                  </div>
                </div>
              </SectionCard>
            )}

            {/* ── SETTINGS ── */}
            {activeTab === 'settings' && (
              <div className="space-y-4">
                <SectionCard icon={ToggleRight} title="Điều kiện hiển thị" iconColor="text-blue-500" iconBg="bg-blue-50">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-2">Trạng thái xuất bản</label>
                      <div className="flex gap-3">
                        {[
                          { val: 'Draft', label: 'Nháp (Draft)', color: 'bg-gray-100 border-gray-300 text-gray-700' },
                          { val: 'Published', label: 'Xuất bản (Published)', color: 'bg-blue-55 border-blue-300 text-blue-700' },
                          { val: 'Disabled', label: 'Vô hiệu hóa', color: 'bg-rose-50 border-rose-300 text-rose-700' },
                        ].map(s => (
                          <label key={s.val} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer text-xs font-bold transition-all ${status === s.val ? s.color : 'bg-gray-50 border-gray-200 text-gray-400'
                            }`}>
                            <input type="radio" name="status" value={s.val} checked={status === s.val} onChange={() => setStatus(s.val)} className="sr-only" />
                            <span className={`w-2 h-2 rounded-full ${status === s.val ? 'bg-current' : 'bg-gray-300'}`} />
                            {s.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-3">
                        <Eye className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-xs font-bold text-gray-800">Hiển thị cho Client</p>
                          <p className="text-[10px] text-gray-400">Ứng viên có thể xem bài này trong phòng chờ</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => setIsClientVisible(v => !v)}
                        className={`relative w-11 h-6 rounded-full transition-all ${isClientVisible ? 'bg-blue-500' : 'bg-gray-300'}`}>
                        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${isClientVisible ? 'left-5.5' : 'left-0.5'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-150 shadow-sm">
                      <div className="flex items-center gap-3">
                        <Shuffle className="w-5 h-5 text-violet-500" />
                        <div>
                          <p className="text-xs font-bold text-gray-800">Random trong phỏng vấn</p>
                          <p className="text-[10px] text-gray-400">Cho phép bài được chọn ngẫu nhiên khi phỏng vấn</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => setAllowRandom(v => !v)}
                        className={`relative w-11 h-6 rounded-full transition-all ${allowRandom ? 'bg-violet-500' : 'bg-gray-300'}`}>
                        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${allowRandom ? 'left-5.5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  </div>
                </SectionCard>
              </div>
            )}
          </div>

          {/* Action Buttons Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-150 bg-white shrink-0">
            <div className="flex items-center gap-2">
              <button type="button"
                onClick={() => setActiveTab(TABS[Math.max(0, TABS.findIndex(t => t.id === activeTab) - 1)].id)}
                disabled={activeTab === TABS[0].id}
                className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-800 disabled:opacity-30 transition-colors px-4 py-2 rounded-xl hover:bg-gray-100">
                <ChevronLeft className="w-4 h-4" /> Trước
              </button>
              <button type="button"
                onClick={() => setActiveTab(TABS[Math.min(TABS.length - 1, TABS.findIndex(t => t.id === activeTab) + 1)].id)}
                disabled={activeTab === TABS[TABS.length - 1].id}
                className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-800 disabled:opacity-30 transition-colors px-4 py-2 rounded-xl hover:bg-gray-100">
                Tiếp <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => navigate('/admin/coding-bank')}
                className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                Hủy
              </button>
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#2563EB] text-white text-xs font-extrabold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-100 disabled:opacity-60 transition-all">
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang lưu…</>
                  : <><Save className="w-4 h-4" /> {problemId ? 'Lưu bài Coding' : 'Publish bài Coding'}</>}
              </button>
            </div>
          </div>
        </form>

        {/* Right Preview Panel */}
        {showPreview && (
          <div className="flex-1 bg-white border border-gray-150 rounded-2xl shadow-sm overflow-y-auto">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wide">Client View Preview</p>
            </div>
            <div className="p-6 space-y-5">
              {/* Title */}
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">{title || 'Tiêu đề bài toán'}</h3>
                {shortDesc && <p className="text-xs text-gray-500 mt-1.5">{shortDesc}</p>}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-black ${DIFF_STYLES[diff]}`}>{diff}</span>
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded text-[10px] font-bold border border-gray-200">{estimatedMinutes} phút</span>
                  {categories.split(',').filter(Boolean).map((c, i) => (
                    <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-bold border border-blue-100">{c.trim()}</span>
                  ))}
                  {targetSkills.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 bg-violet-50 text-violet-700 rounded text-[10px] font-bold border border-violet-100">{s}</span>
                  ))}
                </div>
              </div>

              {/* Description */}
              {desc && (
                <div className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap border-t border-gray-105 pt-4">
                  {desc}
                </div>
              )}

              {/* Examples */}
              {examples.filter(e => e.input || e.output).length > 0 && (
                <div className="border-t border-gray-50 pt-4">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-wide mb-2">Examples</p>
                  {examples.filter(e => e.input || e.output).map((ex, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-3.5 font-mono text-xs space-y-1 mb-2">
                      {ex.input && <div><span className="text-gray-400">Input:</span> <span className="text-indigo-700">{ex.input}</span></div>}
                      {ex.output && <div><span className="text-gray-400">Output:</span> <span className="text-emerald-700">{ex.output}</span></div>}
                      {ex.explanation && <div className="text-gray-500 italic text-[10px] mt-1.5">{ex.explanation}</div>}
                    </div>
                  ))}
                </div>
              )}

              {/* Constraints */}
              {constraints.filter(Boolean).length > 0 && (
                <div className="border-t border-gray-50 pt-4">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-wide mb-2">Constraints</p>
                  <ul className="space-y-1.5">
                    {constraints.filter(Boolean).map((c, i) => (
                      <li key={i} className="text-xs font-mono text-gray-750 flex items-start gap-1.5">
                        <span className="text-gray-400">•</span>{c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Languages */}
              {selectedLangs.length > 0 && (
                <div className="border-t border-gray-50 pt-4">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-wide mb-2">Supported Languages</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLangs.map(l => (
                      <span key={l} className={`px-2.5 py-1 rounded text-[10px] font-bold border ${LANG_COLOR[l]}`}>{l}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Settings / Status */}
              <div className="border-t border-gray-50 pt-4 flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${status === 'Published' ? 'bg-blue-100 text-blue-700' : status === 'Draft' ? 'bg-gray-100 text-gray-650' : 'bg-rose-100 text-rose-700'
                  }`}>
                  {status}
                </span>
                {isClientVisible
                  ? <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600"><Eye className="w-3.5 h-3.5" /> Hiển thị</span>
                  : <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400"><EyeOff className="w-3.5 h-3.5" /> Ẩn</span>}
                {allowRandom && <span className="flex items-center gap-1 text-[10px] font-bold text-violet-600"><Shuffle className="w-3.5 h-3.5" /> Random</span>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

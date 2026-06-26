import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Plus, X, Check, Loader2, BookOpen, TestTube2, Zap,
  Globe, Lock, Save, AlertCircle, Eye, EyeOff, ToggleRight,
  Shuffle, ChevronLeft, ChevronRight, Hash, FileCode, CheckSquare, Code, LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminCodingBankApi } from '../../services/codingBankApi';

// ─────────────────────────────────────────
// Constants & Styling Tokens
// ─────────────────────────────────────────
const DIFF_STYLES = {
  Easy: 'bg-[#EBF1E9] text-[#6F7E64] border-[#CBD9C6]',
  Medium: 'bg-amber-50 text-amber-700 border-amber-250',
  Hard: 'bg-rose-50 text-rose-700 border-rose-250',
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

const ALL_CATEGORIES = [
  'Array', 'String', 'Hash Table (HashMap, HashSet)', 'Two Pointers',
  'Sliding Window', 'Prefix Sum', 'Linked List', 'Stack', 'Queue',
  'Monotonic Stack', 'Binary Search', 'Sorting', 'Tree', 'Binary Tree',
  'Binary Search Tree (BST)', 'Heap (Priority Queue)', 'Trie', 'Graph',
  'Depth-First Search (DFS)', 'Breadth-First Search (BFS)',
  'Union Find (Disjoint Set Union)', 'Topological Sort', 'Shortest Path',
  'Recursion', 'Backtracking', 'Greedy', 'Dynamic Programming (DP)',
  'Bit Manipulation', 'Math', 'Geometry', 'Design', 'Simulation',
  'Divide and Conquer', 'Segment Tree', 'Binary Indexed Tree (Fenwick Tree)',
  'Monotonic Queue', 'String Matching', 'Rolling Hash', 'Interval',
  'Matrix', 'Database (SQL)'
];


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
          initial={{ opacity: 0, y: -24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -24, scale: 0.95 }}
          className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl border ${toast.type === 'success'
            ? 'bg-emerald-50 border-emerald-250 text-emerald-900'
            : toast.type === 'error'
              ? 'bg-rose-50 border-rose-250 text-rose-900'
              : 'bg-gray-50 border-slate-300 text-gray-900'
            }`}
        >
          <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${toast.type === 'success' ? 'bg-emerald-600 text-white'
            : toast.type === 'error' ? 'bg-rose-600 text-white'
              : 'bg-[#222] text-white'
            }`}>
            {toast.type === 'success' ? '✓'
              : toast.type === 'error' ? '✗'
                : '...'}
          </div>
          <span className="text-sm font-semibold">{toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────
// Section Container Component
// ─────────────────────────────────────────
function SectionCard({ title, children, action }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden mb-6">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#F9FAFB]/50">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-900">{title}</span>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────
// Rich Text Toolbar
// ─────────────────────────────────────────
function RichToolbar({ onBold, onItalic, onUnderline, hasSelection }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-300 bg-gray-50/70">
      <button
        type="button"
        disabled={!hasSelection}
        onMouseDown={e => e.preventDefault()}
        onClick={onBold}
        className="px-2.5 py-1 rounded text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        B
      </button>
      <button
        type="button"
        disabled={!hasSelection}
        onMouseDown={e => e.preventDefault()}
        onClick={onItalic}
        className="px-2.5 py-1 rounded text-xs italic text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        I
      </button>
      <button
        type="button"
        disabled={!hasSelection}
        onMouseDown={e => e.preventDefault()}
        onClick={onUnderline}
        className="px-2.5 py-1 rounded text-xs underline text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        U
      </button>
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

  const editorRef = useRef(null);
  const isInitialized = useRef(false);
  const [hasSelection, setHasSelection] = useState(false);

  useEffect(() => {
    if (editorRef.current && desc && !isInitialized.current) {
      editorRef.current.innerHTML = desc;
      isInitialized.current = true;
    }
  }, [desc]);

  const checkSelection = () => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const isInside = editorRef.current.contains(range.commonAncestorContainer);
        const hasSel = isInside && selection.toString().length > 0;
        setHasSelection(hasSel);

        // Clear formatting state if selection is empty to prevent typing from inheriting styles
        if (isInside && !hasSel) {
          try {
            if (document.queryCommandState('underline')) {
              document.execCommand('underline', false, null);
            }
            if (document.queryCommandState('bold')) {
              document.execCommand('bold', false, null);
            }
            if (document.queryCommandState('italic')) {
              document.execCommand('italic', false, null);
            }
          } catch (err) {
            console.error("Failed to query or execute format clear command", err);
          }
        }
        return;
      }
    }
    setHasSelection(false);
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      const key = e.key.toLowerCase();
      if (key === 'b' || key === 'i' || key === 'u') {
        const selection = window.getSelection();
        const selectedText = selection ? selection.toString() : '';
        if (selectedText.length === 0) {
          e.preventDefault();
        }
      }
    }
  };

  const handleFormat = (command) => {
    document.execCommand(command, false, null);
    if (editorRef.current) {
      setDesc(editorRef.current.innerHTML);
      checkSelection();
    }
  };

  // ── Classification
  const [diff, setDiff] = useState('Easy');
  const [categories, setCategories] = useState([]);
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

  // Client Preview toggles/tabs
  const [showPreview, setShowPreview] = useState(true);
  const [previewTab, setPreviewTab] = useState('desc'); // desc, code, tc
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
          setCategories(Array.isArray(p.categories) ? p.categories : []);
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
      } catch {
        setToast({ type: 'error', message: 'Không thể tải chi tiết bài toán.' });
      } finally {
        setLoadingDetails(false);
      }
    };
    fetchDetails();
  }, [problemId]);

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
    if (e) e.preventDefault();
    if (!title.trim()) {
      setToast({ type: 'error', message: 'Vui lòng nhập tiêu đề bài toán!' });
      return;
    }
    if (categories.length < 1) {
      setToast({ type: 'error', message: 'Vui lòng chọn ít nhất 1 chủ đề!' });
      return;
    }
    if (targetSkills.length < 1) {
      setToast({ type: 'error', message: 'Vui lòng chọn ít nhất 1 kỹ năng mục tiêu!' });
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
        categories,
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

  // Grouped tabs for easier onboarding and navigation
  const ZONES = [
    { id: 'basic', label: 'Thông tin cơ bản', icon: BookOpen },
    { id: 'specs', label: 'Input/Output & Ví dụ', icon: LogIn },
    { id: 'code', label: 'Code & Test Cases', icon: Code },
    { id: 'settings', label: 'Logic AI & Trạng thái', icon: Zap },
  ];

  if (loadingDetails) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#333333] mx-auto mb-4" />
          <p className="text-sm font-semibold text-gray-500">Đang tải thông tin bài toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full text-[#333333] font-sans">
      <Toast toast={toast} />

      {/* ── Header (Sticky, stationary when scrolling content) ── */}
      <header className="sticky top-[-24px] mx-[-24px] mb-6 z-30 bg-white border-b border-gray-100 px-8 py-3 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/coding-bank')}
            className="px-3 py-1.5 hover:bg-slate-100 rounded-lg transition-colors border border-gray-100 text-xs font-bold text-slate-650"
            title="Quay lại"
          >
            Quay lại
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold tracking-wider uppercase">
              <span>Admin Dashboard</span>
              <span>/</span>
              <span>Coding Bank</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mt-0.5">
              {problemId ? 'Chỉnh sửa bài coding' : 'Tạo mới bài coding'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-[#222] hover:bg-black active:bg-[#111111] text-white text-sm font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : (problemId ? 'Cập nhật' : 'Tạo bài viết')}
          </button>
        </div>
      </header>

      <main className="max-w-[1200px] ml-auto mr-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Form Workspace */}
          <form
            onSubmit={handleSave}
            className={`lg:col-span-7 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col transition-all ${showPreview ? 'lg:col-span-7' : 'lg:col-span-12'
              }`}
          >
            {/* Consolidated Tab Zone Bar */}
            <div className="grid grid-cols-4 w-full px-6 pt-5 border-b border-gray-200 relative no-scrollbar">
              {ZONES.map(z => {
                const isSelected = activeTab === z.id;
                return (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => setActiveTab(z.id)}
                    className={`col-span-1 text-center py-2.5 text-xs font-bold tracking-wide transition-all duration-150 border-t border-l border-r rounded-t-xl -mb-[1px] relative z-10 shrink-0 whitespace-nowrap ${isSelected
                      ? 'bg-[#EBF1E9] text-[#333333] border-gray-200'
                      : 'bg-transparent text-gray-500 hover:text-[#333333] border-transparent hover:bg-gray-50/50'
                      }`}
                  >
                    {z.label}
                  </button>
                );
              })}
            </div>

            {/* Form Content Areas */}
            <div className="p-6 md:p-8 space-y-6">

              {/* ZONE 1: BASIC & CLASSIFICATION */}
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <SectionCard icon={BookOpen} title="Thông tin cơ bản">
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Mã bài toán</label>
                          <input
                            type="text"
                            value={problemCode}
                            onChange={e => setProblemCode(e.target.value)}
                            placeholder="Ví dụ: two-sum, valid-parentheses"
                            className="w-full px-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl text-sm font-mono text-gray-800 placeholder-gray-450 focus:outline-none focus:bg-white focus:border-[#333333] transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Tiêu đề bài viết *</label>
                          <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                            placeholder="Ví dụ: Tính tổng hai số trong mảng"
                            className="w-full px-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 placeholder-gray-450 focus:outline-none focus:bg-white focus:border-[#333333] transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Mô tả ngắn</label>
                        <input
                          type="text"
                          value={shortDesc}
                          onChange={e => setShortDesc(e.target.value)}
                          placeholder="Mô tả tóm tắt nội dung bài toán..."
                          className="w-full px-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-450 focus:outline-none focus:bg-white focus:border-[#333333] transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Mô tả chi tiết</label>
                        <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#333333] transition-all bg-[#F9FAFB]">
                          <style>{`
                            .rich-editor:empty:before {
                              content: attr(placeholder);
                              color: #9ca3af;
                              cursor: text;
                            }
                          `}</style>
                           <RichToolbar
                            onBold={() => handleFormat('bold')}
                            onItalic={() => handleFormat('italic')}
                            onUnderline={() => handleFormat('underline')}
                            hasSelection={hasSelection}
                          />
                          <div
                            ref={editorRef}
                            contentEditable
                            onInput={e => {
                              setDesc(e.currentTarget.innerHTML);
                              checkSelection();
                            }}
                            onSelect={checkSelection}
                            onKeyUp={checkSelection}
                            onMouseUp={checkSelection}
                            onKeyDown={handleKeyDown}
                            onBlur={checkSelection}
                            placeholder="Nhập đề bài chi tiết..."
                            className="rich-editor w-full px-4 py-3.5 text-sm focus:outline-none resize-none min-h-[180px] max-h-[400px] overflow-y-auto font-sans bg-transparent"
                            style={{ outline: 'none' }}
                          />
                        </div>
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard icon={Hash} title="Phân loại & Cấp bậc">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Độ khó</label>
                        <div className="flex flex-col gap-2">
                          {['Easy', 'Medium', 'Hard'].map(d => (
                            <label
                              key={d}
                              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border cursor-pointer transition-all text-xs font-semibold ${diff === d
                                ? d === 'Easy'
                                  ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                                  : d === 'Medium'
                                    ? 'bg-amber-50 border-amber-400 text-amber-800'
                                    : 'bg-rose-50 border-rose-400 text-rose-800'
                                : 'bg-white border-gray-100 hover:bg-gray-50 text-slate-600'
                                }`}
                            >
                              <input
                                type="radio"
                                name="diff"
                                value={d}
                                checked={diff === d}
                                onChange={() => setDiff(d)}
                                className="sr-only"
                              />
                              <span className={`w-2.5 h-2.5 rounded-full ${diff === d
                                ? d === 'Easy' ? 'bg-emerald-600' : d === 'Medium' ? 'bg-amber-600' : 'bg-rose-600'
                                : 'bg-slate-300'
                                }`} />
                              {d}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Chủ đề</label>
                        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden focus-within:border-[#333333] transition-all">
                          <div className="flex flex-wrap gap-2 p-2.5 min-h-[46px] bg-[#F9FAFB]">
                            {categories.map(c => (
                              <span key={c} className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 text-gray-800 rounded-lg text-xs font-semibold shadow-xs">
                                {c}
                                <button
                                  type="button"
                                  onClick={() => setCategories(prev => prev.filter(x => x !== c))}
                                  className="text-gray-400 hover:text-red-650 transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </span>
                            ))}
                          </div>
                          <select
                            className="w-full px-4 py-3 border-t border-gray-150 text-xs font-semibold text-gray-500 bg-gray-50/70 focus:outline-none cursor-pointer hover:bg-gray-100/70"
                            value=""
                            onChange={e => {
                              const val = e.target.value;
                              if (val && !categories.includes(val)) {
                                if (categories.length >= 3) {
                                  setToast({ type: 'error', message: 'Chỉ được chọn tối đa 3 chủ đề!' });
                                  return;
                                }
                                setCategories(prev => [...prev, val]);
                              }
                            }}
                          >
                            <option value="">+ Thêm chủ đề mới...</option>
                            {ALL_CATEGORIES.filter(c => !categories.includes(c)).map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Trình độ gợi ý</label>
                          <select
                            value={recommendedLevel}
                            onChange={e => setRecommendedLevel(e.target.value)}
                            className="w-full px-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:bg-white focus:border-[#333333] transition-all bg-white cursor-pointer"
                          >
                            <option value="Intern">Intern</option>
                            <option value="Fresher">Fresher</option>
                            <option value="Junior">Junior</option>
                            <option value="Middle">Middle</option>
                            <option value="Senior">Senior</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Thời gian dự kiến (phút)</label>
                          <input
                            type="number"
                            value={estimatedMinutes}
                            onChange={e => setEstimatedMinutes(e.target.value)}
                            min="1"
                            className="w-full px-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-450 focus:outline-none focus:bg-white focus:border-[#333333] transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-5">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Kỹ năng mục tiêu</label>
                      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden focus-within:border-[#333333] transition-all">
                        <div className="flex flex-wrap gap-2 p-2.5 min-h-[46px] bg-[#F9FAFB]">
                          {targetSkills.map(s => (
                            <span key={s} className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 text-gray-800 rounded-lg text-xs font-semibold shadow-xs">
                              {s}
                              <button
                                type="button"
                                onClick={() => setTargetSkills(prev => prev.filter(x => x !== s))}
                                className="text-gray-400 hover:text-red-650 transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <select
                          className="w-full px-4 py-3 border-t border-gray-150 text-xs font-semibold text-gray-500 bg-gray-50/70 focus:outline-none cursor-pointer hover:bg-gray-100/70"
                          value=""
                          onChange={e => {
                            const val = e.target.value;
                            if (val && !targetSkills.includes(val)) {
                              if (targetSkills.length >= 5) {
                                setToast({ type: 'error', message: 'Chỉ được chọn tối đa 5 kỹ năng mục tiêu!' });
                                return;
                              }
                              setTargetSkills(prev => [...prev, val]);
                            }
                          }}
                        >
                          <option value="">+ Thêm kỹ năng mới...</option>
                          {ALL_TARGET_SKILLS.filter(s => !targetSkills.includes(s)).map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </SectionCard>
                </div>
              )}

              {/* ZONE 2: I/O, CONSTRAINTS & EXAMPLES */}
              {activeTab === 'specs' && (
                <div className="space-y-6">
                  <SectionCard icon={FileCode} title="Yêu cầu định dạng Input / Output">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 mb-2.5 uppercase tracking-wider">ĐỊNH DẠNG ĐẦU VÀO (INPUT)</label>
                        <textarea
                          value={inputFormat}
                          onChange={e => setInputFormat(e.target.value)}
                          rows={5}
                          placeholder="Mô tả cấu trúc dữ liệu đầu vào..."
                          className="w-full px-4 py-3.5 bg-[#F9FAFB] border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-450 focus:outline-none focus:bg-white focus:border-[#333333] transition-all resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 mb-2.5 uppercase tracking-wider">ĐỊNH DẠNG ĐẦU RA (OUTPUT)</label>
                        <textarea
                          value={outputFormat}
                          onChange={e => setOutputFormat(e.target.value)}
                          rows={5}
                          placeholder="Mô tả cấu trúc dữ liệu đầu ra mong muốn..."
                          className="w-full px-4 py-3.5 bg-[#F9FAFB] border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-450 focus:outline-none focus:bg-white focus:border-[#333333] transition-all resize-none"
                        />
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard
                    title="Ràng buộc"
                    action={
                      <button
                        type="button"
                        onClick={addConstraint}
                        className="flex items-center gap-1.5 text-xs font-bold text-[#333333] hover:text-[#111111]"
                      >
                        + Thêm ràng buộc
                      </button>
                    }
                  >
                    <div className="space-y-4">
                      {constraints.map((c, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <span className="text-sm font-bold text-gray-400 w-5 text-center">{i + 1}</span>
                          <input
                            type="text"
                            value={c}
                            onChange={e => updateConstraint(i, e.target.value)}
                            placeholder="Ví dụ: 1 <= nums.length <= 10^5"
                            className="flex-1 px-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-450 focus:outline-none focus:bg-white focus:border-[#333333] transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => removeConstraint(i)}
                            className="px-3.5 py-1.5 text-xs text-gray-500 hover:text-red-650 hover:bg-red-50/50 rounded-lg transition-colors border border-transparent"
                          >
                            Xóa
                          </button>
                        </div>
                      ))}
                      {constraints.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-6">Chưa có ràng buộc nào.</p>
                      )}
                    </div>
                  </SectionCard>

                  <SectionCard
                    icon={Eye}
                    title="Ví dụ mẫu"
                    action={
                      <button
                        type="button"
                        onClick={addExample}
                        className="flex items-center gap-1.5 text-xs font-bold text-[#333333] hover:text-[#111111]"
                      >
                        + Thêm ví dụ
                      </button>
                    }
                  >
                    <div className="space-y-5">
                      {examples.map((ex, i) => (
                        <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-5 space-y-4">
                          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ví dụ {i + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeExample(i)}
                              className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-red-655 hover:bg-red-50/50 rounded-lg transition-colors border border-transparent"
                            >
                              Xóa
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Input</label>
                              <textarea
                                value={ex.input}
                                onChange={e => updateExample(i, 'input', e.target.value)}
                                rows={3}
                                placeholder="nums = [2,7,11,15], target = 9"
                                className="w-full px-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl text-sm font-mono text-gray-800 placeholder-gray-450 focus:outline-none focus:bg-white focus:border-[#333333] transition-all resize-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Output</label>
                              <textarea
                                value={ex.output}
                                onChange={e => updateExample(i, 'output', e.target.value)}
                                rows={3}
                                placeholder="[0,1]"
                                className="w-full px-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl text-sm font-mono text-gray-800 placeholder-gray-450 focus:outline-none focus:bg-white focus:border-[#333333] transition-all resize-none"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Giải thích chi tiết</label>
                            <input
                              type="text"
                              value={ex.explanation}
                              onChange={e => updateExample(i, 'explanation', e.target.value)}
                              placeholder="Bởi vì nums[0] + nums[1] == 9, trả về [0, 1]..."
                              className="w-full px-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-450 focus:outline-none focus:bg-white focus:border-[#333333] transition-all"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                </div>
              )}

              {/* ZONE 3: CODE & TEST CASES */}
              {activeTab === 'code' && (
                <div className="space-y-6">
                  <SectionCard title="Ngôn ngữ & Code mẫu ban đầu">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2.5 uppercase tracking-wide">Chọn ngôn ngữ hỗ trợ</label>
                        <div className="flex flex-wrap gap-2">
                          {SUPPORTED_LANGS.map(lang => {
                            const isSelected = selectedLangs.includes(lang);
                            return (
                              <button
                                key={lang}
                                type="button"
                                onClick={() => toggleLang(lang)}
                                className={`px-4 py-2.5 rounded-lg text-xs font-bold border transition-all ${isSelected
                                  ? 'bg-[#222] text-white border-[#333333]'
                                  : 'bg-white border-gray-100 hover:bg-gray-50 text-slate-600'
                                  }`}
                              >
                                {lang}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {selectedLangs.length > 0 && (
                        <div className="border border-gray-100 rounded-xl overflow-hidden mt-4">
                          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                            <div className="flex gap-1.5 overflow-x-auto">
                              {selectedLangs.map(lang => (
                                <button
                                  key={lang}
                                  type="button"
                                  onClick={() => setStarterLang(lang)}
                                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${starterLang === lang
                                    ? 'bg-[#222] text-white'
                                    : 'text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                  {lang}
                                </button>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => setStarterCode(sc => ({ ...sc, [starterLang]: DEFAULT_STARTER[starterLang] || '' }))}
                              className="text-xs font-bold text-gray-500 hover:text-[#333333]"
                            >
                              Reset
                            </button>
                          </div>
                          <textarea
                            value={starterCode[starterLang] || ''}
                            onChange={e => setStarterCode(sc => ({ ...sc, [starterLang]: e.target.value }))}
                            rows={12}
                            className="w-full bg-[#1e1e1e] text-emerald-400 text-xs font-mono p-5 focus:outline-none resize-none min-h-[250px]"
                          />
                        </div>
                      )}
                    </div>
                  </SectionCard>

                  <SectionCard icon={TestTube2} title="Bộ Test Cases">
                    <div className="flex gap-2 mb-4 border-b border-gray-100 pb-3">
                      <button
                        type="button"
                        onClick={() => setTcTab('public')}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold border transition-all ${tcTab === 'public'
                          ? 'bg-[#222] text-white border-[#333333]'
                          : 'bg-white border-gray-100 hover:bg-gray-50 text-slate-600'
                          }`}
                      >
                        Công khai ({publicTC.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setTcTab('hidden')}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold border transition-all ${tcTab === 'hidden'
                          ? 'bg-[#222] text-white border-[#333333]'
                          : 'bg-white border-gray-100 hover:bg-gray-50 text-slate-600'
                          }`}
                      >
                        Ẩn ({hiddenTC.length})
                      </button>
                    </div>

                    <div className="space-y-4">
                      {(tcTab === 'public' ? publicTC : hiddenTC).map((tc, i) => (
                        <div key={i} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 space-y-3.5">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-xs font-bold text-slate-650">Test Case #{i + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeTC(tcTab, i)}
                              className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-red-655 hover:bg-red-50/50 rounded-lg transition-colors border border-transparent"
                            >
                              Xóa
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Input</label>
                              <textarea
                                value={tc.input}
                                onChange={e => updateTC(tcTab, i, 'input', e.target.value)}
                                rows={4}
                                placeholder="Dữ liệu đầu vào cho trình biên dịch..."
                                className="w-full px-4 py-3.5 bg-[#F9FAFB] border border-gray-200 rounded-xl text-sm font-mono text-gray-800 placeholder-gray-450 focus:outline-none focus:bg-white focus:border-[#333333] transition-all resize-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Expected Output</label>
                              <textarea
                                value={tc.expectedOutput}
                                onChange={e => updateTC(tcTab, i, 'expectedOutput', e.target.value)}
                                rows={4}
                                placeholder="Dữ liệu đầu ra mong đợi..."
                                className="w-full px-4 py-3.5 bg-[#F9FAFB] border border-gray-200 rounded-xl text-sm font-mono text-gray-800 placeholder-gray-450 focus:outline-none focus:bg-white focus:border-[#333333] transition-all resize-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addTC(tcTab)}
                        className="w-full py-3.5 border-2 border-dashed border-gray-200 rounded-xl text-sm font-semibold text-gray-500 hover:text-[#333333] hover:border-[#333333] hover:bg-slate-50/50 transition-all flex items-center justify-center gap-2 bg-white"
                      >
                        + Thêm Test Case mới
                      </button>
                    </div>
                  </SectionCard>
                </div>
              )}

              {/* ZONE 4: SOLUTION & SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <SectionCard icon={Zap} title="Ý tưởng giải & Độ phức tạp">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Ý tưởng thuật toán</label>
                        <textarea
                          value={solutionIdea}
                          onChange={e => setSolutionIdea(e.target.value)}
                          rows={4}
                          placeholder="Mô tả các bước thực hiện tối ưu..."
                          className="w-full px-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-450 focus:outline-none focus:bg-white focus:border-[#333333] transition-all resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Time Complexity</label>
                          <input
                            type="text"
                            value={timeComplexity}
                            onChange={e => setTimeComplexity(e.target.value)}
                            placeholder="O(N log N), O(N)..."
                            className="w-full px-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl text-sm font-mono text-gray-800 placeholder-gray-450 focus:outline-none focus:bg-white focus:border-[#333333] transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Space Complexity</label>
                          <input
                            type="text"
                            value={spaceComplexity}
                            onChange={e => setSpaceComplexity(e.target.value)}
                            placeholder="O(1), O(N)..."
                            className="w-full px-4 py-3 bg-[#F9FAFB] border border-gray-200 rounded-xl text-sm font-mono text-gray-800 placeholder-gray-450 focus:outline-none focus:bg-white focus:border-[#333333] transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Code giải hoàn chỉnh</label>
                        <div className="border border-gray-100 rounded-lg overflow-hidden">
                          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 text-xs font-bold text-slate-600">
                            solution.py / solution.js
                          </div>
                          <textarea
                            value={solutionCode}
                            onChange={e => setSolutionCode(e.target.value)}
                            rows={10}
                            className="w-full bg-[#1e1e1e] text-emerald-400 text-xs font-mono p-5 focus:outline-none resize-none min-h-[200px]"
                          />
                        </div>
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard icon={ToggleRight} title="Trạng thái & Quyền hiển thị">
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-3 uppercase tracking-wide">Trạng thái phát hành</label>
                        <div className="flex flex-wrap gap-3">
                          {[
                            { val: 'Draft', label: 'Bản nháp', color: 'bg-slate-100 border-slate-300 text-slate-700' },
                            { val: 'Published', label: 'Công khai', color: 'bg-emerald-50 border-emerald-300 text-emerald-800' },
                            { val: 'Disabled', label: 'Vô hiệu hóa', color: 'bg-rose-50 border-rose-300 text-rose-800' },
                          ].map(s => {
                            const isSelected = status === s.val;
                            return (
                              <label
                                key={s.val}
                                className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border cursor-pointer text-xs font-bold transition-all ${isSelected ? s.color : 'bg-white border-slate-300 text-gray-500 hover:bg-gray-50'
                                  }`}
                              >
                                <input
                                  type="radio"
                                  name="status"
                                  value={s.val}
                                  checked={status === s.val}
                                  onChange={() => setStatus(s.val)}
                                  className="sr-only"
                                />
                                <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-current animate-pulse' : 'bg-slate-300'}`} />
                                {s.label}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </SectionCard>
                </div>
              )}

              {/* Form Navigation Footer */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-6">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab(ZONES[Math.max(0, ZONES.findIndex(t => t.id === activeTab) - 1)].id)}
                    disabled={activeTab === ZONES[0].id}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-655 hover:bg-gray-50 disabled:opacity-40 transition-all bg-white"
                  >
                    Quay lại
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab(ZONES[Math.min(ZONES.length - 1, ZONES.findIndex(t => t.id === activeTab) + 1)].id)}
                    disabled={activeTab === ZONES[ZONES.length - 1].id}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-655 hover:bg-gray-50 disabled:opacity-40 transition-all bg-white"
                  >
                    Kế tiếp
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/coding-bank')}
                    className="px-5 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-900"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#333333] hover:bg-black text-white text-xs font-extrabold rounded-lg shadow-sm transition-all disabled:opacity-50"
                  >
                    {saving ? 'Đang lưu...' : 'Hoàn tất lưu'}
                  </button>
                </div>
              </div>

            </div>
          </form>

          {/* Right Live Preview Panel */}
          {showPreview && (
            <div className="lg:col-span-5 bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden flex flex-col sticky top-[60px] self-start max-h-[calc(100vh-120px)]">

              {/* Preview Header & Candidate Mock-up Tabs */}
              <div className="px-6 py-5 border-b border-gray-150 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">XEM TRƯỚC</span>
                </div>
                <div className="flex gap-1.5">
                  {[
                    { id: 'desc', label: 'Đề bài', icon: BookOpen },
                    { id: 'code', label: 'Starter Code', icon: Code },
                  ].map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setPreviewTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 border ${previewTab === tab.id
                          ? 'bg-[#333333] border-[#333333] text-white shadow-sm'
                          : 'border-gray-250 bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Preview Display Box */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">

                {previewTab === 'desc' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-[#333333] tracking-tight">{title || 'Tiêu đề bài toán'}</h3>
                      {shortDesc && <p className="text-xs text-gray-500 mt-1">{shortDesc}</p>}

                      <div className="flex items-center gap-2 mt-3.5 flex-wrap">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${DIFF_STYLES[diff] || DIFF_STYLES.Easy}`}>
                          {diff}
                        </span>
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-650 rounded-lg text-xs font-bold">
                          {estimatedMinutes} phút
                        </span>
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-650 rounded-lg text-xs font-bold">
                          {recommendedLevel}
                        </span>
                        {categories.map((c, i) => (
                          <span key={i} className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-slate-600 rounded-lg text-xs font-semibold">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <hr className="border-gray-100 my-4" />

                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">MÔ TẢ BÀI TOÁN</p>
                      {desc ? (
                        <div
                          className="text-xs text-slate-700 leading-relaxed font-sans rich-preview"
                          dangerouslySetInnerHTML={{ __html: desc }}
                        />
                      ) : (
                        <p className="text-xs text-gray-400 italic font-medium">Chưa nhập chi tiết mô tả...</p>
                      )}
                    </div>

                    {(inputFormat || outputFormat) && (
                      <div className="border-t border-slate-100 pt-4 space-y-3">
                        {inputFormat && (
                          <div>
                            <p className="text-[11px] font-bold text-[#6F7E64] uppercase tracking-wide mb-1">Input Format</p>
                            <div className="text-xs text-slate-700 whitespace-pre-wrap">{inputFormat}</div>
                          </div>
                        )}
                        {outputFormat && (
                          <div>
                            <p className="text-[11px] font-bold text-[#6F7E64] uppercase tracking-wide mb-1">Output Format</p>
                            <div className="text-xs text-slate-700 whitespace-pre-wrap">{outputFormat}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {constraints.filter(Boolean).length > 0 && (
                      <div className="border-t border-slate-100 pt-4">
                        <p className="text-[11px] font-bold text-[#6F7E64] uppercase tracking-wide mb-2">Giới hạn</p>
                        <ul className="space-y-1">
                          {constraints.filter(Boolean).map((c, i) => (
                            <li key={i} className="text-xs font-mono text-slate-600 flex items-start gap-2">
                              <span>•</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {previewTab === 'code' && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] font-bold text-[#6F7E64] uppercase tracking-wide mb-2">Ngôn ngữ hỗ trợ & starter Code</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {selectedLangs.map(l => (
                          <span key={l} className="px-2.5 py-1 bg-slate-100 border border-gray-100 text-slate-700 rounded-md text-xs font-bold">
                            {l}
                          </span>
                        ))}
                        {selectedLangs.length === 0 && (
                          <span className="text-xs text-gray-400 italic">Chưa chọn ngôn ngữ nào.</span>
                        )}
                      </div>
                    </div>

                    {selectedLangs.length > 0 && (
                      <div className="rounded-xl overflow-hidden border border-gray-100">
                        <div className="px-4 py-2 bg-gray-100 text-gray-400 text-xs font-mono flex items-center justify-between">
                          <span>starter_template</span>
                          <span className="text-[#333333] bg-white px-2 py-0.5 rounded text-[9px] font-bold">{starterLang}</span>
                        </div>
                        <pre className="p-4 bg-[#1e1e1e] text-emerald-400 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap">
                          {starterCode[starterLang] || '// Chưa thiết lập starter template'}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
                {/* Footer preview state metadata */}
                <hr className="border-gray-100 my-4" />
                <div className="flex items-center gap-4 shrink-0 pb-2">
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-650 rounded-full text-[11px] font-bold uppercase tracking-wider">
                    {status === 'Draft' ? 'Bản nháp' : status === 'Published' ? 'Công khai' : 'Vô hiệu hóa'}
                  </span>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

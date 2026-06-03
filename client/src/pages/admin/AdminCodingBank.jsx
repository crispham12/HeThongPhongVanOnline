import { useState, useEffect } from 'react';
import {
  Plus, Search, SlidersHorizontal,
  Download, Database, CheckCircle2, BarChart2,
  AlertTriangle, Eye, FileText, ChevronLeft, ChevronRight,
  X, Check, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const INITIAL_CODING_QUESTIONS = [
  {
    id: '#001',
    title: 'Two Sum',
    role: 'Software Engineer - Intern',
    difficulty: 'EASY',
    category: 'Array, Hash Table',
    languages: ['JV', 'PY', 'JS'],
    tests: 12,
    status: 'Published'
  },
  {
    id: '#002',
    title: 'Longest Palindromic Substring',
    role: 'Backend Engineer',
    difficulty: 'MEDIUM',
    category: 'String, Dynamic Programming',
    languages: ['PY', 'C++'],
    tests: 8,
    status: 'Published'
  },
  {
    id: '#003',
    title: 'Median of Two Sorted Arrays',
    role: 'Senior DevOps',
    difficulty: 'HARD',
    category: 'Binary Search, Divide and Conquer',
    languages: ['JV'],
    tests: 24,
    status: 'Draft'
  },
  {
    id: '#004',
    title: 'Reverse Linked List',
    role: 'Frontend Developer',
    difficulty: 'EASY',
    category: 'Linked List',
    languages: ['JS', 'TS'],
    tests: 15,
    status: 'Published'
  },
  {
    id: '#005',
    title: 'Merge k Sorted Lists',
    role: 'Fullstack Engineer',
    difficulty: 'HARD',
    category: 'Divide and Conquer, Heap',
    languages: ['C++', 'JV', 'PY'],
    tests: 32,
    status: 'Published'
  },
  {
    id: '#006',
    title: 'Valid Parentheses',
    role: 'Software Engineer - Intern',
    difficulty: 'EASY',
    category: 'Stack',
    languages: ['JS', 'PY', 'C++'],
    tests: 10,
    status: 'Draft'
  }
];

export default function AdminCodingBank() {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('Difficulty');
  const [categoryFilter, setCategoryFilter] = useState('Category');
  const [roleFilter, setRoleFilter] = useState('Role');
  const [statusFilter, setStatusFilter] = useState('Status');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState(null);

  // Form State for new coding problem
  const [newTitle, setNewTitle] = useState('');
  const [newRole, setNewRole] = useState('Software Engineer');
  const [newDifficulty, setNewDifficulty] = useState('EASY');
  const [newCategory, setNewCategory] = useState('');
  const [newLanguages, setNewLanguages] = useState(['JS']);
  const [newTests, setNewTests] = useState(10);
  const [newStatus, setNewStatus] = useState('Published');

  // Load from local storage or set initial
  useEffect(() => {
    const stored = localStorage.getItem('coding-bank-questions');
    if (stored) {
      const parsed = JSON.parse(stored);
      setQuestions(parsed);
      setFilteredQuestions(parsed);
    } else {
      localStorage.setItem('coding-bank-questions', JSON.stringify(INITIAL_CODING_QUESTIONS));
      setQuestions(INITIAL_CODING_QUESTIONS);
      setFilteredQuestions(INITIAL_CODING_QUESTIONS);
    }
  }, []);

  // Toast Auto-Dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Apply filters
  const applyFilters = () => {
    let result = [...questions];

    if (searchQuery.trim()) {
      const qLower = searchQuery.toLowerCase();
      result = result.filter(q =>
        q.title.toLowerCase().includes(qLower) ||
        q.category.toLowerCase().includes(qLower) ||
        q.role.toLowerCase().includes(qLower)
      );
    }

    if (difficultyFilter !== 'Difficulty') {
      result = result.filter(q => q.difficulty === difficultyFilter.toUpperCase());
    }

    if (categoryFilter !== 'Category') {
      result = result.filter(q => q.category.toLowerCase().includes(categoryFilter.toLowerCase()));
    }

    if (roleFilter !== 'Role') {
      result = result.filter(q => q.role.toLowerCase().includes(roleFilter.toLowerCase()) || roleFilter.toLowerCase().includes(q.role.toLowerCase()));
    }

    if (statusFilter !== 'Status') {
      result = result.filter(q => q.status === statusFilter);
    }

    setFilteredQuestions(result);
  };

  // Re-run filter when filters change or questions are modified
  useEffect(() => {
    applyFilters();
  }, [searchQuery, difficultyFilter, categoryFilter, roleFilter, statusFilter, questions]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setDifficultyFilter('Difficulty');
    setCategoryFilter('Category');
    setRoleFilter('Role');
    setStatusFilter('Status');
  };

  const handleAddProblem = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCategory.trim()) {
      setToast({ type: 'error', message: 'Vui lòng nhập đầy đủ tiêu đề và danh mục!' });
      return;
    }

    const nextId = `#${String(questions.length + 1).padStart(3, '0')}`;
    const newProblem = {
      id: nextId,
      title: newTitle,
      role: newRole,
      difficulty: newDifficulty,
      category: newCategory,
      languages: newLanguages,
      tests: Number(newTests),
      status: newStatus
    };

    const updated = [...questions, newProblem];
    setQuestions(updated);
    localStorage.setItem('coding-bank-questions', JSON.stringify(updated));
    setShowAddModal(false);

    // Reset Form
    setNewTitle('');
    setNewCategory('');
    setNewTests(10);

    setToast({ type: 'success', message: 'Thêm bài coding mới thành công!' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài coding này?')) {
      const updated = questions.filter(q => q.id !== id);
      setQuestions(updated);
      localStorage.setItem('coding-bank-questions', JSON.stringify(updated));
      setToast({ type: 'success', message: 'Xóa bài coding thành công!' });
    }
  };

  // Metrics calculation
  const totalCount = questions.length;
  const easyCount = questions.filter(q => q.difficulty === 'EASY').length;
  const mediumCount = questions.filter(q => q.difficulty === 'MEDIUM').length;
  const hardCount = questions.filter(q => q.difficulty === 'HARD').length;
  const publishedCount = questions.filter(q => q.status === 'Published').length;
  const draftCount = questions.filter(q => q.status === 'Draft').length;

  // Language colors mapper
  const getLanguageStyle = (lang) => {
    switch (lang) {
      case 'JV': return 'bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]';
      case 'PY': return 'bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]';
      case 'JS': return 'bg-[#FEFCE8] text-[#CA8A04] border border-[#FEF9C3]';
      case 'C++': return 'bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]';
      default: return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-2 relative text-[#0F172A]">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg border ${toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                : 'bg-rose-50 border-rose-100 text-rose-800'
              }`}
          >
            <div className={`p-1.5 rounded-full ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
              {toast.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </div>
            <span className="text-sm font-bold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header section matching mockup layout */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 mb-8">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-gray-900">Ngân hàng bài coding</h1>
          <p className="text-sm text-gray-500 mt-1.5 font-medium">Quản lý và cập nhật danh sách các bài toán lập trình cho phỏng vấn.</p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button className="p-2.5 bg-white border border-[#E2E8F0] rounded-xl hover:bg-gray-50 text-gray-500 hover:text-gray-800 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
          >
            <Plus className="w-4 h-4" />
            Thêm bài coding
          </button>
        </div>
      </div>



      {/* Filters Bar matching reference perfectly */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 flex-wrap w-full md:w-auto">

          {/* Filters Title */}
          <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-black text-gray-800 uppercase border-r border-gray-100 tracking-wider">
            <SlidersHorizontal className="w-4 h-4 text-gray-500" />
            Filters
          </div>

          {/* Difficulty Dropdown */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-3.5 py-2 bg-gray-50 border border-gray-200 text-xs font-bold text-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer appearance-none min-w-[110px] text-center"
          >
            <option value="Difficulty">Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2 bg-gray-50 border border-gray-200 text-xs font-bold text-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer appearance-none min-w-[110px] text-center"
          >
            <option value="Category">Category</option>
            <option value="Array">Array</option>
            <option value="String">String</option>
            <option value="Binary Search">Binary Search</option>
            <option value="Linked List">Linked List</option>
          </select>

          {/* Role Dropdown */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3.5 py-2 bg-gray-50 border border-gray-200 text-xs font-bold text-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer appearance-none min-w-[110px] text-center"
          >
            <option value="Role">Role</option>
            <option value="Software Engineer">Software Engineer</option>
            <option value="Backend Engineer">Backend Engineer</option>
            <option value="Frontend Developer">Frontend Developer</option>
            <option value="Senior DevOps">Senior DevOps</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-gray-50 border border-gray-200 text-xs font-bold text-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer appearance-none min-w-[110px] text-center"
          >
            <option value="Status">Status</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>
        </div>

        {/* Clear filters */}
        <button
          onClick={clearAllFilters}
          className="text-xs font-extrabold text-[#2563EB] hover:text-blue-800 transition-colors mr-2 cursor-pointer"
        >
          Clear all
        </button>
      </div>

      {/* Main Content Table Container matching visual style exactly */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">

        {/* Search bar inside the main container */}
        <div className="p-4 border-b border-gray-50 bg-gray-50/20">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm bài coding..."
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:ring-4 focus:ring-blue-100 focus:border-[#2563EB] focus:outline-none placeholder-gray-400"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC]/55 border-b border-gray-100">
                <th className="py-4 px-6 text-[11px] font-black text-gray-500 uppercase tracking-wider w-24">ID</th>
                <th className="py-4 px-6 text-[11px] font-black text-gray-500 uppercase tracking-wider w-80">TIÊU ĐỀ</th>
                <th className="py-4 px-6 text-[11px] font-black text-gray-500 uppercase tracking-wider w-32">ĐỘ KHÓ</th>
                <th className="py-4 px-6 text-[11px] font-black text-gray-500 uppercase tracking-wider w-56">CATEGORY</th>
                <th className="py-4 px-6 text-[11px] font-black text-gray-500 uppercase tracking-wider w-40">LANGUAGES</th>
                <th className="py-4 px-6 text-[11px] font-black text-gray-500 uppercase tracking-wider w-28">TESTS</th>
                <th className="py-4 px-6 text-[11px] font-black text-gray-500 uppercase tracking-wider w-36">TRẠNG THÁI</th>
                <th className="py-4 px-6 text-[11px] font-black text-gray-500 uppercase tracking-wider text-right w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredQuestions.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50/20 transition-all">

                  {/* ID */}
                  <td className="py-5 px-6 text-sm font-semibold text-gray-400">{q.id}</td>

                  {/* Title & Role */}
                  <td className="py-5 px-6">
                    <div className="font-extrabold text-gray-900 text-sm hover:text-[#2563EB] cursor-pointer transition-colors leading-snug">{q.title}</div>
                    <div className="text-xs font-semibold text-gray-400 mt-1">{q.role}</div>
                  </td>

                  {/* Difficulty */}
                  <td className="py-5 px-6">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black tracking-wide ${q.difficulty === 'EASY' ? 'bg-[#DCFCE7] text-[#15803D]' :
                        q.difficulty === 'MEDIUM' ? 'bg-[#FFEDD5] text-[#C2410C]' :
                          'bg-[#FEE2E2] text-[#B91C1C]'
                      }`}>
                      {q.difficulty}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="py-5 px-6 text-xs font-bold text-gray-600 leading-normal">{q.category}</td>

                  {/* Languages */}
                  <td className="py-5 px-6">
                    <div className="flex gap-1.5">
                      {q.languages.map((lang) => (
                        <span
                          key={lang}
                          className={`w-7 h-5 flex items-center justify-center rounded text-[9px] font-black leading-none ${getLanguageStyle(lang)}`}
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Tests */}
                  <td className="py-5 px-6">
                    <span className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-lg leading-relaxed">
                      {q.tests}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${q.status === 'Published' ? 'bg-[#2563EB]' : 'bg-gray-400'
                        }`}></span>
                      <span className={`text-xs font-extrabold ${q.status === 'Published' ? 'text-[#2563EB]' : 'text-gray-400'
                        }`}>
                        {q.status}
                      </span>
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="py-5 px-6 text-right">
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Xóa bài coding"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>

                </tr>
              ))}
              {filteredQuestions.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-xs font-medium text-gray-400">
                    Không tìm thấy bài coding nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination matching mockup style */}
        <div className="p-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/20">
          <p className="text-xs font-semibold text-gray-500">
            Hiển thị <span className="font-bold text-gray-800">1-{filteredQuestions.length}</span> của <span className="font-bold text-gray-800">{totalCount}</span> bài coding
          </p>
          <div className="flex gap-1.5">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 border border-gray-200 hover:text-gray-800 hover:bg-gray-50 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#2563EB] text-white font-black text-xs shadow-sm">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 border border-gray-200 hover:text-gray-800 hover:bg-gray-50 font-black text-xs transition-colors">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-600 border border-gray-200 hover:text-gray-800 hover:bg-gray-50 font-black text-xs transition-colors">3</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 border border-gray-200 hover:text-gray-800 hover:bg-gray-50 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Modal: Thêm bài coding mới */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-gray-100 flex flex-col"
            >
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
                <span className="font-extrabold text-gray-900 text-lg">Thêm bài coding mới</span>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddProblem} className="space-y-4">

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Tiêu đề bài toán *</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ví dụ: Longest Substring Without Repeating Characters"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:ring-4 focus:ring-blue-100 focus:border-[#2563EB] focus:outline-none"
                  />
                </div>

                {/* Role / Tech */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Vai trò tương ứng</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="Software Engineer">Software Engineer</option>
                      <option value="Backend Developer">Backend Developer</option>
                      <option value="Frontend Developer">Frontend Developer</option>
                      <option value="Senior DevOps">Senior DevOps</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Độ khó</label>
                    <select
                      value={newDifficulty}
                      onChange={(e) => setNewDifficulty(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="EASY">EASY</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HARD">HARD</option>
                    </select>
                  </div>
                </div>

                {/* Category & Tests */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Danh mục (Category) *</label>
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Ví dụ: Hash Table, String"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:ring-4 focus:ring-blue-100 focus:border-[#2563EB] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Số lượng test cases</label>
                    <input
                      type="number"
                      value={newTests}
                      onChange={(e) => setNewTests(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:ring-4 focus:ring-blue-100 focus:border-[#2563EB] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Languages Multi-select Mock */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Hỗ trợ Ngôn ngữ</label>
                  <div className="flex gap-3">
                    {['JS', 'PY', 'JV', 'C++'].map(lang => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => {
                          if (newLanguages.includes(lang)) {
                            setNewLanguages(newLanguages.filter(l => l !== lang));
                          } else {
                            setNewLanguages([...newLanguages, lang]);
                          }
                        }}
                        className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${newLanguages.includes(lang)
                            ? 'bg-[#2563EB] text-white shadow-sm'
                            : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                          }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Trạng thái xuất bản</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={newStatus === 'Published'}
                        onChange={() => setNewStatus('Published')}
                        className="w-4 h-4 text-[#2563EB] border-gray-300"
                      />
                      <span className="text-xs font-semibold text-gray-700">Published (Công khai)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        checked={newStatus === 'Draft'}
                        onChange={() => setNewStatus('Draft')}
                        className="w-4 h-4 text-[#2563EB] border-gray-300"
                      />
                      <span className="text-xs font-semibold text-gray-700">Draft (Nháp)</span>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 rounded-xl"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-md"
                  >
                    Lưu & Đăng tải
                  </button>
                </div>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

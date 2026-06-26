import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, CheckCircle2, XCircle, MoreHorizontal, Trash2, Pencil, MoreVertical, Loader2 } from 'lucide-react';

import { adminQuestionBankApi } from '../../services/questionBankApi';

function DifficultyDots({ level, label }) {
  const dotsCount = label === 'Khó' ? 3 : label === 'Vừa' ? 2 : 1;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1.5">
        {[1, 2, 3].map(i => (
          <div key={i} className={`w-2.5 h-2.5 rounded-full ${i <= dotsCount ? 'bg-blue-600' : 'bg-gray-200'}`} />
        ))}
      </div>
      <span className="text-xs font-semibold text-gray-500">{label}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === 'Approve' || status === 'Published') {
    return (
      <div className="flex items-center gap-1.5 text-green-600 font-bold text-sm">
        <CheckCircle2 className="w-4 h-4" /> Published
      </div>
    );
  }
  if (status === 'Reject' || status === 'Disabled') {
    return (
      <div className="flex items-center gap-1.5 text-red-600 font-bold text-sm">
        <XCircle className="w-4 h-4" /> Disabled
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-gray-500 font-bold text-sm">
      <MoreHorizontal className="w-4 h-4" /> Draft
    </div>
  );
}

export default function AdminQuestionBank() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [roleFilter, setRoleFilter] = useState('Tất cả vai trò');
  const [difficultyFilter, setDifficultyFilter] = useState('Tất cả mức độ');
  const [categoryFilter, setCategoryFilter] = useState('Tất cả danh mục');
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filtered List state
  const [filteredQuestions, setFilteredQuestions] = useState([]);

  // Pagination
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      // In a real scenario we might fetch coding problems here too and merge, 
      // but for now let's just fetch from the questions endpoint.
      const data = await adminQuestionBankApi.getAll({ pageSize: 100 });
      const items = data.items || [];
      // Map API data to the format expected by the UI
      const mapped = items.map(item => {
        let diffLevel = 2;
        if (item.difficulty === 'Khó' || item.difficulty === 'Hard' || item.difficulty === 'Senior') diffLevel = 3;
        if (item.difficulty === 'Dễ' || item.difficulty === 'Easy' || item.difficulty === 'Intern' || item.difficulty === 'Fresher') diffLevel = 1;

        let techStackStr = '';
        try {
          if (item.techStackJson) {
            techStackStr = JSON.parse(item.techStackJson).join(', ');
          }
        } catch (e) { }

        return {
          id: item.id,
          category: item.category === 'Technical' ? 'Kỹ thuật (Technical)' : item.category,
          role: item.role,
          tech: techStackStr || 'N/A',
          difficulty: item.difficulty,
          difficultyLevel: diffLevel,
          content: item.title + (item.content ? ': ' + item.content : ''),
          status: item.status
        };
      });
      setQuestions(mapped);
      setFilteredQuestions(mapped);
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleFilter = () => {
    let result = [...questions];

    // Filter by role
    if (roleFilter !== 'Tất cả vai trò') {
      result = result.filter(q => q.role.toLowerCase().includes(roleFilter.toLowerCase()) || roleFilter.toLowerCase().includes(q.role.toLowerCase()));
    }

    // Filter by difficulty
    if (difficultyFilter !== 'Tất cả mức độ') {
      result = result.filter(q => q.difficulty === difficultyFilter);
    }

    // Filter by category
    if (categoryFilter !== 'Tất cả danh mục') {
      result = result.filter(q => q.category.toLowerCase().includes(categoryFilter.toLowerCase()) || categoryFilter.toLowerCase().includes(q.category.toLowerCase()));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const qLower = searchQuery.toLowerCase();
      result = result.filter(q => 
        q.content.toLowerCase().includes(qLower) || 
        q.tech.toLowerCase().includes(qLower) ||
        (q.id && `#Q-${q.id}`.toLowerCase().includes(qLower))
      );
    }

    setFilteredQuestions(result);
    setCurrentPage(1);
  };

  // Run filter automatically when search query, filters or raw questions list changes
  useEffect(() => {
    handleFilter();
  }, [searchQuery, roleFilter, difficultyFilter, categoryFilter, questions]);

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này khỏi Ngân hàng câu hỏi?')) {
      try {
        await adminQuestionBankApi.delete(id);
        const updated = questions.filter(q => q.id !== id);
        setQuestions(updated);
        setFilteredQuestions(filteredQuestions.filter(q => q.id !== id));
      } catch (error) {
        console.error('Lỗi khi xóa câu hỏi:', error);
        alert('Xóa thất bại');
      }
    }
  };

  const totalPages = Math.ceil(filteredQuestions.length / PAGE_SIZE);
  const paginatedQuestions = filteredQuestions.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="animate-fade-in max-w-[1180px] mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#333333]">Ngân hàng câu hỏi</h1>
          <p className="mt-2 text-[15px] font-semibold text-[#96939a]">Quản lý và biên soạn danh sách câu hỏi phỏng vấn AI.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/question-bank/add')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#333333] hover:bg-black text-white text-xs font-semibold rounded-lg transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Thêm câu hỏi mới
        </button>
      </div>

      {/* Search Input & Filters Box */}
      <div className="mb-6 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-[2] min-w-[200px]">
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-[#8d8a91]">Tìm kiếm</label>
            <input type="text" placeholder="Nội dung, từ khóa, công nghệ..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleFilter()} className="h-9 w-full rounded-lg border border-[#e8e8e8] bg-[#fafafa] px-3 text-[13px] font-semibold text-[#333333] outline-none transition-all placeholder:text-[#b6b3b8] focus:border-[#333333] focus:bg-white focus:ring-2 focus:ring-[#333333]/10" />
          </div>
          <div className="flex-1 min-w-[130px]">
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-[#8d8a91]">Vai trò</label>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="h-9 w-full rounded-lg border border-[#e8e8e8] bg-[#fafafa] px-3 text-[13px] font-bold text-[#333333] outline-none transition-all focus:border-[#333333] focus:bg-white focus:ring-2 focus:ring-[#333333]/10">
              <option value="Tất cả vai trò">Tất cả vai trò</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Fullstack Developer">Fullstack Developer</option>
              <option value="AI Engineer">AI Engineer</option>
            </select>
          </div>
          <div className="flex-1 min-w-[130px]">
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-[#8d8a91]">Độ khó</label>
            <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)} className="h-9 w-full rounded-lg border border-[#e8e8e8] bg-[#fafafa] px-3 text-[13px] font-bold text-[#333333] outline-none transition-all focus:border-[#333333] focus:bg-white focus:ring-2 focus:ring-[#333333]/10">
              <option value="Tất cả mức độ">Tất cả mức độ</option>
              <option value="Dễ">Dễ</option>
              <option value="Vừa">Vừa</option>
              <option value="Khó">Khó</option>
            </select>
          </div>
          <div className="flex-1 min-w-[130px]">
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-[#8d8a91]">Danh mục</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-9 w-full rounded-lg border border-[#e8e8e8] bg-[#fafafa] px-3 text-[13px] font-bold text-[#333333] outline-none transition-all focus:border-[#333333] focus:bg-white focus:ring-2 focus:ring-[#333333]/10">
              <option value="Tất cả danh mục">Tất cả danh mục</option>
              <option value="Coding">Coding</option>
              <option value="Kỹ thuật">Kỹ thuật (Technical)</option>
              <option value="HR">HR</option>
              <option value="GitHub">GitHub</option>
            </select>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleFilter} className="h-9 rounded-lg bg-[#333333] px-4 text-[13px] font-extrabold text-white shadow-sm transition-all hover:bg-black active:translate-y-px flex items-center justify-center gap-1.5">
              <Filter className="h-3.5 w-3.5" /> Lọc
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#eeeeee] bg-white">
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91] w-24">ID</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91] w-32">Danh Mục</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91] w-40">Role / Tech</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91] w-32">Độ Khó</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Nội Dung Câu Hỏi</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91] w-32">Trạng Thái</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91] text-right w-24">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-sm font-medium text-gray-400">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      Đang tải dữ liệu câu hỏi từ database...
                    </div>
                  </td>
                </tr>
              ) : filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-sm font-medium text-gray-400">
                    Không tìm thấy câu hỏi nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                paginatedQuestions.map((q, idx) => (
                  <tr key={q.id} className="group border-b border-[#eeeeee] transition-colors last:border-b-0 hover:bg-[#fafafa]">
                    <td className="px-5 py-5 font-mono text-[14px] font-extrabold text-[#333333] tabular-nums">#Q-{q.id}</td>
                    <td className="px-5 py-5">
                      <span className={`inline-flex rounded-md px-2.5 py-1 text-[10px] font-extrabold uppercase ${
                        q.category.includes('Coding') ? 'bg-indigo-100 text-indigo-700' :
                        q.category.includes('HR') ? 'bg-purple-100 text-purple-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {q.category}
                      </span>
                    </td>
                    <td className="px-5 py-5">
                      <p className="text-[14px] font-semibold leading-tight text-[#333333]">{q.role}</p>
                      <p className="text-xs font-medium text-gray-500 mt-1">{q.tech}</p>
                    </td>
                    <td className="px-5 py-5">
                      <DifficultyDots level={q.difficultyLevel || 2} label={q.difficulty} />
                    </td>
                    <td className="px-5 py-5 text-[14px] font-semibold text-[#333333] leading-relaxed max-w-md">
                      {q.content}
                    </td>
                    <td className="px-5 py-5">
                      <StatusBadge status={q.status} />
                    </td>
                    <td className="px-5 py-5 text-right">
                      <div className="relative inline-block" ref={openMenuId === q.id ? menuRef : null}>
                        <button
                          onClick={() => setOpenMenuId(openMenuId === q.id ? null : q.id)}
                          className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Tùy chọn"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {openMenuId === q.id && (
                          <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
                            <button
                              onClick={() => { setOpenMenuId(null); navigate(`/admin/question-bank/edit/${q.id}`); }}
                              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                            >
                              <Pencil className="w-4 h-4" /> Sửa
                            </button>
                            <button
                              onClick={() => { setOpenMenuId(null); handleDelete(q.id); }}
                              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" /> Xóa
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#eeeeee] bg-white px-5 py-4 sm:flex-row">
          <p className="text-sm font-medium text-[#6f6a72]">
            Hiển thị {Math.min(currentPage * PAGE_SIZE, filteredQuestions.length)} trong số {filteredQuestions.length} kết quả
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#eeeeee] text-[#c8c5ca] transition-colors hover:bg-[#fafafa] disabled:opacity-45">&lt;</button>
              {getPageNumbers().map((p, i) => 
                p === '...' ? (
                  <span key={`ellipsis-${i}`} className="flex h-9 w-9 items-center justify-center text-[#c8c5ca] text-sm font-extrabold">...</span>
                ) : (
                  <button key={p} onClick={() => setCurrentPage(p)} className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-extrabold transition-colors ${currentPage === p ? 'bg-[#333333] text-white shadow-sm' : 'border border-[#eeeeee] text-[#6f6a72] hover:bg-[#fafafa]'}`}>{p}</button>
                )
              )}
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#eeeeee] text-[#c8c5ca] transition-colors hover:bg-[#fafafa] disabled:opacity-45">&gt;</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

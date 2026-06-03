import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, MoreVertical, CheckCircle2, XCircle, MoreHorizontal, Trash2 } from 'lucide-react';

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
  
  // Filter States
  const [roleFilter, setRoleFilter] = useState('Tất cả vai trò');
  const [difficultyFilter, setDifficultyFilter] = useState('Tất cả mức độ');
  const [categoryFilter, setCategoryFilter] = useState('Tất cả danh mục');
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filtered List state
  const [filteredQuestions, setFilteredQuestions] = useState([]);

  const fetchQuestions = async () => {
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
  };

  // Run filter on click or when search query is cleared
  useEffect(() => {
    if (!searchQuery) {
      handleFilter();
    }
  }, [searchQuery, questions]);

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

  return (
    <div className="animate-fade-in max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Ngân hàng câu hỏi</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Quản lý và biên soạn danh sách câu hỏi phỏng vấn AI.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/question-bank/add')}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
        >
          <Plus className="w-5 h-5" />
          Thêm câu hỏi mới
        </button>
      </div>

      {/* Search Input & Filters Box */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8 space-y-6">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
            placeholder="Tìm kiếm theo nội dung câu hỏi, từ khóa, công nghệ..."
            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-100 focus:outline-none placeholder-gray-400 font-medium"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-600 mb-2.5 tracking-wide">Vai trò (Role)</label>
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all appearance-none cursor-pointer"
            >
              <option value="Tất cả vai trò">Tất cả vai trò</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Backend Developer">Backend Developer</option>
              <option value="Fullstack Developer">Fullstack Developer</option>
              <option value="AI Engineer">AI Engineer</option>
            </select>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-600 mb-2.5 tracking-wide">Độ khó (Difficulty)</label>
            <select 
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all appearance-none cursor-pointer"
            >
              <option value="Tất cả mức độ">Tất cả mức độ</option>
              <option value="Dễ">Dễ</option>
              <option value="Vừa">Vừa</option>
              <option value="Khó">Khó</option>
            </select>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-gray-600 mb-2.5 tracking-wide">Danh mục (Category)</label>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all appearance-none cursor-pointer"
            >
              <option value="Tất cả danh mục">Tất cả danh mục</option>
              <option value="Coding">Coding</option>
              <option value="Kỹ thuật">Kỹ thuật (Technical)</option>
              <option value="HR">HR</option>
              <option value="GitHub">GitHub</option>
            </select>
          </div>
          <button 
            onClick={handleFilter}
            className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors shadow-sm shadow-blue-100"
          >
            <Filter className="w-4 h-4" /> Lọc kết quả
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-5 px-6 text-xs font-black text-gray-500 uppercase tracking-wider w-24">ID</th>
                <th className="py-5 px-6 text-xs font-black text-gray-500 uppercase tracking-wider w-32">Danh Mục</th>
                <th className="py-5 px-6 text-xs font-black text-gray-500 uppercase tracking-wider w-40">Role / Tech</th>
                <th className="py-5 px-6 text-xs font-black text-gray-500 uppercase tracking-wider w-32">Độ Khó</th>
                <th className="py-5 px-6 text-xs font-black text-gray-500 uppercase tracking-wider">Nội Dung Câu Hỏi</th>
                <th className="py-5 px-6 text-xs font-black text-gray-500 uppercase tracking-wider w-32">Trạng Thái</th>
                <th className="py-5 px-6 text-xs font-black text-gray-500 uppercase tracking-wider text-right w-24">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredQuestions.map((q, idx) => (
                <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-6 px-6 text-sm font-black text-gray-900">#Q-{q.id}</td>
                  <td className="py-6 px-6">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold ${
                      q.category.includes('Coding') ? 'bg-indigo-100 text-indigo-700' :
                      q.category.includes('HR') ? 'bg-purple-100 text-purple-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {q.category}
                    </span>
                  </td>
                  <td className="py-6 px-6">
                    <p className="text-sm font-bold text-gray-900">{q.role}</p>
                    <p className="text-xs font-medium text-gray-500 mt-1.5">{q.tech}</p>
                  </td>
                  <td className="py-6 px-6">
                    <DifficultyDots level={q.difficultyLevel || 2} label={q.difficulty} />
                  </td>
                  <td className="py-6 px-6 text-sm font-medium text-gray-700 leading-relaxed max-w-md">
                    {q.content}
                  </td>
                  <td className="py-6 px-6">
                    <StatusBadge status={q.status} />
                  </td>
                  <td className="py-6 px-6 text-right">
                    <button 
                      onClick={() => handleDelete(q.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa câu hỏi"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredQuestions.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-sm font-medium text-gray-400">
                    Không tìm thấy câu hỏi nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
          <p className="text-sm font-medium text-gray-500">
            Hiển thị <span className="font-bold text-gray-900">{filteredQuestions.length}</span> câu hỏi
          </p>
        </div>
      </div>
    </div>
  );
}

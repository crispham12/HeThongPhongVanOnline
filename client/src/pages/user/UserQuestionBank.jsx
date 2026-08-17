import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ChevronRight, CheckCircle2, Circle, BookOpen,
  Code2, Users, Flame, Trophy, Star, ArrowRight,
  Filter, ChevronDown, Eye, Play, Clock, Target,
  TrendingUp, Award, Zap, Brain, MessageSquare,
  FileCode, Lightbulb, Loader2
} from 'lucide-react';
import { practiceQuestionApi } from '../../services/questionBankApi';
import { practiceCodingApi } from '../../services/codingBankApi';
import { practiceProgressApi } from '../../services/practiceProgressApi';

const TABS = [
  { key: 'HR', label: 'Câu hỏi HR', icon: Users, apiCategory: 'HR' },
  { key: 'Kỹ thuật', label: 'Kỹ thuật', icon: Brain, apiCategory: 'Technical' },
  { key: 'Lập trình', label: 'Lập trình', icon: Code2, apiCategory: 'Coding' },
];

const DIFF_COLORS = {
  Easy: 'bg-[#fafafa] text-[#333333] border-[#e6e6e6]',
  Medium: 'bg-[#fafafa] text-[#333333] border-[#333333]',
  Hard: 'bg-[#B4F290] text-[#111827] border-[#B4F290]'
};

const STATUS_BADGES = {
  Solved: 'badge-success',
  Completed: 'badge-success',
  InProgress: 'badge-warning',
  NotStarted: 'bg-[#fafafa] text-[#8d8a91] border-[#e6e6e6]'
};

const STATUS_TEXT = {
  Solved: 'Hoàn thành',
  Completed: 'Hoàn thành',
  InProgress: 'Đang làm',
  NotStarted: 'Chưa làm'
};

const POPULAR_CATEGORIES = [
  { value: 'all', label: 'Chủ đề', disabled: true, hidden: true },
  { value: '', label: 'Tất cả' },
  { value: 'Array', label: 'Array (Mảng)' },
  { value: 'String', label: 'String (Chuỗi)' },
  { value: 'HashMap', label: 'Hash Table (Bảng băm)' },
  { value: 'Two Pointers', label: 'Two Pointers (Con trỏ kép)' },
  { value: 'Binary Search', label: 'Binary Search' },
  { value: 'Dynamic Programming', label: 'Dynamic Programming' },
  { value: 'Recursion', label: 'Recursion (Đệ quy)' },
  { value: 'Sorting', label: 'Sorting (Sắp xếp)' }
];

export default function UserQuestionBank() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('HR');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [items, setItems] = useState([]);
  const [progress, setProgress] = useState({
    totalPracticed: 0,
    hrPracticed: 0, hrTotal: 0,
    technicalPracticed: 0, technicalTotal: 0,
    codingPracticed: 0, codingTotal: 0,
    dailyStreak: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  useEffect(() => {
    fetchData();
  }, [activeTab, difficultyFilter, categoryFilter, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [difficultyFilter, statusFilter, categoryFilter, searchQuery]);

  const fetchProgress = async () => {
    try {
      const data = await practiceProgressApi.getProgress();
      setProgress(data);
    } catch (error) {
      console.error('Failed to load progress', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
      try {
        const params = {
          search: searchQuery || undefined,
          difficulty: (difficultyFilter !== 'all' && difficultyFilter !== '') ? difficultyFilter : undefined,
          pageSize: 200
        };

      const currentTab = TABS.find(t => t.key === activeTab);
      
      let data;
        if (currentTab.apiCategory === 'Coding') {
          if (categoryFilter !== 'all' && categoryFilter !== '') {
            params.category = categoryFilter;
          }
          if (params.difficulty === 'Dễ') params.difficulty = 'Easy';
          if (params.difficulty === 'Vừa') params.difficulty = 'Medium';
          if (params.difficulty === 'Khó') params.difficulty = 'Hard';
        data = await practiceCodingApi.getAll(params);
      } else {
        params.category = currentTab.apiCategory;
        data = await practiceQuestionApi.getAll(params);
      }
      
      setItems(data.items || []);
    } catch (error) {
      console.error('Failed to fetch practice items', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setDifficultyFilter('all');
    setStatusFilter('all');
    setCategoryFilter('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (statusFilter !== 'all' && statusFilter !== '') {
        const isCompleted = item.practiceStatus === 'Practiced' || item.practiceStatus === 'Completed' || item.practiceStatus === 'Solved';
        if (statusFilter === 'completed' && !isCompleted) return false;
        if (statusFilter === 'incomplete' && isCompleted) return false;
      }
      return true;
    });
  }, [items, statusFilter, activeTab]);

  const ITEMS_PER_PAGE = 10;

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  const getDifficultyStyle = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'dễ':
      case 'easy':
      case 'intern':
      case 'fresher': 
        return DIFF_COLORS.Easy;
      case 'trung bình':
      case 'medium':
      case 'junior':
        return DIFF_COLORS.Medium;
      case 'khó':
      case 'hard':
      case 'middle':
      case 'senior':
        return DIFF_COLORS.Hard;
      default: return 'bg-[#fafafa] text-[#8d8a91] border-[#e6e6e6]';
    }
  };

  const getProgressPercent = (completed, total) => total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="max-w-[1180px] mx-auto animate-fade-in pb-12 text-[#333333]">
      {/* ─────── PAGE HEADER ─────── */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#333333]">
            Ngân hàng câu hỏi
          </h1>
          <p className="text-[15px] font-semibold text-[#96939a] mt-2">
            Rèn luyện kỹ năng với nội dung phỏng vấn chọn lọc.
          </p>
        </div>
        <div className="relative w-full lg:w-[320px]">
        </div>
      </div>

      {/* ─────── PROGRESS STATS ─────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm min-h-[154px] flex flex-col justify-between transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e6e6e6] bg-[#fafafa] text-[#333333]">
              <MessageSquare className="h-4 w-4" />
            </div>
            <span className="text-[13px] font-extrabold text-[#333333] tabular-nums">
              {progress.hrPracticed} / {progress.hrTotal}
            </span>
          </div>
          <div>
            <p className="label-caps mb-1">Câu hỏi HR</p>
            <div className="h-1.5 w-full bg-[#f1f1f1] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#333333] rounded-full transition-all duration-700"
                style={{ width: `${getProgressPercent(progress.hrPracticed, progress.hrTotal)}%` }}
              />
            </div>
            <p className="text-[11px] font-extrabold text-[#8d8a91] mt-3 tracking-[0.14em] uppercase">{getProgressPercent(progress.hrPracticed, progress.hrTotal)}% HOÀN THÀNH</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm min-h-[154px] flex flex-col justify-between transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e6e6e6] bg-[#fafafa] text-[#333333]">
              <Brain className="h-4 w-4" />
            </div>
            <span className="text-[13px] font-extrabold text-[#333333] tabular-nums">
              {progress.technicalPracticed} / {progress.technicalTotal}
            </span>
          </div>
          <div>
            <p className="label-caps mb-1">Kỹ thuật</p>
            <div className="h-1.5 w-full bg-[#f1f1f1] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#333333] rounded-full transition-all duration-700"
                style={{ width: `${getProgressPercent(progress.technicalPracticed, progress.technicalTotal)}%` }}
              />
            </div>
            <p className="text-[11px] font-extrabold text-[#8d8a91] mt-3 tracking-[0.14em] uppercase">{getProgressPercent(progress.technicalPracticed, progress.technicalTotal)}% HOÀN THÀNH</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm min-h-[154px] flex flex-col justify-between transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e6e6e6] bg-[#fafafa] text-[#333333]">
              <FileCode className="h-4 w-4" />
            </div>
            <span className="text-[13px] font-extrabold text-[#333333] tabular-nums">
              {progress.codingPracticed} / {progress.codingTotal}
            </span>
          </div>
          <div>
            <p className="label-caps mb-1">Lập trình</p>
            <div className="h-1.5 w-full bg-[#f1f1f1] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#333333] rounded-full transition-all duration-700"
                style={{ width: `${getProgressPercent(progress.codingPracticed, progress.codingTotal)}%` }}
              />
            </div>
            <p className="text-[11px] font-extrabold text-[#8d8a91] mt-3 tracking-[0.14em] uppercase">{getProgressPercent(progress.codingPracticed, progress.codingTotal)}% HOÀN THÀNH</p>
          </div>
        </div>
      </div>

      {/* ─────── MAIN CONTENT ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

        {/* ─── LEFT COLUMN ─── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          
          <div className="flex border-b border-[#eeeeee]">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex items-center gap-2 px-5 py-4 text-xs font-extrabold uppercase tracking-[0.14em] transition-all ${
                    isActive ? 'text-[#333333] bg-[#fafafa]' : 'text-[#8d8a91] hover:text-[#333333] hover:bg-[#f1f1f1]'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === 'Lập trình' ? (
            <div className="p-4 border-b border-[#eeeeee] flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:max-w-[280px]">
                <Search className="w-4 h-4 text-[#8d8a91] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="Mã bài tập..."
                  className="input pl-10"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                <select
                  value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                  className="input !w-auto cursor-pointer"
                >
                  {POPULAR_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value} disabled={cat.disabled} hidden={cat.hidden}>{cat.label}</option>
                  ))}
                </select>

                <select
                  value={difficultyFilter}
                  onChange={(e) => { setDifficultyFilter(e.target.value); setCurrentPage(1); }}
                  className="input !w-auto cursor-pointer"
                >
                  <option value="all" disabled hidden>Độ khó</option>
                  <option value="">Tất cả</option>
                  <option value="Dễ">Dễ</option>
                  <option value="Vừa">Vừa</option>
                  <option value="Khó">Khó</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="p-4 border-b border-[#eeeeee] flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:max-w-[280px]">
                <Search className="w-4 h-4 text-[#8d8a91] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="Tìm kiếm câu hỏi..."
                  className="input pl-10"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                <Filter className="w-4 h-4 text-[#8d8a91]" />

              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="input !w-auto cursor-pointer"
              >
                <option value="all" disabled hidden>Độ khó</option>
                <option value="">Tất cả</option>
                <option value="Dễ">Dễ</option>
                <option value="Vừa">Vừa</option>
                <option value="Khó">Khó</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input !w-auto cursor-pointer"
              >
                <option value="all" disabled hidden>Trạng thái</option>
                <option value="">Tất cả</option>
                <option value="completed">Đã hoàn thành</option>
                <option value="incomplete">Chưa hoàn thành</option>
              </select>
            </div>
          </div>
          )}

          <div className="min-h-[300px]">
            {loading ? (
              <div className="py-16 text-center flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#333333] animate-spin mb-3" />
                <p className="text-sm font-extrabold text-[#8d8a91]">Đang tải...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-16 text-center">
                <BookOpen className="w-10 h-10 text-[#e6e6e6] mx-auto mb-3" />
                <p className="text-sm font-extrabold text-[#8d8a91]">Không tìm thấy bài tập nào.</p>
              </div>
            ) : activeTab === 'Lập trình' ? (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#eeeeee] bg-white">
                      <th className="py-4 pl-5 pr-8 label-caps">Tên bài</th>
                      <th className="py-4 px-4 label-caps">Độ khó</th>
                      <th className="py-4 px-4 label-caps">Thời gian</th>
                      <th className="py-4 px-4 label-caps">Tốt nhất</th>
                      <th className="py-4 px-4 label-caps">Trạng thái</th>
                      <th className="py-4 pl-4 pr-5 label-caps text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eeeeee]">
                    {paginatedItems.map((p) => {
                      const isCompleted = p.practiceStatus === 'Solved' || p.practiceStatus === 'Completed' || p.practiceStatus === 'Practiced';
                      return (
                        <tr key={p.id} className="hover:bg-[#fafafa] transition-colors group">
                          <td className="py-4 pl-5 pr-8 align-middle">
                            <div className={`font-extrabold text-sm transition-colors ${isCompleted ? 'text-[#8d8a91] line-through' : 'text-[#333333] group-hover:text-black'}`}>
                              {p.title}
                            </div>
                          </td>
                          <td className="py-4 px-4 align-middle whitespace-nowrap">
                            <span className={`inline-block px-2.5 py-1 rounded border text-[10px] font-extrabold uppercase tracking-widest ${getDifficultyStyle(p.difficulty)}`}>
                              {p.difficulty?.toUpperCase() || '-'}
                            </span>
                          </td>
                          <td className="py-4 px-4 align-middle whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-xs text-[#333333] font-extrabold tabular-nums">
                              <Clock className="w-3.5 h-3.5 text-[#8d8a91] flex-shrink-0" />
                              {p.estimatedMinutes || 15}m
                            </div>
                          </td>
                          <td className="py-4 px-4 align-middle whitespace-nowrap text-center">
                            {p.bestScore !== null && p.bestScore !== undefined ? (
                              <span className="text-sm font-extrabold text-[#333333] tabular-nums">{p.bestScore}%</span>
                            ) : (
                              <span className="text-[#e6e6e6] font-bold">—</span>
                            )}
                          </td>
                          <td className="py-4 px-4 align-middle whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${STATUS_BADGES[p.practiceStatus] || 'bg-white text-[#8d8a91] border-[#e6e6e6]'}`}>
                              {STATUS_TEXT[p.practiceStatus] || 'Chưa làm'}
                            </span>
                          </td>
                          <td className="py-4 pl-4 pr-5 align-middle text-right whitespace-nowrap">
                            <button
                              onClick={() => navigate(`/coding-practice/${p.id}`)}
                              className="btn-primary !h-8 !px-3 !text-xs"
                            >
                              <Play className="w-3 h-3" /> Bắt đầu
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="divide-y divide-[#eeeeee]">
                {paginatedItems.map((q) => {
                  const isCompleted = q.practiceStatus === 'Practiced' || q.practiceStatus === 'Completed';
                  return (
                    <div key={q.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 hover:bg-[#fafafa] transition-colors group">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {isCompleted ? <CheckCircle2 className="w-5 h-5 text-[#77c486]" /> : <Circle className="w-5 h-5 text-[#e6e6e6]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[15px] font-extrabold leading-tight ${isCompleted ? 'text-[#8d8a91] line-through' : 'text-[#333333]'}`}>
                            {q.title}
                          </p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {q.role && (
                              <span className="text-[10px] font-extrabold text-[#333333] bg-[#f1f1f1] px-2 py-1 rounded uppercase tracking-[0.14em]">
                                {q.role}
                              </span>
                            )}
                            <span className={`text-[10px] font-extrabold px-2 py-1 rounded uppercase tracking-[0.14em] border ${getDifficultyStyle(q.difficulty)}`}>
                              {q.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity self-end sm:self-center">
                        <button
                          onClick={() => navigate(`/question-bank/practice/${q.id}`)}
                          className="btn-primary !h-9 !px-4 !text-xs"
                        >
                          <Play className="w-3.5 h-3.5" /> Luyện tập
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {totalPages > 0 && (
            <div className="p-5 border-t border-[#eeeeee] flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
              <p className="text-[13px] font-extrabold text-[#8d8a91]">
                {filteredItems.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)} / {filteredItems.length}
              </p>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#eeeeee] text-[#8d8a91] transition-colors hover:bg-[#fafafa] disabled:opacity-45"
                  >
                    &lt;
                  </button>
                  
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const page = idx + 1;
                    const isActive = currentPage === page;
                    if (totalPages > 7) {
                      if (page !== 1 && page !== totalPages && Math.abs(page - currentPage) > 1) {
                        if (page === 2 || page === totalPages - 1) return <span key={page} className="text-[#8d8a91] px-2">...</span>;
                        return null;
                      }
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-extrabold transition-colors ${
                          isActive
                            ? 'bg-[#333333] text-white shadow-sm'
                            : 'border border-[#eeeeee] text-[#6f6a72] hover:bg-[#fafafa]'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#eeeeee] text-[#8d8a91] transition-colors hover:bg-[#fafafa] disabled:opacity-45"
                  >
                    &gt;
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── RIGHT COLUMN ─── */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="label-caps mb-4 flex items-center gap-2 text-[#333333]">
              <Target className="w-4 h-4" /> Tiến độ của tôi
            </h3>

            <div className="rounded-lg bg-[#B4F290] p-4 mb-4 text-[#111827]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#111827]/65">Chuỗi liên tục</p>
                  <p className="text-[28px] font-extrabold leading-none mt-2 tabular-nums">{progress.dailyStreak}</p>
                </div>
                <div className="w-10 h-10 border border-[#111827]/20 bg-[#111827]/5 rounded-lg flex items-center justify-center">
                  <Flame className="w-5 h-5 text-[#111827]" />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[#e6e6e6] p-4 mb-4 bg-[#fafafa]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Hoàn thành</p>
                  <p className="text-[28px] font-extrabold text-[#333333] leading-none mt-2 tabular-nums">{progress.totalPracticed}</p>
                </div>
                <div className="w-10 h-10 border border-[#e6e6e6] bg-white rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-[#333333]" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="label-caps mb-4 flex items-center gap-2 text-[#333333]">
              <Lightbulb className="w-4 h-4" /> Gợi ý
            </h3>
            <div className="space-y-2">
              <button onClick={() => handleTabChange('Kỹ thuật')} className="w-full text-left rounded-lg border border-[#e6e6e6] p-3 hover:border-[#333333] hover:bg-[#fafafa] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded border border-[#e6e6e6] bg-white flex items-center justify-center shrink-0 text-[#333333]">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[13px] font-extrabold text-[#333333]">Ôn tập Kỹ thuật</p>
                    <p className="text-[11px] font-semibold text-[#8d8a91] mt-0.5">Tiếp tục giải câu hỏi kỹ thuật</p>
                  </div>
                </div>
              </button>

              <button onClick={() => handleTabChange('Lập trình')} className="w-full text-left rounded-lg border border-[#e6e6e6] p-3 hover:border-[#333333] hover:bg-[#fafafa] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded border border-[#e6e6e6] bg-white flex items-center justify-center shrink-0 text-[#333333]">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[13px] font-extrabold text-[#333333]">Luyện Coding</p>
                    <p className="text-[11px] font-semibold text-[#8d8a91] mt-0.5">Cải thiện tư duy thuật toán</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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

export default function UserQuestionBank() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('HR');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
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
  }, [activeTab, difficultyFilter, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [difficultyFilter, statusFilter, searchQuery]);

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
        difficulty: difficultyFilter !== 'all' ? difficultyFilter : undefined,
        pageSize: 200 // Load more to allow client-side status filtering and pagination
      };

      const currentTab = TABS.find(t => t.key === activeTab);
      
      let data;
      if (currentTab.apiCategory === 'Coding') {
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
    setSearchQuery('');
    setCurrentPage(1);
  };

  /* Filter items by status on client side since backend doesn't support it directly yet */
  const filteredItems = useMemo(() => {
    if (statusFilter === 'all') return items;
    return items.filter(item => {
      const isCompleted = item.practiceStatus === 'Practiced' || item.practiceStatus === 'Completed';
      if (statusFilter === 'completed') return isCompleted;
      if (statusFilter === 'incomplete') return !isCompleted;
      return true;
    });
  }, [items, statusFilter]);

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
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'trung bình':
      case 'medium':
      case 'junior':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'khó':
      case 'hard':
      case 'middle':
      case 'senior':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getProgressPercent = (completed, total) => total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="max-w-[1400px] mx-auto animate-fade-in pb-12">
      {/* ─────── PAGE HEADER ─────── */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-gray-900">
            Ngân hàng câu hỏi
          </h1>
          <p className="text-sm text-gray-500 mt-1.5 font-medium">
            Rèn luyện kỹ năng với nội dung phỏng vấn chọn lọc.
          </p>
        </div>
        <div className="relative max-w-xs w-full lg:w-auto">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm câu hỏi..."
            className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium text-gray-700 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:outline-none placeholder-gray-400 shadow-sm transition-all"
          />
        </div>
      </div>

      {/* ─────── PROGRESS STATS ─────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Câu hỏi HR</p>
                <p className="text-[11px] font-medium text-gray-400 mt-0.5">Behavioral & Soft skills</p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-lg">
              {progress.hrPracticed}/{progress.hrTotal}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all duration-700"
              style={{ width: `${getProgressPercent(progress.hrPracticed, progress.hrTotal)}%` }}
            />
          </div>
          <p className="text-[11px] font-semibold text-gray-400 mt-2">{getProgressPercent(progress.hrPracticed, progress.hrTotal)}% hoàn thành</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Brain className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Câu hỏi kỹ thuật</p>
                <p className="text-[11px] font-medium text-gray-400 mt-0.5">Technical Knowledge</p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              {progress.technicalPracticed}/{progress.technicalTotal}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-700"
              style={{ width: `${getProgressPercent(progress.technicalPracticed, progress.technicalTotal)}%` }}
            />
          </div>
          <p className="text-[11px] font-semibold text-gray-400 mt-2">{getProgressPercent(progress.technicalPracticed, progress.technicalTotal)}% hoàn thành</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <FileCode className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Bài tập lập trình</p>
                <p className="text-[11px] font-medium text-gray-400 mt-0.5">Coding Challenges</p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
              {progress.codingPracticed}/{progress.codingTotal}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${getProgressPercent(progress.codingPracticed, progress.codingTotal)}%` }}
            />
          </div>
          <p className="text-[11px] font-semibold text-gray-400 mt-2">{getProgressPercent(progress.codingPracticed, progress.codingTotal)}% hoàn thành</p>
        </div>
      </div>

      {/* ─────── MAIN CONTENT ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

        {/* ─── LEFT COLUMN ─── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          
          <div className="flex border-b border-gray-100">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold transition-all relative ${
                    isActive ? 'text-[#2563EB]' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                  {isActive && <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#2563EB] rounded-t-full" />}
                </button>
              );
            })}
          </div>

          <div className="p-4 border-b border-gray-50 bg-gray-50/30 flex flex-wrap items-center gap-3">
            <Filter className="w-4 h-4 text-gray-400" />

            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-gray-200 text-xs font-bold text-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer min-w-[100px]"
            >
              <option value="all">Độ khó</option>
              {activeTab === 'Lập trình' ? (
                <>
                  <option value="Easy">Dễ (Easy)</option>
                  <option value="Medium">Trung bình (Medium)</option>
                  <option value="Hard">Khó (Hard)</option>
                </>
              ) : (
                <>
                  <option value="Intern">Intern</option>
                  <option value="Fresher">Fresher</option>
                  <option value="Junior">Junior</option>
                  <option value="Middle">Middle</option>
                  <option value="Senior">Senior</option>
                </>
              )}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-gray-200 text-xs font-bold text-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer min-w-[110px]"
            >
              <option value="all">Trạng thái</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="incomplete">Chưa hoàn thành</option>
            </select>
          </div>

          <div className="divide-y divide-gray-50 min-h-[300px]">
            {loading ? (
              <div className="py-16 text-center flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                <p className="text-sm font-semibold text-gray-400">Đang tải câu hỏi...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-16 text-center">
                <BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-400">Không tìm thấy câu hỏi nào.</p>
                <p className="text-xs text-gray-300 mt-1">Thử thay đổi bộ lọc hoặc tìm kiếm khác.</p>
              </div>
            ) : (
              paginatedItems.map((q) => {
                const isCompleted = q.practiceStatus === 'Practiced' || q.practiceStatus === 'Completed';
                return (
                  <div key={q.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors group">
                    <div className="flex-shrink-0">
                      {isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-gray-200" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold leading-snug ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                        {q.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {q.role && (
                          <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            {q.role}
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getDifficultyStyle(q.difficulty)}`}>
                          {q.difficulty}
                        </span>
                        {q.category && activeTab === 'Lập trình' && (
                           <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                             {q.category}
                           </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {activeTab !== 'Lập trình' && (
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 text-[11px] font-bold rounded-lg hover:bg-gray-200 transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                          Xem chi tiết
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/question-bank/practice/${q.id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB] text-white text-[11px] font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Luyện tập
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50/20 mt-auto flex flex-col items-center gap-4">
            <p className="text-xs font-semibold text-gray-400 text-center">
              Hiển thị từ <span className="font-bold text-gray-600">{filteredItems.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}</span> đến <span className="font-bold text-gray-600">{Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)}</span> trong số <span className="font-bold text-gray-600">{filteredItems.length}</span> câu hỏi
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-2 justify-center">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  &lt;
                </button>
                
                {(() => {
                  const pages = [];
                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    if (currentPage > 3) pages.push('...');
                    
                    const start = Math.max(2, currentPage - 1);
                    const end = Math.min(totalPages - 1, currentPage + 1);
                    for (let i = start; i <= end; i++) {
                      if (!pages.includes(i)) pages.push(i);
                    }
                    
                    if (currentPage < totalPages - 2) pages.push('...');
                    if (!pages.includes(totalPages)) pages.push(totalPages);
                  }
                  
                  return pages.map((page, idx) => {
                    if (page === '...') {
                      return (
                        <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-gray-400 font-semibold">
                          ...
                        </span>
                      );
                    }
                    const isActive = currentPage === page;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl border text-sm font-bold transition-all ${
                          isActive
                            ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-sm'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  });
                })()}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  &gt;
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT COLUMN ─── */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-[#2563EB]" />
              Tiến độ của tôi
            </h3>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 mb-4 border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">Chuỗi luyện tập</p>
                  <p className="text-3xl font-black text-orange-600 mt-1">{progress.dailyStreak}</p>
                  <p className="text-[11px] font-semibold text-orange-400">ngày liên tiếp</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
                  <Flame className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-blue-700">Top 5%</p>
                  <p className="text-[11px] font-medium text-blue-400">người dùng tích cực nhất</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg font-black text-gray-800">{progress.totalPracticed}</p>
                <p className="text-[10px] font-bold text-gray-400 mt-0.5">Đã hoàn thành</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg font-black text-gray-800">{progress.hrTotal + progress.technicalTotal + progress.codingTotal}</p>
                <p className="text-[10px] font-bold text-gray-400 mt-0.5">Tổng câu hỏi</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Gợi ý cho bạn
            </h3>
            <div className="space-y-3">
              <div className="group flex items-start gap-3 p-3 rounded-xl hover:bg-blue-50/50 cursor-pointer transition-all border border-transparent hover:border-blue-100">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                  <Brain className="w-4.5 h-4.5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 group-hover:text-blue-700 transition-colors">Ôn tập hệ thống</p>
                  <p className="text-[10px] font-medium text-gray-400 mt-0.5 leading-relaxed">Tiếp tục giải các câu hỏi kỹ thuật bạn chưa hoàn thành</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors mt-0.5 flex-shrink-0" />
              </div>

              <div className="group flex items-start gap-3 p-3 rounded-xl hover:bg-emerald-50/50 cursor-pointer transition-all border border-transparent hover:border-emerald-100">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200 transition-colors">
                  <Code2 className="w-4.5 h-4.5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 group-hover:text-emerald-700 transition-colors">Luyện Coding</p>
                  <p className="text-[10px] font-medium text-gray-400 mt-0.5 leading-relaxed">Cải thiện tư duy giải thuật qua các bài tập lập trình</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-colors mt-0.5 flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

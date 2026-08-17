import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Plus, Search,
  ChevronLeft, ChevronRight, X, Check, Trash2, Loader2,
  Code2, Pencil, SlidersHorizontal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminCodingBankApi } from '../../services/codingBankApi';

// ─────────────────────────────────────────
// Constants
// ─────────────────────────────────────────
const DIFF_STYLES = {
  Easy: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Medium: 'bg-amber-50  text-amber-700 border border-amber-200',
  Hard: 'bg-rose-50   text-rose-700 border border-rose-200',
  EASY: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  MEDIUM: 'bg-amber-50  text-amber-700 border border-amber-200',
  HARD: 'bg-rose-50   text-rose-700 border border-rose-200',
  easy: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  medium: 'bg-amber-50  text-amber-700 border border-amber-200',
  hard: 'bg-rose-50   text-rose-700 border border-rose-200',
};

// ─────────────────────────────────────────
// Toast
// ─────────────────────────────────────────
function Toast({ toast }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.96 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-4 py-3.5 rounded-xl shadow-lg border ${toast.type === 'success'
            ? 'bg-white border-emerald-200 text-slate-800'
            : toast.type === 'error'
              ? 'bg-white border-rose-200 text-slate-800'
              : 'bg-white border-slate-200 text-slate-800'
            }`}
        >
          <div className={`w-7 h-7 flex items-center justify-center rounded-full shrink-0 ${toast.type === 'success' ? 'bg-emerald-100 text-emerald-600'
            : toast.type === 'error' ? 'bg-rose-100 text-rose-600'
              : 'bg-slate-100 text-slate-500'
            }`}>
            {toast.type === 'success' ? <Check className="w-3.5 h-3.5" />
              : toast.type === 'error' ? <X className="w-3.5 h-3.5" />
                : <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          </div>
          <span className="text-sm font-semibold">{toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────
// StatCard
// ─────────────────────────────────────────
function StatCard({ label, value, accent }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] px-5 py-4 flex flex-col gap-1.5 hover:border-[#333333]/20 transition-colors">
      <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">{label}</span>
      <span className={`text-2xl font-bold tracking-tight ${accent}`}>{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────
// FilterSelect
// ─────────────────────────────────────────
function FilterSelect({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="text-xs font-semibold text-[#333333] border border-[#E5E7EB] rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#333333]/20 focus:border-[#333333] transition-all cursor-pointer hover:border-[#333333]/40"
    >
      {children}
    </select>
  );
}

// ─────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────
export default function AdminCodingBank() {
  const navigate = useNavigate();
  const location = useLocation();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [diffFilter, setDiffFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [recommendedLevelFilter, setRecommendedLevelFilter] = useState('');

  // Pagination & Stats
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ easy: 0, medium: 0, hard: 0 });
  const PAGE_SIZE = 15;

  // Show toast from add/edit page redirect
  useEffect(() => {
    if (!location.state?.toast) return;

    const nextToast = location.state.toast;
    const timer = setTimeout(() => setToast(nextToast), 0);
    window.history.replaceState({}, document.title);

    return () => clearTimeout(timer);
  }, [location.state]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Fetch list
  const fetchProblems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, pageSize: PAGE_SIZE };
      if (diffFilter) params.difficulty = diffFilter;
      if (statusFilter) params.status = statusFilter;
      if (recommendedLevelFilter) params.recommendedLevel = recommendedLevelFilter;
      if (searchQuery) params.search = searchQuery;
      const res = await adminCodingBankApi.getAll(params);
      setProblems(res.items || []);
      setTotalItems(res.totalItems || 0);
      setTotalPages(res.totalPages || 1);
      if (res.extraData) {
        setStats({
          easy: res.extraData.easyCount || 0,
          medium: res.extraData.mediumCount || 0,
          hard: res.extraData.hardCount || 0
        });
      }
    } catch {
      setToast({ type: 'error', message: 'Không thể tải danh sách bài coding.' });
    } finally {
      setLoading(false);
    }
  }, [page, diffFilter, statusFilter, recommendedLevelFilter, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => fetchProblems(), 0);
    return () => clearTimeout(timer);
  }, [fetchProblems]);

  const handleDelete = async (id, title) => {
    if (!window.confirm('Xóa bài "' + title + '"?')) return;
    try {
      await adminCodingBankApi.delete(id);
      setToast({ type: 'success', message: 'Đã xóa bài coding.' });
      fetchProblems();
    } catch {
      setToast({ type: 'error', message: 'Xóa thất bại.' });
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      if (item.status === 'Published') {
        await adminCodingBankApi.unpublish(item.id);
        setToast({ type: 'success', message: 'Đã chuyển "' + item.title + '" về Draft.' });
      } else {
        await adminCodingBankApi.publish(item.id);
        setToast({ type: 'success', message: 'Đã publish "' + item.title + '".' });
      }
      fetchProblems();
    } catch {
      setToast({ type: 'error', message: 'Cập nhật trạng thái thất bại.' });
    }
  };

  const easyCount = stats.easy;
  const mediumCount = stats.medium;
  const hardCount = stats.hard;

  const hasActiveFilters = diffFilter || statusFilter || recommendedLevelFilter || searchQuery;

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="max-w-[1400px] relative text-[#333333]">
      <Toast toast={toast} />

      {/* ── Header ── */}
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between border-b border-[#E5E7EB] pb-6">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#333333]">Coding Bank</h1>
          <p className="mt-2 text-[15px] font-semibold text-[#96939a]">Quản lý bài tập lập trình của hệ thống</p>
        </div>
        <button
          onClick={() => navigate('/admin/coding-bank/add')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#333333] hover:bg-[#B4F290] text-[#111827] text-xs font-semibold rounded-lg transition-all shadow-sm shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Thêm bài Coding
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Tổng bài" value={totalItems} accent="text-[#333333]" />
        <StatCard label="Easy" value={easyCount} accent="text-emerald-600" />
        <StatCard label="Medium" value={mediumCount} accent="text-amber-600" />
        <StatCard label="Hard" value={hardCount} accent="text-rose-600" />
      </div>

      {/* ── Toolbar: Search + Filters ── */}
      <div className="mb-6 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-[2] min-w-[200px]">
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-[#8d8a91]">Tìm kiếm</label>
            <input type="text" placeholder="Tiêu đề, danh mục..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} className="h-9 w-full rounded-lg border border-[#e8e8e8] bg-[#fafafa] px-3 text-[13px] font-semibold text-[#333333] outline-none transition-all placeholder:text-[#b6b3b8] focus:border-[#333333] focus:bg-white focus:ring-2 focus:ring-[#333333]/10" />
          </div>
          <div className="flex-1 min-w-[130px]">
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-[#8d8a91]">Độ khó</label>
            <select value={diffFilter} onChange={(e) => { setDiffFilter(e.target.value); setPage(1); }} className="h-9 w-full rounded-lg border border-[#e8e8e8] bg-[#fafafa] px-3 text-[13px] font-bold text-[#333333] outline-none transition-all focus:border-[#333333] focus:bg-white focus:ring-2 focus:ring-[#333333]/10">
              <option value="">Tất cả độ khó</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div className="flex-1 min-w-[130px]">
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-[#8d8a91]">Cấp độ</label>
            <select value={recommendedLevelFilter} onChange={(e) => { setRecommendedLevelFilter(e.target.value); setPage(1); }} className="h-9 w-full rounded-lg border border-[#e8e8e8] bg-[#fafafa] px-3 text-[13px] font-bold text-[#333333] outline-none transition-all focus:border-[#333333] focus:bg-white focus:ring-2 focus:ring-[#333333]/10">
              <option value="">Tất cả cấp độ</option>
              <option value="Fresher">Fresher</option>
              <option value="Junior">Junior</option>
              <option value="Middle">Middle</option>
              <option value="Senior">Senior</option>
            </select>
          </div>
          <div className="flex-1 min-w-[130px]">
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-[#8d8a91]">Trạng thái</label>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="h-9 w-full rounded-lg border border-[#e8e8e8] bg-[#fafafa] px-3 text-[13px] font-bold text-[#333333] outline-none transition-all focus:border-[#333333] focus:bg-white focus:ring-2 focus:ring-[#333333]/10">
              <option value="">Tất cả trạng thái</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {hasActiveFilters && (
              <button type="button" onClick={() => { setDiffFilter(''); setRecommendedLevelFilter(''); setStatusFilter(''); setSearchQuery(''); setPage(1); }} className="h-9 rounded-lg border border-[#e8e8e8] bg-white px-3 text-[13px] font-bold text-[#96939a] transition-all hover:border-[#d6d6d6] hover:text-[#333333]">Xóa lọc</button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#eeeeee] bg-white">
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91] w-20">ID</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Tiêu đề</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91] w-28">Độ khó</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Category</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91] w-36">Trạng thái</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91] w-24"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#9CA3AF] mx-auto" />
                    <p className="text-xs text-[#9CA3AF] mt-3 font-medium">Đang tải dữ liệu...</p>
                  </td>
                </tr>
              ) : problems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <div className="w-12 h-12 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-center mx-auto mb-4">
                      <Code2 className="w-5 h-5 text-[#9CA3AF]" />
                    </div>
                    <p className="text-sm font-semibold text-[#333333]">Chưa có bài coding nào</p>
                    <p className="text-xs text-[#9CA3AF] mt-1">Nhấn "Thêm bài Coding" để bắt đầu.</p>
                  </td>
                </tr>
              ) : problems.map(p => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="group border-b border-[#eeeeee] transition-colors last:border-b-0 hover:bg-[#fafafa]"
                >
                  <td className="px-5 py-5 text-[14px] font-extrabold text-[#333333] tabular-nums">
                    #{String(p.id).slice(0, 6)}
                  </td>
                  <td className="px-5 py-5">
                    <div className="text-[14px] font-semibold leading-tight text-[#333333]">{p.title}</div>
                    {p.shortDescription && (
                      <div className="text-xs font-medium text-gray-500 mt-1 line-clamp-1 leading-relaxed">{p.shortDescription}</div>
                    )}
                    {p.recommendedLevel && (
                      <span className="inline-block mt-1 text-[10px] font-extrabold text-gray-500 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 uppercase tracking-wide">
                        {p.recommendedLevel}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-5">
                    <span className={`inline-flex rounded-full px-4 py-1.5 text-[12px] font-extrabold ${DIFF_STYLES[p.difficulty] || 'bg-[#F8F9FA] text-[#6B7280] border border-[#E5E7EB]'}`}>
                      {p.difficulty}
                    </span>
                  </td>
                  <td className="px-5 py-5 text-[14px] font-semibold text-[#333333] max-w-[160px] truncate">
                    {Array.isArray(p.categories) ? p.categories.join(', ') : (p.category || p.categoriesJson)}
                  </td>
                  <td className="px-5 py-5">
                    <button onClick={() => handleToggleStatus(p)} className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-extrabold transition-colors hover:brightness-95 ${p.status === 'Published' ? 'bg-[#c9f0d2] text-[#4b7a55]' : 'bg-[#fff4e5] text-[#e65100]'}`}>
                      {p.status}
                    </button>
                  </td>
                  <td className="px-5 py-5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => navigate('/admin/coding-bank/edit/' + p.id)}
                        className="p-1.5 text-[#9CA3AF] hover:text-[#333333] hover:bg-[#F8F9FA] border border-transparent hover:border-[#E5E7EB] rounded-lg transition-all"
                        title="Chỉnh sửa"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        className="p-1.5 text-[#9CA3AF] hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-all"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#eeeeee] bg-white px-5 py-4 sm:flex-row">
          <p className="text-sm font-medium text-[#6f6a72]">Hiển thị {problems.length} trong số {totalItems.toLocaleString()} kết quả</p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#eeeeee] text-[#c8c5ca] transition-colors hover:bg-[#fafafa] disabled:opacity-45"><ChevronLeft className="h-4 w-4" /></button>
              {getPageNumbers().map((n, i) => 
                n === '...' ? (
                  <span key={`ellipsis-${i}`} className="flex h-9 w-9 items-center justify-center text-[#c8c5ca] text-sm font-extrabold">...</span>
                ) : (
                  <button key={n} onClick={() => setPage(n)} className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-extrabold transition-colors ${page === n ? 'bg-[#333333] text-white shadow-sm' : 'border border-[#eeeeee] text-[#6f6a72] hover:bg-[#fafafa]'}`}>{n}</button>
                )
              )}
              <button disabled={page === totalPages} onClick={() => setPage((current) => current + 1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#eeeeee] text-[#c8c5ca] transition-colors hover:bg-[#fafafa] disabled:opacity-45"><ChevronRight className="h-4 w-4" /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

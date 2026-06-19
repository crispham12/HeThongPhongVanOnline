import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Plus, Search,
  ChevronLeft, ChevronRight, X, Check, Trash2, Loader2,
  Code2, Pencil,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminCodingBankApi } from '../../services/codingBankApi';

// ─────────────────────────────────────────
// Constants
// ─────────────────────────────────────────
const DIFF_STYLES = {
  Easy:   'bg-emerald-100 text-emerald-700',
  Medium: 'bg-amber-100  text-amber-700',
  Hard:   'bg-rose-100   text-rose-700',
  EASY:   'bg-emerald-100 text-emerald-700',
  MEDIUM: 'bg-amber-100  text-amber-700',
  HARD:   'bg-rose-100   text-rose-700',
  easy:   'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100  text-amber-700',
  hard:   'bg-rose-100   text-rose-700',
};

// ─────────────────────────────────────────
// Toast
// ─────────────────────────────────────────
function Toast({ toast }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -24, scale: 0.94 }}
          className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <div className={`p-1.5 rounded-full ${
            toast.type === 'success' ? 'bg-emerald-500 text-white'
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
// Main Page
// ─────────────────────────────────────────
export default function AdminCodingBank() {
  const navigate = useNavigate();
  const location = useLocation();

  const [problems, setProblems]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [toast, setToast]           = useState(null);

  // Filters
  const [searchQuery, setSearchQuery]                       = useState('');
  const [diffFilter, setDiffFilter]                         = useState('');
  const [statusFilter, setStatusFilter]                     = useState('');
  const [recommendedLevelFilter, setRecommendedLevelFilter] = useState('');

  // Pagination
  const [page, setPage]             = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 15;

  // Show toast from add/edit page redirect
  useEffect(() => {
    if (location.state?.toast) {
      setToast(location.state.toast);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

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
      if (diffFilter)             params.difficulty       = diffFilter;
      if (statusFilter)           params.status           = statusFilter;
      if (recommendedLevelFilter) params.recommendedLevel = recommendedLevelFilter;
      if (searchQuery)            params.search           = searchQuery;
      const res = await adminCodingBankApi.getAll(params);
      setProblems(res.items || []);
      setTotalItems(res.totalItems || 0);
      setTotalPages(res.totalPages || 1);
    } catch {
      setToast({ type: 'error', message: 'Khong the tai danh sach bai coding.' });
    } finally {
      setLoading(false);
    }
  }, [page, diffFilter, statusFilter, recommendedLevelFilter, searchQuery]);

  useEffect(() => { fetchProblems(); }, [fetchProblems]);

  const handleDelete = async (id, title) => {
    if (!window.confirm('Xoa bai "' + title + '"?')) return;
    try {
      await adminCodingBankApi.delete(id);
      setToast({ type: 'success', message: 'Da xoa bai coding.' });
      fetchProblems();
    } catch {
      setToast({ type: 'error', message: 'Xoa that bai.' });
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      if (item.status === 'Published') {
        await adminCodingBankApi.unpublish(item.id);
        setToast({ type: 'success', message: 'Da chuyen "' + item.title + '" ve Draft.' });
      } else {
        await adminCodingBankApi.publish(item.id);
        setToast({ type: 'success', message: 'Da publish "' + item.title + '".' });
      }
      fetchProblems();
    } catch {
      setToast({ type: 'error', message: 'Cap nhat trang thai that bai.' });
    }
  };

  const easyCount   = problems.filter(p => p.difficulty?.toLowerCase() === 'easy').length;
  const mediumCount = problems.filter(p => p.difficulty?.toLowerCase() === 'medium').length;
  const hardCount   = problems.filter(p => p.difficulty?.toLowerCase() === 'hard').length;

  return (
    <div className="max-w-[1400px] mx-auto p-2 relative text-[#0F172A]">
      <Toast toast={toast} />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Coding Bank</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Quan ly bai tap lap trinh cua he thong</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/coding-bank/add')}
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm shadow-blue-200 transition-all"
          >
            <Plus className="w-4 h-4" />
            Them bai Coding
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Tong bai', value: totalItems, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Easy', value: easyCount, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Medium', value: mediumCount, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Hard', value: hardCount, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map(s => (
          <div key={s.label} className={s.bg + ' rounded-2xl px-5 py-4 flex flex-col gap-1'}>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{s.label}</span>
            <span className={'text-2xl font-black ' + s.color}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select value={diffFilter} onChange={e => { setDiffFilter(e.target.value); setPage(1); }}
          className="text-xs font-bold border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200">
          <option value="">Do kho</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <select value={recommendedLevelFilter} onChange={e => { setRecommendedLevelFilter(e.target.value); setPage(1); }}
          className="text-xs font-bold border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200">
          <option value="">Cap do</option>
          <option value="Fresher">Fresher</option>
          <option value="Junior">Junior</option>
          <option value="Middle">Middle</option>
          <option value="Senior">Senior</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="text-xs font-bold border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200">
          <option value="">Status</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
        </select>
        <button onClick={() => { setDiffFilter(''); setRecommendedLevelFilter(''); setStatusFilter(''); setSearchQuery(''); setPage(1); }}
          className="text-xs font-extrabold text-[#2563EB] hover:text-blue-800 transition-colors">
          Clear all
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-50 bg-gray-50/20">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
              placeholder="Tim bai coding theo tieu de, danh muc..."
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:ring-4 focus:ring-blue-100 focus:border-[#2563EB] focus:outline-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-gray-100">
                <th className="py-4 px-6 text-[11px] font-black text-gray-500 uppercase tracking-wider">ID</th>
                <th className="py-4 px-6 text-[11px] font-black text-gray-500 uppercase tracking-wider">TIEU DE</th>
                <th className="py-4 px-6 text-[11px] font-black text-gray-500 uppercase tracking-wider">DO KHO</th>
                <th className="py-4 px-6 text-[11px] font-black text-gray-500 uppercase tracking-wider">CATEGORY</th>
                <th className="py-4 px-6 text-[11px] font-black text-gray-500 uppercase tracking-wider">TRANG THAI</th>
                <th className="py-4 px-6 text-[11px] font-black text-gray-500 uppercase tracking-wider text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="6" className="py-16 text-center">
                  <Loader2 className="w-7 h-7 animate-spin text-blue-400 mx-auto" />
                  <p className="text-xs text-gray-400 mt-3 font-medium">Dang tai du lieu...</p>
                </td></tr>
              ) : problems.length === 0 ? (
                <tr><td colSpan="6" className="py-16 text-center">
                  <Code2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm font-bold text-gray-400">Chua co bai coding nao</p>
                  <p className="text-xs text-gray-400 mt-1">Nhan "Them bai Coding" de bat dau.</p>
                </td></tr>
              ) : problems.map(p => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="hover:bg-blue-50/20 transition-all group">
                  <td className="py-5 px-6 text-sm font-semibold text-gray-400">#{String(p.id).slice(0, 6)}</td>
                  <td className="py-5 px-6">
                    <div className="font-extrabold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">{p.title}</div>
                    {p.shortDescription && <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{p.shortDescription}</div>}
                    {p.recommendedLevel && <div className="text-xs font-semibold text-violet-600 mt-0.5">{p.recommendedLevel}</div>}
                  </td>
                  <td className="py-5 px-6">
                    <span className={'inline-block px-2.5 py-0.5 rounded text-[10px] font-black tracking-wide ' + (DIFF_STYLES[p.difficulty] || 'bg-gray-100 text-gray-600')}>
                      {p.difficulty?.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-xs font-bold text-gray-600 max-w-[160px] truncate">
                    {Array.isArray(p.categories) ? p.categories.join(', ') : (p.category || p.categoriesJson)}
                  </td>
                  <td className="py-5 px-6">
                    <button onClick={() => handleToggleStatus(p)} className="flex items-center gap-1.5 group/status">
                      <span className={'w-2 h-2 rounded-full transition-all ' + (p.status === 'Published' ? 'bg-blue-500' : 'bg-gray-400')} />
                      <span className={'text-xs font-extrabold transition-colors ' + (p.status === 'Published' ? 'text-blue-600 group-hover/status:text-blue-800' : 'text-gray-400 group-hover/status:text-gray-600')}>
                        {p.status}
                      </span>
                    </button>
                  </td>
                  <td className="py-5 px-6 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => navigate('/admin/coding-bank/edit/' + p.id)}
                        className="p-1.5 text-gray-300 hover:text-blue-600 hover:bg-blue-50/60 rounded-lg transition-all">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id, p.title)}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50/60 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/20">
          <p className="text-xs font-semibold text-gray-500">
            Hien thi <span className="font-bold text-gray-800">{problems.length}</span> / <span className="font-bold text-gray-800">{totalItems}</span> bai coding
          </p>
          {totalPages > 1 && (
            <div className="flex gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  className={'w-8 h-8 flex items-center justify-center rounded-lg font-black text-xs transition-colors ' + (page === n ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 border border-gray-200 hover:bg-gray-50')}>
                  {n}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

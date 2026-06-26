import { useState, useEffect } from 'react';
import {
  Download, Users, Ban, Activity, Award, Search, RefreshCw,
  X, Eye, Lock, Unlock, RotateCcw, Shield, Loader2,
  ChevronLeft, ChevronRight, SlidersHorizontal, TrendingUp,
  Calendar, Mail, Hash, ArrowUpRight
} from 'lucide-react';
import { adminUsersApi } from '../../services/adminUsersApi';
import html2pdf from 'html2pdf.js';

// ─── Avatar Indicator ─────────────────────────────────────────────────────────
// Deterministic color from name string for consistent avatar backgrounds
function getAvatarColor(name = '') {
  const colors = [
    'bg-violet-100 text-violet-700',
    'bg-sky-100 text-sky-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-indigo-100 text-indigo-700',
    'bg-teal-100 text-teal-700',
    'bg-orange-100 text-orange-700',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function UserAvatar({ name = '', avatarUrl, size = 'md' }) {
  const sz = size === 'lg' ? 'w-12 h-12 text-sm' : 'w-8 h-8 text-[11px]';
  const colorClass = getAvatarColor(name);
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sz} rounded-full object-cover ring-2 ring-white shrink-0`}
      />
    );
  }
  return (
    <div className={`${sz} ${colorClass} rounded-full flex items-center justify-center font-bold shrink-0 ring-2 ring-white`}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  if (status === 'Active') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Hoạt động
      </span>
    );
  }
  if (status === 'Locked') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-600 border border-red-100">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        Bị khóa
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
      Không hoạt động
    </span>
  );
}

// ─── Plan Badge ───────────────────────────────────────────────────────────────
function PlanBadge({ plan }) {
  if (plan === 'Premium') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide bg-amber-50 text-amber-700 border border-amber-200 uppercase">
        ★ Premium
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide bg-gray-100 text-gray-500 border border-gray-200 uppercase">
      Free
    </span>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ title, value, subtext, highlight = false }) {
  if (highlight) {
    return (
      <div className="min-h-[116px] bg-[#333333] rounded-2xl p-6 border border-[#303030] text-white shadow-sm flex flex-col justify-between transition-all hover:shadow-md cursor-default">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-white/65">{title}</p>
          <h3 className="mt-3 text-[22px] font-medium leading-none tabular-nums text-white">
            {value}
          </h3>
          {subtext && <p className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white/60">{subtext}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm min-h-[116px] flex flex-col justify-between transition-all hover:shadow-md cursor-default">
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#66767b]">{title}</p>
        <h3 className="mt-3 text-[18px] font-medium leading-none text-[#151515] tabular-nums">{value}</h3>
      </div>
      {subtext && (
        <div className="mt-4 text-[13px] font-medium text-[#66767b]">
          {subtext}
        </div>
      )}
    </div>
  );
}

// ─── Modal primitives ─────────────────────────────────────────────────────────
function ModalOverlay({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, icon: Icon, iconColor = 'text-gray-700', onClose }) {
  return (
    <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
        {Icon && <Icon className={`w-4 h-4 ${iconColor}`} />}
        {title}
      </h3>
      <button
        onClick={onClose}
        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function ModalActions({ onCancel, submitLabel, submitting, variant = 'primary' }) {
  const btnClass = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-300'
    : 'bg-[#333333] hover:bg-black text-white disabled:bg-gray-300';
  return (
    <div className="flex gap-2 pt-4">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
      >
        Hủy
      </button>
      <button
        type="submit"
        disabled={submitting}
        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${btnClass}`}
      >
        {submitting ? 'Đang xử lý...' : submitLabel}
      </button>
    </div>
  );
}

function InputField({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all bg-white placeholder-gray-400';

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ filtered }) {
  return (
    <tr>
      <td colSpan="6">
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">
            {filtered ? 'Không tìm thấy người dùng' : 'Chưa có người dùng'}
          </p>
          <p className="text-xs text-gray-400 max-w-xs">
            {filtered
              ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để xem kết quả khác.'
              : 'Người dùng đăng ký sẽ xuất hiện ở đây.'}
          </p>
        </div>
      </td>
    </tr>
  );
}

// ─── Drawer Section Title ─────────────────────────────────────────────────────
function DrawerSection({ title, children }) {
  return (
    <div className="space-y-3">
      <h4 className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.12em]">{title}</h4>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminUsers() {
  const [overview, setOverview] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    activeUsers: 0,
    lockedUsers: 0,
  });
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [plan, setPlan] = useState('Tất cả');
  const [status, setStatus] = useState('Tất cả');
  const [showFilters, setShowFilters] = useState(false);

  // Modals & UI
  const [showLockModal, setShowLockModal] = useState(false);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [lockReason, setLockReason] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [detailUser, setDetailUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── Data fetching ──
  const fetchOverview = async () => {
    try {
      const data = await adminUsersApi.getUserOverview();
      setOverview(data);
    } catch (err) {
      console.error('Lỗi khi tải overview người dùng:', err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        search: search || undefined,
        plan: plan !== 'Tất cả' ? plan : undefined,
        status: status !== 'Tất cả' ? status : undefined,
        page,
        pageSize,
      };
      const data = await adminUsersApi.getUsers(params);
      setUsers(data.items);
      setTotalItems(data.totalItems);
    } catch (err) {
      console.error('Lỗi khi tải danh sách người dùng:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOverview(); }, []);
  useEffect(() => { fetchUsers(); }, [page, plan, status]);

  const handleRefresh = () => { fetchOverview(); fetchUsers(); };
  const handleSearchSubmit = (e) => { e.preventDefault(); setPage(1); fetchUsers(); };

  // ── Action handlers ──
  const handleLockUser = async (e) => {
    e.preventDefault();
    if (!lockReason.trim()) { alert('Vui lòng nhập lý do khóa.'); return; }
    try {
      await adminUsersApi.lockUser(selectedUserId, lockReason);
      alert('Tài khoản đã bị khóa thành công.');
      setShowLockModal(false);
      setLockReason('');
      handleRefresh();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      alert(`Không thể khóa tài khoản: ${errorMsg}`);
    }
  };

  const handleUnlockUser = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn mở khóa tài khoản này?')) return;
    try {
      await adminUsersApi.unlockUser(userId);
      alert('Mở khóa tài khoản thành công.');
      handleRefresh();
    } catch (err) { alert(`Lỗi khi mở khóa: ${err.message}`); }
  };

  const handleResetLimit = async (userId) => {
    if (!window.confirm('Reset giới hạn sử dụng trong ngày của người dùng này về 0?')) return;
    try {
      await adminUsersApi.resetDailyLimit(userId);
      alert('Đã reset giới hạn sử dụng trong ngày thành công.');
      handleRefresh();
    } catch (err) { alert(`Lỗi khi reset giới hạn: ${err.message}`); }
  };

  const handleViewDetails = async (userId) => {
    setDetailLoading(true);
    setShowDetailDrawer(true);
    try {
      const data = await adminUsersApi.getUserDetail(userId);
      setDetailUser(data);
    } catch (err) {
      console.error(err);
      alert('Không thể tải chi tiết người dùng.');
      setShowDetailDrawer(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // ── PDF Export ──
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const params = {
        search: search || undefined,
        plan: plan !== 'Tất cả' ? plan : undefined,
        status: status !== 'Tất cả' ? status : undefined,
      };
      const reportData = await adminUsersApi.exportUsersPdf(params);
      const printableContainer = document.createElement('div');
      printableContainer.style.width = '800px';
      printableContainer.innerHTML = `
        <div style="font-family:sans-serif;padding:32px;color:#111827;">
          <div style="border-bottom:2px solid #333333;padding-bottom:16px;margin-bottom:24px;">
            <h1 style="font-size:22px;font-weight:900;color:#333333;margin:0;">${reportData.reportTitle}</h1>
            <p style="font-size:11px;color:#6b7280;margin:6px 0 0;">Ngày xuất: ${reportData.generatedAt}</p>
          </div>
          <div style="margin-bottom:24px;">
            <h3 style="font-size:13px;font-weight:800;color:#1f2937;margin:0 0 12px;border-left:3px solid #333333;padding-left:10px;">THỐNG KÊ TỔNG QUAN</h3>
            <table style="width:100%;border-collapse:collapse;font-size:12px;">
              <tr>
                <td style="padding:8px 10px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;">Tổng người dùng</td>
                <td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;color:#333;">${reportData.overview.totalUsers}</td>
                <td style="padding:8px 10px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;">Gói Premium</td>
                <td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;color:#d97706;">${reportData.overview.premiumUsers}</td>
              </tr>
              <tr>
                <td style="padding:8px 10px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;">Đang hoạt động</td>
                <td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;color:#16a34a;">${reportData.overview.activeUsers}</td>
                <td style="padding:8px 10px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;">Bị khóa</td>
                <td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:700;color:#dc2626;">${reportData.overview.lockedUsers}</td>
              </tr>
            </table>
          </div>
          <div>
            <h3 style="font-size:13px;font-weight:800;color:#1f2937;margin:0 0 12px;border-left:3px solid #333333;padding-left:10px;">DANH SÁCH NGƯỜI DÙNG</h3>
            <table style="width:100%;border-collapse:collapse;font-size:11px;">
              <thead>
                <tr style="background:#f3f4f6;">
                  <th style="padding:7px 8px;border:1px solid #e5e7eb;text-align:left;">Mã User</th>
                  <th style="padding:7px 8px;border:1px solid #e5e7eb;text-align:left;">Họ và tên</th>
                  <th style="padding:7px 8px;border:1px solid #e5e7eb;text-align:left;">Email</th>
                  <th style="padding:7px 8px;border:1px solid #e5e7eb;text-align:center;">Gói</th>
                  <th style="padding:7px 8px;border:1px solid #e5e7eb;text-align:center;">Trạng thái</th>
                  <th style="padding:7px 8px;border:1px solid #e5e7eb;text-align:right;">Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.items.map(u => `
                  <tr>
                    <td style="padding:7px 8px;border:1px solid #e5e7eb;font-family:monospace;">${u.userCode}</td>
                    <td style="padding:7px 8px;border:1px solid #e5e7eb;font-weight:600;">${u.fullName}</td>
                    <td style="padding:7px 8px;border:1px solid #e5e7eb;">${u.email}</td>
                    <td style="padding:7px 8px;border:1px solid #e5e7eb;text-align:center;">${u.plan}</td>
                    <td style="padding:7px 8px;border:1px solid #e5e7eb;text-align:center;">${u.status}</td>
                    <td style="padding:7px 8px;border:1px solid #e5e7eb;text-align:right;">${new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
          <div style="margin-top:36px;text-align:center;font-size:10px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:14px;">
            Báo cáo tự động — Nền tảng Phỏng vấn IT Thông minh. Không chứa mật khẩu băm hay token bảo mật.
          </div>
        </div>`;
      const hiddenWrapper = document.createElement('div');
      hiddenWrapper.style.cssText = 'position:absolute;left:-9999px;top:-9999px;';
      hiddenWrapper.appendChild(printableContainer);
      document.body.appendChild(hiddenWrapper);
      await html2pdf().set({
        margin: [10, 10, 10, 10],
        filename: `users-report-${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: false, width: 800 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }).from(printableContainer).save();
      document.body.removeChild(hiddenWrapper);
      alert('Xuất báo cáo PDF thành công!');
    } catch (err) {
      console.error(err);
      alert('Không thể xuất báo cáo PDF. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize);
  const isFiltered = search || plan !== 'Tất cả' || status !== 'Tất cả';

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-[1180px] mx-auto pb-16 space-y-6">

      {/* ── Page Header ── */}
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#333333]">Quản lý Người dùng</h1>
          <p className="mt-2 text-[15px] font-semibold text-[#96939a]">
            Xem danh sách, phân quyền và quản lý trạng thái tài khoản trên toàn hệ thống.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#dfe4e7] text-[#151515] text-xs font-semibold rounded-lg hover:bg-[#f8f8f8] transition-all shadow-sm"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#333333] hover:bg-black text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            {isExporting ? 'Đang xuất...' : 'Xuất báo cáo'}
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Tổng người dùng"
          value={overview.totalUsers.toLocaleString()}
          icon={Users}
          subtext="Tất cả tài khoản hệ thống"
          highlight
        />
        <KpiCard
          title="Gói Premium"
          value={overview.premiumUsers.toLocaleString()}
          icon={Award}
          subtext="Đã kích hoạt Premium"
        />
        <KpiCard
          title="Đang hoạt động"
          value={overview.activeUsers.toLocaleString()}
          icon={Activity}
          subtext="Tài khoản hoạt động bình thường"
        />
        <KpiCard
          title="Bị khóa"
          value={overview.lockedUsers.toLocaleString()}
          icon={Ban}
          subtext="Tài khoản bị hạn chế truy cập"
        />
      </div>

      <form onSubmit={handleSearchSubmit} className="mb-6 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-[2] min-w-[200px]">
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-[#8d8a91]">Tìm kiếm</label>
            <input type="text" placeholder="Tên, email hoặc mã người dùng..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 w-full rounded-lg border border-[#e8e8e8] bg-[#fafafa] px-3 text-[13px] font-semibold text-[#333333] outline-none transition-all placeholder:text-[#b6b3b8] focus:border-[#333333] focus:bg-white focus:ring-2 focus:ring-[#333333]/10" />
          </div>
          <div className="flex-1 min-w-[130px]">
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-[#8d8a91]">Gói (Plan)</label>
            <select value={plan} onChange={(e) => { setPlan(e.target.value); setPage(1); }} className="h-9 w-full rounded-lg border border-[#e8e8e8] bg-[#fafafa] px-3 text-[13px] font-bold text-[#333333] outline-none transition-all focus:border-[#333333] focus:bg-white focus:ring-2 focus:ring-[#333333]/10">
              <option value="Tất cả">Tất cả</option>
              <option value="Premium">Premium</option>
              <option value="Free">Free</option>
            </select>
          </div>
          <div className="flex-1 min-w-[130px]">
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-[#8d8a91]">Trạng thái</label>
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="h-9 w-full rounded-lg border border-[#e8e8e8] bg-[#fafafa] px-3 text-[13px] font-bold text-[#333333] outline-none transition-all focus:border-[#333333] focus:bg-white focus:ring-2 focus:ring-[#333333]/10">
              <option value="Tất cả">Tất cả</option>
              <option value="Active">Active</option>
              <option value="Locked">Locked</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button type="submit" className="h-9 rounded-lg bg-[#333333] px-4 text-[13px] font-extrabold text-white shadow-sm transition-all hover:bg-black active:translate-y-px flex items-center justify-center gap-1.5">
              <Search className="h-3.5 w-3.5" /> Lọc
            </button>
            <button type="button" onClick={() => { setSearch(''); setPlan('Tất cả'); setStatus('Tất cả'); setPage(1); }} className="h-9 rounded-lg border border-[#e8e8e8] bg-white px-3 text-[13px] font-bold text-[#96939a] transition-all hover:border-[#d6d6d6] hover:text-[#333333]">Xóa</button>
          </div>
        </div>
      </form>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#eeeeee] bg-white">
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91] w-28">Mã User</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Người dùng</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Gói</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Trạng thái</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Ngày tạo</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91] text-right w-36">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                      <Loader2 className="w-7 h-7 animate-spin text-gray-400" />
                      <p className="text-sm font-medium text-gray-400">Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <EmptyState filtered={!!isFiltered} />
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="group border-b border-[#eeeeee] transition-colors last:border-b-0 hover:bg-[#fafafa]">
                    {/* Code */}
                    <td className="py-3.5 px-5">
                      <span className="font-mono text-[11px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                        {user.userCode}
                      </span>
                    </td>

                    {/* User info */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={user.fullName} avatarUrl={user.avatarUrl} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user.fullName}</p>
                          <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                            <Mail className="w-3 h-3 shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="py-3.5 px-5">
                      <PlanBadge plan={user.plan} />
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-5">
                      <StatusBadge status={user.status} />
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-5">
                      <span className="text-xs text-gray-500 font-medium">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleViewDetails(user.id)}
                          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {user.status === 'Locked' ? (
                          <button
                            onClick={() => handleUnlockUser(user.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Mở khóa tài khoản"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => { setSelectedUserId(user.id); setShowLockModal(true); }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Khóa tài khoản"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => handleResetLimit(user.id)}
                          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Reset giới hạn ngày"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalItems > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-[#eeeeee] bg-white px-5 py-4 sm:flex-row">
            <p className="text-sm font-medium text-[#6f6a72]">Hiển thị {Math.min((page - 1) * pageSize + 1, totalItems)}-{Math.min(page * pageSize, totalItems)} trong số {totalItems.toLocaleString()} kết quả</p>
            <div className="flex items-center gap-2">
              <button disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#eeeeee] text-[#c8c5ca] transition-colors hover:bg-[#fafafa] disabled:opacity-45"><ChevronLeft className="h-4 w-4" /></button>
              {Array.from({ length: totalPages }, (_, index) => (
                <button key={index + 1} onClick={() => setPage(index + 1)} className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-extrabold transition-colors ${page === index + 1 ? 'bg-[#333333] text-white shadow-sm' : 'border border-[#eeeeee] text-[#6f6a72] hover:bg-[#fafafa]'}`}>{index + 1}</button>
              ))}
              <button disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#eeeeee] text-[#c8c5ca] transition-colors hover:bg-[#fafafa] disabled:opacity-45"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* ── Lock User Modal ── */}
      {showLockModal && (
        <ModalOverlay onClose={() => { setShowLockModal(false); setLockReason(''); }}>
          <ModalHeader
            title="Khóa tài khoản"
            icon={Lock}
            iconColor="text-red-500"
            onClose={() => { setShowLockModal(false); setLockReason(''); }}
          />
          <form onSubmit={handleLockUser} className="p-6 space-y-4">
            <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-xs font-semibold text-red-700 leading-relaxed">
                Người dùng sẽ bị hạn chế truy cập ngay lập tức sau khi xác nhận. Lý do sẽ được lưu lại trong hệ thống.
              </p>
            </div>
            <InputField label="Lý do khóa tài khoản *">
              <textarea
                required
                placeholder="Nhập lý do khóa tài khoản..."
                className={`${inputClass} h-24 resize-none`}
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
              />
            </InputField>
            <ModalActions
              onCancel={() => { setShowLockModal(false); setLockReason(''); }}
              submitLabel="Xác nhận Khóa"
              submitting={submitting}
              variant="danger"
            />
          </form>
        </ModalOverlay>
      )}

      {/* ── User Detail Drawer ── */}
      {showDetailDrawer && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => { setShowDetailDrawer(false); setDetailUser(null); }}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-gray-200 flex flex-col">
            {/* Drawer header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-white" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Chi tiết người dùng</h3>
              </div>
              <button
                onClick={() => { setShowDetailDrawer(false); setDetailUser(null); }}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto">
              {detailLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-24">
                  <Loader2 className="w-7 h-7 animate-spin text-gray-400" />
                  <p className="text-sm font-medium text-gray-400">Đang tải thông tin...</p>
                </div>
              ) : detailUser ? (
                <div className="p-6 space-y-6">
                  {/* Profile Header */}
                  <div className="flex items-center gap-4">
                    <UserAvatar name={detailUser.fullName} avatarUrl={detailUser.avatarUrl} size="lg" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-extrabold text-gray-900 truncate">{detailUser.fullName}</h4>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{detailUser.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-mono text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                          {detailUser.userCode}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded uppercase">
                          {detailUser.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-gray-100" />

                  {/* Daily Usage */}
                  <DrawerSection title="Sử dụng hôm nay">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Phỏng vấn</p>
                        <p className="text-xl font-extrabold text-gray-900 tracking-tight">
                          {detailUser.dailyInterviewUsed}
                          <span className="text-xs font-semibold text-gray-400 ml-1">lượt</span>
                        </p>
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">GitHub Analysis</p>
                        <p className="text-xl font-extrabold text-gray-900 tracking-tight">
                          {detailUser.dailyGithubAnalysisUsed}
                          <span className="text-xs font-semibold text-gray-400 ml-1">lượt</span>
                        </p>
                      </div>
                    </div>
                  </DrawerSection>

                  {/* Subscription History */}
                  <DrawerSection title="Lịch sử đăng ký">
                    {detailUser.subscriptionHistory.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">Chưa có lịch sử đăng ký.</p>
                    ) : (
                      <div className="space-y-2">
                        {detailUser.subscriptionHistory.map((sub, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl">
                            <div>
                              <p className="text-xs font-bold text-gray-800">Gói {sub.plan}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                Bắt đầu: {new Date(sub.startDate).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              {sub.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </DrawerSection>

                  {/* Interview Statistics */}
                  <DrawerSection title="Thống kê luyện tập">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Tổng phiên', value: detailUser.interviewStats.totalSessions },
                        { label: 'Tổng lượt', value: detailUser.interviewStats.totalAttempts },
                        { label: 'Điểm cao nhất', value: `${detailUser.interviewStats.bestScore}/100` },
                        { label: 'Điểm trung bình', value: `${detailUser.interviewStats.averageLatestScore}/100` },
                      ].map(({ label, value }) => (
                        <div key={label} className="border border-gray-100 rounded-xl p-3 text-center bg-gray-50/50">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                          <p className="text-lg font-extrabold text-gray-900 tracking-tight">{value}</p>
                        </div>
                      ))}
                    </div>
                  </DrawerSection>

                  <div className="h-px bg-gray-100" />

                  {/* Account Meta */}
                  <DrawerSection title="Thông tin tài khoản">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400 font-medium">Đăng nhập lần cuối</span>
                        <span className="text-gray-700 font-semibold text-right">
                          {detailUser.lastLoginAt
                            ? new Date(detailUser.lastLoginAt).toLocaleString('vi-VN')
                            : 'Chưa đăng nhập'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400 font-medium">Ngày tạo tài khoản</span>
                        <span className="text-gray-700 font-semibold">
                          {new Date(detailUser.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </DrawerSection>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                  <Users className="w-8 h-8 text-gray-300" />
                  <p className="text-sm font-medium text-gray-400">Không tìm thấy thông tin người dùng.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

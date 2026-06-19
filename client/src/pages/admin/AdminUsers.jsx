import { useState, useEffect } from 'react';
import { Download, Users, UserPlus, Ban, Activity, Award, Search, Filter, RefreshCw, X, Eye, Edit2, Lock, Unlock, RotateCcw, Shield } from 'lucide-react';
import { adminUsersApi } from '../../services/adminUsersApi';
import html2pdf from 'html2pdf.js';

function StatCard({ title, value, icon: Icon, subtext, iconColor, iconBg }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-bold text-gray-500 mb-1">{title}</p>
          <h3 className="text-3xl font-black text-gray-900 leading-none">{value}</h3>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      <div className="text-xs font-bold text-gray-400">
        {subtext}
      </div>
    </div>
  );
}

export default function AdminUsers() {
  // --- States ---
  const [overview, setOverview] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    activeUsers: 0,
    lockedUsers: 0
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

  // Modals & UI controls
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);

  // Form states
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    password: '',
    plan: 'Free',
    role: 'User'
  });

  const [editingUser, setEditingUser] = useState({
    id: 0,
    fullName: '',
    plan: 'Free',
    status: 'Active'
  });

  const [lockReason, setLockReason] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [detailUser, setDetailUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // --- Fetching ---
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
        pageSize
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

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page, plan, status]);

  const handleRefresh = () => {
    fetchOverview();
    fetchUsers();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  // --- Handlers ---
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.fullName || !newUser.email || !newUser.password) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }
    setSubmitting(true);
    try {
      await adminUsersApi.createUser(newUser);
      alert('Tạo người dùng mới thành công!');
      setShowAddModal(false);
      setNewUser({ fullName: '', email: '', password: '', plan: 'Free', role: 'User' });
      handleRefresh();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      alert(`Lỗi khi tạo người dùng: ${errorMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser.fullName) {
      alert('Họ tên không được để trống.');
      return;
    }
    setSubmitting(true);
    try {
      await adminUsersApi.updateUser(editingUser.id, {
        fullName: editingUser.fullName,
        plan: editingUser.plan,
        status: editingUser.status
      });
      alert('Cập nhật thông tin thành công!');
      setShowEditModal(false);
      handleRefresh();
    } catch (err) {
      alert(`Lỗi khi cập nhật: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLockUser = async (e) => {
    e.preventDefault();
    if (!lockReason.trim()) {
      alert('Vui lòng nhập lý do khóa.');
      return;
    }
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
    } catch (err) {
      alert(`Lỗi khi mở khóa: ${err.message}`);
    }
  };

  const handleResetLimit = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn reset giới hạn sử dụng trong ngày của người dùng này về 0?')) return;
    try {
      await adminUsersApi.resetDailyLimit(userId);
      alert('Đã reset giới hạn sử dụng trong ngày thành công.');
      handleRefresh();
    } catch (err) {
      alert(`Lỗi khi reset giới hạn: ${err.message}`);
    }
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

  // Export PDF Report
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const params = {
        search: search || undefined,
        plan: plan !== 'Tất cả' ? plan : undefined,
        status: status !== 'Tất cả' ? status : undefined
      };
      const reportData = await adminUsersApi.exportUsersPdf(params);

      // Create temporary printable layout
      const printableContainer = document.createElement('div');
      printableContainer.className = 'p-8 bg-white font-sans text-gray-800';
      printableContainer.style.width = '800px';

      printableContainer.innerHTML = `
        <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 25px;">
          <h1 style="font-size: 24px; font-weight: 900; color: #1e3a8a; margin: 0;">${reportData.reportTitle}</h1>
          <p style="font-size: 12px; color: #6b7280; margin: 5px 0 0 0;">Ngày xuất: ${reportData.generatedAt}</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: 800; color: #1f2937; margin: 0 0 15px 0; border-left: 4px solid #3b82f6; padding-left: 10px;">THỐNG KÊ TỔNG QUAN</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold;">Tổng số người dùng:</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right; font-weight: bold; color: #2563eb;">${reportData.overview.totalUsers}</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold;">Gói Premium:</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right; font-weight: bold; color: #d97706;">${reportData.overview.premiumUsers}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold;">Đang hoạt động:</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right; color: #16a34a; font-weight: bold;">${reportData.overview.activeUsers}</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold;">Bị khóa:</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right; color: #dc2626; font-weight: bold;">${reportData.overview.lockedUsers}</td>
            </tr>
          </table>
        </div>

        <div>
          <h3 style="font-size: 16px; font-weight: 800; color: #1f2937; margin: 0 0 15px 0; border-left: 4px solid #3b82f6; padding-left: 10px;">DANH SÁCH NGƯỜI DÙNG PHÙ HỢP BỘ LỌC</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Mã User</th>
                <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Họ và tên</th>
                <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Email</th>
                <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">Gói dịch vụ</th>
                <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">Trạng thái</th>
                <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.items.map(u => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; font-family: monospace;">${u.userCode}</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">${u.fullName}</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">${u.email}</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">${u.plan}</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">${u.status}</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">${new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="margin-top: 40px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 15px;">
          Báo cáo tự động được tạo bởi Nền tảng Phỏng vấn IT Thông minh. Không chứa mật khẩu băm hay token bảo mật.
        </div>
      `;

      const hiddenWrapper = document.createElement('div');
      hiddenWrapper.style.position = 'absolute';
      hiddenWrapper.style.left = '-9999px';
      hiddenWrapper.style.top = '-9999px';
      hiddenWrapper.appendChild(printableContainer);
      document.body.appendChild(hiddenWrapper);

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `users-report-${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false,
          width: 800
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(printableContainer).save();

      document.body.removeChild(hiddenWrapper);
      alert('Xuất báo cáo PDF người dùng thành công!');
    } catch (err) {
      console.error(err);
      alert('Không thể xuất báo cáo PDF. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-[1400px] mx-auto pb-10 px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Quản lý Người dùng</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Xem danh sách, phân quyền và quản lý trạng thái tài khoản hệ thống.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Đang xuất...' : 'Xuất báo cáo'}
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
          >
            <UserPlus className="w-4 h-4" />
            Thêm người dùng
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Tổng người dùng" value={overview.totalUsers.toLocaleString()} icon={Users} subtext="Toàn hệ thống" iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatCard title="Gói Premium" value={overview.premiumUsers.toLocaleString()} icon={Award} subtext="Đã kích hoạt Premium" iconColor="text-amber-500" iconBg="bg-amber-50" />
        <StatCard title="Đang hoạt động" value={overview.activeUsers.toLocaleString()} icon={Activity} subtext="Tài khoản hoạt động tốt" iconColor="text-green-600" iconBg="bg-green-50" />
        <StatCard title="Tài khoản bị khóa" value={overview.lockedUsers.toLocaleString()} icon={Ban} subtext="Đang bị khóa truy cập" iconColor="text-red-600" iconBg="bg-red-50" />
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filters bar */}
        <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row gap-4 items-center justify-between bg-gray-50/50">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-stretch sm:items-center">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Tìm theo tên, email hoặc mã..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-semibold"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gói:</span>
              <select 
                value={plan}
                onChange={(e) => { setPlan(e.target.value); setPage(1); }}
                className="py-2.5 pl-3 pr-8 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option>Tất cả</option>
                <option>Premium</option>
                <option>Free</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2 justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái:</span>
              <select 
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="py-2.5 pl-3 pr-8 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option>Tất cả</option>
                <option>Active</option>
                <option>Locked</option>
                <option>Inactive</option>
              </select>
            </div>

            <button 
              type="submit"
              className="px-4 py-2.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors"
            >
              Lọc
            </button>
          </form>
          
          <div className="flex gap-2 self-end lg:self-auto">
            <button 
              onClick={handleRefresh}
              className="p-2.5 text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
              title="Làm mới"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/20 border-b border-gray-100">
                <th className="py-5 px-6 text-xs font-black text-gray-500 uppercase tracking-wider w-24">Mã User</th>
                <th className="py-5 px-6 text-xs font-black text-gray-500 uppercase tracking-wider">Người dùng</th>
                <th className="py-5 px-6 text-xs font-black text-gray-500 uppercase tracking-wider">Gói dịch vụ</th>
                <th className="py-5 px-6 text-xs font-black text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="py-5 px-6 text-xs font-black text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                <th className="py-5 px-6 text-xs font-black text-gray-500 uppercase tracking-wider text-center w-52">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-sm font-semibold text-gray-500">
                    Đang tải danh sách người dùng...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-sm font-semibold text-gray-500">
                    Không tìm thấy người dùng phù hợp.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="py-4 px-6 text-xs font-bold text-gray-500 font-mono">{user.userCode}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-100 shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                            {user.fullName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-gray-900">{user.fullName}</p>
                          <p className="text-xs font-semibold text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {user.plan === 'Premium' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-700 tracking-wider">
                          ☆ PREMIUM
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black bg-gray-100 text-gray-600 tracking-wider">
                          FREE
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold ${
                        user.status === 'Active' 
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : user.status === 'Locked'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}>
                        {user.status === 'Active' ? 'Hoạt động' : user.status === 'Locked' ? 'Bị khóa' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm font-semibold text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleViewDetails(user.id)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setEditingUser({
                              id: user.id,
                              fullName: user.fullName,
                              plan: user.plan,
                              status: user.status
                            });
                            setShowEditModal(true);
                          }}
                          className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {user.status === 'Locked' ? (
                          <button 
                            onClick={() => handleUnlockUser(user.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                            title="Mở khóa"
                          >
                            <Unlock className="w-4 h-4" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => {
                              setSelectedUserId(user.id);
                              setShowLockModal(true);
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Khóa tài khoản"
                          >
                            <Lock className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleResetLimit(user.id)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Reset giới hạn ngày"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {totalItems > 0 && (
          <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/20">
            <p className="text-sm font-medium text-gray-500">
              Hiển thị <span className="font-bold text-gray-900">{Math.min((page - 1) * pageSize + 1, totalItems)} - {Math.min(page * pageSize, totalItems)}</span> trong số <span className="font-bold text-gray-900">{totalItems.toLocaleString()}</span> người dùng
            </p>
            <div className="flex gap-1.5">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 text-gray-400 font-bold"
              >
                {'<'}
              </button>
              {Array.from({ length: Math.ceil(totalItems / pageSize) }).map((_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => setPage(idx + 1)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg font-bold text-sm ${
                    page === idx + 1
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button 
                disabled={page >= Math.ceil(totalItems / pageSize)}
                onClick={() => setPage(p => p + 1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 text-gray-400 font-bold"
              >
                {'>'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- ADD USER MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 animate-scale-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-black text-gray-900">Thêm người dùng mới</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Họ và tên *</label>
                <input 
                  type="text" required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-semibold"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email *</label>
                <input 
                  type="email" required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-semibold"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mật khẩu *</label>
                <input 
                  type="password" required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-semibold"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Gói dịch vụ</label>
                  <select 
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 font-semibold"
                    value={newUser.plan}
                    onChange={(e) => setNewUser({...newUser, plan: e.target.value})}
                  >
                    <option value="Free">Free</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Vai trò</label>
                  <select 
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 font-semibold"
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {submitting ? 'Đang tạo...' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT USER MODAL --- */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 animate-scale-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-black text-gray-900">Chỉnh sửa thông tin</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Họ và tên *</label>
                <input 
                  type="text" required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-semibold"
                  value={editingUser.fullName}
                  onChange={(e) => setEditingUser({...editingUser, fullName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Gói dịch vụ</label>
                <select 
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 font-semibold"
                  value={editingUser.plan}
                  onChange={(e) => setEditingUser({...editingUser, plan: e.target.value})}
                >
                  <option value="Free">Free</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Trạng thái tài khoản</label>
                <select 
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 font-semibold"
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}
                >
                  <option value="Active">Active (Hoạt động)</option>
                  <option value="Locked">Locked (Bị khóa)</option>
                  <option value="Inactive">Inactive (Không hoạt động)</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {submitting ? 'Đang lưu...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- LOCK USER MODAL --- */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 animate-scale-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2"><Ban className="w-5 h-5 text-red-500" /> Khóa tài khoản người dùng</h3>
              <button onClick={() => setShowLockModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleLockUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Lý do khóa tài khoản *</label>
                <textarea 
                  required
                  placeholder="Lý do khóa tài khoản..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-semibold h-24"
                  value={lockReason}
                  onChange={(e) => setLockReason(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowLockModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700"
                >
                  Xác nhận Khóa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- USER DETAIL DRAWER --- */}
      {showDetailDrawer && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-gray-100 flex flex-col animate-slide-left">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Chi tiết người dùng
            </h3>
            <button onClick={() => setShowDetailDrawer(false)} className="text-gray-400 hover:text-gray-600 bg-white p-1 rounded-lg border border-gray-200">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {detailLoading ? (
              <div className="text-center py-20 font-bold text-gray-500">Đang tải chi tiết...</div>
            ) : detailUser ? (
              <>
                {/* Profile Header */}
                <div className="flex items-center gap-4 border-b border-gray-50 pb-6">
                  {detailUser.avatarUrl ? (
                    <img src={detailUser.avatarUrl} alt="" className="w-16 h-16 rounded-2xl object-cover border" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 text-2xl font-black flex items-center justify-center border border-blue-100">
                      {detailUser.fullName.slice(0,2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="text-lg font-black text-gray-900">{detailUser.fullName}</h4>
                    <p className="text-xs font-semibold text-gray-500">Mã: {detailUser.userCode} | Vai trò: {detailUser.role}</p>
                    <p className="text-xs font-semibold text-gray-400 mt-0.5">{detailUser.email}</p>
                  </div>
                </div>

                {/* System Stats / Usage */}
                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Thông số & Giới hạn</h4>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div>
                      <span className="block text-[10px] font-black text-gray-400 uppercase">Phỏng vấn hôm nay</span>
                      <span className="text-base font-black text-gray-900">{detailUser.dailyInterviewUsed} lượt</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-black text-gray-400 uppercase">Phân tích Github ngày</span>
                      <span className="text-base font-black text-gray-900">{detailUser.dailyGithubAnalysisUsed} lượt</span>
                    </div>
                  </div>
                </div>

                {/* Subscriptions */}
                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Lịch sử đăng ký dịch vụ</h4>
                  <div className="space-y-3">
                    {detailUser.subscriptionHistory.map((sub, idx) => (
                      <div key={idx} className="border border-gray-100 rounded-xl p-3.5 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-gray-800">Gói {sub.plan}</p>
                          <p className="text-gray-400 mt-0.5">Bắt đầu: {new Date(sub.startDate).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 font-bold rounded">
                          {sub.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Thống kê luyện tập phỏng vấn</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-gray-100 rounded-xl p-3.5 text-center">
                      <span className="block text-[10px] font-bold text-gray-400 uppercase">Tổng số phiên</span>
                      <span className="text-lg font-black text-gray-900">{detailUser.interviewStats.totalSessions}</span>
                    </div>
                    <div className="border border-gray-100 rounded-xl p-3.5 text-center">
                      <span className="block text-[10px] font-bold text-gray-400 uppercase">Tổng số lượt làm</span>
                      <span className="text-lg font-black text-gray-900">{detailUser.interviewStats.totalAttempts}</span>
                    </div>
                    <div className="border border-gray-100 rounded-xl p-3.5 text-center">
                      <span className="block text-[10px] font-bold text-gray-400 uppercase">Điểm cao nhất</span>
                      <span className="text-lg font-black text-green-600">{detailUser.interviewStats.bestScore}/100</span>
                    </div>
                    <div className="border border-gray-100 rounded-xl p-3.5 text-center">
                      <span className="block text-[10px] font-bold text-gray-400 uppercase">Điểm trung bình</span>
                      <span className="text-lg font-black text-blue-600">{detailUser.interviewStats.averageLatestScore}/100</span>
                    </div>
                  </div>
                </div>

                {/* Account details */}
                <div className="border-t border-gray-100 pt-6 text-xs text-gray-400 font-semibold space-y-2">
                  <div className="flex justify-between">
                    <span>Đăng nhập lần cuối:</span>
                    <span className="text-gray-600">{detailUser.lastLoginAt ? new Date(detailUser.lastLoginAt).toLocaleString('vi-VN') : 'Chưa đăng nhập'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ngày tạo tài khoản:</span>
                    <span className="text-gray-600">{new Date(detailUser.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-gray-400 font-semibold">Không tìm thấy thông tin.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

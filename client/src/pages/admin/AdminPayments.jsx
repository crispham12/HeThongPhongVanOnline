import { useState, useEffect } from 'react';
import { 
  Download, TrendingUp, RefreshCw, AlertCircle, MoreVertical, 
  CheckCircle2, XCircle, Clock, Loader2, ToggleLeft, ToggleRight, Edit3, Plus, Shield, Eye
} from 'lucide-react';
import { adminPaymentsApi } from '../../services/adminPaymentsApi';

function StatusIcon({ status }) {
  if (status === 'Success' || status === 'Thành công') return <CheckCircle2 className="w-3.5 h-3.5" />;
  if (status === 'Failed' || status === 'Thất bại') return <XCircle className="w-3.5 h-3.5" />;
  return <Clock className="w-3.5 h-3.5" />;
}

function StatCard({ title, value, trend, trendUp, sub }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between min-h-[116px] transition-all hover:shadow-md">
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#66767b]">{title}</p>
        <h3 className="mt-3 text-[18px] font-medium leading-none text-[#151515] tabular-nums">{value}</h3>
        {sub && <p className="text-xs text-gray-500 font-medium mt-1">{sub}</p>}
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1.5 text-[13px]">
          <span className={`inline-flex items-center gap-1 font-medium tabular-nums ${trendUp ? 'text-[#6f8066]' : 'text-[#c20f16]'}`}>
            {trendUp ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7" /><path d="M12 19V5" /></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m19 12-7 7-7-7" /><path d="M12 5v14" /></svg>
            )}
            {trend}
          </span>
          <span className="text-[#66767b]">so với tháng trước</span>
        </div>
      )}
    </div>
  );
}

export default function AdminPayments() {
  const [overview, setOverview] = useState({
    totalRevenue: 0,
    successfulTransactions: 0,
    pendingTransactions: 0,
    failedTransactions: 0,
    totalCreditsSold: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [txFilter, setTxFilter] = useState('');
  const [searchUserId, setSearchUserId] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Edit / Create Package States
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [packageName, setPackageName] = useState('');
  const [packagePrice, setPackagePrice] = useState('');
  const [packageCredits, setPackageCredits] = useState('');

  // View Transaction Detail Modal
  const [selectedTx, setSelectedTx] = useState(null);

  const fetchOverviewAndPackages = async () => {
    try {
      const stats = await adminPaymentsApi.getOverview();
      setOverview(stats);

      const pkgs = await adminPaymentsApi.getPackages();
      setPackages(pkgs);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu tổng quan:", err);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        pageSize: 10,
        status: txFilter || undefined,
        userId: searchUserId ? parseInt(searchUserId) : undefined
      };
      const res = await adminPaymentsApi.getTransactions(params);
      setTransactions(res.items);
      setTotalPages(res.totalPages);
      setTotalItems(res.totalItems);
    } catch (err) {
      console.error("Lỗi khi tải lịch sử giao dịch:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewAndPackages();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [txFilter, page, searchUserId]);

  const handleToggleActive = async (id) => {
    try {
      await adminPaymentsApi.togglePackageActive(id);
      fetchOverviewAndPackages();
    } catch (err) {
      console.error("Lỗi khi thay đổi trạng thái gói:", err);
    }
  };

  const handleOpenEdit = (pkg) => {
    setEditingPackage(pkg);
    setPackageName(pkg.name);
    setPackagePrice(pkg.price.toString());
    setPackageCredits(pkg.credits.toString());
    setShowPackageModal(true);
  };

  const handleOpenCreate = () => {
    setEditingPackage(null);
    setPackageName('');
    setPackagePrice('');
    setPackageCredits('');
    setShowPackageModal(true);
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    const pkgData = {
      name: packageName,
      price: parseFloat(packagePrice),
      credits: parseInt(packageCredits),
      isActive: editingPackage ? editingPackage.isActive : true
    };

    try {
      if (editingPackage) {
        await adminPaymentsApi.updatePackage(editingPackage.id, pkgData);
      } else {
        await adminPaymentsApi.createPackage(pkgData);
      }
      setShowPackageModal(false);
      fetchOverviewAndPackages();
    } catch (err) {
      console.error("Lỗi khi lưu gói:", err);
    }
  };

  const handleFilterChange = (filterVal) => {
    setTxFilter(filterVal);
    setPage(1);
  };

  return (
    <div className="animate-fade-in max-w-[1180px] mx-auto pb-10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#333333]">Thanh toán & Gói dịch vụ</h1>
          <p className="mt-2 text-[15px] font-semibold text-[#96939a]">Quản lý doanh thu chuyển khoản SePay, lịch sử giao dịch và cấu hình gói lượt phỏng vấn.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button 
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm gói mới
          </button>
          <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#333333] hover:bg-black text-white text-xs font-semibold rounded-lg transition-all shadow-sm">
            <Download className="w-3.5 h-3.5" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Tổng doanh thu" value={`${overview.totalRevenue.toLocaleString('vi-VN')} VNĐ`} trend="+12.5%" trendUp={true} />
        <StatCard title="Lượt phỏng vấn đã bán" value={overview.totalCreditsSold.toLocaleString('vi-VN')} trend="+8%" trendUp={true} />
        <StatCard title="Giao dịch chờ xử lý" value={overview.pendingTransactions.toLocaleString('vi-VN')} />
        <StatCard title="Giao dịch thất bại" value={overview.failedTransactions.toLocaleString('vi-VN')} />
      </div>

      {/* Pricing Plans */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Cấu hình Gói lượt phỏng vấn</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((p, idx) => {
            // Style mappings matching original color theme: Grey, Blue, Green
            const isFeatured = idx === 1; // 2nd tier is featured (blue border)
            const isYearlyStyle = idx === 2; // 3rd tier gets green style accent
            return (
              <div 
                key={p.id} 
                className={`bg-white rounded-2xl p-6 border flex flex-col relative ${
                  isFeatured 
                    ? 'border-2 border-blue-500 shadow-lg shadow-blue-100' 
                    : 'border-gray-200 shadow-sm'
                }`}
              >
                {isFeatured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-md shadow-blue-200">Phổ biến nhất</span>
                  </div>
                )}
                <div className="mb-6">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    isFeatured ? 'text-blue-600' : isYearlyStyle ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {isYearlyStyle ? 'Tiết kiệm 30%' : isFeatured ? 'Nâng cao' : 'Cơ bản'}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mt-2">{p.name}</h3>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="text-4xl font-black text-gray-900">
                      {p.price.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6 flex-1 flex flex-col justify-center text-center">
                  <span className="text-xs text-gray-500 font-medium">Số lượt phỏng vấn nhận được:</span>
                  <span className="text-2xl font-black text-gray-900 mt-1">{p.credits} Lượt</span>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenEdit(p)}
                    className="flex-1 py-2 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-55 transition-colors cursor-pointer"
                  >
                    Chỉnh sửa gói
                  </button>
                  <button 
                    onClick={() => handleToggleActive(p.id)}
                    className={`px-3 py-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                      p.isActive 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100' 
                        : 'bg-gray-105 border-gray-250 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    {p.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#eeeeee] p-5 gap-4">
          <h3 className="text-[15px] font-extrabold text-[#333333]">Giao dịch gần đây</h3>
          <div className="flex flex-wrap items-center gap-3">
            {/* Search by User ID */}
            <input 
              type="text" 
              placeholder="Tìm theo User ID..." 
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 text-xs text-gray-700 focus:outline-none focus:border-purple-500 w-36 font-semibold"
            />
            {/* Filter buttons */}
            <div className="flex rounded-lg bg-[#fafafa] p-1 border border-[#e8e8e8]">
              {[
                { value: '', label: 'Tất cả' },
                { value: 'Success', label: 'Thành công' },
                { value: 'Pending', label: 'Chờ xử lý' },
                { value: 'Failed', label: 'Thất bại' }
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleFilterChange(opt.value)}
                  className={`px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide rounded-md transition-all cursor-pointer ${
                    txFilter === opt.value 
                      ? 'bg-[#333333] text-white shadow-sm' 
                      : 'text-[#8d8a91] hover:text-[#333333]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto relative min-h-[250px]">
          {loading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
              <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
          )}

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#eeeeee] bg-white">
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Mã Giao Dịch</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Nội Dung</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Người Dùng</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Gói</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Số Tiền</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Trạng Thế</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Ngày Tạo</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91] text-right">Chi Tiết</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-5 py-10 text-center text-gray-500 font-medium">
                    Không tìm thấy giao dịch nào.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="group border-b border-[#eeeeee] transition-colors last:border-b-0 hover:bg-[#fafafa]">
                    <td className="px-5 py-5 font-mono text-[14px] font-extrabold text-[#333333] tabular-nums">
                      {tx.sePayTransactionId || "N/A"}
                    </td>
                    <td className="px-5 py-5 text-[13px] font-medium text-gray-700">
                      <span className="font-mono text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50 mr-1">{tx.paymentCode}</span>
                      {tx.transferContent || "Chưa chuyển khoản"}
                    </td>
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold bg-blue-100 text-blue-700 shrink-0">
                          {tx.userName ? tx.userName.substring(0, Math.Min(2, tx.userName.length)).toUpperCase() : "US"}
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold leading-tight text-[#333333]">{tx.userName}</p>
                          <p className="text-xs font-medium text-gray-500 mt-1">{tx.userEmail} (ID: {tx.userId})</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-5">
                      <span className="text-[13px] font-extrabold text-blue-600">{tx.packageName}</span>
                      <p className="text-[10px] text-gray-400 font-semibold mt-0.5">+{tx.credits} lượt</p>
                    </td>
                    <td className="px-5 py-5 text-[14px] font-extrabold text-[#333333] tabular-nums">{tx.amount.toLocaleString('vi-VN')} đ</td>
                    <td className="px-5 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-extrabold uppercase ${
                        tx.status === 'Success' 
                          ? 'text-green-700 bg-green-100 border border-green-200' 
                          : tx.status === 'Failed' 
                            ? 'text-red-700 bg-red-100 border border-red-200'
                            : tx.status === 'Expired' 
                              ? 'text-gray-600 bg-gray-100'
                              : 'text-amber-700 bg-amber-100 border border-amber-200'
                      }`}>
                        <StatusIcon status={tx.status} />
                        {tx.status === 'Success' ? 'Thành công' : tx.status === 'Pending' ? 'Chờ xử lý' : tx.status === 'Failed' ? 'Thất bại' : 'Hết hạn'}
                      </span>
                    </td>
                    <td className="px-5 py-5">
                      <p className="text-[14px] font-semibold text-[#333333]">{new Date(tx.createdAt).toLocaleDateString('vi-VN')}</p>
                      <p className="text-xs font-medium text-gray-500 mt-1">
                        {new Date(tx.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </td>
                    <td className="px-5 py-5 text-right">
                      <button 
                        onClick={() => setSelectedTx(tx)}
                        className="p-2 text-[#9CA3AF] hover:text-[#333333] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-[#eeeeee] bg-white px-5 py-4 sm:flex-row">
            <p className="text-sm font-medium text-[#6f6a72]">
              Hiển thị {((page - 1) * 10) + 1}-{Math.min(page * 10, totalItems)} trong số {totalItems.toLocaleString('vi-VN')} kết quả
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#eeeeee] text-[#c8c5ca] transition-colors hover:bg-[#fafafa] disabled:opacity-50 cursor-pointer"
              >
                {'<'}
              </button>
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setPage(index + 1)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-extrabold transition-colors cursor-pointer ${
                    page === index + 1 ? 'bg-[#333333] text-white shadow-sm' : 'border border-[#eeeeee] text-[#6f6a72] hover:bg-[#fafafa]'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#eeeeee] text-[#c8c5ca] transition-colors hover:bg-[#fafafa] disabled:opacity-50 cursor-pointer"
              >
                {'>'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* 1. Modal: Thêm mới / Cập nhật gói                       */}
      {/* ──────────────────────────────────────────────────────── */}
      {showPackageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingPackage ? 'Cập nhật gói lượt phỏng vấn' : 'Tạo gói lượt phỏng vấn mới'}
            </h3>
            
            <form onSubmit={handleSavePackage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Tên Gói</label>
                <input 
                  type="text" 
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  placeholder="Gói 10 lượt..."
                  required
                  className="w-full bg-gray-55 border border-gray-300 rounded-xl py-2.5 px-4 text-sm text-gray-800 focus:outline-none focus:border-purple-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Giá Tiền (đ)</label>
                  <input 
                    type="number" 
                    value={packagePrice}
                    onChange={(e) => setPackagePrice(e.target.value)}
                    placeholder="35000"
                    required
                    className="w-full bg-gray-55 border border-gray-300 rounded-xl py-2.5 px-4 text-sm text-gray-800 focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Số Lượt</label>
                  <input 
                    type="number" 
                    value={packageCredits}
                    onChange={(e) => setPackageCredits(e.target.value)}
                    placeholder="10"
                    required
                    className="w-full bg-gray-55 border border-gray-300 rounded-xl py-2.5 px-4 text-sm text-gray-800 focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                <button 
                  type="button"
                  onClick={() => setShowPackageModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all border border-gray-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────── */}
      {/* 2. Modal: Chi tiết Giao dịch                            */}
      {/* ──────────────────────────────────────────────────────── */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Mã đơn hàng</span>
                <h3 className="text-lg font-bold text-gray-900 mt-0.5">
                  {selectedTx.paymentCode}
                </h3>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-extrabold uppercase ${
                selectedTx.status === 'Success' 
                  ? 'text-green-700 bg-green-100 border border-green-200' 
                  : selectedTx.status === 'Failed' 
                    ? 'text-red-700 bg-red-100 border border-red-200'
                    : selectedTx.status === 'Expired' 
                      ? 'text-gray-600 bg-gray-100'
                      : 'text-amber-700 bg-amber-100 border border-amber-200'
              }`}>
                <StatusIcon status={selectedTx.status} />
                {selectedTx.status === 'Success' ? 'Thành công' : selectedTx.status === 'Pending' ? 'Chờ xử lý' : selectedTx.status === 'Failed' ? 'Thất bại' : 'Hết hạn'}
              </span>
            </div>

            <div className="bg-gray-50 border border-gray-150 rounded-xl p-5 space-y-3.5 mb-6">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-gray-500">Họ và Tên:</span>
                <span className="font-bold text-gray-800">{selectedTx.userName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-gray-500">Email người mua:</span>
                <span className="font-bold text-gray-800">{selectedTx.userEmail}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-gray-500">Gói lượt tập:</span>
                <span className="font-bold text-purple-600">{selectedTx.packageName} (+{selectedTx.credits} lượt)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-gray-500">Số tiền:</span>
                <span className="font-mono font-bold text-gray-800">{selectedTx.amount.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-gray-500">Cổng thanh toán:</span>
                <span className="font-bold text-gray-800">{selectedTx.paymentMethod}</span>
              </div>

              {/* SePay details if present */}
              {selectedTx.status === 'Success' && (
                <div className="border-t border-gray-200 pt-3.5 mt-2 space-y-3.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-gray-500">Mã GD ngân hàng:</span>
                    <span className="font-mono font-bold text-emerald-600">{selectedTx.sePayTransactionId}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-gray-500">Mã ngân hàng:</span>
                    <span className="font-bold text-gray-800">{selectedTx.bankCode}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-gray-500">Số tài khoản chuyển:</span>
                    <span className="font-mono font-bold text-gray-800">{selectedTx.bankAccountNumber}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-gray-500">Ngày chuyển thành công:</span>
                    <span className="font-bold text-gray-800">
                      {new Date(selectedTx.paidAt).toLocaleDateString('vi-VN')} {new Date(selectedTx.paidAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setSelectedTx(null)}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Đóng cửa sổ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

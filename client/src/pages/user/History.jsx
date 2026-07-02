import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';

const STATUS_MAP = {
  Ready: { label: 'SẴN SÀNG', color: 'text-green-700' },
  AlmostReady: { label: 'GẦN ĐẠT', color: 'text-blue-600' },
  NeedsImprovement: { label: 'CẦN CẢI THIỆN', color: 'text-orange-600' },
  Pending: { label: 'CHƯA ĐÁNH GIÁ', color: 'text-gray-500' },
};

const TYPE_MAP = {
  HR: { label: 'Nhân sự (HR)', color: 'text-gray-800' },
  Technical: { label: 'Kỹ thuật', color: 'text-blue-600' },
  Coding: { label: 'Lập trình', color: 'text-orange-600' },
  GitHub: { label: 'GitHub', color: 'text-gray-800' },
};

export default function History() {
  const navigate = useNavigate();

  // Filter state
  const [search, setSearch] = useState('');
  const [interviewType, setInterviewType] = useState('All');
  const [status, setStatus] = useState('All');
  const [dateRange, setDateRange] = useState('90days');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // Data state
  const [summary, setSummary] = useState(null);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Delete modal state
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        search,
        interviewType,
        status,
        dateRange,
        sort,
        page,
        pageSize: PAGE_SIZE,
      });
      const res = await api.get(`/interviews/history?${params}`);
      setSummary(res.data.summary);
      setItems(res.data.items);
      setPagination(res.data.pagination);
    } catch (err) {
      setError('Không thể tải danh sách phỏng vấn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [search, interviewType, status, dateRange, sort, page]);

  useEffect(() => {
    const timer = setTimeout(fetchHistory, 300); // debounce search
    return () => clearTimeout(timer);
  }, [fetchHistory]);

  const handleArchive = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      await api.delete(`/interviews/history/${deleteItem.sessionId}`);
      setDeleteItem(null);
      fetchHistory();
    } catch (err) {
      alert('Xoá thất bại. Vui lòng thử lại.');
    } finally {
      setDeleting(false);
    }
  };

  const getStatus = (s) => STATUS_MAP[s] || { label: s, color: 'text-gray-600' };
  const getType = (t) => TYPE_MAP[t] || { label: t, color: 'text-gray-800' };

  const formatDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans p-6 text-gray-800">
      <div className="max-w-[1200px] mx-auto space-y-6">

        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Lịch sử phỏng vấn</h1>
            <p className="text-gray-500 mt-1 text-[15px]">Xem lại các buổi phỏng vấn, theo dõi tiến độ và so sánh kết quả của bạn.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/setup')}
              className="px-5 py-2 bg-[#6B705C] text-white border border-transparent rounded-lg text-sm font-semibold hover:bg-[#5a5f4c] transition-colors shadow-sm">
              Phỏng vấn mới
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">TỔNG SỐ PHỎNG VẤN</p>
            <h2 className="text-3xl font-bold text-gray-900">{loading ? '—' : (summary?.totalInterviews ?? 0)}</h2>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">ĐIỂM TRUNG BÌNH</p>
            <h2 className="text-3xl font-bold text-gray-900">
              {loading ? '—' : (summary?.averageScore ?? 0)} <span className="text-lg font-semibold text-gray-500">/ 10</span>
            </h2>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">ĐIỂM CAO NHẤT</p>
            <h2 className="text-3xl font-bold text-gray-900">
              {loading ? '—' : (summary?.highestScore ?? 0)} <span className="text-lg font-semibold text-gray-500">/ 10</span>
            </h2>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">TỶ LỆ SẴN SÀNG</p>
            <h2 className="text-3xl font-bold text-gray-900">{loading ? '—' : `${summary?.interviewReadyPercent ?? 0}%`}</h2>
            <p className="text-[13px] text-gray-500 mt-1">{loading ? '' : `${summary?.readySessions ?? 0} phiên sẵn sàng`}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#f0f4f8] border border-blue-100 rounded-xl p-3 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] bg-white border border-gray-200 rounded-lg px-3 py-2 flex flex-col justify-center">
            <span className="text-[10px] font-bold text-gray-500 uppercase">TÌM KIẾM</span>
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Tìm theo vị trí..."
              className="w-full text-sm outline-none bg-transparent placeholder-gray-400 mt-0.5" />
          </div>
          <div className="w-[180px] bg-white border border-gray-200 rounded-lg px-3 py-2 flex flex-col justify-center">
            <span className="text-[10px] font-bold text-gray-500 uppercase">LOẠI PHỎNG VẤN</span>
            <select value={interviewType} onChange={e => { setInterviewType(e.target.value); setPage(1); }} className="w-full text-sm outline-none bg-transparent font-medium mt-0.5 cursor-pointer">
              <option value="All">Tất cả</option>
              <option value="HR">Nhân sự (HR)</option>
              <option value="Technical">Kỹ thuật</option>
              <option value="Coding">Lập trình</option>
            </select>
          </div>
          <div className="w-[150px] bg-white border border-gray-200 rounded-lg px-3 py-2 flex flex-col justify-center">
            <span className="text-[10px] font-bold text-gray-500 uppercase">TRẠNG THÁI</span>
            <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="w-full text-sm outline-none bg-transparent font-medium mt-0.5 cursor-pointer">
              <option value="All">Tất cả</option>
              <option value="Ready">Sẵn sàng</option>
              <option value="AlmostReady">Gần đạt</option>
              <option value="NeedsImprovement">Cần cải thiện</option>
              <option value="Pending">Chưa đánh giá</option>
            </select>
          </div>
          <div className="w-[180px] bg-white border border-gray-200 rounded-lg px-3 py-2 flex flex-col justify-center">
            <span className="text-[10px] font-bold text-gray-500 uppercase">THỜI GIAN</span>
            <select value={dateRange} onChange={e => { setDateRange(e.target.value); setPage(1); }} className="w-full text-sm outline-none bg-transparent font-medium mt-0.5 cursor-pointer">
              <option value="all">Tất cả</option>
              <option value="7days">7 ngày qua</option>
              <option value="30days">30 ngày qua</option>
              <option value="90days">90 ngày qua</option>
            </select>
          </div>
          <div className="w-[150px] bg-white border border-gray-200 rounded-lg px-3 py-2 flex flex-col justify-center">
            <span className="text-[10px] font-bold text-gray-500 uppercase">SẮP XẾP</span>
            <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} className="w-full text-sm outline-none bg-transparent font-medium mt-0.5 cursor-pointer">
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="highestScore">Điểm cao nhất</option>
              <option value="lowestScore">Điểm thấp nhất</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm animate-pulse">
            Đang tải dữ liệu...
          </div>
        )}

        {/* Table */}
        {!loading && !error && items.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fafafa] border-b border-gray-200">
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">LOẠI PHỎNG VẤN</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">VỊ TRÍ</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">CẤP ĐỘ</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">ĐIỂM SỐ</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">TRẠNG THÁI</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">CÂU HỎI</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">THỜI LƯỢNG</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">NGÀY PHỎNG VẤN</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-wider">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((row) => {
                  const typeInfo = getType(row.interviewType);
                  const statusInfo = getStatus(row.status);
                  return (
                    <tr key={row.sessionId} className="hover:bg-gray-50 transition-colors">
                      <td className={`px-6 py-4 text-[14px] font-bold ${typeInfo.color}`}>{typeInfo.label}</td>
                      <td className="px-6 py-4 text-[14px] font-bold text-gray-800">{row.role}</td>
                      <td className="px-6 py-4 text-[14px] text-gray-600">{row.level}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {row.hasResult ? (
                          <>
                            <span className="text-[14px] font-bold text-gray-900">{row.score}</span>
                            <span className="text-[13px] text-gray-500"> / 10</span>
                          </>
                        ) : (
                          <span className="text-[13px] text-gray-400">Chưa chấm</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[12px] font-bold uppercase ${statusInfo.color}`}>{statusInfo.label}</span>
                      </td>
                      <td className="px-6 py-4 text-[14px] text-gray-600">{row.questionsAnswered} / {row.totalQuestions}</td>
                      <td className="px-6 py-4 text-[14px] text-gray-600">{row.durationMinutes > 0 ? `${row.durationMinutes} phút` : '—'}</td>
                      <td className="px-6 py-4 text-[14px] text-gray-600">{formatDate(row.interviewDate)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-[13px] text-gray-500 whitespace-nowrap">
                          <button onClick={() => navigate(`/history/${row.sessionId}`)} className="font-medium hover:text-gray-900 transition-colors">Xem</button>
                          <span>·</span>
                          <button onClick={() => navigate(`/history/compare?a=${row.sessionId}`)} className="font-medium hover:text-gray-900 transition-colors">So sánh</button>
                          <span>·</span>
                          <button onClick={() => setDeleteItem(row)} className="font-medium hover:text-blue-600 text-gray-400 transition-colors">Xoá</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && items.length === 0 && (
          <div className="border border-dashed border-gray-300 rounded-2xl p-8 bg-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 text-green-700 flex items-center justify-center font-bold text-xl border border-green-100">Ø</div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Chưa có lịch sử phỏng vấn</h3>
                <p className="text-gray-500 text-sm mt-1">Hãy hoàn thành một buổi phỏng vấn để hệ thống theo dõi tiến độ của bạn.</p>
              </div>
            </div>
            <button onClick={() => navigate('/setup')} className="px-6 py-2.5 bg-[#6B705C] text-white rounded-xl text-sm font-semibold hover:bg-[#5a5f4c] transition-colors shadow-sm">
              Bắt đầu phỏng vấn
            </button>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors">
              ‹ Trước
            </button>
            <span className="text-sm text-gray-600">Trang {page} / {pagination.totalPages}</span>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors">
              Tiếp ›
            </button>
          </div>
        )}

        {/* Delete/Archive Modal */}
        {deleteItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-[480px] p-6 shadow-xl border border-gray-100">
              <h2 className="text-[20px] font-bold text-gray-900">Xoá lịch sử phỏng vấn?</h2>
              <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">
                Hành động này sẽ đưa lịch sử phỏng vấn vào lưu trữ. Bạn có thể khôi phục lại sau từ mục đã lưu trữ.
              </p>

              <div className="bg-[#fcfcfd] border border-gray-200 rounded-xl p-4 mt-5">
                <p className="text-[12px] font-bold text-gray-900">Phiên đã chọn</p>
                <p className="text-[13px] text-gray-600 mt-1">
                  {getType(deleteItem.interviewType).label} · {deleteItem.role} · {deleteItem.hasResult ? `${deleteItem.score} / 10` : 'Chưa chấm'} · {formatDate(deleteItem.interviewDate)}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5 mt-6">
                <button
                  onClick={() => setDeleteItem(null)}
                  disabled={deleting}
                  className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50">
                  Huỷ
                </button>
                <button
                  onClick={handleArchive}
                  disabled={deleting}
                  className="px-5 py-2 bg-blue-600 border border-transparent rounded-lg text-[13px] font-bold text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50">
                  {deleting ? 'Đang xoá...' : 'Xoá'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

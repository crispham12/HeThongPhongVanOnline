import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../lib/axios';

export default function HistoryCompare() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // IDs of selected interviews
  const [selectedA, setSelectedA] = useState(searchParams.get('a') || '');
  const [selectedB, setSelectedB] = useState(searchParams.get('b') || '');

  // History list for selection dropdowns
  const [historyList, setHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Compare result
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user's history for selection dropdowns
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/interviews/history?pageSize=100&sort=newest');
        const validItems = (res.data.items || []).filter(item => item.hasResult && item.score > 0);
        setHistoryList(validItems);
      } catch {
        // Non-critical, user can still type IDs
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleCompare = useCallback(async () => {
    if (!selectedA || !selectedB) {
      setError('Vui lòng chọn cả hai phiên phỏng vấn để so sánh.');
      return;
    }
    if (selectedA === selectedB) {
      setError('Không thể so sánh một phiên với chính nó.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.post('/interviews/history/compare', {
        interviewAId: selectedA,
        interviewBId: selectedB,
      });
      setResult(res.data);
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;
      if (status === 400) setError(detail || 'Yêu cầu không hợp lệ.');
      else if (status === 403) setError('Bạn không có quyền so sánh phiên phỏng vấn này.');
      else if (status === 404) setError('Một trong hai phiên phỏng vấn không tồn tại.');
      else if (status === 409) setError('Một trong hai phiên phỏng vấn chưa được chấm điểm.');
      else setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [selectedA, selectedB]);

  // Auto-compare when both are selected
  useEffect(() => {
    if (selectedA && selectedB && selectedA !== selectedB) {
      handleCompare();
    }
  }, [selectedA, selectedB]); // eslint-disable-line

  const getTrendLabel = (trend, diff) => {
    if (trend === 'up') return { label: `+${diff}`, color: 'text-green-600' };
    if (trend === 'down') return { label: `${diff}`, color: 'text-red-500' };
    if (trend === 'same') return { label: '=', color: 'text-gray-500' };
    return { label: '—', color: 'text-gray-400' };
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getInterviewLabel = (item) => {
    if (!item) return '';
    return `${item.interviewType === 'HR' ? 'Nhân sự (HR)' : item.interviewType} · ${item.role} · ${formatDate(item.interviewDate)}`;
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans p-6 text-gray-800 pb-16">
      <div className="max-w-[1100px] mx-auto space-y-5">

        {/* Breadcrumbs & Header */}
        <div>
          <div className="text-[13px] font-medium text-gray-500 flex items-center gap-2 mb-2">
            <button onClick={() => navigate('/history')} className="hover:text-gray-900 transition-colors">Lịch sử phỏng vấn</button>
            <span>›</span>
            <span className="text-gray-900">So sánh phỏng vấn</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">So sánh phỏng vấn</h1>
          <p className="text-[13px] text-gray-500 mt-1">So sánh hai phiên phỏng vấn cùng loại để hiểu rõ sự tiến bộ, khoảng trống và trọng tâm thực hành tiếp theo.</p>
        </div>

        {/* Selection Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">PHIÊN PHỎNG VẤN A</p>
            <select
              value={selectedA}
              onChange={(e) => setSelectedA(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="">-- Chọn phiên A --</option>
              {historyList.map(item => (
                <option key={`a-${item.sessionId}`} value={item.sessionId}>{getInterviewLabel(item)}</option>
              ))}
            </select>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">PHIÊN PHỎNG VẤN B</p>
            <select
              value={selectedB}
              onChange={(e) => setSelectedB(e.target.value)}
              disabled={!selectedA}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">-- Chọn phiên B --</option>
              {historyList
                .filter(item => {
                  if (!selectedA) return true;
                  const itemA = historyList.find(x => x.sessionId === selectedA);
                  if (!itemA) return true;
                  return item.interviewType === itemA.interviewType && item.sessionId !== selectedA;
                })
                .map(item => (
                  <option key={`b-${item.sessionId}`} value={item.sessionId}>{getInterviewLabel(item)}</option>
                ))}
            </select>
          </div>
        </div>

        {/* Compare Button */}
        {(!selectedA || !selectedB) && (
          <div className="text-center">
            <button
              onClick={handleCompare}
              disabled={loading || !selectedA || !selectedB}
              className="px-8 py-3 bg-[#6B705C] text-white rounded-xl text-sm font-semibold hover:bg-[#5a5f4c] transition-colors shadow-sm disabled:opacity-40">
              So sánh ngay
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm animate-pulse">
            Đang so sánh...
          </div>
        )}

        {/* Results */}
        {result && (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-[14px] font-bold text-gray-900 mb-2">Điểm tổng quát</h3>
                <div className="flex items-center gap-4 text-[13px] font-bold text-gray-800">
                  <span>A {result.interviewA.overallScore} / 10</span>
                  <span>B {result.interviewB.overallScore} / 10</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full mt-3 overflow-hidden relative">
                  <div className="absolute top-0 left-0 h-full bg-[#8c9f7a] rounded-full" style={{ width: `${result.interviewA.overallScore * 10}%` }}></div>
                  <div className="absolute top-0 left-0 h-full bg-[#5a6b4c] rounded-full" style={{ width: `${result.interviewB.overallScore * 10}%` }}></div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-[14px] font-bold text-gray-900 mb-1">Chênh lệch điểm</h3>
                <h2 className={`text-[32px] font-bold leading-none my-1 ${result.overallDifference > 0 ? 'text-[#5a6b4c]' : result.overallDifference < 0 ? 'text-red-500' : 'text-gray-700'}`}>
                  {result.overallDifference > 0 ? `+${result.overallDifference}` : result.overallDifference}
                </h2>
                <p className="text-[12px] text-gray-500 mt-1">
                  {result.betterInterview === 'A' ? 'Phiên A có hiệu suất tốt hơn.' : result.betterInterview === 'B' ? 'Phiên B có hiệu suất tốt hơn.' : 'Hai phiên tương đương nhau.'}
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-[14px] font-bold text-gray-900 mb-1">Trọng tâm thực hành</h3>
                <h2 className="text-[24px] font-bold text-[#a66249] leading-none my-2">{result.practiceFocus}</h2>
                <p className="text-[12px] text-gray-500 mt-1">Khoảng trống lớn nhất cần cải thiện.</p>
              </div>
            </div>

            {/* Metrics Table */}
            {result.metrics?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#fafafa] border-b border-gray-200">
                      <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-[30%]">TIÊU CHÍ</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-[23%] text-center">PHIÊN A</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-[23%] text-center">PHIÊN B</th>
                      <th className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider w-[24%] text-center">XU HƯỚNG</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {result.metrics.map((m, idx) => {
                      const trend = getTrendLabel(m.trend, m.difference);
                      return (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3 text-[13px] font-medium text-gray-800">{m.name}</td>
                          <td className="px-5 py-3 text-center">
                            {m.interviewAScore != null ? (
                              <><span className="text-[13px] font-bold text-gray-900">{m.interviewAScore}</span><span className="text-[12px] text-gray-500"> / 10</span></>
                            ) : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-5 py-3 text-center">
                            {m.interviewBScore != null ? (
                              <><span className="text-[13px] font-bold text-gray-900">{m.interviewBScore}</span><span className="text-[12px] text-gray-500"> / 10</span></>
                            ) : <span className="text-gray-400">—</span>}
                          </td>
                          <td className={`px-5 py-3 text-center text-[13px] font-bold ${trend.color}`}>{trend.label}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-[14px] font-bold text-gray-900 mb-3">Điểm mạnh</h3>
                <ul className="space-y-2">
                  {result.strengthsComparison?.map((item, idx) => (
                    <li key={idx} className="text-[13px] text-gray-600">{item}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-[14px] font-bold text-gray-900 mb-3">Điểm yếu</h3>
                <ul className="space-y-2">
                  {result.weaknessesComparison?.map((item, idx) => (
                    <li key={idx} className="text-[13px] text-gray-600">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

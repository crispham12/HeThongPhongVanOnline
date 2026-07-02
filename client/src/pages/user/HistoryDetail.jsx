import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../lib/axios';

export default function HistoryDetail() {
  const navigate = useNavigate();
  const { id: sessionId } = useParams();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      setErrorStatus(null);
      try {
        const res = await api.get(`/interviews/${sessionId}/detail`);
        setDetail(res.data);
      } catch (err) {
        const status = err.response?.status;
        setErrorStatus(status);
        if (status === 404) setError('Không tìm thấy phiên phỏng vấn này.');
        else if (status === 403) setError('Bạn không có quyền xem phiên phỏng vấn này.');
        else if (status === 409) setError('Phiên phỏng vấn này chưa được chấm điểm.');
        else if (status === 410) setError('Phiên phỏng vấn này đã bị lưu trữ. Hãy khôi phục trước khi xem.');
        else setError('Đã xảy ra lỗi. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    if (sessionId) fetchDetail();
  }, [sessionId]);

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusColor = (s) => {
    if (s === 'Ready') return 'text-green-700';
    if (s === 'AlmostReady') return 'text-blue-600';
    if (s === 'NeedsImprovement') return 'text-orange-600';
    return 'text-gray-500';
  };

  const getStatusLabel = (s) => {
    if (s === 'Ready') return 'SẴN SÀNG';
    if (s === 'AlmostReady') return 'GẦN ĐẠT';
    if (s === 'NeedsImprovement') return 'CẦN CẢI THIỆN';
    return s;
  };

  const getTrendColor = (t) => {
    if (t === 'up') return 'text-green-600';
    if (t === 'down') return 'text-red-500';
    return 'text-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans p-6 flex items-center justify-center text-gray-400 text-sm animate-pulse">
        Đang tải dữ liệu phỏng vấn...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white font-sans p-6">
        <div className="max-w-[1100px] mx-auto">
          <button onClick={() => navigate('/history')} className="text-sm text-gray-500 hover:text-gray-800 mb-4 flex items-center gap-1">
            ‹ Lịch sử phỏng vấn
          </button>
          <div className={`rounded-xl border px-6 py-8 text-center ${errorStatus === 410 ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            <p className="text-lg font-bold mb-2">{errorStatus === 410 ? 'Phiên đã bị lưu trữ' : 'Không thể tải dữ liệu'}</p>
            <p className="text-sm">{error}</p>
            {errorStatus === 410 && (
              <button onClick={() => navigate('/history')} className="mt-4 px-5 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 transition-colors">
                Về lịch sử
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!detail) return null;

  const { summary, overall, scoreBreakdown, strengths, improvements, starAnalysis, questionEvaluations, aiSummary, recommendedPractices } = detail;
  const scorePercent = (overall?.overallScore / 10) * 100;

  return (
    <div className="min-h-screen bg-white font-sans p-6 text-gray-800 pb-16">
      <div className="max-w-[1100px] mx-auto space-y-5">

        {/* Breadcrumbs & Header */}
        <div>
          <div className="text-[13px] font-medium text-gray-500 flex items-center gap-2 mb-2">
            <button onClick={() => navigate('/history')} className="hover:text-gray-900 transition-colors">Lịch sử phỏng vấn</button>
            <span>›</span>
            <span className="text-gray-900">Chi tiết phỏng vấn</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{summary?.role} · {summary?.interviewType === 'HR' ? 'Nhân sự (HR)' : summary?.interviewType}</h1>
          <p className="text-sm text-gray-500 mt-1">Đánh giá chi tiết về điểm số, phản hồi từng câu hỏi, điểm mạnh, điểm cần cải thiện và lộ trình học tập.</p>
        </div>

        {/* Top Two Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Interview Summary */}
          <div className="border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-4">Tóm tắt phỏng vấn</h2>
            <div className="grid grid-cols-3 gap-y-4 gap-x-4">
              <div><p className="text-[12px] font-bold text-gray-800">Loại</p><p className="text-[13px] text-gray-600 mt-0.5">{summary?.interviewType === 'HR' ? 'Nhân sự (HR)' : summary?.interviewType}</p></div>
              <div><p className="text-[12px] font-bold text-gray-800">Vị trí</p><p className="text-[13px] text-gray-600 mt-0.5">{summary?.role}</p></div>
              <div><p className="text-[12px] font-bold text-gray-800">Cấp độ</p><p className="text-[13px] text-gray-600 mt-0.5">{summary?.level}</p></div>
              <div><p className="text-[12px] font-bold text-gray-800">Ngày phỏng vấn</p><p className="text-[13px] text-gray-600 mt-0.5">{formatDate(summary?.interviewDate)}</p></div>
              <div><p className="text-[12px] font-bold text-gray-800">Thời lượng</p><p className="text-[13px] text-gray-600 mt-0.5">{summary?.durationMinutes > 0 ? `${summary.durationMinutes} phút` : '—'}</p></div>
              <div><p className="text-[12px] font-bold text-gray-800">Số câu hỏi</p><p className="text-[13px] text-gray-600 mt-0.5">{summary?.questionsAnswered} / {summary?.totalQuestions}</p></div>
            </div>
          </div>

          {/* Overall Score */}
          <div className="border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <p className="text-[13px] text-gray-700 leading-relaxed">
              Tóm tắt: {aiSummary?.overallObservation || overall?.summary || '—'}
            </p>
            <div className="mt-4">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-[32px] font-bold text-gray-900 leading-none">
                    {overall?.overallScore} <span className="text-xl text-gray-500">/ 10</span>
                  </h2>
                  <p className="text-[12px] font-bold text-gray-500 mt-1">Điểm tổng quát</p>
                </div>
                <div className="text-right">
                  <p className={`text-[12px] font-bold ${getStatusColor(overall?.overallStatus)}`}>{getStatusLabel(overall?.overallStatus)}</p>
                  <p className="text-[12px] text-gray-500 mt-0.5">Sẵn sàng đi làm: {overall?.hiringReadiness}</p>
                </div>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-[#5a6b4c] rounded-full" style={{ width: `${scorePercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Three Columns: Breakdown, Strengths, Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-[14px] font-bold text-gray-900 mb-3">Chi tiết điểm số</h3>
            <ul className="space-y-2">
              {scoreBreakdown && Object.entries(scoreBreakdown).map(([key, val]) => (
                <li key={key} className="text-[13px] text-gray-700 flex justify-between">
                  <span className="capitalize">{key}</span>
                  <span className="font-semibold">{val}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-[14px] font-bold text-gray-900 mb-3">Điểm mạnh</h3>
            <ul className="space-y-2">
              {strengths?.length > 0 ? strengths.map((item, idx) => (
                <li key={idx} className="text-[13px] text-gray-700">· {item.title}</li>
              )) : <li className="text-[13px] text-gray-400">Chưa có dữ liệu</li>}
            </ul>
          </div>
          <div className="border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-[14px] font-bold text-gray-900 mb-3">Điểm cần cải thiện</h3>
            <ul className="space-y-2">
              {improvements?.length > 0 ? improvements.map((item, idx) => (
                <li key={idx} className="text-[13px] text-gray-700">· {item.title}</li>
              )) : <li className="text-[13px] text-gray-400">Chưa có dữ liệu</li>}
            </ul>
          </div>
        </div>

        {/* STAR Analysis */}
        {starAnalysis && (
          <div className="border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-[14px] font-bold text-gray-900 mb-3">Phân tích STAR</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['situation', 'task', 'action', 'result'].map((key) => {
                const item = starAnalysis[key];
                if (!item) return null;
                return (
                  <div key={key} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-[11px] font-bold text-gray-500 uppercase">{key}</p>
                    <p className="text-[22px] font-bold text-gray-900 mt-1">{item.score} <span className="text-sm text-gray-400">/ 10</span></p>
                    <p className={`text-[11px] font-semibold mt-0.5 ${getTrendColor(item.status === 'Excellent' ? 'up' : item.status === 'Good' ? 'up' : 'down')}`}>{item.status}</p>
                    {item.feedback && <p className="text-[12px] text-gray-500 mt-2 leading-relaxed">{item.feedback}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Question Breakdown */}
        {questionEvaluations?.length > 0 && (
          <div className="border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 bg-[#fafafa] border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-[14px] font-bold text-gray-900">Chi tiết theo câu hỏi</h3>
              <span className="text-[12px] font-bold text-gray-500">{questionEvaluations.length} câu hỏi</span>
            </div>
            <div className="divide-y divide-gray-100">
              {questionEvaluations.map((q, idx) => (
                <div key={q.questionId} className="px-5 py-4 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-[13px] font-bold text-gray-900">Câu {idx + 1}: {q.question}</h4>
                    {q.questionScore > 0 && (
                      <span className="text-[13px] font-bold text-gray-600 ml-4 shrink-0">{q.questionScore} / 10</span>
                    )}
                  </div>
                  {q.questionScore > 0 && (
                    <p className="text-[12px] font-bold text-gray-500">
                      STAR {q.starScore} · Giao tiếp {q.communicationScore} · Tự tin {q.confidenceScore}
                    </p>
                  )}
                  {q.strengths?.length > 0 && (
                    <p className="text-[12px] text-green-700">✓ {q.strengths.join(' · ')}</p>
                  )}
                  {q.suggestions?.length > 0 && (
                    <p className="text-[12px] text-gray-500">💡 {q.suggestions.join(' · ')}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Two Cards: Roadmap & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-[14px] font-bold text-gray-900 mb-3">Lộ trình học tập</h3>
            <ul className="space-y-2">
              {recommendedPractices?.length > 0 ? recommendedPractices.map((item, idx) => (
                <li key={idx} className="text-[13px] text-gray-700">
                  {idx + 1}. {item.title}
                  {item.estimatedTime && <span className="text-gray-400 ml-1">· {item.estimatedTime}</span>}
                </li>
              )) : <li className="text-[13px] text-gray-400">Chưa có lộ trình</li>}
            </ul>
          </div>
          <div className="border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-[14px] font-bold text-gray-900 mb-3">Hành động tiếp theo</h3>
            <div className="flex flex-wrap items-center gap-2 text-[13px] font-bold text-[#5a6b4c]">
              <button onClick={() => navigate(`/history/compare?a=${sessionId}`)} className="hover:underline">So sánh phỏng vấn</button>
              <span className="text-gray-300">·</span>
              <button onClick={() => navigate('/history')} className="hover:underline">Về Lịch sử</button>
              <span className="text-gray-300">·</span>
              <button onClick={() => navigate('/setup')} className="hover:underline">Phỏng vấn mới</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

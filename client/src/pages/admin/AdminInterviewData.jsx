import { useState, useEffect } from 'react';
import { Download, ClipboardList, Users, Code2, LayoutGrid, Star, Filter, X, Eye, ArrowLeft, Calendar, Award, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { interviewDataApi } from '../../services/interviewDataApi';
import html2pdf from 'html2pdf.js';

function StatCard({ title, value, icon: Icon, trend, trendUp, iconColor, iconBg, highlight, sub }) {
  if (highlight) {
    return (
      <div className="bg-blue-600 rounded-2xl p-6 border border-blue-500 shadow-sm shadow-blue-200 flex flex-col justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500 mb-4">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-blue-100 mb-1">{title}</p>
          <h3 className="text-3xl font-black text-white leading-none">{value}<span className="text-lg font-bold text-blue-200">/100</span></h3>
          {sub && <p className="text-[10px] font-bold text-blue-200 mt-2 uppercase tracking-widest">{sub}</p>}
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      <div>
        <p className="text-sm font-bold text-gray-700 mb-1">{title}</p>
        <h3 className="text-2xl font-black text-gray-900">{value}</h3>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold mt-2 ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trendUp ? (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
            ) : (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m19 12-7 7-7-7"/><path d="M12 5v14"/></svg>
            )}
            {trend}
          </div>
        )}
        {!trend && <div className="h-1 w-12 bg-blue-600 rounded-full mt-3"></div>}
      </div>
    </div>
  );
}

const formatDate = (dateString) => {
  if (!dateString) return '--/--/--';
  const date = new Date(dateString);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
};

export default function AdminInterviewData() {
  // Filter States
  const [role, setRole] = useState('');
  const [skillType, setSkillType] = useState('');
  const [scoreMin, setScoreMin] = useState('');
  const [scoreMax, setScoreMax] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');

  // Table & Overview States
  const [overview, setOverview] = useState({
    totalSessions: 0,
    hrCount: 0,
    technicalCount: 0,
    comprehensiveCount: 0,
    averageScore: 0,
    totalAttempts: 0,
    uniqueUsers: 0
  });

  const [sessions, setSessions] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Detail Modal / Panel States
  const [selectedSession, setSelectedSession] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [attemptQuestions, setAttemptQuestions] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch Overview Data
  const fetchOverview = async () => {
    try {
      const data = await interviewDataApi.getOverview();
      setOverview(data);
    } catch (error) {
      console.error("Lỗi khi tải overview:", error);
    }
  };

  // Fetch Sessions
  const fetchSessions = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        pageSize,
        role: role || undefined,
        skillType: skillType || undefined,
        scoreMin: scoreMin ? parseFloat(scoreMin) : undefined,
        scoreMax: scoreMax ? parseFloat(scoreMax) : undefined,
        date: date || undefined,
        status: status || undefined
      };
      const data = await interviewDataApi.getSessions(params);
      setSessions(data.items);
      setTotalItems(data.totalItems);
    } catch (error) {
      console.error("Lỗi khi tải danh sách phiên:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [page, role, skillType, status]);

  // Handle Filter Button
  const handleApplyFilter = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSessions();
  };

  // Handle Clear Filter
  const handleClearFilters = () => {
    setRole('');
    setSkillType('');
    setScoreMin('');
    setScoreMax('');
    setDate('');
    setStatus('');
    setPage(1);
  };

  // View Details of a Session
  const handleViewSessionDetails = async (session) => {
    setDetailLoading(true);
    try {
      const sessionDetail = await interviewDataApi.getSessionDetail(session.id);
      setSelectedSession(sessionDetail);
      const attemptsData = await interviewDataApi.getAttempts(session.id);
      setAttempts(attemptsData);

      // Select the latest attempt by default if any
      if (attemptsData && attemptsData.length > 0) {
        const latest = attemptsData[attemptsData.length - 1];
        handleSelectAttempt(latest.id);
      } else {
        setSelectedAttempt(null);
        setAttemptQuestions([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết phiên:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  // Select an attempt to view its questions
  const handleSelectAttempt = async (attemptId) => {
    try {
      const attemptDetail = await interviewDataApi.getAttemptDetail(attemptId);
      setSelectedAttempt(attemptDetail);
      const questionsData = await interviewDataApi.getAttemptQuestions(attemptId);
      setAttemptQuestions(questionsData);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết lần làm:", error);
    }
  };

  // Export PDF Report
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const reportData = await interviewDataApi.getReportData();

      // Create temporary printable layout
      const printableContainer = document.createElement('div');
      printableContainer.className = 'p-8 bg-white font-sans text-gray-800';
      printableContainer.style.width = '800px';

      printableContainer.innerHTML = `
        <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 25px;">
          <h1 style="font-size: 24px; font-weight: 900; color: #1e3a8a; margin: 0;">${reportData.reportTitle}</h1>
          <p style="font-size: 12px; color: #6b7280; margin: 5px 0 0 0;">Ngày xuất: ${formatDate(reportData.generatedAt)}</p>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: 800; color: #1f2937; margin: 0 0 15px 0; border-left: 4px solid #3b82f6; padding-left: 10px;">THỐNG KÊ TỔNG QUAN</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold;">Tổng số phiên:</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right; font-weight: bold; color: #2563eb;">${reportData.overview.totalSessions}</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold;">Điểm trung bình:</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right; font-weight: bold; color: #16a34a;">${reportData.overview.averageScore.toFixed(1)}/100</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold;">Phiên HR:</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right;">${reportData.overview.hrCount}</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold;">Phiên Kỹ thuật:</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right;">${reportData.overview.technicalCount}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold;">Tổng số lượt làm:</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right;">${reportData.overview.totalAttempts}</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold;">Số ứng viên duy nhất:</td>
              <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right;">${reportData.overview.uniqueUsers}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="font-size: 16px; font-weight: 800; color: #1f2937; margin: 0 0 15px 0; border-left: 4px solid #3b82f6; padding-left: 10px;">TOP ỨNG VIÊN ĐẠT ĐIỂM CAO NHẤT</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Ứng viên</th>
                <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Vị trí</th>
                <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">Lượt làm</th>
                <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">Điểm cao nhất</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.topUsers.map(user => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">${user.userName}</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">${user.role}</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">${user.totalAttempts}</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center; font-weight: bold; color: #2563eb;">${user.bestScore}/100</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div>
          <h3 style="font-size: 16px; font-weight: 800; color: #1f2937; margin: 0 0 15px 0; border-left: 4px solid #3b82f6; padding-left: 10px;">NHẬT KÝ PHIÊN LUYỆN TẬP GẦN ĐÂY</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Ứng viên</th>
                <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Vị trí</th>
                <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">Loại</th>
                <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">Số lượt</th>
                <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">Mới nhất</th>
                <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">Cao nhất</th>
                <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">Cập nhật</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.sessions.map(s => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">${s.userName}</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">${s.role}</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center; font-weight: bold;">${s.skillType}</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">${s.attemptCount}</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center; font-weight: bold;">${s.latestScore}</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center; font-weight: bold; color: #16a34a;">${s.bestScore}</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">${formatDate(s.updatedAt)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="margin-top: 40px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 15px;">
          Báo cáo tự động được tạo bởi Hệ Thống Quản Lý Phỏng Vấn AI. Không chứa thông tin nhạy cảm.
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
        filename: `bao-cao-du-lieu-phong-van-${new Date().toISOString().slice(0, 10)}.pdf`,
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
      alert("Xuất báo cáo PDF thành công!");
    } catch (err) {
      console.error(err);
      alert("Không thể xuất báo cáo PDF. Vui lòng thử lại.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-[1400px] mx-auto pb-10 px-4">
      {/* Detail Screen view */}
      {selectedSession ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <button
            onClick={() => setSelectedSession(null)}
            className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Session Summary Panel */}
            <div className="lg:col-span-1 border-r border-gray-100 pr-0 lg:pr-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 font-black text-xl flex items-center justify-center">
                  {selectedSession.userName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">{selectedSession.userName}</h2>
                  <p className="text-sm font-semibold text-gray-500">{selectedSession.role}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                  <span className="text-sm text-gray-500 font-medium">Kỹ năng đánh giá</span>
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-black tracking-wide bg-blue-100 text-blue-700">
                    {selectedSession.skillType}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                  <span className="text-sm text-gray-500 font-medium">Tổng số lần làm</span>
                  <span className="text-sm font-bold text-gray-900">{selectedSession.attemptCount} lần</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                  <span className="text-sm text-gray-500 font-medium">Điểm số mới nhất</span>
                  <span className="text-sm font-bold text-gray-900">{selectedSession.latestScore}/100</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                  <span className="text-sm text-gray-500 font-medium">Điểm số cao nhất</span>
                  <span className="text-sm font-black text-green-600">{selectedSession.bestScore}/100</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                  <span className="text-sm text-gray-500 font-medium">Thời gian cập nhật</span>
                  <span className="text-sm font-bold text-gray-900">{formatDate(selectedSession.updatedAt)}</span>
                </div>
              </div>

              <h3 className="text-sm font-black text-gray-500 uppercase tracking-wider mb-4">Lịch sử các lần làm</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {attempts.map((att) => (
                  <button
                    key={att.id}
                    onClick={() => handleSelectAttempt(att.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                      selectedAttempt?.id === att.id
                        ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                        : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 font-bold flex items-center justify-center text-xs">
                        #{att.attemptNumber}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-500">Lượt phỏng vấn</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(att.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-blue-600">{att.score}/100</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Questions detail list */}
            <div className="lg:col-span-2">
              {selectedAttempt ? (
                <div>
                  <div className="border-b border-gray-100 pb-4 mb-6">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-lg font-black text-gray-900">Chi tiết lượt làm #{selectedAttempt.attemptNumber}</h3>
                        <p className="text-xs text-gray-400 mt-1">
                          Thời lượng: {Math.floor(selectedAttempt.durationSeconds / 60)} phút | Bắt đầu: {formatDate(selectedAttempt.startedAt)}
                        </p>
                      </div>
                      <div className="bg-blue-50 text-blue-600 rounded-xl px-4 py-2 text-center">
                        <span className="block text-[10px] font-black tracking-wider text-blue-400 uppercase">Điểm số</span>
                        <span className="text-lg font-black">{selectedAttempt.score}/100</span>
                      </div>
                    </div>
                    {selectedAttempt.summary && (
                      <div className="bg-gray-50 rounded-xl p-4 mt-4 border border-gray-100 text-sm text-gray-700 italic">
                        <strong>Tóm tắt đánh giá:</strong> {selectedAttempt.summary}
                      </div>
                    )}
                  </div>

                  <h4 className="text-sm font-black text-gray-500 uppercase tracking-wider mb-4">Danh sách câu hỏi & câu trả lời</h4>
                  <div className="space-y-4">
                    {attemptQuestions.map((q, idx) => (
                      <div key={q.id} className="border border-gray-100 rounded-xl p-5 hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start gap-4 mb-3">
                          <span className="text-xs font-bold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md">
                            Câu {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-blue-600">
                            Điểm: {q.score}/10
                          </span>
                        </div>
                        <h5 className="font-bold text-gray-900 text-sm mb-3">{q.question}</h5>

                        <div className="bg-blue-50/20 border border-blue-50/50 rounded-lg p-3 text-xs text-gray-700 mb-3">
                          <strong className="block text-blue-800 font-bold mb-1">Trả lời:</strong>
                          {q.userAnswer || <span className="italic text-gray-400">Không có câu trả lời</span>}
                        </div>

                        {q.aiFeedback && (
                          <div className="bg-green-50/20 border border-green-50/50 rounded-lg p-3 text-xs text-gray-700">
                            <strong className="block text-green-800 font-bold mb-1">AI nhận xét & Gợi ý:</strong>
                            {q.aiFeedback}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-2xl">
                  <ClipboardList className="w-10 h-10 text-gray-300 mb-2" />
                  <p className="text-sm font-bold text-gray-400">Chọn một lượt làm để xem chi tiết câu hỏi</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900">Quản lý dữ liệu phỏng vấn</h1>
              <p className="text-sm text-gray-500 mt-2 font-medium">Phân tích và theo dõi chất lượng ứng viên qua các đợt đánh giá AI.</p>
            </div>
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 disabled:bg-blue-300"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Đang xuất PDF...' : 'Xuất báo cáo (PDF)'}
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
            <StatCard title="Tổng phiên" value={overview.totalSessions} icon={ClipboardList} iconColor="text-blue-600" iconBg="bg-blue-50" />
            <StatCard title="HR" value={overview.hrCount} icon={Users} iconColor="text-purple-600" iconBg="bg-purple-50" />
            <StatCard title="Kỹ thuật" value={overview.technicalCount} icon={Code2} iconColor="text-blue-600" iconBg="bg-blue-50" />
            <StatCard title="Toàn diện" value={overview.comprehensiveCount} icon={LayoutGrid} iconColor="text-green-600" iconBg="bg-green-50" />
            <StatCard title="Điểm trung bình" value={overview.averageScore.toFixed(1)} icon={Star} highlight={true} sub="TOP 15% ỨNG VIÊN" />
          </div>

          {/* Filter Box */}
          <form onSubmit={handleApplyFilter} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
            <div className="flex flex-wrap gap-5 items-end">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 tracking-wide">Vị trí (Role)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Frontend Dev"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 w-48"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 tracking-wide">Loại phỏng vấn</label>
                <select
                  value={skillType}
                  onChange={(e) => setSkillType(e.target.value)}
                  className="py-2.5 pl-3 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 appearance-none cursor-pointer w-48"
                >
                  <option value="">Tất cả loại</option>
                  <option value="HR">HR</option>
                  <option value="TECHNICAL">Technical</option>
                  <option value="CODING">Coding</option>
                  <option value="COMPREHENSIVE">Comprehensive</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 tracking-wide">Khoảng điểm</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number" placeholder="Min"
                    value={scoreMin} onChange={(e) => setScoreMin(e.target.value)}
                    className="w-20 py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                  <span className="text-gray-400 font-bold">-</span>
                  <input
                    type="number" placeholder="Max"
                    value={scoreMax} onChange={(e) => setScoreMax(e.target.value)}
                    className="w-20 py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 tracking-wide">Ngày</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2 tracking-wide">Trạng thái</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="py-2.5 pl-3 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 appearance-none cursor-pointer w-48"
                >
                  <option value="">Tất cả</option>
                  <option value="Completed">Hoàn thành</option>
                  <option value="InProgress">Đang thực hiện</option>
                </select>
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 border border-blue-200 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-100 transition-colors"
              >
                <Filter className="w-4 h-4" /> Lọc
              </button>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Xóa lọc
              </button>
            </div>
          </form>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="py-5 px-5 text-xs font-black text-gray-500 uppercase tracking-wider w-28">Mã Phiên</th>
                    <th className="py-5 px-5 text-xs font-black text-gray-500 uppercase tracking-wider">Người Dùng</th>
                    <th className="py-5 px-5 text-xs font-black text-gray-500 uppercase tracking-wider">Vai Trò</th>
                    <th className="py-5 px-5 text-xs font-black text-gray-500 uppercase tracking-wider">Loại</th>
                    <th className="py-5 px-5 text-xs font-black text-gray-500 uppercase tracking-wider text-center">Số lượt</th>
                    <th className="py-5 px-5 text-xs font-black text-gray-500 uppercase tracking-wider text-center">Mới nhất</th>
                    <th className="py-5 px-5 text-xs font-black text-gray-500 uppercase tracking-wider text-center">Cao nhất</th>
                    <th className="py-5 px-5 text-xs font-black text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                    <th className="py-5 px-5 text-xs font-black text-gray-500 uppercase tracking-wider text-center w-24">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="py-10 text-center text-sm font-semibold text-gray-500">
                        Đang tải danh sách...
                      </td>
                    </tr>
                  ) : sessions.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-10 text-center text-sm font-semibold text-gray-500">
                        Không tìm thấy phiên luyện tập nào.
                      </td>
                    </tr>
                  ) : (
                    sessions.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-5 px-5">
                          <span
                            onClick={() => handleViewSessionDetails(item)}
                            className="text-sm font-bold text-blue-600 cursor-pointer hover:underline"
                          >
                            #SES-{item.id}
                          </span>
                        </td>
                        <td className="py-5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 bg-blue-100 text-blue-700">
                              {item.userName.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm font-bold text-gray-900">{item.userName}</span>
                          </div>
                        </td>
                        <td className="py-5 px-5 text-sm font-semibold text-gray-700">{item.role}</td>
                        <td className="py-5 px-5">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black tracking-wider bg-indigo-100 text-indigo-700">
                            {item.skillType}
                          </span>
                        </td>
                        <td className="py-5 px-5 text-center text-sm font-bold text-gray-900">{item.attemptCount}</td>
                        <td className="py-5 px-5 text-center text-sm font-bold text-gray-900">{item.latestScore}</td>
                        <td className="py-5 px-5 text-center text-sm font-bold text-green-600">{item.bestScore}</td>
                        <td className="py-5 px-5">
                          <div className={`flex items-center gap-1.5 text-sm font-bold ${item.status === 'Completed' ? 'text-green-600' : 'text-blue-500'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Completed' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></div>
                            {item.status === 'Completed' ? 'Hoàn thành' : 'Đang làm'}
                          </div>
                        </td>
                        <td className="py-5 px-5 text-center">
                          <button
                            onClick={() => handleViewSessionDetails(item)}
                            className="inline-flex items-center justify-center p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalItems > 0 && (
              <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                <p className="text-sm font-medium text-gray-500">
                  Hiển thị <span className="font-bold text-gray-900">{Math.min((page - 1) * pageSize + 1, totalItems)} - {Math.min(page * pageSize, totalItems)}</span> trên <span className="font-bold text-gray-900">{totalItems}</span> kết quả
                </p>
                <div className="flex gap-1.5">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 border border-gray-200 hover:bg-gray-50 font-bold text-sm transition-colors disabled:opacity-50"
                  >
                    {'<'}
                  </button>
                  {Array.from({ length: Math.ceil(totalItems / pageSize) }, (_, idx) => (
                    <button
                      key={idx + 1}
                      onClick={() => setPage(idx + 1)}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg font-bold text-sm transition-colors ${
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
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 border border-gray-200 hover:bg-gray-50 font-bold text-sm transition-colors disabled:opacity-50"
                  >
                    {'>'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

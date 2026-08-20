import { useCallback, useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Code2,
  Download,
  LayoutGrid,
  Loader2,
  Star,
  Users,
  Filter,
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { interviewDataApi } from '../../services/interviewDataApi';
import { motion, AnimatePresence } from 'framer-motion';

const PAGE_SIZE = 10;

const formatDate = (dateString) => {
  if (!dateString) return '--/--/--';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
};

function StatCard({ title, value, highlight = false, sub }) {
  if (highlight) {
    return (
      <div className="min-h-[116px] bg-[#B4F290] rounded-2xl p-6 border border-[#B4F290] text-[#111827] shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#111827]/65">{title}</p>
          <h3 className="mt-3 text-[22px] font-medium leading-none tabular-nums text-[#111827]/70">
            {value}<span className="text-base font-normal text-[#111827]/70">/100</span>
          </h3>
          {sub && <p className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#111827]/60">{sub}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm min-h-[116px] flex flex-col justify-between transition-all hover:shadow-md">
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#66767b]">{title}</p>
        <h3 className="mt-3 text-[18px] font-medium leading-none text-[#151515] tabular-nums">{value}</h3>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const completed = status === 'Completed';
  return (
    <span className={`inline-flex rounded-full px-4 py-1.5 text-[12px] font-extrabold ${completed ? 'bg-[#c9f0d2] text-[#4b7a55]' : 'bg-[#f1e5ed] text-[#7d7280]'}`}>
      {completed ? 'Hoàn thành' : 'Đang làm'}
    </span>
  );
}

export default function AdminInterviewData() {
  const location = useLocation();
  const autoOpenDone = useRef(false);
  const [role, setRole] = useState('');
  const [skillType, setSkillType] = useState('');
  const [scoreMin, setScoreMin] = useState('');
  const [scoreMax, setScoreMax] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');

  const [overview, setOverview] = useState({
    totalSessions: 0,
    hrCount: 0,
    technicalCount: 0,
    comprehensiveCount: 0,
    averageScore: 0,
    totalAttempts: 0,
    uniqueUsers: 0,
  });
  const [sessions, setSessions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [selectedSession, setSelectedSession] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [attemptQuestions, setAttemptQuestions] = useState([]);

  const fetchOverview = useCallback(async () => {
    try {
      const data = await interviewDataApi.getOverview();
      setOverview(data);
    } catch (error) {
      console.error('Failed to load interview overview:', error);
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await interviewDataApi.getSessions({
        page,
        pageSize: PAGE_SIZE,
        role: role || undefined,
        skillType: skillType || undefined,
        scoreMin: scoreMin ? parseFloat(scoreMin) : undefined,
        scoreMax: scoreMax ? parseFloat(scoreMax) : undefined,
        date: date || undefined,
        status: status || undefined,
      });
      setSessions(data.items || []);
      setTotalItems(data.totalItems || 0);
    } catch (error) {
      console.error('Failed to load interview sessions:', error);
    } finally {
      setLoading(false);
    }
  }, [date, page, role, scoreMax, scoreMin, skillType, status]);

  useEffect(() => {
    const timer = setTimeout(() => fetchOverview(), 0);
    return () => clearTimeout(timer);
  }, [fetchOverview]);

  useEffect(() => {
    const timer = setTimeout(() => fetchSessions(), 0);
    return () => clearTimeout(timer);
  }, [fetchSessions]);

  // Auto-open session khi navigate từ AdminDashboard
  useEffect(() => {
    const targetId = location.state?.sessionId;
    if (!targetId || autoOpenDone.current || sessions.length === 0) return;
    const found = sessions.find(s => String(s.id) === String(targetId));
    if (found) {
      autoOpenDone.current = true;
      handleViewSessionDetails(found);
    }
  }, [sessions, location.state]);

  const handleApplyFilter = (event) => {
    event.preventDefault();
    setPage(1);
    fetchSessions();
  };

  const handleClearFilters = () => {
    setRole('');
    setSkillType('');
    setScoreMin('');
    setScoreMax('');
    setDate('');
    setStatus('');
    setPage(1);
  };

  const handleSelectAttempt = async (attemptId) => {
    try {
      const attemptDetail = await interviewDataApi.getAttemptDetail(attemptId);
      const questionsData = await interviewDataApi.getAttemptQuestions(attemptId);
      setSelectedAttempt(attemptDetail);
      setAttemptQuestions(questionsData || []);
    } catch (error) {
      console.error('Failed to load attempt detail:', error);
    }
  };

  const handleViewSessionDetails = async (session) => {
    try {
      const sessionDetail = await interviewDataApi.getSessionDetail(session.id);
      const attemptsData = await interviewDataApi.getAttempts(session.id);
      setSelectedSession(sessionDetail);
      setAttempts(attemptsData || []);

      if (attemptsData?.length) {
        await handleSelectAttempt(attemptsData[attemptsData.length - 1].id);
      } else {
        setSelectedAttempt(null);
        setAttemptQuestions([]);
      }
    } catch (error) {
      console.error('Failed to load session detail:', error);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const reportData = await interviewDataApi.getReportData();
      const printableContainer = document.createElement('div');
      printableContainer.className = 'p-8 bg-white font-sans text-gray-800';
      printableContainer.style.width = '800px';
      printableContainer.innerHTML = `
        <div style="border-bottom:2px solid #333333;padding-bottom:15px;margin-bottom:25px;">
          <h1 style="font-size:24px;font-weight:900;color:#333333;margin:0;">${reportData.reportTitle}</h1>
          <p style="font-size:12px;color:#6b7280;margin:5px 0 0 0;">Ngày xuất: ${formatDate(reportData.generatedAt)}</p>
        </div>
        <h3 style="font-size:16px;font-weight:800;color:#1f2937;margin:0 0 15px 0;">Thống kê tổng quan</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:25px;">
          <tr><td style="padding:10px;border:1px solid #e5e7eb;font-weight:bold;">Tổng số phiên</td><td style="padding:10px;border:1px solid #e5e7eb;text-align:right;">${reportData.overview.totalSessions}</td></tr>
          <tr><td style="padding:10px;border:1px solid #e5e7eb;font-weight:bold;">Điểm trung bình</td><td style="padding:10px;border:1px solid #e5e7eb;text-align:right;">${reportData.overview.averageScore.toFixed(1)}/100</td></tr>
        </table>
        <h3 style="font-size:16px;font-weight:800;color:#1f2937;margin:0 0 15px 0;">Nhật ký phiên gần đây</h3>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead><tr style="background:#f3f4f6;"><th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Ứng viên</th><th style="padding:8px;border:1px solid #e5e7eb;text-align:left;">Vai trò</th><th style="padding:8px;border:1px solid #e5e7eb;text-align:center;">Cao nhất</th></tr></thead>
          <tbody>${(reportData.sessions || []).map(s => `<tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">${s.userName}</td><td style="padding:8px;border:1px solid #e5e7eb;">${s.role}</td><td style="padding:8px;border:1px solid #e5e7eb;text-align:center;font-weight:bold;">${s.bestScore}</td></tr>`).join('')}</tbody>
        </table>
      `;

      const hiddenWrapper = document.createElement('div');
      hiddenWrapper.style.position = 'absolute';
      hiddenWrapper.style.left = '-9999px';
      hiddenWrapper.appendChild(printableContainer);
      document.body.appendChild(hiddenWrapper);

      await html2pdf().set({
        margin: [10, 10, 10, 10],
        filename: `bao-cao-du-lieu-phong-van-${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false, width: 800 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }).from(printableContainer).save();

      document.body.removeChild(hiddenWrapper);
      alert('Xuất báo cáo PDF thành công.');
    } catch (error) {
      console.error(error);
      alert('Không thể xuất báo cáo PDF. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const firstItem = totalItems ? Math.min((page - 1) * PAGE_SIZE + 1, totalItems) : 0;
  const lastItem = Math.min(page * PAGE_SIZE, totalItems);

  if (selectedSession) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-[1180px] pb-10">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <button
            onClick={() => setSelectedSession(null)}
            className="mb-6 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#8d8a91] transition-colors hover:text-[#333333]"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </button>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
            <aside className="border-b border-[#eeeeee] pb-6 lg:border-b-0 lg:border-r lg:pr-8">
              <div className="mb-6">
                <h2 className="text-xl font-extrabold text-[#333333]">{selectedSession.userName}</h2>
                <p className="mt-1 text-sm font-semibold text-[#8d8a91]">{selectedSession.role}</p>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-[#eeeeee] py-3"><span className="font-bold text-[#8d8a91]">Loại</span><span className="font-extrabold text-[#333333]">{selectedSession.skillType}</span></div>
                <div className="flex justify-between border-b border-[#eeeeee] py-3"><span className="font-bold text-[#8d8a91]">Số lượt</span><span className="font-extrabold text-[#333333]">{selectedSession.attemptCount}</span></div>
                <div className="flex justify-between border-b border-[#eeeeee] py-3"><span className="font-bold text-[#8d8a91]">Mới nhất</span><span className="font-extrabold text-[#333333]">{Number(selectedSession.latestScore).toFixed(1)}/100</span></div>
                <div className="flex justify-between border-b border-[#eeeeee] py-3"><span className="font-bold text-[#8d8a91]">Cao nhất</span><span className="font-extrabold text-[#77c486]">{Number(selectedSession.bestScore).toFixed(1)}/100</span></div>
              </div>

              <h3 className="mb-3 mt-7 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Lịch sử lượt làm</h3>
              <div className="space-y-2">
                {attempts.map((attempt) => (
                  <button
                    key={attempt.id}
                    onClick={() => handleSelectAttempt(attempt.id)}
                    className={`w-full rounded-lg border px-4 py-3 text-left transition-all ${selectedAttempt?.id === attempt.id ? 'border-[#333333] bg-[#fafafa]' : 'border-[#e6e6e6] hover:border-[#b8b8b8]'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#333333]">#{attempt.attemptNumber}</span>
                      <span className="text-sm font-bold text-[#333333]">{Number(attempt.score).toFixed(1)}/100</span>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-[#8d8a91]">{formatDate(attempt.createdAt)}</p>
                  </button>
                ))}
              </div>
            </aside>

            <section>
              {selectedAttempt ? (
                <div>
                  <div className="mb-6 border-b border-[#eeeeee] pb-5">
                    <h3 className="text-lg font-extrabold text-[#333333]">Chi tiết lượt làm #{selectedAttempt.attemptNumber}</h3>
                    <p className="mt-1 text-sm font-semibold text-[#8d8a91]">Điểm: {Number(selectedAttempt.score).toFixed(1)}/100</p>
                  </div>
                  <div className="space-y-4">
                    {attemptQuestions.map((question, index) => (
                      <article key={question.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <span className="rounded-md bg-[#f1f1f1] px-2.5 py-1 text-[10px] font-extrabold uppercase text-[#333333]">Câu {index + 1}</span>
                          <span className="text-sm font-extrabold text-[#333333]">{Number(question.score).toFixed(1)}/10</span>
                        </div>
                        <h4 className="text-sm font-extrabold leading-relaxed text-[#333333]">{question.question}</h4>
                        <div className="mt-4 rounded-lg bg-[#fafafa] p-4 text-sm font-medium leading-relaxed text-[#6f6a72]">
                          {question.userAnswer || 'Không có câu trả lời'}
                        </div>
                        {question.aiFeedback && <div className="mt-3 rounded-lg border border-[#e6e6e6] p-4 text-sm font-medium leading-relaxed text-[#6f6a72]">{question.aiFeedback}</div>}
                      </article>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-[#d7d7d7] text-center">
                  <ClipboardList className="mb-3 h-9 w-9 text-[#c9c7cb]" />
                  <p className="text-sm font-extrabold text-[#8d8a91]">Chọn một lượt làm để xem chi tiết</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-[1180px] pb-10 text-[#333333]">
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight">Quản lý dữ liệu phỏng vấn</h1>
          <p className="mt-2 text-[15px] font-semibold text-[#96939a]">Phân tích và theo dõi chất lượng ứng viên qua các đợt đánh giá AI.</p>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#B4F290] text-[#111827] hover:bg-[#B4F290] text-[#111827] text-xs font-semibold rounded-lg transition-all disabled:opacity-50 shadow-sm"
        >
          <Download className="h-3.5 w-3.5" />
          {isExporting ? 'Đang xuất...' : 'Xuất báo cáo'}
        </button>
      </div>

      <div className="mb-7 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_minmax(180px,1fr)]">
        <StatCard title="Tổng phiên" value={overview.totalSessions} icon={ClipboardList} />
        <StatCard title="HR" value={overview.hrCount} icon={Users} />
        <StatCard title="Kỹ thuật" value={overview.technicalCount} icon={Code2} />
        <StatCard title="Toàn diện" value={overview.comprehensiveCount} icon={LayoutGrid} />
        <StatCard title="Điểm trung bình" value={overview.averageScore.toFixed(1)} icon={Star} highlight sub="TOP 15% ỨNG VIÊN" />
      </div>

      <form onSubmit={handleApplyFilter} className="mb-6 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[160px]">
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-[#8d8a91]">Vị trí (Role)</label>
            <input type="text" placeholder="Frontend Dev..." value={role} onChange={(event) => setRole(event.target.value)} className="h-9 w-full rounded-lg border border-[#e8e8e8] bg-[#fafafa] px-3 text-[13px] font-semibold text-[#333333] outline-none transition-all placeholder:text-[#b6b3b8] focus:border-[#333333] focus:bg-white focus:ring-2 focus:ring-[#333333]/10" />
          </div>
          <div className="flex-[0.8] min-w-[130px]">
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-[#8d8a91]">Loại</label>
            <select value={skillType} onChange={(event) => setSkillType(event.target.value)} className="h-9 w-full rounded-lg border border-[#e8e8e8] bg-[#fafafa] px-3 text-[13px] font-bold text-[#333333] outline-none transition-all focus:border-[#333333] focus:bg-white focus:ring-2 focus:ring-[#333333]/10">
              <option value="">Tất cả</option>
              <option value="HR">HR</option>
              <option value="TECHNICAL">Technical</option>
              <option value="CODING">Coding</option>
              <option value="COMPREHENSIVE">Comprehensive</option>
            </select>
          </div>
          <div className="flex-[1.2] min-w-[160px]">
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-[#8d8a91]">Khoảng điểm</label>
            <div className="flex items-center gap-1.5">
              <input type="number" placeholder="Min" value={scoreMin} onChange={(event) => setScoreMin(event.target.value)} className="h-9 w-full min-w-0 rounded-lg border border-[#e8e8e8] bg-[#fafafa] px-2.5 text-[13px] font-semibold text-[#333333] outline-none transition-all placeholder:text-[#b6b3b8] focus:border-[#333333] focus:bg-white focus:ring-2 focus:ring-[#333333]/10" />
              <span className="text-[#b6b3b8] font-medium">-</span>
              <input type="number" placeholder="Max" value={scoreMax} onChange={(event) => setScoreMax(event.target.value)} className="h-9 w-full min-w-0 rounded-lg border border-[#e8e8e8] bg-[#fafafa] px-2.5 text-[13px] font-semibold text-[#333333] outline-none transition-all placeholder:text-[#b6b3b8] focus:border-[#333333] focus:bg-white focus:ring-2 focus:ring-[#333333]/10" />
            </div>
          </div>
          <div className="flex-[0.8] min-w-[120px]">
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-[#8d8a91]">Ngày</label>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="h-9 w-full rounded-lg border border-[#e8e8e8] bg-[#fafafa] px-3 text-[13px] font-bold text-[#333333] outline-none transition-all focus:border-[#333333] focus:bg-white focus:ring-2 focus:ring-[#333333]/10" />
          </div>
          <div className="flex-[0.8] min-w-[120px]">
            <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-[#8d8a91]">Trạng thái</label>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-9 w-full rounded-lg border border-[#e8e8e8] bg-[#fafafa] px-3 text-[13px] font-bold text-[#333333] outline-none transition-all focus:border-[#333333] focus:bg-white focus:ring-2 focus:ring-[#333333]/10">
              <option value="">Tất cả</option>
              <option value="Completed">Hoàn thành</option>
              <option value="InProgress">Đang làm</option>
            </select>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button type="submit" disabled={loading} className="h-9 rounded-lg bg-[#B4F290] text-[#111827] px-4 text-[13px] font-extrabold  shadow-sm transition-all hover:bg-[#9de675] active:translate-y-px flex items-center justify-center gap-1.5 disabled:opacity-70 disabled:active:translate-y-0">
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Filter className="h-3.5 w-3.5" /> Lọc</>}
            </button>
            <button type="button" onClick={handleClearFilters} className="h-9 rounded-lg border border-[#e8e8e8] bg-white px-3 text-[13px] font-bold text-[#96939a] transition-all hover:border-[#d6d6d6] hover:text-[#333333]">Xóa</button>
          </div>
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#eeeeee] bg-white">
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Mã phiên</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Người dùng</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Vai trò</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Loại</th>
                <th className="px-5 py-4 text-center text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Số lượt</th>
                <th className="px-5 py-4 text-center text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Mới nhất</th>
                <th className="px-5 py-4 text-center text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Cao nhất</th>
                <th className="px-5 py-4 text-center text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Trạng thái</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="py-16 text-center"><Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-[#333333]" /><p className="text-sm font-semibold text-[#96939a]">Đang tải danh sách...</p></td></tr>
              ) : sessions.length === 0 ? (
                <tr><td colSpan="8" className="py-16 text-center"><ClipboardList className="mx-auto mb-3 h-8 w-8 text-[#c9c7cb]" /><p className="text-sm font-semibold text-[#96939a]">Không tìm thấy phiên luyện tập nào.</p></td></tr>
              ) : (
                sessions.map((item) => (
                  <tr key={item.id} onClick={() => handleViewSessionDetails(item)} className="group cursor-pointer border-b border-[#eeeeee] transition-colors last:border-b-0 hover:bg-[#fafafa]">
                    <td className="px-5 py-5 text-[14px] font-extrabold text-[#333333] tabular-nums">#SES-{item.id}</td>
                    <td className="px-5 py-5 text-[14px] font-extrabold text-[#333333]">{item.userName}</td>
                    <td className="px-5 py-5 text-[14px] font-semibold leading-tight text-[#333333]">{item.role}</td>
                    <td className="px-5 py-5"><span className="inline-flex rounded-md bg-[#f1f1f1] px-2.5 py-1 text-[10px] font-extrabold uppercase text-[#333333]">{item.skillType}</span></td>
                    <td className="px-5 py-5 text-center text-[15px] font-extrabold text-[#333333] tabular-nums">{item.attemptCount}</td>
                    <td className="px-5 py-5 text-center text-[15px] font-extrabold text-[#333333] tabular-nums">{item.latestScore != null ? Number(item.latestScore).toFixed(1) : '—'}</td>
                    <td className="px-5 py-5 text-center text-[15px] font-extrabold text-[#77c486] tabular-nums">{item.bestScore != null ? Number(item.bestScore).toFixed(1) : '—'}</td>
                    <td className="px-5 py-5 text-center"><StatusBadge status={item.status} /></td>
                    <td className="px-5 py-5 text-right"><ChevronRight className="inline-block h-4 w-4 text-[#c8c5ca] transition-colors group-hover:text-[#333333]" /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalItems > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-[#eeeeee] bg-white px-5 py-4 sm:flex-row">
            <p className="text-sm font-medium text-[#6f6a72]">Hiển thị {firstItem}-{lastItem} trong số {totalItems.toLocaleString()} kết quả</p>
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
    </motion.div>
  );
}
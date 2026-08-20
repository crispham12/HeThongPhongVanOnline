import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../lib/axios';

const HRInterviewResultPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        // Fetch both session details (for role, level, etc.) and final result
        const [sessionRes, resultRes] = await Promise.all([
          api.get(`/hr-interviews/${sessionId}`),
          api.get(`/hr-interviews/${sessionId}/result`)
        ]);
        
        const sessionData = sessionRes.data;
        const resultData = resultRes.data;

        // Map to the existing UI format
        const getScoreStatus = (score) => {
          if (score >= 9) return "Xuất Sắc";
          if (score >= 8) return "Tốt";
          if (score >= 7) return "Khá";
          if (score >= 6) return "Trung Bình";
          return "Cần Cải Thiện";
        };

        const mappedData = {
          summary: {
            role: sessionData.role || "N/A",
            interviewType: "HR Interview",
            level: sessionData.difficulty || "N/A",
            durationMinutes: 15, // Currently we don't have exact duration easily accessible here
            questionsAnswered: sessionData.answeredCount || 0,
            totalQuestions: sessionData.totalQuestions || 10,
            interviewDate: new Date().toLocaleDateString('vi-VN'),
            overallStatus: resultData.status === "completed" ? "Hoàn Thành" : resultData.status
          },
          overall: {
            score: resultData.overallScore,
            summaryText: resultData.overallObservation,
            topPercentile: null, // Removed mock data
            hiringReadiness: resultData.readinessLevel
          },
          scoreBreakdown: [
            { name: "STAR Structure", score: resultData.compositeScores?.starStructureScore || 0, status: getScoreStatus(resultData.compositeScores?.starStructureScore || 0) },
            { name: "Communication", score: resultData.compositeScores?.communicationScore || 0, status: getScoreStatus(resultData.compositeScores?.communicationScore || 0) },
            { name: "Professionalism", score: resultData.compositeScores?.professionalismScore || 0, status: getScoreStatus(resultData.compositeScores?.professionalismScore || 0) },
            { name: "Confidence", score: resultData.compositeScores?.confidenceScore || 0, status: getScoreStatus(resultData.compositeScores?.confidenceScore || 0) },
            { name: "Logic", score: resultData.compositeScores?.logicScore || 0, status: getScoreStatus(resultData.compositeScores?.logicScore || 0) },
            { name: "Completeness", score: resultData.compositeScores?.completenessScore || 0, status: getScoreStatus(resultData.compositeScores?.completenessScore || 0) },
            { name: "Clarity", score: resultData.compositeScores?.clarityScore || 0, status: getScoreStatus(resultData.compositeScores?.clarityScore || 0) }
          ],
          strengths: resultData.strengths?.map(s => ({
            title: s.title,
            description: s.description,
            score: s.score || 0,
            status: s.status || getScoreStatus(s.score || 0)
          })) || [],
          improvements: resultData.improvements?.map(i => ({
            title: i.title,
            description: i.description,
            score: 0,
            status: i.priority || "Cần Cải Thiện"
          })) || [],
          // Map average STAR analysis from questionEvaluations
          starAnalysis: (() => {
            if (!resultData.questionEvaluations || resultData.questionEvaluations.length === 0) return [];
            let sScore = 0, tScore = 0, aScore = 0, rScore = 0;
            let validEvals = 0;
            resultData.questionEvaluations.forEach(q => {
              if (q.starAnalysis) {
                sScore += q.starAnalysis.situation?.score || 0;
                tScore += q.starAnalysis.task?.score || 0;
                aScore += q.starAnalysis.action?.score || 0;
                rScore += q.starAnalysis.result?.score || 0;
                validEvals++;
              }
            });
            if (validEvals === 0) return [];
            return [
              { name: "Situation", score: +(sScore/validEvals).toFixed(1), status: getScoreStatus(sScore/validEvals), feedback: "Đánh giá chung Situation" },
              { name: "Task", score: +(tScore/validEvals).toFixed(1), status: getScoreStatus(tScore/validEvals), feedback: "Đánh giá chung Task" },
              { name: "Action", score: +(aScore/validEvals).toFixed(1), status: getScoreStatus(aScore/validEvals), feedback: "Đánh giá chung Action" },
              { name: "Result", score: +(rScore/validEvals).toFixed(1), status: getScoreStatus(rScore/validEvals), feedback: "Đánh giá chung Result" }
            ];
          })()
        };

        setData(mappedData);
      } catch (err) {
        if (err.response?.status === 404 || err.response?.status === 400) {
          setError("empty");
        } else {
          setError("error");
        }
      } finally {
        setLoading(false);
      }
    };
    if (sessionId) {
      fetchResult();
    }
  }, [sessionId]);

  if (loading) return <ResultSkeleton />;
  if (error === "empty") return <ResultEmptyState onBack={() => navigate(`/interview/analysis/${sessionId}`)} />;
  if (error === "error") return <ResultErrorState onRetry={() => window.location.reload()} />;
  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto space-y-6">
        <InterviewSummaryCard summary={data.summary} />
        <OverallScoreHero overall={data.overall} />
        <ScoreBreakdownGrid breakdown={data.scoreBreakdown} />
        <StrengthImprovementSection strengths={data.strengths} improvements={data.improvements} />
        <STARAnalysisGrid starAnalysis={data.starAnalysis} />
        <NextActionsBar onPractice={() => navigate('/setup')} onHistory={() => navigate('/history')} onDashboard={() => navigate('/dashboard')} />
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ────────────────────────────────────────────────────────

const InterviewSummaryCard = ({ summary }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-bold text-gray-900">Tổng Quan Phỏng Vấn</h2>
      <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-sm font-medium rounded-full">
        Đã Hoàn Thành
      </span>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SummaryField label="Vị Trí" value={summary.role} />
      <SummaryField label="Loại Phỏng Vấn" value={summary.interviewType} />
      <SummaryField label="Cấp Độ" value={summary.level} />
      <SummaryField label="Thời Lượng Phỏng Vấn" value={`${summary.durationMinutes} phút`} />
      <SummaryField label="Số Câu Trả Lời" value={`${summary.questionsAnswered} / ${summary.totalQuestions}`} />
      <SummaryField label="Ngày Phỏng Vấn" value={summary.interviewDate} />
      <div className="col-span-1 md:col-span-2">
        <SummaryField label="Trạng Thái Chung" value={summary.overallStatus} />
      </div>
    </div>
  </div>
);

const SummaryField = ({ label, value }) => (
  <div className="border border-gray-100 rounded-lg p-3 bg-gray-50/50">
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="font-medium text-gray-900">{value}</p>
  </div>
);

const OverallScoreHero = ({ overall }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row gap-8 items-center">
    <CircularScore score={overall.score} />
    <div className="flex-1 space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Điểm Tổng Thể</h2>
        <p className="text-gray-600 font-medium mt-1">{Number(overall.score).toFixed(1)} / 10</p>
      </div>
      <p className="text-gray-700">{overall.score === 0 ? "No valid interview data available." : overall.summaryText}</p>
      <div className="grid grid-cols-2 gap-4">
        {overall.topPercentile && (
          <div className="border border-gray-100 rounded-lg p-3 bg-gray-50/50">
            <p className="text-xs text-gray-500 mb-1">Tốp Ứng Viên</p>
            <p className="font-medium text-gray-900">{overall.topPercentile}</p>
          </div>
        )}
        <div className="border border-gray-100 rounded-lg p-3 bg-gray-50/50">
          <p className="text-xs text-gray-500 mb-1">Độ Sẵn Sàng Tuyển Dụng</p>
          <p className="font-medium text-gray-900">{overall.score === 0 ? "Không" : overall.hiringReadiness}</p>
        </div>
      </div>
    </div>
  </div>
);

const CircularScore = ({ score }) => {
  const percentage = Math.min(100, Math.max(0, score * 10));
  return (
    <div className="relative w-32 h-32 flex-shrink-0">
      <svg className="w-full h-full" viewBox="0 0 36 36">
        <path
          className="text-gray-100"
          strokeWidth="3"
          stroke="currentColor"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          className="text-[#6B705C]"
          strokeWidth="3"
          strokeDasharray={`${percentage}, 100`}
          stroke="currentColor"
          fill="none"
          strokeLinecap="round"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-bold text-gray-900">{Number(score).toFixed(1)}</span>
      </div>
    </div>
  );
};

const ScoreBreakdownGrid = ({ breakdown }) => (
  <div>
    <h3 className="text-lg font-bold text-gray-900 mb-4">Chi Tiết Điểm Số</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {breakdown.map((item, idx) => (
        <ScoreMetricCard key={idx} metric={item} />
      ))}
    </div>
  </div>
);

const ScoreMetricCard = ({ metric }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col justify-between">
    <div className="flex justify-between items-center mb-4">
      <span className="font-bold text-gray-900">{metric.name}</span>
      <span className="text-gray-600 font-medium">{Number(metric.score).toFixed(1)}</span>
    </div>
    <div>
      <MiniProgressBar score={metric.score} status={metric.status} />
      <div className="mt-2">
        <StatusBadge status={metric.status} />
      </div>
    </div>
  </div>
);

const StrengthImprovementSection = ({ strengths, improvements }) => {
  if (!strengths?.length && !improvements?.length) return null;
  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Điểm Mạnh và Điểm Cần Cải Thiện</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {strengths?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-5">
            <h4 className="font-bold text-gray-900">Điểm Mạnh</h4>
            {strengths.map((item, idx) => <StrengthItem key={idx} item={item} />)}
          </div>
        )}
        {improvements?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-5">
            <h4 className="font-bold text-gray-900">Điểm Cần Cải Thiện</h4>
            {improvements.map((item, idx) => <ImprovementItem key={idx} item={item} />)}
          </div>
        )}
      </div>
    </div>
  );
};

const StrengthItem = ({ item }) => (
  <div className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
    <div className="flex justify-between items-start mb-2">
      <span className="font-bold text-gray-900">{item.title}</span>
      <span className="text-[10px] uppercase font-bold text-[#6B705C] tracking-wide ml-2">{item.status}</span>
    </div>
    <MiniProgressBar score={item.score} status={item.status} thin />
    <p className="text-sm text-gray-600 mt-2">{item.description}</p>
  </div>
);

const ImprovementItem = ({ item }) => (
  <div className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
    <div className="flex justify-between items-start mb-2">
      <span className="font-bold text-gray-900">{item.title}</span>
      <span className={`text-[10px] uppercase font-bold tracking-wide ml-2 ${
        ['Critical', 'Cần Cải Thiện', 'Cần Cải Thiện Nhiều'].includes(item.status) ? 'text-red-600' :
        ['Weak', 'Trung Bình'].includes(item.status) ? 'text-orange-500' : 'text-amber-600'
      }`}>
        {item.status}
      </span>
    </div>
    <MiniProgressBar score={item.score} status={item.status} thin />
    <p className="text-sm text-gray-600 mt-2">{item.description}</p>
  </div>
);

const STARAnalysisGrid = ({ starAnalysis }) => {
  if (!starAnalysis?.length) return null;
  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Phân Tích STAR</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {starAnalysis.map((item, idx) => <STARCard key={idx} item={item} />)}
      </div>
    </div>
  );
};

const STARCard = ({ item }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col">
    <div className="flex justify-between items-center mb-3">
      <span className="font-bold text-gray-900">{item.name}</span>
      <span className="text-gray-600 text-sm font-medium">{Number(item.score).toFixed(1)}</span>
    </div>
    <div className="mb-3">
       <span className={`text-[10px] uppercase font-bold tracking-wide ${
        ['Critical', 'Cần Cải Thiện', 'Cần Cải Thiện Nhiều'].includes(item.status) ? 'text-red-600' :
        ['Weak', 'Trung Bình'].includes(item.status) ? 'text-orange-500' : 
        ['Focus', 'Average', 'Khá'].includes(item.status) ? 'text-amber-600' : 'text-[#6B705C]'
      }`}>
        {item.status}
      </span>
    </div>
    <MiniProgressBar score={item.score} status={item.status} thin />
    <p className="text-sm text-gray-600 mt-3 flex-1">{item.feedback}</p>
  </div>
);

const NextActionsBar = ({ onPractice, onHistory, onDashboard }) => (
  <div>
    <h3 className="text-lg font-bold text-gray-900 mb-4">Bước Tiếp Theo</h3>
    <div className="flex flex-wrap gap-4">
      <button onClick={onPractice} className="px-6 py-2.5 bg-[#6B705C] hover:bg-[#5a5f4c]  font-medium rounded-lg transition-colors shadow-sm">
        Luyện Tập Lại
      </button>
      <button onClick={onHistory} className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors">
        Xem Lịch Sử
      </button>
      <button onClick={() => alert("Chức năng xuất PDF chưa khả dụng.")} className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors">
        Xuất PDF
      </button>
      <button onClick={onDashboard} className="px-6 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors">
        Về Trang Chủ
      </button>
    </div>
    <p className="text-center text-xs text-gray-400 mt-8">Phỏng vấn hoàn tất thành công. Báo cáo AI đã được tạo.</p>
  </div>
);

// ────────────────────────────────────────────────────────
// UTILS
// ────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const getColors = () => {
    switch (status?.toUpperCase()) {
      case 'STRONG':
      case 'GOOD':
      case 'XUẤT SẮC':
      case 'TỐT':
        return 'text-[#6B705C] border-transparent';
      case 'AVERAGE':
      case 'FOCUS':
      case 'KHÁ':
        return 'text-amber-600 border-transparent';
      case 'WEAK':
      case 'TRUNG BÌNH':
        return 'text-orange-500 border-transparent';
      case 'CRITICAL':
      case 'CẦN CẢI THIỆN':
      case 'CẦN CẢI THIỆN NHIỀU':
        return 'text-red-600 border-transparent';
      default:
        return 'text-gray-500 border-transparent';
    }
  };
  return (
    <span className={`text-[10px] uppercase font-bold tracking-wide ${getColors()}`}>
      {status}
    </span>
  );
};

const MiniProgressBar = ({ score, status, thin = false }) => {
  const getBgColor = () => {
    switch (status?.toUpperCase()) {
      case 'STRONG':
      case 'GOOD':
      case 'XUẤT SẮC':
      case 'TỐT':
        return 'bg-[#6B705C]';
      case 'AVERAGE':
      case 'FOCUS':
      case 'KHÁ':
        return 'bg-amber-400';
      case 'WEAK':
      case 'TRUNG BÌNH':
        return 'bg-orange-400';
      case 'CRITICAL':
      case 'CẦN CẢI THIỆN':
      case 'CẦN CẢI THIỆN NHIỀU':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };
  
  return (
    <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${thin ? 'h-1' : 'h-2'}`}>
      <div
        className={`${getBgColor()} h-full rounded-full`}
        style={{ width: `${Math.max(0, Math.min(100, score * 10))}%` }}
      />
    </div>
  );
};

// ────────────────────────────────────────────────────────
// STATES
// ────────────────────────────────────────────────────────

const ResultSkeleton = () => (
  <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
    <div className="w-full max-w-5xl space-y-6 animate-pulse">
      <div className="h-48 bg-gray-200 rounded-xl" />
      <div className="h-40 bg-gray-200 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl" />)}
      </div>
    </div>
  </div>
);

const ResultEmptyState = ({ onBack }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center max-w-md w-full">
      <h3 className="text-xl font-bold text-gray-900 mb-2">Báo Cáo Chưa Sẵn Sàng</h3>
      <p className="text-gray-600 mb-6">AI đang phân tích kết quả phỏng vấn của bạn. Vui lòng quay lại sau ít phút.</p>
      <button onClick={onBack} className="px-6 py-2.5 bg-[#6B705C] hover:bg-[#5a5f4c]  font-medium rounded-lg w-full">
        Quay lại Tiến trình
      </button>
    </div>
  </div>
);

const ResultErrorState = ({ onRetry }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    <div className="bg-white p-8 rounded-xl shadow-sm border border-red-100 text-center max-w-md w-full">
      <h3 className="text-xl font-bold text-red-700 mb-2">Không thể tải kết quả</h3>
      <p className="text-gray-600 mb-6">Đã xảy ra lỗi khi tải báo cáo phỏng vấn của bạn.</p>
      <button onClick={onRetry} className="px-6 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 font-medium rounded-lg w-full">
        Thử lại
      </button>
    </div>
  </div>
);

export default HRInterviewResultPage;

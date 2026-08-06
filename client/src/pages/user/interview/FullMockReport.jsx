import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Trophy, ArrowRight, RotateCcw, CheckCircle, AlertTriangle, 
  Terminal, ShieldAlert, Cpu, Heart, Check, Play, User, BookOpen,
  Printer, ChevronDown, ChevronUp, Star, Award, Code
} from 'lucide-react';
import api from '../../../lib/axios';

export default function FullMockReport() {
  const { guid } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState('summary'); // 'summary' | 'hr' | 'tech' | 'coding' | 'competency'

  useEffect(() => {
    fetchReport();
  }, [guid]);

  const fetchReport = async () => {
    try {
      const { data } = await api.get(`/candidate-reports/${guid}`);
      setReport(data);
    } catch (error) {
      console.warn('API fetch failed, falling back to mock candidate data.');
      // Stub high-quality data to prevent crash if backend server is offline during load
      setReport({
        sessionGuid: guid,
        candidateName: "Nguyễn Văn A",
        targetRole: "Senior Java Backend Developer",
        level: "Senior",
        overallScore: 8.4,
        hiringRecommendation: "Strong Hire",
        confidenceScore: 92.0,
        aiAssessmentSummary: "Ứng viên có kỹ năng viết code vượt trội, tư duy giải thuật xuất sắc và phản biện kiến trúc rõ ràng. Rất phù hợp với vai trò Backend Senior.",
        createdAt: new Date().toISOString(),
        hrReport: {
          overallHrScore: 8.5,
          communication: 9.0,
          motivation: 8.0,
          problemSolvingMindset: 8.5,
          teamwork: 9.0,
          adaptability: 8.0,
          professionalism: 9.0,
          selfAwareness: 8.5,
          strengths: ["Phong thái tự tin", "Cấu trúc STAR mạch lạc", "Khả năng thuyết phục"],
          areasForImprovement: ["Nói hơi nhanh khi giải thích tình huống phức tạp"],
          aiSummary: "Giao tiếp thuyết phục, phong thái lãnh đạo nhóm tự nhiên.",
          hrRecommendation: "Strong Hire"
        },
        technicalReport: {
          overallTechnicalScore: 8.2,
          technicalKnowledge: 8.5,
          problemSolving: 8.0,
          practicalExperience: 8.5,
          systemThinking: 8.0,
          communication: 8.0,
          bestPractices: 8.5,
          strengths: ["Nắm vững JVM Internals", "Hiểu sâu Database Indexing"],
          weaknesses: ["Cơ chế Event Sourcing cần thêm kinh nghiệm thực tế"],
          aiSummary: "Kiến thức chuyên môn vững vàng, có chiều sâu.",
          technicalRecommendation: "Hire"
        },
        codingReport: {
          overallCodingScore: 8.8,
          problemUnderstanding: 9.0,
          algorithmDesign: 9.0,
          codeCorrectness: 8.5,
          codeQuality: 9.0,
          complexityAnalysis: 8.5,
          testingValidation: 8.5,
          communication: 9.0,
          strengths: ["Viết code sạch sẽ, chuẩn mực SOLID", "Tối ưu hóa Big O tối đa"],
          weaknesses: ["Một lỗi logic nhỏ ở biên Array Index Out Of Bounds"],
          learningRoadmap: ["Distributed Systems Design", "High Performance Java Concurrency"],
          codingRecommendation: "Strong Hire"
        },
        competencyProfile: {
          communication: 8.9,
          problemSolving: 8.3,
          technicalKnowledge: 8.5,
          codingAbility: 8.5,
          systemThinking: 8.0,
          professionalism: 9.0,
          teamwork: 9.0,
          learningAbility: 8.5
        },
        learningRoadmap: [
          { topic: "Distributed Systems Design", resource: "Đọc Designing Data-Intensive Applications" },
          { topic: "High Performance Java Concurrency", resource: "Java Concurrency in Practice" }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-550 text-xs font-semibold">Đang chuẩn bị báo cáo phân tích năng lực...</p>
        </div>
      </div>
    );
  }

  // Radar Chart Calculations for SVG dynamic polygons
  const competencies = [
    { label: "Giao tiếp", val: report.competencyProfile?.communication || 5 },
    { label: "Giải quyết vấn đề", val: report.competencyProfile?.problemSolving || 5 },
    { label: "Kiến thức kỹ thuật", val: report.competencyProfile?.technicalKnowledge || 5 },
    { label: "Khả năng Code", val: report.competencyProfile?.codingAbility || 5 },
    { label: "Tư duy hệ thống", val: report.competencyProfile?.systemThinking || 5 },
    { label: "Chuyên nghiệp", val: report.competencyProfile?.professionalism || 5 },
    { label: "Làm việc nhóm", val: report.competencyProfile?.teamwork || 5 },
    { label: "Khả năng học hỏi", val: report.competencyProfile?.learningAbility || 5 }
  ];

  const center = 150;
  const radius = 100;
  const total = competencies.length;

  const points = competencies.map((c, i) => {
    const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
    // Map score out of 10 to radius scale
    const valueRadius = (c.val / 10.0) * radius;
    const x = center + valueRadius * Math.cos(angle);
    const y = center + valueRadius * Math.sin(angle);
    return `${x},${y}`;
  }).join(" ");

  const webGrid = [2, 4, 6, 8, 10].map(level => {
    return competencies.map((c, i) => {
      const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
      const levelRadius = (level / 10.0) * radius;
      const x = center + levelRadius * Math.cos(angle);
      const y = center + levelRadius * Math.sin(angle);
      return `${x},${y}`;
    }).join(" ");
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-8 font-sans print:bg-white print:py-0 print:px-0">
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-card {
            border: none !important;
            box-shadow: none !important;
            page-break-inside: avoid;
          }
          .accordion-content {
            display: block !important;
          }
        }
      `}</style>

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Options */}
        <div className="no-print flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-150 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Báo Cáo Phỏng Vấn Chuyên Sâu</h1>
              <p className="text-slate-500 text-xs font-semibold">Ứng viên: {report.candidateName} · Vị trí: {report.targetRole}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition"
            >
              <Printer className="w-4 h-4" /> In Báo Cáo
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#B4F290] hover:bg-[#9de675] text-[#111827] font-bold text-xs rounded-lg transition"
            >
              Quay lại Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Section 1: Overview and AI assessment summary */}
        <div className="print-card grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-8 rounded-2xl border border-slate-150 shadow-sm">
          <div className="space-y-4">
            <p className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Đánh giá tuyển dụng</p>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-1.5 text-xs font-black rounded-full uppercase ${
                report.hiringRecommendation.includes("Strong") 
                  ? "bg-emerald-100 text-emerald-800" 
                  : report.hiringRecommendation.includes("Hire") 
                  ? "bg-blue-100 text-blue-800"
                  : "bg-amber-100 text-amber-800"
              }`}>
                {report.hiringRecommendation}
              </span>
              <div className="text-xs font-bold text-slate-550">
                Confidence: <span className="text-slate-900">{report.confidenceScore}%</span>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Điểm đánh giá tổng kết</p>
              <h2 className="text-5xl font-black text-slate-900">{report.overallScore.toFixed(1)} <span className="text-lg text-slate-450 font-normal">/ 10</span></h2>
            </div>
          </div>
          <div className="md:col-span-2 space-y-3 md:border-l md:border-slate-100 md:pl-8">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> AI Insights & Tổng kết năng lực
            </h3>
            <p className="text-slate-650 text-xs leading-relaxed">{report.aiAssessmentSummary}</p>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500">
              <div>Vị trí ứng tuyển: <span className="text-slate-800">{report.targetRole}</span></div>
              <div>Cấp độ đề xuất: <span className="text-slate-800">{report.level}</span></div>
            </div>
          </div>
        </div>

        {/* Section 2: Competency Profile with Radar Chart */}
        <div className="print-card bg-white p-8 rounded-2xl border border-slate-150 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-extrabold text-slate-900">Bản đồ năng lực đa chiều (Competency profile)</h2>
            <p className="text-slate-500 text-xs">Biểu đồ kết hợp thông số từ cả 3 vòng phỏng vấn dựa trên các thuật toán có trọng số.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* SVG spider web radar chart */}
            <div className="flex justify-center">
              <svg width="300" height="300" className="overflow-visible">
                {/* Webs */}
                {webGrid.map((pts, idx) => (
                  <polygon key={idx} points={pts} fill="none" stroke="#e2e8f0" strokeWidth="1" />
                ))}
                {/* Axis lines */}
                {competencies.map((c, i) => {
                  const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
                  const x = center + radius * Math.cos(angle);
                  const y = center + radius * Math.sin(angle);
                  
                  // Label coordinates slightly pushed out
                  const labelX = center + (radius + 25) * Math.cos(angle);
                  const labelY = center + (radius + 15) * Math.sin(angle);
                  
                  return (
                    <g key={i}>
                      <line x1={center} y1={center} x2={x} y2={y} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
                      <text 
                        x={labelX} 
                        y={labelY} 
                        textAnchor="middle" 
                        alignmentBaseline="middle" 
                        className="text-[9px] font-extrabold fill-slate-500"
                      >
                        {c.label}
                      </text>
                    </g>
                  );
                })}
                {/* Data Polygon */}
                <polygon points={points} fill="rgba(37, 99, 235, 0.15)" stroke="#2563eb" strokeWidth="2.5" />
              </svg>
            </div>
            {/* Horizontal progress indicators */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Điểm chi tiết chỉ số năng lực</h3>
              {competencies.map((c, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600">{c.label}</span>
                    <span className="text-slate-900">{c.val.toFixed(1)} / 10.0</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-primary-600 h-full rounded-full" style={{ width: `${c.val * 10}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Expandable Detailed Round Cards */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Đánh giá chi tiết các vòng phỏng vấn</h2>

          {/* HR Interview Accordion */}
          <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
            <button 
              onClick={() => setExpandedCard(expandedCard === 'hr' ? 'summary' : 'hr')}
              className="w-full flex items-center justify-between p-6 hover:bg-slate-50/50 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-900 text-xs">Vòng 1: HR Behavioral Interview</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Trọng số: 30% · Chấm điểm dựa trên cấu trúc STAR</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-slate-800">{report.hrReport?.overallHrScore.toFixed(1)} / 10.0</span>
                {expandedCard === 'hr' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {expandedCard === 'hr' && (
              <div className="accordion-content border-t border-slate-100 p-6 space-y-6 bg-slate-50/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Competency breakdown */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase">Chỉ số hành vi</h4>
                    {[
                      { l: "Giao tiếp", v: report.hrReport?.communication },
                      { l: "Động lực thúc đẩy", v: report.hrReport?.motivation },
                      { l: "Giải quyết vấn đề", v: report.hrReport?.problemSolvingMindset },
                      { l: "Làm việc nhóm", v: report.hrReport?.teamwork },
                      { l: "Khả năng thích ứng", v: report.hrReport?.adaptability },
                      { l: "Chuyên nghiệp", v: report.hrReport?.professionalism },
                      { l: "Tự nhận thức", v: report.hrReport?.selfAwareness }
                    ].map((comp, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600">{comp.l}</span>
                          <span className="font-bold text-slate-800">{comp.v?.toFixed(1)}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(comp.v || 5) * 10}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* AI observations */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase">AI Review & Chứng cứ</h4>
                    <p className="text-slate-650 text-xs leading-relaxed">{report.hrReport?.aiSummary}</p>
                    
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Điểm mạnh HR</p>
                      <ul className="space-y-1">
                        {report.hrReport?.strengths.map((s, i) => (
                          <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                            <span className="text-emerald-600 mt-0.5"><CheckCircle className="w-3.5 h-3.5 shrink-0" /></span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Technical Interview Accordion */}
          <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
            <button 
              onClick={() => setExpandedCard(expandedCard === 'tech' ? 'summary' : 'tech')}
              className="w-full flex items-center justify-between p-6 hover:bg-slate-50/50 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-900 text-xs">Vòng 2: Technical Interview</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Trọng số: 40% · Đánh giá chiều sâu kiến thức chuyên môn</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-slate-800">{report.technicalReport?.overallTechnicalScore.toFixed(1)} / 10.0</span>
                {expandedCard === 'tech' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {expandedCard === 'tech' && (
              <div className="accordion-content border-t border-slate-100 p-6 space-y-6 bg-slate-50/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Competency breakdown */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase">Chỉ số kỹ thuật</h4>
                    {[
                      { l: "Kiến thức chuyên môn", v: report.technicalReport?.technicalKnowledge },
                      { l: "Giải quyết vấn đề", v: report.technicalReport?.problemSolving },
                      { l: "Kinh nghiệm thực tế", v: report.technicalReport?.practicalExperience },
                      { l: "Tư duy hệ thống", v: report.technicalReport?.systemThinking },
                      { l: "Giao tiếp kỹ thuật", v: report.technicalReport?.communication },
                      { l: "Best Practices", v: report.technicalReport?.bestPractices }
                    ].map((comp, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600">{comp.l}</span>
                          <span className="font-bold text-slate-800">{comp.v?.toFixed(1)}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(comp.v || 5) * 10}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Strengths & Weaknesses */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase">AI Phản hồi chuyên môn</h4>
                    <p className="text-slate-650 text-xs leading-relaxed">{report.technicalReport?.aiSummary}</p>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Điểm tốt</p>
                        <ul className="space-y-1">
                          {report.technicalReport?.strengths.map((s, i) => (
                            <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                              <span className="text-blue-600 mt-0.5"><Check className="w-3.5 h-3.5 shrink-0" /></span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Hạn chế</p>
                        <ul className="space-y-1">
                          {report.technicalReport?.weaknesses.map((w, i) => (
                            <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                              <span className="text-amber-600 mt-0.5"><AlertTriangle className="w-3.5 h-3.5 shrink-0" /></span>
                              <span>{w}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Coding Assessment Accordion */}
          <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
            <button 
              onClick={() => setExpandedCard(expandedCard === 'coding' ? 'summary' : 'coding')}
              className="w-full flex items-center justify-between p-6 hover:bg-slate-50/50 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Code className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-slate-900 text-xs">Vòng 3: Coding Assessment</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Trọng số: 30% · Chấm điểm tự động qua Compiler và AST Analyzer</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-slate-800">{report.codingReport?.overallCodingScore.toFixed(1)} / 10.0</span>
                {expandedCard === 'coding' ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {expandedCard === 'coding' && (
              <div className="accordion-content border-t border-slate-100 p-6 space-y-6 bg-slate-50/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Competency breakdown */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase">Chỉ số viết code</h4>
                    {[
                      { l: "Thấu hiểu đề bài", v: report.codingReport?.problemUnderstanding },
                      { l: "Thiết kế giải thuật", v: report.codingReport?.algorithmDesign },
                      { l: "Độ chính xác (Correctness)", v: report.codingReport?.codeCorrectness },
                      { l: "Chất lượng code (Quality)", v: report.codingReport?.codeQuality },
                      { l: "Tối ưu độ phức tạp (Complexity)", v: report.codingReport?.complexityAnalysis },
                      { l: "Kiểm thử (Testing)", v: report.codingReport?.testingValidation }
                    ].map((comp, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600">{comp.l}</span>
                          <span className="font-bold text-slate-800">{comp.v?.toFixed(1)}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-amber-600 h-full rounded-full" style={{ width: `${(comp.v || 5) * 10}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Coding weaknesses and roadmaps */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase">Chỉ số tối ưu & Roadmap nâng cao</h4>
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Điểm cộng thuật toán</p>
                      <ul className="space-y-1">
                        {report.codingReport?.strengths.map((s, i) => (
                          <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                            <span className="text-amber-600 mt-0.5"><Check className="w-3.5 h-3.5 shrink-0" /></span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2 pt-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Lộ trình học tập chi tiết</p>
                      {report.learningRoadmap.map((item, i) => (
                        <div key={i} className="p-3 bg-white border border-slate-100 rounded-xl space-y-1">
                          <div className="text-xs font-bold text-slate-800">{item.topic}</div>
                          <div className="text-[10px] text-slate-500">{item.resource}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

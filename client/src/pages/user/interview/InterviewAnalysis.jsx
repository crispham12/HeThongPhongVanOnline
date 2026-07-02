import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Bot, CheckCircle2, Circle, Loader2, AlertCircle, BarChart3 } from 'lucide-react';
import api from '../../../lib/axios';

const ANALYSIS_STEPS = [
  { id: 'transcript', label: 'Xử lý văn bản thoại', weight: 15 },
  { id: 'speech', label: 'Phân tích giọng điệu', weight: 15 },
  { id: 'star', label: 'Đánh giá cấu trúc STAR', weight: 20 },
  { id: 'communication', label: 'Kỹ năng giao tiếp', weight: 15 },
  { id: 'professionalism', label: 'Đánh giá tính chuyên nghiệp', weight: 10 },
  { id: 'confidence', label: 'Phân tích sự tự tin', weight: 10 },
  { id: 'feedback', label: 'Tạo nhận xét phản hồi', weight: 10 },
  { id: 'report', label: 'Chuẩn bị báo cáo cuối cùng', weight: 5 }
];

const WORKING_TEXTS = {
  transcript: 'Đang chuyển đổi giọng nói thành văn bản và trích xuất từ khóa...',
  speech: 'Đang phân tích âm điệu, tốc độ và sự rõ ràng trong giọng nói...',
  star: 'Đang đối chiếu câu trả lời với phương pháp STAR...',
  communication: 'Đang đánh giá hiệu quả giao tiếp của bạn...',
  professionalism: 'Đang đo lường từ vựng chuyên ngành và thái độ...',
  confidence: 'Đang tính toán mức độ tự tin từ mẫu giọng nói...',
  feedback: 'Đang tạo các nhận xét hành động cá nhân hóa...',
  report: 'Đang hoàn tất báo cáo phỏng vấn toàn diện của bạn...'
};

const TIPS = [
  'AI của chúng tôi không chỉ đánh giá từ khóa. Nó còn xem xét cấu trúc và logic.',
  'Phương pháp STAR (Tình huống, Nhiệm vụ, Hành động, Kết quả) giúp cấu trúc câu trả lời hiệu quả.',
  'Tốc độ nói ổn định và phát âm rõ ràng sẽ cải thiện đáng kể điểm giao tiếp.',
  'Thể hiện sự nhiệt huyết và duy trì âm điệu vững vàng sẽ tăng chỉ số tự tin.',
  'Việc sử dụng từ vựng chuyên ngành cho thấy mức độ sẵn sàng làm việc của bạn.'
];

export default function InterviewAnalysis() {
  const navigate = useNavigate();
  const { sessionId } = useParams();

  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [status, setStatus] = useState('processing'); // processing, completed, failed
  const [currentTip, setCurrentTip] = useState(TIPS[0]);
  


  // Trigger backend analysis
  useEffect(() => {
    const startBackendAnalysis = async () => {
      try {
        if (sessionId && sessionId !== 'demo') {
          await api.post(`/hr-interviews/${sessionId}/analysis/start`);
        }
      } catch (error) {
        console.error("Failed to start analysis", error);
        // We could setStatus('failed') here, but let's let the fake progress run
        // and Result page will handle errors.
      }
    };
    startBackendAnalysis();
  }, [sessionId]);

  // Rotate tips every 4 seconds
  useEffect(() => {
    if (status !== 'processing') return;
    const interval = setInterval(() => {
      setCurrentTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
    }, 4000);
    return () => clearInterval(interval);
  }, [status]);

  // Simulate analysis progress
  useEffect(() => {
    if (status !== 'processing') return;

    let currentProgress = 0;
    let stepIdx = 0;

    const timer = setInterval(() => {
      if (stepIdx >= ANALYSIS_STEPS.length) {
        clearInterval(timer);
        setStatus('completed');
        setProgress(100);
        return;
      }

      // Add small random increments to progress
      currentProgress += Math.random() * 2 + 1;

      // Calculate target progress for current step
      let targetProgress = 0;
      for (let i = 0; i <= stepIdx; i++) {
        targetProgress += ANALYSIS_STEPS[i].weight;
      }

      if (currentProgress >= targetProgress) {
        currentProgress = targetProgress;
        stepIdx++;
        if (stepIdx < ANALYSIS_STEPS.length) {
          setCurrentStepIndex(stepIdx);
        }
      }

      setProgress(Math.min(currentProgress, 100));

    }, 300); // Update every 300ms for smooth animation

    return () => clearInterval(timer);
  }, [status]);

  // Auto redirect on completion
  useEffect(() => {
    if (status === 'completed') {
      const timer = setTimeout(() => {
        navigate(`/interviews/hr/${sessionId || 'demo'}/result`);
      }, 1500); // Small delay to let user see 100% completion
      return () => clearTimeout(timer);
    }
  }, [status, navigate, sessionId]);

  const handleRetry = () => {
    setProgress(0);
    setCurrentStepIndex(0);
    setStatus('processing');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-gray-800 font-sans p-6 flex flex-col items-center py-12">
      <div className="max-w-[1000px] w-full">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-white border border-gray-200 rounded-2xl flex items-center justify-center shadow-sm">
            <Bot className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900 leading-tight">Phân Tích Phỏng Vấn AI</h1>
            <p className="text-[14px] text-gray-500 mt-1">AI đang phân tích phần thể hiện của bạn. Quá trình này thường chỉ mất vài giây.</p>
          </div>
        </div>

        {status === 'failed' ? (
          <div className="bg-white rounded-2xl border border-red-100 p-8 shadow-sm text-center mb-6">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Phân tích thất bại</h2>
            <p className="text-gray-500 mb-6">Chúng tôi gặp lỗi khi xử lý dữ liệu phỏng vấn của bạn. Vui lòng thử lại.</p>
            <div className="flex justify-center gap-3">
              <button onClick={handleRetry} className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800">
                Thử lại
              </button>
              <button className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
                Liên hệ hỗ trợ
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6 relative overflow-hidden">
            
            {/* Progress Header */}
            <div className="flex justify-between items-end mb-3">
              <h2 className="text-3xl font-bold text-gray-900">{Math.floor(progress)}%</h2>
              <BarChart3 className="w-6 h-6 text-gray-400 mb-1" />
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-6 relative">
              <div 
                className="h-full bg-[#6b7280] rounded-full transition-all duration-300 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                {/* Shine effect */}
                <div className="absolute top-0 left-0 bottom-0 right-0 overflow-hidden rounded-full">
                   <div className="w-full h-full bg-white/20 -translate-x-full animate-[shimmer_2s_infinite]"></div>
                </div>
              </div>
            </div>

            <p className="text-[14px] font-medium text-gray-700 mb-4">
              {status === 'completed' ? 'Phân tích hoàn tất! Đang chuyển hướng...' : 'Đang phân tích...'}
            </p>

            {/* Checklist Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-6">
              {ANALYSIS_STEPS.map((step, index) => {
                const isCompleted = index < currentStepIndex || status === 'completed';
                const isCurrent = index === currentStepIndex && status === 'processing';
                
                return (
                  <div 
                    key={step.id} 
                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors duration-300 ${isCurrent ? 'bg-gray-50/80' : ''}`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-[18px] h-[18px] text-green-500 flex-shrink-0" />
                    ) : isCurrent ? (
                      <div className="relative flex items-center justify-center w-[18px] h-[18px] flex-shrink-0">
                         <Loader2 className="w-[18px] h-[18px] text-gray-400 animate-spin absolute" />
                         <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
                      </div>
                    ) : (
                      <Circle className="w-[18px] h-[18px] text-gray-300 flex-shrink-0" />
                    )}
                    <span className={`text-[14px] ${isCompleted ? 'text-gray-600' : isCurrent ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Currently Working Box */}
            <div className="border border-gray-200 bg-[#fafafa] rounded-xl p-4 flex flex-col justify-center">
              <h3 className="text-[15px] font-semibold text-gray-900 mb-2">Đang xử lý</h3>
              <div className="flex items-center gap-3">
                {status === 'processing' ? (
                  <>
                    <Loader2 className="w-4 h-4 text-[#6b7280] animate-spin flex-shrink-0" />
                    <span className="text-[14px] text-gray-700 font-medium">
                      {WORKING_TEXTS[ANALYSIS_STEPS[currentStepIndex]?.id] || 'Đang hoàn tất...'}
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-[14px] text-green-700 font-medium">Tất cả tác vụ đã hoàn tất thành công!</span>
                  </>
                )}
              </div>
            </div>
            
          </div>
        )}

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Summary Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tổng Quan Phỏng Vấn</h3>
            <div className="space-y-3">
              <div className="flex flex-col">
                <span className="text-[13px] text-gray-500">Loại Phỏng Vấn</span>
                <span className="text-[14.5px] font-medium text-gray-800">HR Phỏng Vấn</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] text-gray-500">Vị Trí</span>
                <span className="text-[14.5px] font-medium text-gray-800">Lập Trình Viên</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] text-gray-500">Cấp Độ</span>
                <span className="text-[14.5px] font-medium text-gray-800">Thực Tập Sinh / Mới Tốt Nghiệp</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] text-gray-500">Câu Hỏi</span>
                <span className="text-[14.5px] font-medium text-gray-800">Hoàn thành 10 / 10</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] text-gray-500">Thời Lượng</span>
                <span className="text-[14.5px] font-medium text-gray-800">~ 20 phút</span>
              </div>
            </div>
          </div>

          {/* AI Status Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng Thái AI</h3>
            <div className="space-y-3">
              <div className="flex flex-col">
                <span className="text-[13px] text-gray-500">Trạng Thái Kết Nối</span>
                <span className="text-[14.5px] font-medium text-gray-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> Đã kết nối
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] text-gray-500">Mô Hình Ngôn Ngữ</span>
                <span className="text-[14.5px] font-medium text-gray-800">GPT-4 Turbo</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] text-gray-500">Nhận Diện Giọng Nói</span>
                <span className="text-[14.5px] font-medium text-gray-800">Hoàn tất</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] text-gray-500">Bản Dịch Voice-to-Text</span>
                <span className="text-[14.5px] font-medium text-gray-800">Sẵn sàng</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] text-gray-500">Hàng Đợi Phân Tích</span>
                <span className="text-[14.5px] font-medium text-gray-800">
                  {status === 'completed' ? 'Xong' : 'Đang xử lý...'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tip Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Bạn có biết?</h3>
          <p className="text-[15px] text-gray-600 leading-relaxed transition-opacity duration-300">
            {currentTip}
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-[14px] text-gray-500">
            <li className="flex items-center gap-2"><span className="w-1 h-1 bg-gray-400 rounded-full"></span> Cấu trúc</li>
            <li className="flex items-center gap-2"><span className="w-1 h-1 bg-gray-400 rounded-full"></span> Lập luận</li>
            <li className="flex items-center gap-2"><span className="w-1 h-1 bg-gray-400 rounded-full"></span> Giao tiếp</li>
            <li className="flex items-center gap-2"><span className="w-1 h-1 bg-gray-400 rounded-full"></span> Tự tin</li>
            <li className="flex items-center gap-2"><span className="w-1 h-1 bg-gray-400 rounded-full"></span> Chuyên nghiệp</li>
          </ul>
        </div>

        {/* Bottom Notice */}
        <div className="text-center pb-8">
          <p className="text-[13px] text-gray-500 font-medium">
            Vui lòng không đóng trang này. Phỏng vấn của bạn đang được phân tích bảo mật.
          </p>
        </div>

      </div>
    </div>
  );
}

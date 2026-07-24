import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import api from '../../../lib/axios';
import HRInterview from './HRInterview';
import TechnicalInterview from './TechnicalInterview';
import CodingAssessment from './CodingAssessment';

const ROUNDS = ['HR', 'Technical', 'Coding'];

export default function FullMockInterview() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Guard: nếu không có state → về setup
  useEffect(() => {
    if (!state?.fullMockSessionGuid) {
      navigate('/setup');
    }
  }, [state, navigate]);

  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [roundSessionGuids, setRoundSessionGuids] = useState({}); // { HR: guid, Technical: guid }
  const [abandoning, setAbandoning] = useState(false);
  const [questionProgress, setQuestionProgress] = useState({ current: 1, total: 10 });

  const handleQuestionChange = useCallback((current, total) => {
    setQuestionProgress({ current, total });
  }, []);

  const currentRound = ROUNDS[currentRoundIndex]; // 'HR' | 'Technical' | 'Coding'
  const fullMockGuid = state?.fullMockSessionGuid;

  // Gọi khi 1 vòng hoàn thành
  const handleRoundComplete = async (round, roundSessionGuid) => {
    try {
      await api.post(`/full-mock/${fullMockGuid}/complete-round`, {
        round,
        roundSessionGuid,
      });

      setRoundSessionGuids(prev => ({ ...prev, [round]: roundSessionGuid }));

      if (currentRoundIndex < ROUNDS.length - 1) {
        setCurrentRoundIndex(prev => prev + 1);
      } else {
        // Vòng cuối xong → đến trang report
        navigate(`/interview/full-mock/result/${fullMockGuid}`);
      }
    } catch (error) {
      console.error('Lỗi complete-round:', error);
      alert('Có lỗi khi lưu kết quả vòng. Vui lòng thử lại.');
    }
  };

  // Gọi khi user muốn thoát
  const handleAbandon = async () => {
    const confirmed = window.confirm(
      'Bạn có chắc muốn thoát? Các vòng chưa hoàn thành sẽ được hoàn trả quota.'
    );
    if (!confirmed) return;

    setAbandoning(true);
    try {
      await api.post(`/full-mock/${fullMockGuid}/abandon`);
    } catch (error) {
      console.error('Lỗi abandon:', error);
    } finally {
      navigate('/dashboard');
    }
  };

  const handleSkipHR = async () => {
    const confirmed = window.confirm('Bạn có chắc muốn bỏ qua phần HR và đi tiếp đến Technical?');
    if (!confirmed) return;
    await handleRoundComplete('HR', 'skipped-hr-session');
  };

  if (!state?.fullMockSessionGuid) return null;

  return (
    <div className="relative min-h-screen bg-white">
      {/* Progress Header — luôn hiển thị phía trên */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-100 pl-12 pr-6 py-6 flex items-center justify-between relative">
        {/* Progress steps */}
        <div className="flex items-center gap-2">
          {ROUNDS.map((round, idx) => (
            <div key={round} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                idx < currentRoundIndex
                  ? 'bg-slate-800 text-white'
                  : idx === currentRoundIndex
                  ? 'bg-[#b2f396] text-slate-900 font-extrabold'
                  : 'bg-[#f1f5f9] text-slate-450 border border-slate-200'
              }`}>
                {idx < currentRoundIndex && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {round}
              </div>
              {idx < ROUNDS.length - 1 && (
                <div className="w-10 h-px bg-slate-200 border-t border-dashed" />
              )}
            </div>
          ))}
        </div>

        {/* Question progress indicator inside the header - absolutely centered */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
          {Array.from({ length: questionProgress.total }).map((_, idx) => {
            const num = idx + 1;
            const isActive = num === questionProgress.current;
            return (
              <div
                key={num}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#b2f396] text-slate-900 font-bold border border-[#b2f396]'
                    : 'bg-white border border-slate-200 text-slate-400 cursor-default'
                }`}
              >
                {num}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {currentRound === 'HR' && (
            <button
              onClick={handleSkipHR}
              className="flex items-center gap-1 px-4 py-1.5 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-all"
            >
              Bỏ qua vòng HR
            </button>
          )}

          <button
            onClick={handleAbandon}
            disabled={abandoning}
            className="flex items-center gap-1 px-4 py-1.5 text-xs font-bold text-red-500 bg-[#fef2f2] hover:bg-[#fee2e2] border border-[#fee2e2] rounded-lg transition-all"
          >
            <span className="text-sm font-semibold">×</span> {abandoning ? 'Đang thoát...' : 'Thoát'}
          </button>
        </div>
      </div>

      {/* Render vòng hiện tại — truyền onComplete callback */}
      <div className="h-[calc(100vh-80px)] overflow-hidden">
        {currentRound === 'HR' && (
          <HRInterview
            fullMockMode
            role={state.role}
            difficulty={state.difficulty}
            onComplete={(sessionGuid) => handleRoundComplete('HR', sessionGuid)}
            onQuestionChange={handleQuestionChange}
          />
        )}
        {currentRound === 'Technical' && (
          <TechnicalInterview
            fullMockMode
            role={state.role}
            difficulty={state.difficulty}
            stack={state.stack}
            onComplete={(sessionGuid) => handleRoundComplete('Technical', sessionGuid)}
            onQuestionChange={handleQuestionChange}
          />
        )}
        {currentRound === 'Coding' && (
          <CodingAssessment
            fullMockMode
            role={state.role}
            difficulty={state.difficulty}
            stack={state.stack}
            onComplete={(sessionGuid) => handleRoundComplete('Coding', sessionGuid)}
          />
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Video, VideoOff, Mic, MicOff, Check, Loader2 } from 'lucide-react';
import axios from 'axios';
import api from '../../../lib/axios';

// Giả lập Web Speech API cho Transcript
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function HRInterview({ fullMockMode = false, role, difficulty, stack = [], onComplete, onQuestionChange }) {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState(state?.sessionId || null);
  const sessionIdRef = useRef(state?.sessionId || null);
  const isSubmittingRef = useRef(false);

  const updateSessionId = (id) => {
    setSessionId(id);
    sessionIdRef.current = id;
  };

  // ────────────────────────────────────────────────────────
  // STATES
  // ────────────────────────────────────────────────────────
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // States camera & answer
  const [cameraStatus, setCameraStatus] = useState('disabled'); // disabled, loading, enabled, denied
  const [answerState, setAnswerState] = useState('idle'); // idle, preparing, recording, stopped, submitted
  const [draftStatus, setDraftStatus] = useState('idle'); // idle, saving, saved, failed

  // Timers
  const [prepTime, setPrepTime] = useState(30);
  const [answerTime, setAnswerTime] = useState(0);

  // Audio / Video
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const prepTimerRef = useRef(null);
  const answerTimerRef = useRef(null);

  // Answer data
  const [transcript, setTranscript] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [fillerWords, setFillerWords] = useState(0);
  const [voiceAnalysis, setVoiceAnalysis] = useState(null); // null | VoiceAnalysisResponse
  const [analyzingVoice, setAnalyzingVoice] = useState(false);

  // Auto-save debounce
  const draftTimerRef = useRef(null);

  // ────────────────────────────────────────────────────────
  // INIT FETCH
  // ────────────────────────────────────────────────────────
  const analyzeVoice = async (transcriptText, durationSecs) => {
    if (!transcriptText.trim() || durationSecs <= 0) return;
    setAnalyzingVoice(true);
    try {
      const aiUrl = import.meta.env.VITE_AI_URL || 'http://localhost:8000';
      const { data } = await axios.post(`${aiUrl}/ai/voice/analyze`, {
        transcript: transcriptText,
        duration_seconds: durationSecs,
        language: 'vi'
      });
      setVoiceAnalysis(data);
      // Cập nhật fillerWords state từ kết quả phân tích chính xác hơn
      setFillerWords(data.filler_word_count);
    } catch (error) {
      console.error('Voice analysis failed:', error);
      // Không block user nếu phân tích lỗi
    } finally {
      setAnalyzingVoice(false);
    }
  };

  const createHrSession = async () => {
    if (!role || !difficulty) {
      console.error('Missing role or difficulty for HR session');
      return;
    }
    try {
      const { data } = await api.post('/hr-interviews/start', {
        role: role,
        techStack: stack,
        difficulty: difficulty,
        questionMode: "AI_ONLY"
      });
      setSessionId(data.sessionId);
      sessionIdRef.current = data.sessionId;
    } catch (error) {
      console.error('HR start error:', error.response?.data || error);
      alert('Hệ thống đang gặp sự cố, không thể phỏng vấn lúc này. Vui lòng thử lại sau 1 phút nữa.');
    }
  };

  useEffect(() => {
    if (fullMockMode && !sessionId) {
      createHrSession();
    } else if (!fullMockMode && !state?.sessionId) {
      navigate('/setup');
    } else if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (onQuestionChange && session?.totalQuestions) {
      onQuestionChange(currentQIndex + 1, session.totalQuestions);
    }
  }, [currentQIndex, session?.totalQuestions]);

  const fetchSession = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/hr-interviews/${sessionId}`);
      setSession(res.data);
      // Tìm câu chưa trả lời
      const answeredCount = res.data.answeredCount || 0;
      setCurrentQIndex(Math.min(answeredCount, res.data.totalQuestions - 1));
    } catch (error) {
      alert("Lỗi tải phiên phỏng vấn");
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = session?.questions?.[currentQIndex];

  // ────────────────────────────────────────────────────────
  // DRAFT LOGIC
  // ────────────────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (currentQuestion) {
      loadDraft();
    }
  }, [currentQuestion?.questionId]);

  const loadDraft = async () => {
    if (!currentQuestion) return;
    try {
      const res = await api.get(`/hr-interviews/${sessionId}/questions/${currentQuestion.questionId}/draft`);
      if (res.data) {
        setTranscript(res.data.transcript || '');
        setAnswerTime(res.data.durationSeconds || 0);
        setWordCount(res.data.wordCount || 0);
        setFillerWords(res.data.fillerWords || 0);
        // Nếu có draft, khôi phục lại trạng thái stopped để có thể submit
        if (res.data.transcript) {
          setAnswerState('stopped');
        }
      }
    } catch (error) {
      // 404 (ko có draft) thì bỏ qua
    }
  };

  const saveDraft = async (force = false) => {
    if (!currentQuestion) return;
    if (answerState === 'submitted' || answerState === 'idle' || answerState === 'preparing') return;

    setDraftStatus('saving');
    try {
      const payload = {
        questionId: currentQuestion.questionId,
        answerText: transcript,
        transcript: transcript,
        durationSeconds: answerTime,
        wordCount: wordCount,
        fillerWords: fillerWords
      };

      // Lưu local trước
      localStorage.setItem(`hr_draft_${sessionId}_${currentQuestion.questionId}`, JSON.stringify(payload));

      // Gửi lên server
      await api.post(`/hr-interviews/${sessionId}/questions/${currentQuestion.questionId}/draft`, payload);
      setDraftStatus('saved');
    } catch (error) {
      console.error("Lỗi lưu nháp:", error);
      setDraftStatus('failed');
    }
  };

  // Auto save draft khi transcript thay đổi
  useEffect(() => {
    if (answerState === 'recording' || answerState === 'stopped') {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
      draftTimerRef.current = setTimeout(() => {
        saveDraft();
      }, 3000); // 3s auto save
    }
    return () => clearTimeout(draftTimerRef.current);
  }, [transcript, answerState, answerTime]);


  // ────────────────────────────────────────────────────────
  // CAMERA
  // ────────────────────────────────────────────────────────
  const enableCamera = async () => {
    setCameraStatus('loading');
    try {
      const constraints = fullMockMode ? { audio: true } : { video: true, audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;
      if (!fullMockMode && videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraStatus('enabled');
    } catch (err) {
      console.error(err);
      setCameraStatus('denied');
    }
  };

  // ────────────────────────────────────────────────────────
  // TIMERS & RECORDING
  // ────────────────────────────────────────────────────────
  const startPreparation = () => {
    if (cameraStatus !== 'enabled') {
      alert("Vui lòng Enable Camera trước");
      return;
    }
    setAnswerState('preparing');
    setPrepTime(30);
    prepTimerRef.current = setInterval(() => {
      setPrepTime((prev) => {
        if (prev <= 1) {
          clearInterval(prepTimerRef.current);
          startAnswer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startAnswer = () => {
    if (prepTimerRef.current) clearInterval(prepTimerRef.current);
    if (cameraStatus !== 'enabled') {
      alert("Vui lòng Enable Camera");
      return;
    }

    setAnswerState('recording');
    setPrepTime(0);
    setAnswerTime(0);
    setTranscript('');
    setWordCount(0);
    setFillerWords(0);

    // Bật timer
    answerTimerRef.current = setInterval(() => {
      setAnswerTime(prev => prev + 1);
    }, 1000);

    // Bật STT (Speech To Text)
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'vi-VN';

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
        setTranscript(currentTranscript);
        // Fake logic đếm từ
        const words = currentTranscript.trim().split(/\s+/);
        setWordCount(words.length);
        setFillerWords(Math.floor(words.length * 0.05)); // 5% là filler words (mock)
      };

      recognition.start();
      recognitionRef.current = recognition;
    } else {
      // Mock nếu ko support
      let mockWords = 0;
      recognitionRef.current = setInterval(() => {
        mockWords++;
        setTranscript(prev => prev + " mock_word");
        setWordCount(mockWords);
      }, 2000);
    }
  };

  const stopAnswer = () => {
    if (answerTimerRef.current) clearInterval(answerTimerRef.current);
    if (SpeechRecognition && recognitionRef.current) {
      recognitionRef.current.stop();
    } else {
      clearInterval(recognitionRef.current);
    }
    setAnswerState('stopped');
    saveDraft(true); // Save force khi stop
    analyzeVoice(transcript, answerTime);
  };

  // ────────────────────────────────────────────────────────
  // SUBMIT
  // ────────────────────────────────────────────────────────
  const submitAnswer = async () => {
    // Guard: chặn double-submit
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    try {
      setDraftStatus('saving');
      await api.post(`/hr-interviews/${sessionId}/answers`, {
        questionId: currentQuestion.questionId,
        answerText: transcript,
        transcript: transcript,
        durationSeconds: answerTime,
        wordCount: wordCount,
        fillerWords: fillerWords,
        voiceAnalysis: voiceAnalysis ? JSON.stringify(voiceAnalysis) : null
      });

      setAnswerState('submitted');
      // Clear draft
      await api.delete(`/hr-interviews/${sessionId}/questions/${currentQuestion.questionId}/draft`).catch(() => {});
      localStorage.removeItem(`hr_draft_${sessionId}_${currentQuestion.questionId}`);

      // Chuyển câu or Finish
      if (currentQIndex < (session.totalQuestions - 1)) {
        setCurrentQIndex(prev => prev + 1);
        resetState();
      } else {
        finishInterview();
      }

    } catch (error) {
      // 409 = câu đã nộp rồi → bỏ qua, tự động chuyển câu tiếp
      if (error.response?.status === 409) {
        console.warn('Câu hỏi đã được nộp trước đó, chuyển tiếp.');
        if (currentQIndex < (session.totalQuestions - 1)) {
          setCurrentQIndex(prev => prev + 1);
          resetState();
        } else {
          finishInterview();
        }
      } else {
        alert("Lỗi nộp bài: " + (error.response?.data?.message || ""));
        setDraftStatus('failed');
      }
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleInterviewComplete = (completedSessionGuid) => {
    if (fullMockMode && onComplete) {
      onComplete(completedSessionGuid);
    } else {
      navigate(`/interviews/hr/${completedSessionGuid}/result`);
    }
  };

  const finishInterview = () => {
    handleInterviewComplete(sessionIdRef.current);
  };

  const resetState = () => {
    setAnswerState('idle');
    setTranscript('');
    setAnswerTime(0);
    setPrepTime(30);
    setWordCount(0);
    setFillerWords(0);
    setVoiceAnalysis(null);
    setAnalyzingVoice(false);
    setDraftStatus('idle');
  };

  // Dọn dẹp
  useEffect(() => {
    return () => {
      if (prepTimerRef.current) clearInterval(prepTimerRef.current);
      if (answerTimerRef.current) clearInterval(answerTimerRef.current);
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current && SpeechRecognition) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Format time (MM:SS)
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Auto-enable camera silently on load in fullMockMode
  useEffect(() => {
    if (fullMockMode && sessionId) {
      enableCamera();
    }
  }, [sessionId, fullMockMode]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="w-8 h-8 animate-spin text-black" /></div>;
  }

  if (fullMockMode) {
    return (
      <div className="bg-white text-gray-800 font-sans px-4 md:px-12 py-4 w-full flex flex-col items-center">
        <div className="w-full max-w-[1300px] flex flex-col gap-4">
          {/* Main Question & Recording Card */}
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 md:p-12 flex flex-col gap-6">
            {/* Question section */}
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-black text-black tracking-tight">
                Câu {currentQIndex + 1}:
              </h2>
              <p className="text-lg md:text-2xl font-normal text-slate-800 leading-relaxed">
                {currentQuestion?.questionText || "Đang tải câu hỏi..."}
              </p>
            </div>

            {/* Transcript / Input Area */}
            <div className="relative w-full">
              <textarea
                value={transcript}
                readOnly
                placeholder="Câu trả lời của bạn sẽ được ghi tại đây."
                className="w-full h-48 p-6 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-100 text-gray-700 resize-none transition-all pr-12 text-sm md:text-base"
              />
              <div className="absolute top-2 right-4 text-xs font-medium text-gray-400">
                {wordCount} từ
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100 shrink-0">
              {/* Waveform visualizer & Time */}
              <div className="flex items-center gap-4">
                <div className="text-sm font-bold text-slate-800 tracking-wider">
                  thời gian: {formatTime(answerTime)}
                </div>
                {answerState === 'submitted' && (
                  <div className="flex items-center gap-1.5 text-green-600 font-bold text-xs bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                    <Check className="w-3.5 h-3.5" /> Đã ghi nhận câu trả lời
                  </div>
                )}
              </div>

              <button
                onClick={answerState === 'recording' ? stopAnswer : startAnswer}
                className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all shadow-sm ${answerState === 'recording'
                  ? 'bg-red-500 text-white animate-pulse border border-red-500'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
              >
                {answerState === 'recording' ? (
                  <Mic className="w-5 h-5 md:w-6 md:h-6 text-white" />
                ) : (
                  <Mic className="w-5 h-5 md:w-6 md:h-6 text-slate-600" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-end shrink-0">
            <button
              onClick={submitAnswer}
              disabled={answerState !== 'stopped' && answerState !== 'submitted' || transcript.trim().length < 20}
              className="px-10 py-3.5 bg-[#b2f396] hover:bg-[#9de080] text-slate-900 font-extrabold rounded-2xl transition-all shadow-sm disabled:opacity-50 text-sm"
              title={transcript.trim().length < 20 ? "Vui lòng trả lời ít nhất 20 ký tự" : ""}
            >
              Hoàn thành
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans p-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-black rounded-full"></div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 leading-none mb-1">AI Interview Platform</h1>
              <p className="text-[13px] text-gray-500">Interview Type: HR Interview</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[13px] text-gray-600">
            <span>Role: {session?.role}</span>
            <span>Level: {session?.difficulty}</span>
            <span>
              Draft:
              {draftStatus === 'saving' && <span className="text-yellow-600 ml-1">Saving...</span>}
              {draftStatus === 'saved' && <span className="text-green-600 ml-1">Saved</span>}
              {draftStatus === 'failed' && <span className="text-red-600 ml-1">Failed</span>}
              {draftStatus === 'idle' && <span className="text-gray-400 ml-1">-</span>}
            </span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Video Section */}
            <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-4 shadow-sm bg-white">
              <div className="flex justify-between items-center">
                <span className={`px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium ${answerState === 'recording' ? 'text-red-600 border-red-200 bg-red-50' : 'text-gray-600'}`}>
                  {answerState === 'recording' ? 'Recording...' : 'Not recording'}
                </span>
                <div className="flex items-center gap-2">
                  <button className={`w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center ${cameraStatus === 'enabled' ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <Video className="w-4 h-4" />
                  </button>
                  <button className={`w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center ${answerState === 'recording' ? 'text-red-600 bg-red-50 border-red-200' : 'text-gray-500 hover:bg-gray-50'}`}>
                    <Mic className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600 font-medium">
                    Connection
                  </span>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-200 rounded-lg h-[350px] flex flex-col items-center justify-center bg-gray-50/50 overflow-hidden relative">
                {cameraStatus === 'disabled' && (
                  <>
                    <p className="text-gray-500 text-sm mb-4">Camera preview will appear here</p>
                    <button onClick={enableCamera} className="px-5 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800">
                      Enable Camera
                    </button>
                  </>
                )}
                {cameraStatus === 'loading' && <Loader2 className="w-8 h-8 animate-spin text-gray-500" />}
                {cameraStatus === 'denied' && <p className="text-red-500 text-sm">Quyền truy cập Camera bị từ chối.</p>}

                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`w-full h-full object-cover ${cameraStatus === 'enabled' ? 'block' : 'hidden'}`}
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="flex items-end gap-1.5 h-6">
                  <div className={`w-1.5 bg-gray-300 rounded-sm ${answerState === 'recording' ? 'animate-bounce bg-black h-4' : 'h-3'}`}></div>
                  <div className={`w-1.5 bg-gray-300 rounded-sm ${answerState === 'recording' ? 'animate-bounce bg-black h-5 delay-75' : 'h-4'}`}></div>
                  <div className={`w-1.5 bg-gray-300 rounded-sm ${answerState === 'recording' ? 'animate-bounce bg-black h-6 delay-150' : 'h-6'}`}></div>
                  <div className={`w-1.5 bg-gray-300 rounded-sm ${answerState === 'recording' ? 'animate-bounce bg-black h-5 delay-75' : 'h-5'}`}></div>
                  <div className={`w-1.5 bg-gray-300 rounded-sm ${answerState === 'recording' ? 'animate-bounce bg-black h-3' : 'h-7'}`}></div>
                </div>
                <div className="text-sm text-gray-600">
                  Recording duration: {formatTime(answerTime)}
                </div>
                {answerState === 'recording' ? (
                  <button onClick={stopAnswer} className="px-5 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700">
                    Stop Recording
                  </button>
                ) : (
                  <button onClick={startAnswer} disabled={cameraStatus !== 'enabled' || answerState === 'stopped'} className="px-5 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50">
                    {answerState === 'stopped' ? 'Finished Recording' : 'Start Recording'}
                  </button>
                )}
              </div>
            </div>

            {/* Transcript Section */}
            <div className="border border-gray-200 rounded-xl p-5 shadow-sm bg-white">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Answer Transcript</h2>
              <div className="border border-gray-200 rounded-lg p-4 min-h-[120px] mb-4 bg-gray-50/50">
                <p className="text-gray-700 text-[15px]">{transcript || "Your answer transcript will appear here after recording starts."}</p>
              </div>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>Word count: {wordCount}</span>
                <span>Duration: {formatTime(answerTime)}</span>
                <span>Filler words: {fillerWords}</span>
              </div>

              {/* Voice Analysis — hiển thị sau khi submit nếu có */}
              {analyzingVoice && (
                <div className="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <p className="text-[10px] text-slate-500 animate-pulse font-medium">Đang phân tích giọng nói...</p>
                </div>
              )}

              {voiceAnalysis && !fullMockMode && (
                <div className="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">
                    Phân tích giọng nói
                  </p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-white border border-slate-200 rounded-full text-slate-600">
                      Tốc độ: {voiceAnalysis.speaking_rate} ({voiceAnalysis.words_per_minute} từ/phút)
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${voiceAnalysis.filler_word_count > 5
                      ? 'bg-red-50 border border-red-200 text-red-600'
                      : 'bg-white border border-slate-200 text-slate-600'
                      }`}>
                      Filler words: {voiceAnalysis.filler_word_count} lần
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-white border border-slate-200 rounded-full text-slate-600">
                      Độ rõ: {voiceAnalysis.clarity_score}/100
                    </span>
                  </div>
                  {voiceAnalysis.feedback && (
                    <p className="text-[10px] text-slate-500 leading-relaxed">{voiceAnalysis.feedback}</p>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 flex flex-col gap-6">

            {/* Question Card */}
            <div className="border border-gray-200 rounded-2xl p-6 shadow-sm bg-white">
              <p className="text-[14px] text-gray-500 mb-3 font-medium">Question {currentQIndex + 1} of {session?.totalQuestions}</p>
              <h2 className="text-[18px] leading-relaxed font-semibold text-gray-900">
                {currentQuestion?.questionText}
              </h2>
            </div>

            {/* Timers & Buttons */}
            <div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className={`border rounded-xl p-4 shadow-sm ${answerState === 'preparing' ? 'bg-black text-white border-black' : 'bg-white border-gray-200'}`}>
                  <p className={`text-[13px] mb-1 ${answerState === 'preparing' ? 'text-gray-300' : 'text-gray-500'}`}>Preparation Timer</p>
                  <p className="text-3xl font-medium">{formatTime(prepTime)}</p>
                </div>
                <div className={`border rounded-xl p-4 shadow-sm ${answerState === 'recording' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-gray-200 text-gray-800'}`}>
                  <p className={`text-[13px] mb-1 ${answerState === 'recording' ? 'text-red-500' : 'text-gray-500'}`}>Answer Timer</p>
                  <p className="text-3xl font-medium">{formatTime(answerTime)}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={startPreparation}
                  disabled={cameraStatus !== 'enabled' || answerState !== 'idle'}
                  className="px-4 py-2 bg-black text-white text-[13.5px] font-medium rounded-full hover:bg-gray-800 disabled:opacity-50 flex-1">
                  Start Preparation
                </button>
                <button
                  onClick={startAnswer}
                  disabled={cameraStatus !== 'enabled' || answerState === 'recording' || answerState === 'stopped'}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-800 text-[13.5px] font-medium rounded-full hover:bg-gray-50 disabled:opacity-50 flex-1">
                  Start Answer
                </button>
              </div>
            </div>

            {/* STAR Tips */}
            <div className="border border-gray-200 rounded-xl p-5 shadow-sm bg-white">
              <h3 className="text-lg font-bold mb-3 text-gray-900">STAR Tips</h3>
              <div className="space-y-3 text-[14px] text-gray-800 leading-relaxed">
                <p><span className="font-bold">S — Situation:</span> Briefly describe the context and challenge.</p>
                <p><span className="font-bold">T — Task:</span> Explain your specific responsibility.</p>
                <p><span className="font-bold">A — Action:</span> Share the steps you took and why.</p>
                <p><span className="font-bold">R — Result:</span> Summarize the measurable outcome and learning.</p>
              </div>
            </div>

            {/* Question Progress */}
            <div className="border border-gray-200 rounded-xl p-5 shadow-sm bg-white">
              <h3 className="text-[15px] font-medium mb-4 text-gray-800">Question Progress</h3>
              <div className="flex flex-wrap gap-2.5">
                {Array.from({ length: session?.totalQuestions || 10 }).map((_, i) => {
                  if (i < currentQIndex) {
                    return (
                      <div key={i} className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white">
                        <Check className="w-4 h-4" />
                      </div>
                    );
                  } else if (i === currentQIndex) {
                    return (
                      <div key={i} className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-sm font-medium">
                        {i + 1}
                      </div>
                    );
                  } else {
                    return (
                      <div key={i} className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 text-sm font-medium">
                        {i + 1}
                      </div>
                    );
                  }
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="mt-6 border border-gray-200 rounded-xl p-4 bg-white shadow-sm flex justify-end gap-3">
          <button onClick={() => saveDraft(true)} disabled={answerState === 'idle' || answerState === 'preparing'} className="px-6 py-2 border border-gray-300 rounded-full text-[14px] font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50">
            Save Draft
          </button>
          <button
            onClick={submitAnswer}
            disabled={answerState !== 'stopped' || transcript.trim().length < 20}
            className="px-6 py-2 bg-black text-white rounded-full text-[14px] font-medium hover:bg-gray-800 disabled:opacity-50"
            title={transcript.trim().length < 20 ? "Vui lòng trả lời ít nhất 20 ký tự" : ""}
          >
            Submit Answer & Next
          </button>
        </div>

      </div>
    </div>
  );
}

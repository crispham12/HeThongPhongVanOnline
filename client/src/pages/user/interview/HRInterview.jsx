import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Video, Mic, Check, Loader2 } from 'lucide-react';
import api from '../../../lib/axios';

// Giả lập Web Speech API cho Transcript
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function HRInterview() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const sessionId = state?.sessionId;

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

  // Auto-save debounce
  const draftTimerRef = useRef(null);

  // ────────────────────────────────────────────────────────
  // INIT FETCH
  // ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) {
      navigate('/interview/setup');
      return;
    }
    fetchSession();
  }, [sessionId]);

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
  useEffect(() => {
    if (currentQuestion) {
      loadDraft();
    }
  }, [currentQuestion]);

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
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
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
  };

  // ────────────────────────────────────────────────────────
  // SUBMIT
  // ────────────────────────────────────────────────────────
  const submitAnswer = async () => {
    try {
      setDraftStatus('saving'); // Dùng spinner của draft cho chung
      await api.post(`/hr-interviews/${sessionId}/answers`, {
        questionId: currentQuestion.questionId,
        answerText: transcript,
        transcript: transcript,
        durationSeconds: answerTime,
        wordCount: wordCount,
        fillerWords: fillerWords
      });
      
      setAnswerState('submitted');
      // Clear draft
      await api.delete(`/hr-interviews/${sessionId}/questions/${currentQuestion.questionId}/draft`).catch(()=>console.log("Delete draft failed"));
      localStorage.removeItem(`hr_draft_${sessionId}_${currentQuestion.questionId}`);

      // Chuyển câu or Finish
      if (currentQIndex < (session.totalQuestions - 1)) {
         setCurrentQIndex(prev => prev + 1);
         resetState();
      } else {
         finishInterview();
      }

    } catch (error) {
      alert("Lỗi nộp bài: " + (error.response?.data?.message || ""));
      setDraftStatus('failed');
    }
  };

  const finishInterview = () => {
     navigate(`/interview/analysis/${sessionId}`);
  };

  const resetState = () => {
    setAnswerState('idle');
    setTranscript('');
    setAnswerTime(0);
    setPrepTime(30);
    setWordCount(0);
    setFillerWords(0);
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

  if (loading) {
     return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="w-8 h-8 animate-spin text-black" /></div>;
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
                  <div className={`w-1.5 bg-gray-300 rounded-sm ${answerState==='recording'?'animate-bounce bg-black h-4':'h-3'}`}></div>
                  <div className={`w-1.5 bg-gray-300 rounded-sm ${answerState==='recording'?'animate-bounce bg-black h-5 delay-75':'h-4'}`}></div>
                  <div className={`w-1.5 bg-gray-300 rounded-sm ${answerState==='recording'?'animate-bounce bg-black h-6 delay-150':'h-6'}`}></div>
                  <div className={`w-1.5 bg-gray-300 rounded-sm ${answerState==='recording'?'animate-bounce bg-black h-5 delay-75':'h-5'}`}></div>
                  <div className={`w-1.5 bg-gray-300 rounded-sm ${answerState==='recording'?'animate-bounce bg-black h-3':'h-7'}`}></div>
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
            </div>

          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Question Card */}
            <div className="border border-gray-200 rounded-xl p-5 shadow-sm bg-white">
              <p className="text-sm text-gray-500 mb-3">Question {currentQIndex + 1} of {session?.totalQuestions}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 border border-gray-200 rounded-full text-[13px] text-gray-600">
                  Category: {currentQuestion?.category}
                </span>
                <span className="px-3 py-1 border border-gray-200 rounded-full text-[13px] text-gray-600">
                  Suggested Method STAR
                </span>
              </div>
              <h2 className="text-[20px] leading-[1.4] font-semibold text-gray-900">
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
          <button onClick={()=>saveDraft(true)} disabled={answerState==='idle' || answerState==='preparing'} className="px-6 py-2 border border-gray-300 rounded-full text-[14px] font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50">
            Save Draft
          </button>
          <button 
            onClick={submitAnswer} 
            disabled={answerState !== 'stopped'} 
            className="px-6 py-2 bg-black text-white rounded-full text-[14px] font-medium hover:bg-gray-800 disabled:opacity-50">
            Submit Answer & Next
          </button>
        </div>

      </div>
    </div>
  );
}

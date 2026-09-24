import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BrainCircuit, Timer, ChevronRight, Loader2, CheckCircle, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../lib/axios';
import { practiceQuestionApi } from '../../../services/questionBankApi';
const renderFormattedQuestion = (text) => {
  if (!text) return 'Đang tải câu hỏi...';

  // Format các tag `code` nằm trong backticks
  const formatCodeTags = (str) => {
    const parts = str.split(/(`[^`]+`)/g);
    return parts.map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="px-1.5 py-0.5 mx-0.5 bg-slate-100 border border-slate-200 text-sm font-semibold font-mono rounded text-slate-800">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  // Tách intro và các câu hỏi phụ 1., 2., 3.
  const parts = text.split(/(\d+\.\s+)/g);

  if (parts.length <= 1) {
    return <p className="text-lg font-normal text-slate-800 leading-relaxed">{formatCodeTags(text)}</p>;
  }

  const intro = parts[0];
  const items = [];
  for (let i = 1; i < parts.length; i += 2) {
    const num = parts[i];
    const itemText = parts[i + 1] || '';
    items.push({ num, text: itemText });
  }

  return (
    <div className="space-y-4">
      {intro.trim() && (
        <p className="text-[15px] font-medium text-slate-600 bg-slate-50 border-l-4 border-slate-300 p-3 rounded-r-xl leading-relaxed">
          {formatCodeTags(intro)}
        </p>
      )}
      <div className="space-y-2.5 pl-1">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2.5">
            <span className="flex-shrink-0 w-5 h-5 bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700 rounded-full flex items-center justify-center mt-1">
              {item.num.replace('.', '').trim()}
            </span>
            <p className="text-[14px] text-slate-700 leading-relaxed flex-1 pt-0.5">
              {formatCodeTags(item.text)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function TechnicalInterview({ fullMockMode = false, role, difficulty, stack, onComplete, onQuestionChange }) {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [sessionId, setSessionId] = useState(state?.sessionId || null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [qCount, setQCount] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(3);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Silence detection
  const [silenceWarning, setSilenceWarning] = useState(false);
  const silenceTimerRef = useRef(null);
  const silenceWarnRef = useRef(null);
  const audioContextRef = useRef(null);
  const silenceCheckRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const SILENCE_TIMEOUT_MS = 60000;  // 1 phút
  const SILENCE_WARN_MS = 30000;     // 30 giây
  const SILENCE_THRESHOLD = 0.01;

  const [answerTime, setAnswerTime] = useState(0);
  const answerTimerRef = useRef(null);

  const startAnswerTimer = () => {
    if (answerTimerRef.current) clearInterval(answerTimerRef.current);
    setAnswerTime(0);
    answerTimerRef.current = setInterval(() => {
      setAnswerTime(prev => prev + 1);
    }, 1000);
  };

  const stopAnswerTimer = () => {
    if (answerTimerRef.current) {
      clearInterval(answerTimerRef.current);
      answerTimerRef.current = null;
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (question) {
      startAnswerTimer();
    }
    return () => stopAnswerTimer();
  }, [question]);

  const clearSilenceDetection = () => {
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
    if (silenceWarnRef.current) { clearTimeout(silenceWarnRef.current); silenceWarnRef.current = null; }
    if (silenceCheckRef.current) { clearInterval(silenceCheckRef.current); silenceCheckRef.current = null; }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      speechRecognitionRef.current = null;
    }
    setSilenceWarning(false);
  };

  const toggleVoiceInput = async () => {
    if (isRecording) {
      clearSilenceDetection();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          clearSilenceDetection();
          stream.getTracks().forEach(track => track.stop());
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          setIsTranscribing(true);
          try {
            const transcribedText = await practiceQuestionApi.transcribeAudio(audioBlob);
            setAnswer((prev) => (prev ? prev + ' ' + transcribedText : transcribedText));
          } catch (error) {
            console.error("Transcription error:", error);
            alert("Lỗi khi nhận diện giọng nói. Vui lòng thử lại.");
          } finally {
            setIsTranscribing(false);
          }
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
        setIsRecording(true);
        setSilenceWarning(false);

        // ── Silence & Real Speech detection ──────────────────────────────────
        try {
          const resetTimers = () => {
            if (silenceWarnRef.current) { clearTimeout(silenceWarnRef.current); silenceWarnRef.current = null; }
            if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
            setSilenceWarning(false);
            
            silenceWarnRef.current = setTimeout(() => setSilenceWarning(true), SILENCE_WARN_MS);
            silenceTimerRef.current = setTimeout(() => {
              if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                console.info('[Technical] Không có tiếng người nói 1 phút → tự tắt mic');
                mediaRecorderRef.current.stop();
                setIsRecording(false);
              }
            }, SILENCE_TIMEOUT_MS);
          };

          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'vi-VN';

            recognition.onresult = (event) => {
              resetTimers();
            };
            
            recognition.onend = () => {
              if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                try { recognition.start(); } catch(e){}
              }
            };

            recognition.start();
            speechRecognitionRef.current = recognition;
          }

          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 512;
          source.connect(analyser);
          const dataArray = new Uint8Array(analyser.frequencyBinCount);

          silenceCheckRef.current = setInterval(() => {
            analyser.getByteFrequencyData(dataArray);
            const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length / 255;
            if (avg > SILENCE_THRESHOLD) {
               if (!SpeechRecognition) {
                   resetTimers();
               }
            }
          }, 500);

          // Khởi động lần đầu
          resetTimers();
        } catch (audioErr) {
          console.warn('Silence/Speech detection không khả dụng:', audioErr);
        }
        // ──────────────────────────────────────────────────────

      } catch (err) {
        alert("Không thể truy cập microphone. Vui lòng cấp quyền trong trình duyệt.");
      }
    }
  };

  const createTechnicalSession = async () => {
    try {
      const stackStr = Array.isArray(stack) ? stack.join(', ') : (stack || '');
      const { data } = await api.post('/technical-interviews/start', {
        role: role,
        techStack: stackStr,
        level: difficulty
      });
      setSessionId(data.sessionId);
      setTotalQuestions(3);
      if (data.currentQuestion) {
        setQuestion(data.currentQuestion.content);
        setQCount(data.currentQuestion.questionIndex);
      }
    } catch (error) {
      alert('Không thể tạo phiên Technical. Vui lòng thử lại.');
    }
  };

  useEffect(() => {
    if (fullMockMode && !sessionId) {
      createTechnicalSession();
    } else if (!fullMockMode && !state?.sessionId) {
      navigate('/setup');
    } else if (sessionId) {
      fetchNextQuestion(sessionId);
    }
    return () => {
      clearSilenceDetection();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [sessionId]);

  useEffect(() => {
    if (onQuestionChange) {
      onQuestionChange(qCount, totalQuestions);
    }
  }, [qCount, totalQuestions, onQuestionChange]);

  const fetchNextQuestion = async (sid) => {
    const activeSid = sid || sessionId;
    if (!activeSid) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/technical-interviews/${activeSid}`);
      setTotalQuestions(3);
      if (data.status === 'Completed' || !data.currentQuestion) {
        handleInterviewComplete(activeSid);
      } else {
        setQuestion(data.currentQuestion.content);
        setQCount(data.currentQuestion.questionIndex);
        setAnswer('');
      }
    } catch (error) {
      console.error("Lỗi lấy câu hỏi:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInterviewComplete = async (completedSessionId) => {
    if (fullMockMode && onComplete) {
      setSubmitting(true);
      try {
        await api.get(`/technical-interviews/${completedSessionId}/result`);
      } catch (err) {
        console.error("Lỗi tạo báo cáo technical", err);
      } finally {
        setSubmitting(false);
        onComplete(String(completedSessionId));
      }
    } else {
      navigate(`/interview/technical/${completedSessionId}/result`);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data } = await api.post(`/technical-interviews/${sessionId}/answers`, {
        answer: answer,
        durationSeconds: answerTime
      });

      if (data.questionIndex > 3 || data.stage === 'Completed') {
        handleInterviewComplete(sessionId);
      } else {
        setQCount(data.questionIndex);
        setQuestion(data.content);
        setAnswer('');
      }
    } catch (error) {
      alert("Lỗi nộp bài.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="w-8 h-8 animate-spin text-black" /></div>
  );

  return (
    <div className="bg-white text-gray-800 font-sans px-4 md:px-12 py-4 w-full flex flex-col items-center">
      <div className="w-full max-w-[1300px] flex flex-col gap-4">
        {/* Main Question Card */}
        <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 md:p-12 flex flex-col gap-6">
          {/* Question section */}
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-black tracking-tight">
              Câu {qCount}:
            </h2>
            <div className="pt-2">
              {renderFormattedQuestion(question)}
            </div>
          </div>

          {/* Textarea */}
          <div className="relative w-full">
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              readOnly={fullMockMode}
              placeholder={fullMockMode ? "Câu trả lời của bạn sẽ được ghi nhận bằng giọng nói. Vui lòng bấm biểu tượng Micro phía dưới để bắt đầu nói..." : "Nhập câu trả lời chi tiết của bạn tại đây..."}
              className="w-full h-48 p-6 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-100 text-gray-700 resize-none transition-all pr-12 text-sm md:text-base"
            />
          </div>

          {/* Bottom Controls */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <div className="flex flex-col gap-1">
              <div className="text-sm font-bold text-slate-800 tracking-wider">
                thời gian: {formatTime(answerTime)}
              </div>
              {silenceWarning && isRecording && (
                <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs bg-amber-50 border border-amber-200 px-3 py-1 rounded-full animate-pulse">
                  ⚠️ Không phát hiện giọng nói — mic sẽ tắt sau 30s
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={toggleVoiceInput}
              disabled={isTranscribing}
              className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all shadow-sm ${
                isTranscribing
                  ? 'bg-amber-100 text-amber-600 border border-amber-300'
                  : isRecording
                  ? 'bg-red-500  animate-pulse border border-red-500'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {isTranscribing ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> : <Mic className="w-5 h-5 md:w-6 md:h-6" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end shrink-0">
          <button
            onClick={handleSubmit}
            disabled={!answer.trim() || submitting || isTranscribing}
            className="px-10 py-3.5 bg-[#b2f396] hover:bg-[#9de080] text-slate-900 font-extrabold rounded-2xl transition-all shadow-sm disabled:opacity-50 text-sm flex items-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Hoàn thành'}
            {!submitting && qCount < totalQuestions && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

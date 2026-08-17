import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Code2, Play, Send, Loader2, Info, CheckCircle2,
  Timer, ShieldCheck, Save, ChevronRight, Star, Share2,
  Terminal, Monitor, Settings, ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import api from '../../../lib/axios';

export default function CodingAssessment({ fullMockMode = false, role, difficulty, stack, onComplete }) {
  const navigate = useNavigate();

  // Problems
  const [problems, setProblems] = useState([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [loadingProblems, setLoadingProblems] = useState(true);

  // Per-problem state
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);

  // Results
  const [testResults, setTestResults] = useState(null); // null | { passed, total, results }
  const [problemScores, setProblemScores] = useState([]); // [{ score, testScore, ... }]
  const [submitted, setSubmitted] = useState(false);
  const [isRunResult, setIsRunResult] = useState(false);

  // Timer
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    setLoadingProblems(true);
    try {
      const aiUrl = import.meta.env.VITE_AI_URL || 'http://localhost:8000';
      const { data } = await axios.post(`${aiUrl}/ai/coding/full-mock/generate`, {
        role: role || 'backend',
        difficulty_level: difficulty || 'fresher',
        stack: stack || []
      });
      setProblems(data.problems);
      if (data.problems && data.problems[0]) {
        setCode(data.problems[0].starter_code?.[language] || '');
      }
    } catch (error) {
      console.error(error);
      alert('Không thể tải bài coding. Vui lòng thử lại.');
    } finally {
      setLoadingProblems(false);
    }
  };

  // Timer Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          handleCodingComplete();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [problems, problemScores]);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Handle language change and update starter code
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    const currentProblem = problems[currentProblemIndex];
    if (currentProblem) {
      setCode(currentProblem.starter_code?.[lang] || '');
    }
  };

  // Sync editor with current problem and reset results
  useEffect(() => {
    if (problems.length > 0 && currentProblemIndex < problems.length) {
      setCode(problems[currentProblemIndex].starter_code?.[language] || '');
      setTestResults(null);
      setSubmitted(false);
      setIsRunResult(false);
    }
  }, [currentProblemIndex, problems]);

  // Run public test cases via Piston
  const handleRun = async () => {
    if (!code.trim() || running || submitted) return;
    setRunning(true);
    setTestResults(null);

    const currentProblem = problems[currentProblemIndex];
    // Run the first 3 test cases (public)
    const publicTests = currentProblem.test_cases.slice(0, 3);

    try {
      const aiUrl = import.meta.env.VITE_AI_URL || 'http://localhost:8000';
      const formattedTestCases = publicTests.map(tc => ({
        input: tc.input,
        expectedOutput: tc.expected_output,
        isHidden: false
      }));

      const { data } = await axios.post(`${aiUrl}/ai/practice/run`, {
        language: language,
        code: code,
        testCases: formattedTestCases,
        functionName: 'solution'
      });

      const mappedResults = data.results.map(r => ({
        input: r.input,
        expected: r.expectedOutput,
        actual: r.actualOutput || r.status,
        passed: r.passed
      }));

      setTestResults({ passed: data.passedTestCases, total: data.totalTestCases, results: mappedResults });
      setIsRunResult(true);
    } catch (error) {
      console.error(error);
      alert('Lỗi chạy code trên máy chủ. Vui lòng thử lại.');
    } finally {
      setRunning(false);
    }
  };

  // Submit problem and call AI evaluation
  const handleSubmitProblem = async () => {
    if (submitted || submitting || !code.trim()) return;
    setSubmitting(true);

    const currentProblem = problems[currentProblemIndex];

    try {
      // Run ALL test cases via Backend Sandbox
      const aiUrl = import.meta.env.VITE_AI_URL || 'http://localhost:8000';
      const formattedTestCases = currentProblem.test_cases.map(tc => ({
        input: tc.input,
        expectedOutput: tc.expected_output,
        isHidden: false
      }));

      const { data: runData } = await axios.post(`${aiUrl}/ai/practice/run`, {
        language: language,
        code: code,
        testCases: formattedTestCases,
        functionName: 'solution'
      });

      const allResults = runData.results.map(r => ({
        input: r.input,
        expected: r.expectedOutput,
        actual: r.actualOutput || r.status,
        passed: r.passed
      }));

      const passedCount = runData.passedTestCases;

      // AI evaluation for quality & complexity
      const evalResponse = await axios.post(`${aiUrl}/ai/coding/full-mock/evaluate`, {
        problem_title: currentProblem.title,
        problem_description: currentProblem.description,
        user_code: code,
        language: language,
        test_results: allResults,
        passed_count: passedCount,
        total_count: allResults.length
      });

      const score = evalResponse.data;
      setProblemScores(prev => [...prev, {
        problemIndex: currentProblemIndex,
        title: currentProblem.title,
        difficulty: currentProblem.difficulty,
        score: score.score,
        testScore: score.test_score,
        qualityScore: score.quality_score,
        complexityScore: score.complexity_score,
        feedback: score.feedback,
        codeQualityNotes: score.code_quality_notes,
        complexityNotes: score.complexity_notes,
        improvementSuggestions: score.improvement_suggestions,
        passedCount: passedCount,
        totalCount: allResults.length,
        userCode: code,
        language: language
      }]);

      setSubmitted(true);
      setTestResults({ passed: passedCount, total: allResults.length, results: allResults });
      setIsRunResult(false);
    } catch (error) {
      console.error(error);
      setProblemScores(prev => [...prev, {
        problemIndex: currentProblemIndex,
        title: currentProblem.title,
        difficulty: currentProblem.difficulty,
        score: 0, testScore: 0, qualityScore: 0, complexityScore: 0,
        feedback: 'Lỗi khi chấm bài.',
        passedCount: 0, totalCount: currentProblem.test_cases.length,
        userCode: code, language: language
      }]);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextProblem = () => {
    if (currentProblemIndex < problems.length - 1) {
      setCurrentProblemIndex(prev => prev + 1);
    } else {
      handleCodingComplete();
    }
  };

  const handleCodingComplete = async () => {
    if (!fullMockMode || !onComplete) {
      navigate('/interview/coding/result');
      return;
    }
    try {
      const { data } = await api.post('/interview/start', {
        role: role || 'backend',
        stack: stack || [],
        difficulty: difficulty || 'fresher',
        type: 'coding',
      });

      // Calculate overall score (0-10) and divide by the total number of problems
      const totalProblems = problems.length || 1;
      const avgScore = problemScores.reduce((sum, item) => sum + (item.score || 0), 0) / totalProblems;
      const overallScore = avgScore / 10.0; 
      const overallFeedback = JSON.stringify(problemScores);

      // Complete session to save score & feedback in InterviewSessions table
      await api.post('/interview/complete-session', {
        sessionId: data.sessionId,
        overallScore: overallScore,
        overallFeedback: overallFeedback
      });

      onComplete(String(data.sessionId), problemScores);
    } catch (error) {
      console.error(error);
      alert('Không thể lưu kết quả. Vui lòng thử lại.');
    }
  };

  if (loadingProblems) {
    return (
      <div className="fixed inset-0 bg-[#f8f9fa] flex flex-col items-center justify-center gap-4 z-[200]">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium animate-pulse">AI đang chuẩn bị bài tập coding...</p>
      </div>
    );
  }

  const currentProblem = problems[currentProblemIndex];

  return (
    <div className="fixed inset-0 bg-[#f8f9fa] z-[100] flex flex-col font-sans text-[13px]">
      {/* Top Navigation Bar */}
      <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-primary-600 rounded flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">InterviewPro AI</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Timer className="w-4 h-4 text-primary-600" />
            <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Progress Tracker and Language Select */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            {problems.map((p, idx) => (
              <div key={idx} className={`px-3 py-1 rounded-full text-[10px] font-bold ${idx < currentProblemIndex ? 'bg-green-100 text-green-700' :
                  idx === currentProblemIndex ? 'bg-primary-100 text-primary-700' :
                    'bg-gray-100 text-gray-400'
                }`}>
                {idx < currentProblemIndex ? '✓' : `Bài ${idx + 1}`} · {p.difficulty}
              </div>
            ))}
          </div>

          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            disabled={submitted}
            className="text-xs font-bold border border-gray-200 rounded-lg px-3 py-1.5 bg-white cursor-pointer"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
          </select>

          <button
            onClick={handleCodingComplete}
            className="bg-red-50 hover:bg-red-100 text-red-650 border border-red-200 text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
          >
            Nộp & Kết thúc 📊
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel: Problem Description */}
        <div className="w-[40%] border-r border-gray-200 bg-white flex flex-col overflow-hidden">
          <div className="p-6 overflow-y-auto h-full space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{currentProblem?.title}</h2>
              <div className="flex gap-2">
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-tighter ${currentProblem?.difficulty === 'Easy' ? 'bg-green-50 text-green-600' :
                    currentProblem?.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600' :
                      'bg-red-50 text-red-600'
                  }`}>
                  {currentProblem?.difficulty}
                </span>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded uppercase tracking-tighter">Coding Round</span>
              </div>
            </div>

            <div className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
              {currentProblem?.description}
            </div>

            {/* Examples */}
            {currentProblem?.examples && currentProblem.examples.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Ví dụ:</h3>
                {currentProblem.examples.map((ex, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4 font-mono text-[11px] border border-gray-100 space-y-2">
                    <p className="font-bold text-gray-500">// Ví dụ {idx + 1}</p>
                    <p><span className="text-gray-400">Input:</span> {ex.input}</p>
                    <p><span className="text-gray-400">Output:</span> {ex.output}</p>
                    {ex.explanation && <p className="text-gray-500 italic"><span className="text-gray-400">Giải thích:</span> {ex.explanation}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Constraints */}
            {currentProblem?.constraints && currentProblem.constraints.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">Ràng buộc:</h3>
                <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600">
                  {currentProblem.constraints.map((c, idx) => (
                    <li key={idx}><code>{c}</code></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Editor & Console */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Editor Header Tabs */}
          <div className="h-10 border-b border-gray-100 flex items-center justify-between px-4 shrink-0">
            <div className="flex h-full">
              <button className="px-4 h-full border-b-2 border-primary-600 text-primary-600 text-[12px] font-bold">
                solution.{language === 'python' ? 'py' : language === 'javascript' ? 'js' : 'java'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={language === 'javascript' ? 'javascript' : language === 'python' ? 'python' : 'java'}
              theme="vs-light"
              value={code}
              onChange={v => setCode(v || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbersMinChars: 3,
                padding: { top: 20 },
                scrollBeyondLastLine: false,
                fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
                readOnly: submitted
              }}
            />
          </div>

          {/* Console Area */}
          <div className="h-[35%] border-t border-gray-200 flex flex-col shrink-0 bg-white">
            <div className="h-10 bg-gray-50 border-b border-gray-100 flex items-center justify-between px-4 shrink-0">
              <div className="flex h-full items-center">
                <span className="text-[11px] font-bold text-gray-600 px-4">Kết quả thực thi</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Submit state check cases count */}
                {submitted && testResults && (
                  <div className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold ${testResults.passed === testResults.total
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : testResults.passed === 0
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                    {testResults.passed === testResults.total ? '✓' : '◐'} {testResults.passed}/{testResults.total} test cases passed
                  </div>
                )}

                {/* Run Buttons */}
                {!submitted ? (
                  <>
                    <button
                      onClick={handleRun}
                      disabled={running || !code.trim()}
                      className="bg-white border border-gray-200 px-4 py-1.5 rounded text-[11px] font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />} Chạy thử
                    </button>
                    <button
                      onClick={handleSubmitProblem}
                      disabled={submitting || !code.trim()}
                      className="bg-[#B4F290] text-[#111827] px-4 py-1.5 rounded text-[11px] font-bold hover:bg-[#9de675] flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />} Nộp bài
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleNextProblem}
                    className="bg-[#B4F290] text-[#111827] px-5 py-1.5 rounded text-[11px] font-bold hover:bg-[#9de675] flex items-center gap-2 shadow-sm animate-pulse"
                  >
                    {currentProblemIndex < problems.length - 1 ? 'Bài tiếp theo →' : 'Đi tới trang báo cáo 📊'}
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 p-5 overflow-y-auto font-mono bg-gray-50 text-gray-800">
              {testResults ? (
                <div className="space-y-3">
                  <p className="font-bold text-sm text-gray-700">
                    {isRunResult ? 'Kết quả chạy thử (3 test cases public):' : `Kết quả nộp bài: ${testResults.passed}/${testResults.total} tests passed`}
                  </p>
                  {isRunResult ? (
                    // Khi Run: hiển thị đầy đủ input/expected/actual
                    testResults.results.map((res, i) => (
                      <div key={i} className="border-b border-gray-200 pb-2 text-[11px]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-bold uppercase ${res.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {res.passed ? '✓ Pass' : '✗ Fail'}
                          </span>
                          <span className="text-gray-400">| Case {i + 1}</span>
                        </div>
                        <p><span className="text-gray-400">Input:</span> <span className="font-semibold text-gray-700">{res.input}</span></p>
                        <p><span className="text-gray-400">Expected:</span> <span className="font-semibold text-gray-700">{res.expected}</span></p>
                        <p><span className="text-gray-400">Actual:</span> <span className="font-semibold text-gray-750">{res.actual || '<Empty/Error>'}</span></p>
                      </div>
                    ))
                  ) : (
                    // Khi Submit: chỉ hiển thị Pass/Fail từng case, KHÔNG hiển thị expected
                    testResults.results.map((res, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] py-1 border-b border-gray-100 last:border-b-0 pb-1">
                        <span className={`font-bold ${res.passed ? 'text-green-600' : 'text-red-600'}`}>
                          {res.passed ? '✓' : '✗'}
                        </span>
                        <span className="text-gray-500 font-sans">Test case {i + 1}: {res.passed ? 'Passed' : 'Failed'}</span>
                        {!res.passed && res.actual && (
                          <span className="text-gray-400 font-sans font-medium">— Output của bạn: {res.actual}</span>
                        )}
                        {/* KHÔNG hiển thị expected output */}
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic">
                  {running ? 'Đang thực thi các test cases qua Piston...' : '> Chờ thực thi code...'}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="h-10 bg-white border-t border-gray-200 px-6 flex items-center justify-between shrink-0 text-[10px]">
        <div className="flex gap-6 text-gray-400">
          <span>Vai trò: <span className="text-gray-700 font-semibold uppercase">{role || 'General'}</span></span>
          <span>Cấp độ: <span className="text-gray-700 font-semibold uppercase">{difficulty || 'Fresher'}</span></span>
        </div>
        <div className="flex gap-6 text-gray-400 font-medium">
          <div className="flex items-center gap-1 text-green-500 font-bold">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Hệ thống sẵn sàng
          </div>
        </div>
      </footer>
    </div>
  );
}

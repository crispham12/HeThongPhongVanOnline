import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Code2, Play, Send, Loader2, Info, CheckCircle2,
  ChevronLeft, Timer, ShieldCheck, Save, ChevronRight, Star, Share2,
  Terminal, Monitor, Settings, ExternalLink, CheckCircle, XCircle, Award, Sparkles, Lightbulb, BarChart2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { codingPracticeApi } from '../../services/codingPracticeApi';

const DEFAULT_STARTER = {
  Python: 'def solution():\n    # Your code here\n    pass',
  JavaScript: 'function solution() {\n    // Your code here\n}',
  Java: 'import java.util.*;\n\nclass Solution {\n    public int[] solution(int[] nums, int target) {\n        // Your code here\n        return new int[]{};\n    }\n}',
  'C#': 'public class Solution {\n    public void Solve() {\n        // Your code here\n    }\n}'
};

export default function CodingPracticeWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Problem detail state
  const [problem, setProblem] = useState(null);
  const [loadingProblem, setLoadingProblem] = useState(true);

  // Editor states
  const [language, setLanguage] = useState('Python');
  const [code, setCode] = useState('');
  const [starterCodeMap, setStarterCodeMap] = useState({});
  const [availableLanguages, setAvailableLanguages] = useState(['Python', 'JavaScript', 'Java', 'C#']);

  // Results
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [isRunResult, setIsRunResult] = useState(false);
  
  const [consoleTab, setConsoleTab] = useState('run'); // 'run', 'aifeedback'

  const handleExit = () => {
    setTestResults(null);
    setSubmitResult(null);
    setSubmitted(false);
    setIsRunResult(false);
    setRunning(false);
    setSubmitting(false);
    setCode(starterCodeMap[language] || DEFAULT_STARTER[language] || '');
    navigate('/question-bank');
  };

  const fetchProblemDetails = async () => {
    setLoadingProblem(true);
    try {
      const p = await codingPracticeApi.getProblemById(id);
      if (p) {
        setProblem(p);
        const supported = p.supportedLanguages && p.supportedLanguages.length > 0
          ? p.supportedLanguages
          : ['Python', 'JavaScript', 'Java', 'C#'];
        setAvailableLanguages(supported);
        const defaultLang = supported[0] || 'Python';
        setLanguage(defaultLang);

        const map = p.starterCode || {};
        supported.forEach(lang => {
          if (!map[lang]) map[lang] = DEFAULT_STARTER[lang] || '';
        });
        setStarterCodeMap(map);
        setCode(map[defaultLang] || '');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể tải chi tiết bài toán.');
    } finally {
      setLoadingProblem(false);
    }
  };

  useEffect(() => {
    fetchProblemDetails();
  }, [id]);

  const handleLanguageChange = (lang) => {
    setStarterCodeMap(prev => ({ ...prev, [language]: code }));
    setLanguage(lang);
    setCode(starterCodeMap[lang] || DEFAULT_STARTER[lang] || '');
  };

  const getMonacoLanguage = (lang) => {
    const l = lang?.toLowerCase();
    if (l === 'c#') return 'csharp';
    if (l === 'javascript') return 'javascript';
    if (l === 'typescript') return 'typescript';
    if (l === 'python') return 'python';
    if (l === 'java') return 'java';
    return 'python';
  };

  const handleRunCode = async () => {
    if (!code.trim() || running || submitted) return;
    setRunning(true);
    setTestResults(null);
    setIsRunResult(true);
    setConsoleTab('run');

    try {
      const res = await codingPracticeApi.runCode(id, { language, code });
      
      const formattedResults = (res.testResults || []).map(tc => ({
        input: tc.input,
        expected: tc.expectedOutput,
        actual: tc.actualOutput || '',
        passed: tc.passed
      }));

      setTestResults({ 
        passed: formattedResults.filter(r => r.passed).length, 
        total: formattedResults.length, 
        results: formattedResults 
      });
    } catch (error) {
      console.error(error);
      alert('Lỗi thực thi code chạy thử.');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!code.trim() || submitting) return;
    setSubmitting(true);
    setSubmitResult(null);
    setTestResults(null);
    setIsRunResult(false);
    setSubmitted(true);
    setConsoleTab('run');

    try {
      const res = await codingPracticeApi.submitCode(id, { language, code });
      
      setSubmitResult(res);

      const formattedResults = (res.testResults || []).map(tc => ({
        passed: tc.passed,
        actual: tc.actualOutput || '',
        input: tc.input,
        expected: tc.expectedOutput
      }));

      setTestResults({ 
        passed: res.passedTestCases || 0, 
        total: res.totalTestCases || 0, 
        results: formattedResults 
      });
      
    } catch (error) {
      console.error(error);
      alert('Lỗi nộp bài đánh giá.');
      setSubmitted(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProblem) {
    return (
      <div className="fixed inset-0 bg-[#f8f9fa] flex flex-col items-center justify-center gap-4 z-[200]">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium animate-pulse">Đang tải không gian làm bài...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#f8f9fa] z-[100] flex flex-col font-sans text-[13px]">
      {/* Top Navigation Bar */}
      <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-xs font-bold mr-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Thoát
            </button>

          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-4">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            disabled={submitted || submitting || running}
            className="text-xs font-bold border border-gray-200 rounded-lg px-3 py-1.5 bg-white cursor-pointer"
          >
            {availableLanguages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>

          <div className="h-5 w-[1px] bg-gray-200 mx-2" />

          {!submitted ? (
            <>
              <button
                onClick={handleRunCode}
                disabled={running || !code.trim()}
                className="bg-white border border-gray-200 px-4 py-1.5 rounded text-[11px] font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm disabled:opacity-50 transition-colors"
              >
                {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />} Chạy thử
              </button>
              <button
                onClick={handleSubmitCode}
                disabled={submitting || !code.trim()}
                className="bg-[#B4F290] text-[#111827] px-4 py-1.5 rounded text-[11px] font-bold hover:bg-[#9de675] flex items-center gap-2 shadow-sm disabled:opacity-50 transition-colors"
              >
                {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />} Nộp bài
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setSubmitted(false);
                setTestResults(null);
                setSubmitResult(null);
              }}
              className="bg-gray-100 text-gray-700 border border-gray-200 px-5 py-1.5 rounded text-[11px] font-bold hover:bg-gray-200 flex items-center gap-2 shadow-sm"
            >
              Làm lại bài này
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel: Problem Description */}
        <div className="w-[40%] border-r border-gray-200 bg-white flex flex-col overflow-hidden">
          <div className="p-6 overflow-y-auto h-full space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{problem?.title}</h2>
              <div className="flex gap-2">
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-tighter ${
                  ['dễ', 'easy', 'fresher', 'intern'].includes(problem?.difficulty?.toLowerCase()) ? 'bg-green-50 text-green-600 border border-green-200' :
                  ['trung bình', 'vừa', 'medium', 'junior'].includes(problem?.difficulty?.toLowerCase()) ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                  'bg-red-50 text-red-600 border border-red-200'
                }`}>
                  {problem?.difficulty || 'N/A'}
                </span>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded uppercase tracking-tighter border border-gray-200">Coding Practice</span>
              </div>
            </div>

            <div className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
              {problem?.description}
            </div>

            {/* Input & Output format */}
            {(problem?.inputFormat || problem?.outputFormat) && (
              <div className="space-y-4">
                {problem.inputFormat && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">Định dạng Input:</h3>
                    <div className="bg-gray-50 rounded-lg p-3 font-mono text-[11px] border border-gray-100 whitespace-pre-wrap">
                      {problem.inputFormat}
                    </div>
                  </div>
                )}
                {problem.outputFormat && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">Định dạng Output:</h3>
                    <div className="bg-gray-50 rounded-lg p-3 font-mono text-[11px] border border-gray-100 whitespace-pre-wrap">
                      {problem.outputFormat}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Examples */}
            {problem?.examples && problem.examples.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Ví dụ:</h3>
                {problem.examples.map((ex, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4 font-mono text-[11px] border border-gray-100 space-y-2">
                    <p className="font-bold text-gray-500">// Ví dụ {idx + 1}</p>
                    <p><span className="text-gray-400">Input:</span> {ex.input}</p>
                    <p><span className="text-gray-400">Output:</span> {ex.output}</p>
                    {ex.explanation && <p className="text-gray-500 italic font-sans"><span className="text-gray-400">Giải thích:</span> {ex.explanation}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Constraints */}
            {problem?.constraints && problem.constraints.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">Ràng buộc:</h3>
                <ul className="list-disc pl-5 space-y-1 text-xs text-gray-600 font-mono">
                  {problem.constraints.map((c, idx) => (
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
                solution.{getMonacoLanguage(language) === 'python' ? 'py' : getMonacoLanguage(language) === 'javascript' ? 'js' : getMonacoLanguage(language) === 'java' ? 'java' : 'cs'}
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={getMonacoLanguage(language)}
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
                readOnly: submitted || submitting || running
              }}
            />
          </div>

          {/* Console Area */}
          <div className="h-[35%] border-t border-gray-200 flex flex-col shrink-0 bg-white">
            <div className="h-10 bg-gray-50 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex h-full">
                <button 
                  onClick={() => setConsoleTab('run')}
                  className={`px-5 h-full text-[11px] font-bold uppercase tracking-wider border-r border-gray-200 transition-colors ${consoleTab === 'run' ? 'bg-white text-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  Kết quả thực thi
                </button>
                <button 
                  onClick={() => setConsoleTab('aifeedback')}
                  className={`px-5 h-full text-[11px] font-bold uppercase tracking-wider border-r border-gray-200 transition-colors flex items-center gap-1.5 ${consoleTab === 'aifeedback' ? 'bg-white text-violet-700' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <Sparkles className="w-3 h-3" />
                  AI Feedback
                </button>
              </div>

              <div className="flex items-center gap-2 pr-4">
                {/* Submit state check cases count */}
                {testResults && (
                  <div className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold ${testResults.passed === testResults.total
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : testResults.passed === 0
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                    {testResults.passed === testResults.total ? '✓' : '◐'} {testResults.passed}/{testResults.total} test cases passed
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white">
              {consoleTab === 'run' && (
                <div className="p-5 font-mono text-gray-800">
                  {testResults ? (
                    <div className="space-y-3">
                      <p className="font-bold text-sm text-gray-700">
                        {isRunResult ? 'Kết quả chạy thử (Test cases public):' : `Kết quả nộp bài: ${testResults.passed}/${testResults.total} tests passed`}
                      </p>
                      
                      {submitResult && submitResult.status && (
                         <div className="flex items-center gap-2 text-xs font-sans font-bold py-1">
                           Trạng thái: <span className={`uppercase px-2 py-0.5 rounded ${submitResult.status === 'Accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{submitResult.status}</span>
                         </div>
                      )}

                      {isRunResult ? (
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
                        testResults.results.map((res, i) => (
                          <div key={i} className="flex items-center gap-2 text-[11px] py-1 border-b border-gray-100 last:border-b-0 pb-1">
                            <span className={`font-bold ${res.passed ? 'text-green-600' : 'text-red-600'}`}>
                              {res.passed ? '✓' : '✗'}
                            </span>
                            <span className="text-gray-500 font-sans">Test case {i + 1}: {res.passed ? 'Passed' : 'Failed'}</span>
                            {!res.passed && (
                              <div className="w-full mt-2 space-y-1 ml-4 pl-4 border-l-2 border-red-200">
                                <p><span className="text-gray-400">Input:</span> <span className="text-gray-600">{res.input}</span></p>
                                <p><span className="text-gray-400">Expected:</span> <span className="text-green-600">{res.expected}</span></p>
                                <p><span className="text-gray-400">Actual:</span> <span className="text-red-600">{res.actual || '<Empty/Error>'}</span></p>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 italic">
                      {running ? 'Đang thực thi code trên Backend...' : submitting ? 'Đang chấm điểm và phân tích AI...' : '> Chờ thực thi code...'}
                    </div>
                  )}
                </div>
              )}

              {consoleTab === 'aifeedback' && (
                <div className="p-5">
                  {!submitResult || !submitResult.aiFeedback ? (
                    <div className="flex flex-col items-center justify-center py-6 text-gray-400 font-sans">
                      <Sparkles className="w-8 h-8 text-gray-200 mb-2" />
                      <p className="text-xs font-bold">Hãy Nộp bài để nhận AI Feedback chi tiết.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 text-xs font-semibold font-sans">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col items-center justify-center">
                           <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Score</span>
                           <span className="text-xl text-blue-600 font-black">{submitResult.score || 0} / 100</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-gray-50 rounded-lg p-2 flex flex-col items-center justify-center">
                            <span className="text-[9px] text-gray-400 uppercase font-bold">Runtime</span>
                            <span className="text-sm text-gray-700 font-bold">{submitResult.runtimeMs || 0} ms</span>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2 flex flex-col items-center justify-center">
                            <span className="text-[9px] text-gray-400 uppercase font-bold">Memory</span>
                            <span className="text-sm text-gray-700 font-bold">{submitResult.memoryUsageMb || 0} MB</span>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2 flex flex-col items-center justify-center">
                            <span className="text-[9px] text-gray-400 uppercase font-bold">Time Cmplx</span>
                            <span className="text-sm text-violet-600 font-bold">{submitResult.aiFeedback?.timeComplexity || 'O(n)'}</span>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2 flex flex-col items-center justify-center">
                            <span className="text-[9px] text-gray-400 uppercase font-bold">Space Cmplx</span>
                            <span className="text-sm text-violet-600 font-bold">{submitResult.aiFeedback?.spaceComplexity || 'O(n)'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Strengths */}
                      <div>
                        <h4 className="font-bold text-emerald-700 flex items-center gap-1.5 mb-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500" /> ĐIỂM MẠNH
                        </h4>
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 space-y-2">
                          {submitResult.aiFeedback.strengths && submitResult.aiFeedback.strengths.length > 0 ? (
                            submitResult.aiFeedback.strengths.map((str, i) => (
                              <div key={i} className="flex gap-2 text-gray-700 text-xs">
                                <span className="text-emerald-600">✓</span> <span>{str}</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-400 italic">Không có đánh giá cụ thể.</span>
                          )}
                        </div>
                      </div>
                
                      {/* Weaknesses */}
                      <div>
                        <h4 className="font-bold text-rose-700 flex items-center gap-1.5 mb-2">
                          <XCircle className="w-4 h-4 text-rose-500" /> ĐIỂM YẾU
                        </h4>
                        <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5 space-y-2">
                          {submitResult.aiFeedback.weaknesses && submitResult.aiFeedback.weaknesses.length > 0 ? (
                            submitResult.aiFeedback.weaknesses.map((weak, i) => (
                              <div key={i} className="flex gap-2 text-gray-700 text-xs">
                                <span className="text-rose-600 font-bold">✗</span> <span>{weak}</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-400 italic">Không tìm thấy điểm yếu.</span>
                          )}
                        </div>
                      </div>
                
                      {/* Suggestions */}
                      <div>
                        <h4 className="font-bold text-violet-700 flex items-center gap-1.5 mb-2">
                          <Lightbulb className="w-4 h-4 text-violet-500" /> GỢI Ý CẢI THIỆN
                        </h4>
                        <div className="bg-violet-50 border border-violet-100 rounded-xl p-3.5 space-y-2">
                          {submitResult.aiFeedback.suggestions && submitResult.aiFeedback.suggestions.length > 0 ? (
                            submitResult.aiFeedback.suggestions.map((sug, i) => (
                              <div key={i} className="flex gap-2 text-gray-700 text-xs">
                                <span className="text-violet-600">•</span> <span>{sug}</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-400 italic">Giải thuật của bạn đã khá tối ưu.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="h-8 bg-white border-t border-gray-200 px-6 flex items-center justify-between shrink-0 text-[10px]">
        <div className="flex gap-6 text-gray-400">
          <span>Chủ đề: <span className="text-gray-700 font-semibold uppercase">{(problem?.targetSkills || 'General').toString()}</span></span>
          <span>Độ khó: <span className="text-gray-700 font-semibold uppercase">{problem?.difficulty || 'N/A'}</span></span>
        </div>
        <div className="flex gap-6 text-gray-400 font-medium">
          <div className="flex items-center gap-1 text-green-500 font-bold">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Hệ thống chấm điểm Backend sẵn sàng
          </div>
        </div>
      </footer>
    </div>
  );
}

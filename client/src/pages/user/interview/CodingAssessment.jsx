import { useState, useEffect } from 'react';
  import { useNavigate } from 'react-router-dom';
  import Editor from '@monaco-editor/react';
  import { 
    Code2, Play, Send, Loader2, Info, CheckCircle2, 
    Timer, ShieldCheck, Save, ChevronRight, Star, Share2,
    Terminal, Monitor, Settings, ExternalLink
  } from 'lucide-react';
  import { motion } from 'framer-motion';
  import api from '../../../lib/axios';

export default function CodingAssessment({ fullMockMode = false, role, difficulty, stack, onComplete }) {
  const navigate = useNavigate();
  const [code, setCode] = useState(`function solution(candidates, B) {
  // Initialize DP table for budget B
  const dp = new Array(B + 1).fill(0);

  for (const [exp, skill, cost] of candidates) {
    for (let i = B; i >= cost; i--) {
      dp[i] = Math.max(dp[i], dp[i - cost] + skill);
    }
  }

  return dp[B];
}`);
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('console');
  const [timeLeft, setTimeLeft] = useState(6178); // 01:42:58
  const [output, setOutput] = useState({
    status: 'passed',
    time: '42ms',
    memory: '12.4MB',
    output: '90',
    expected: '90'
  });

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(t => t > 0 ? t - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleRun = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const handleFinalSubmit = async () => {
    if (fullMockMode && onComplete) {
      try {
        const { data } = await api.post('/interview/start', {
          role: role || 'backend',
          stack: stack || [],
          difficulty: difficulty || 'fresher',
          type: 'coding',
        });
        onComplete(String(data.sessionId));
      } catch (error) {
        alert('Không thể lưu kết quả Coding. Vui lòng thử lại.');
        // Không gọi onComplete — giữ user ở màn hình Coding để thử lại
      }
    } else {
      navigate('/result/123');
    }
  };

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

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Hệ thống: Ổn định</span>
          </div>
          <button className="text-sm font-semibold text-gray-500 hover:text-gray-900 px-4">Lưu bản nháp</button>
          <button 
            onClick={handleFinalSubmit}
            className="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary-100 hover:bg-primary-700 flex items-center gap-2"
          >
            Nộp bài đánh giá <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel: Problem Description (In English as requested) */}
        <div className="w-[40%] border-r border-gray-200 bg-white flex flex-col overflow-hidden">
          <div className="p-6 overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">124. Optimal Recruitment Pipeline</h2>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded uppercase tracking-tighter">Hard</span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold rounded uppercase tracking-tighter">60 Points</span>
                </div>
              </div>
              <div className="flex gap-2 text-gray-400">
                <button className="hover:text-gray-600"><Star className="w-5 h-5" /></button>
                <button className="hover:text-gray-600"><Share2 className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-4">
              <p>Given an array of <code>candidates</code>, where each candidate is represented as a triple <code>[experience, skill_score, salary_expectation]</code>, and a recruiter with a total budget <code>B</code>.</p>
              <p>Your goal is to maximize the <strong>Total Pipeline Value</strong> (Sum of Skill Scores) without exceeding the budget <code>B</code>. Each candidate can only be hired once.</p>
              
              <h3 className="text-[11px] font-bold text-gray-900 uppercase mt-8 mb-3 tracking-widest">Constraints:</h3>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li><code>1 ≤ candidates.length ≤ 10^3</code></li>
                <li><code>0 ≤ experience, skill_score ≤ 10^4</code></li>
                <li><code>1 ≤ B ≤ 10^5</code></li>
              </ul>

              <h3 className="text-[11px] font-bold text-gray-900 uppercase mt-8 mb-3 tracking-widest">Example 1:</h3>
              <div className="bg-gray-50 rounded-xl p-4 font-mono text-[11px] border border-gray-100 space-y-2">
                <p><span className="text-gray-400 italic">// Input</span></p>
                <p>candidates = [[5, 80, 50000], [2, 40, 20000], [3, 50, 35000]], B = 60000</p>
                <p><span className="text-gray-400 italic">// Output</span></p>
                <p>90</p>
                <p><span className="text-gray-400 italic">// Explanation</span></p>
                <p className="text-gray-500">Hiring candidate 2 and 3 yields 40+50=90 value for 55000 cost. Hiring candidate 1 yields 80 value for 50000 cost.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Editor & Console */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Editor Header Tabs */}
          <div className="h-10 border-b border-gray-100 flex items-center justify-between px-4 shrink-0">
            <div className="flex h-full">
              <button className="px-4 h-full border-b-2 border-primary-600 text-primary-600 text-[12px] font-bold">solution.js</button>
              <button className="px-4 h-full text-gray-400 text-[12px] font-bold hover:text-gray-600">Ghi chú</button>
            </div>
            <div className="flex items-center gap-4">
              <select className="bg-transparent text-[11px] font-bold text-gray-500 outline-none cursor-pointer hover:text-gray-800 transition-colors">
                <option>JavaScript (Node.js)</option>
                <option>Python 3</option>
                <option>Java 17</option>
              </select>
              <Settings className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              theme="vs-light"
              value={code}
              onChange={v => setCode(v)}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbersMinChars: 3,
                padding: { top: 20 },
                scrollBeyondLastLine: false,
                fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
              }}
            />
          </div>

          {/* Console Area */}
          <div className="h-[35%] border-t border-gray-200 flex flex-col shrink-0">
            <div className="h-10 bg-gray-50 border-b border-gray-100 flex items-center justify-between px-4 shrink-0">
              <div className="flex h-full">
                <button 
                  onClick={() => setActiveTab('console')}
                  className={`px-4 h-full text-[11px] font-bold transition-colors ${activeTab === 'console' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-400'}`}
                >
                  Kết quả thực thi
                </button>
                <button 
                  onClick={() => setActiveTab('testcases')}
                  className={`px-4 h-full text-[11px] font-bold transition-colors ${activeTab === 'testcases' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-400'}`}
                >
                  Bộ kiểm thử (Test Cases)
                </button>
              </div>
              <button 
                onClick={handleRun}
                disabled={loading}
                className="bg-white border border-gray-200 px-4 py-1 rounded text-[11px] font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />} Chạy thử
              </button>
            </div>
            <div className="flex-1 p-5 overflow-y-auto bg-white font-mono">
              {activeTab === 'console' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" /> Test Case 1: Passed
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 text-[11px] max-w-sm">
                    <span className="text-gray-400 font-sans">Execution time:</span> <span className="text-gray-700">{output.time}</span>
                    <span className="text-gray-400 font-sans">Memory usage:</span> <span className="text-gray-700">{output.memory}</span>
                    <span className="text-gray-400 font-sans">Output:</span> <span className="text-gray-900 font-bold">{output.output}</span>
                    <span className="text-gray-400 font-sans">Expected:</span> <span className="text-gray-900 font-bold">{output.expected}</span>
                  </div>
                  <div className="pt-4 text-[11px] text-gray-400 italic">
                    {'>'} Waiting for next execution...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="h-10 bg-white border-t border-gray-200 px-6 flex items-center justify-between shrink-0 text-[10px]">
        <div className="flex gap-6 text-gray-400">
          <span>Candidate: <span className="text-gray-700 font-semibold uppercase tracking-tight">Lead_Recruiter_01</span></span>
          <span>Session ID: <span className="text-gray-700 font-semibold uppercase tracking-tight">#AX-4492-Z</span></span>
        </div>
        <div className="flex gap-6 text-gray-400 font-medium">
          <a href="#" className="hover:text-primary-600 flex items-center gap-1">API Documentation <ExternalLink className="w-3 h-3" /></a>
          <a href="#" className="hover:text-primary-600 flex items-center gap-1">Security Architecture <ExternalLink className="w-3 h-3" /></a>
          <div className="flex items-center gap-1 text-green-500 font-bold">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Connected
          </div>
        </div>
      </footer>
    </div>
  );
}

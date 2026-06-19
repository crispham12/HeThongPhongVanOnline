import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MonacoEditor from '@monaco-editor/react';
import {
  ChevronLeft, Play, RotateCcw, Loader2, BookOpen, Clock, AlertCircle,
  CheckCircle, XCircle, Sparkles, Code2, Cpu, History, Check, AlertTriangle,
  Lightbulb, Copy, Maximize2, Minimize2, Terminal, Award, Tag, BarChart2, Zap
} from 'lucide-react';
import { codingPracticeApi } from '../../services/codingPracticeApi';

// ==========================================
// BADGE COMPONENTS
// ==========================================

export function DifficultyBadge({ difficulty }) {
  const styles = {
    Easy: 'bg-emerald-50 text-emerald-600 border-emerald-200/60 hover:bg-emerald-100/50',
    Medium: 'bg-amber-50 text-amber-600 border-amber-200/60 hover:bg-amber-100/50',
    Hard: 'bg-rose-50 text-rose-600 border-rose-200/60 hover:bg-rose-100/50'
  };

  const labels = {
    Easy: 'Dễ',
    Medium: 'Trung bình',
    Hard: 'Khó'
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${styles[difficulty] || styles.Easy}`}>
      {labels[difficulty] || difficulty}
    </span>
  );
}

export function RecommendedLevelBadge({ level }) {
  const styles = {
    Intern: 'bg-blue-50 text-blue-600 border-blue-200/60',
    Fresher: 'bg-indigo-50 text-indigo-600 border-indigo-200/60',
    Junior: 'bg-violet-50 text-violet-600 border-violet-200/60',
    Middle: 'bg-purple-50 text-purple-600 border-purple-200/60',
    Senior: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200/60'
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${styles[level] || 'bg-slate-50 text-slate-650 border-slate-200'}`}>
      {level}
    </span>
  );
}

export function CategoryBadge({ name }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200/80 text-slate-600 rounded-lg text-xs font-semibold border border-slate-200/40 transition-colors">
      <Tag className="w-3 h-3 text-slate-400" />
      {name}
    </span>
  );
}

// ==========================================
// PROGRESS CARD COMPONENT
// ==========================================

export function ProblemProgressCard({ bestScore, latestScore, attemptCount }) {
  return (
    <div className="flex items-center gap-4 bg-slate-900/40 backdrop-blur-md border border-slate-700/60 rounded-xl px-4 py-2 text-xs select-none">
      <div className="flex flex-col">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Best Score</span>
        <span className={`font-mono font-black text-sm ${bestScore >= 80 ? 'text-emerald-400' : bestScore >= 50 ? 'text-amber-400' : 'text-slate-300'}`}>
          {bestScore}%
        </span>
      </div>
      <div className="w-[1px] h-6 bg-slate-700/50" />
      <div className="flex flex-col">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Latest</span>
        <span className="font-mono font-black text-sm text-slate-200">{latestScore}%</span>
      </div>
      <div className="w-[1px] h-6 bg-slate-700/50" />
      <div className="flex flex-col">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Attempts</span>
        <span className="font-mono font-black text-sm text-blue-400">{attemptCount}</span>
      </div>
    </div>
  );
}

// ==========================================
// TABS COMPONENTS (LEFT PANEL)
// ==========================================

export function ProblemDescriptionPanel({ problem }) {
  if (!problem) return null;

  // Split categories by comma or handle array
  const categories = Array.isArray(problem.targetSkills)
    ? problem.targetSkills
    : typeof problem.targetSkills === 'string'
      ? problem.targetSkills.split(',').map(s => s.trim()).filter(Boolean)
      : [];

  // Visual examples
  const examplesList = problem.examples || [];

  // Constraints list
  const constraintsList = problem.constraints || [];

  return (
    <div className="space-y-6 text-slate-700">
      <div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">{problem.title}</h1>
        <div className="flex flex-wrap gap-2 items-center mb-6">
          <DifficultyBadge difficulty={problem.difficulty} />
          {problem.recommendedLevel && (
            <RecommendedLevelBadge level={problem.recommendedLevel} />
          )}
        </div>
      </div>

      {/* Problem Description */}
      <div className="prose prose-slate max-w-none">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Mô tả bài toán</h3>
        <div className="whitespace-pre-wrap leading-relaxed text-sm text-slate-650 bg-white border border-slate-100 p-4 rounded-xl">
          {problem.description}
        </div>
      </div>

      {/* Input Format */}
      {problem.inputFormat && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Input Format</h3>
          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 font-mono text-xs text-slate-800 whitespace-pre-wrap">
            {problem.inputFormat}
          </div>
        </div>
      )}

      {/* Output Format */}
      {problem.outputFormat && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Output Format</h3>
          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 font-mono text-xs text-slate-800 whitespace-pre-wrap">
            {problem.outputFormat}
          </div>
        </div>
      )}

      {/* Examples */}
      {examplesList.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Ví dụ</h3>
          {examplesList.map((ex, idx) => (
            <div key={idx} className="bg-white border border-slate-200/70 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-[10px] font-black text-slate-400 mb-3 tracking-widest uppercase">Ví dụ {idx + 1}</div>
              <div className="space-y-2 font-mono text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-indigo-600 font-bold">Input:</span> {ex.input}
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-emerald-600 font-bold">Output:</span> {ex.output}
                </div>
                {ex.explanation && (
                  <div className="text-slate-500 italic text-[11px] mt-2 pt-2 border-t border-slate-100">
                    <span className="font-semibold not-italic text-slate-600">Giải thích:</span> {ex.explanation}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Constraints */}
      {constraintsList.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Ràng buộc (Constraints)</h3>
          <ul className="space-y-2 pl-4 list-disc text-xs font-mono text-slate-500">
            {constraintsList.map((constraint, idx) => (
              <li key={idx} className="leading-relaxed">
                {constraint}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <div className="border-t border-slate-200/60 pt-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Chủ đề</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat, idx) => (
              <CategoryBadge key={idx} name={cat} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SubmissionHistoryPanel({ attempts, loading }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
        <span className="text-xs text-slate-400 font-bold">Đang tải lịch sử...</span>
      </div>
    );
  }

  if (!attempts || attempts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
        <History className="w-12 h-12 text-slate-200 mb-3" />
        <p className="text-sm font-bold">Bạn chưa từng nộp bài này.</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">Giải pháp của bạn và kết quả đánh giá AI sẽ hiển thị ở đây sau khi nộp bài.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {attempts.map((att, idx) => {
        const date = att.createdAt ? new Date(att.createdAt).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) : '12/06/2026';

        const isAccepted = att.status === 'Accepted';

        return (
          <div key={att.id || idx} className="bg-white border border-slate-200/70 hover:border-slate-300 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800">Attempt #{att.attemptNumber || (attempts.length - idx)}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                isAccepted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {att.status || 'Accepted'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 font-semibold">
              <div>Ngôn ngữ: <strong className="text-slate-700 font-bold">{att.language}</strong></div>
              <div>Testcases: <strong className="text-slate-700 font-bold">{att.passedTestCases}/{att.totalTestCases}</strong></div>
              <div>Runtime: <strong className="text-slate-700 font-bold">{att.runtimeMs || '45'}ms</strong></div>
              <div>Memory: <strong className="text-slate-700 font-bold">{att.memoryUsageMb || '12'}MB</strong></div>
              <div>Điểm: <strong className="text-blue-600 font-bold">{att.score || 0}/100</strong></div>
              <div>Ngày nộp: <strong className="text-slate-650 font-bold">{date}</strong></div>
            </div>

            {att.aiFeedback && (
              <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100 text-[11px] leading-relaxed">
                <div className="font-bold text-slate-650 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-violet-500" />
                  Đánh giá AI:
                </div>
                <div className="text-slate-600 line-clamp-2 hover:line-clamp-none transition-all cursor-pointer">
                  {att.aiFeedback.strengths?.[0] ? `✓ ${att.aiFeedback.strengths[0]}` : 'Có nhận xét từ AI.'}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ==========================================
// TABS COMPONENTS (RIGHT BOTTOM PANEL)
// ==========================================

export function TestCasesTab({ testCases }) {
  const [activeCase, setActiveCase] = useState(0);

  if (!testCases || testCases.length === 0) {
    return <div className="text-slate-400 text-xs italic py-4">Không có test case công khai.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Case selection buttons */}
      <div className="flex gap-2 border-b border-slate-200/50 pb-2">
        {testCases.map((tc, idx) => (
          <button
            key={idx}
            onClick={() => setActiveCase(idx)}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
              activeCase === idx
                ? 'bg-slate-200 text-slate-800'
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
            }`}
          >
            Case {idx + 1}
          </button>
        ))}
      </div>

      <div className="space-y-3 font-mono text-xs text-slate-750">
        <div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Input</div>
          <div className="p-3 bg-slate-100/70 border border-slate-200/60 rounded-xl whitespace-pre-wrap">
            {testCases[activeCase]?.input || 'N/A'}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Output dự kiến</div>
          <div className="p-3 bg-slate-100/70 border border-slate-200/60 rounded-xl whitespace-pre-wrap">
            {testCases[activeCase]?.expectedOutput || 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RunResultTab({ runResult, running }) {
  if (running) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
        <span className="font-bold text-xs text-slate-500">Running Code...</span>
      </div>
    );
  }

  if (!runResult) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <Terminal className="w-10 h-10 text-slate-200 mb-2" />
        <p className="text-xs font-bold text-slate-400">Chưa có kết quả chạy thử.</p>
      </div>
    );
  }

  const isAccepted = runResult.status === 'Accepted';

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
        <span className="font-black text-slate-800 text-sm flex items-center gap-1.5">
          {isAccepted ? (
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-500" />
          )}
          Kết quả chạy: {isAccepted ? 'PASS' : 'FAIL'}
        </span>
        <span className={`px-2.5 py-0.5 rounded text-[10px] font-black border uppercase ${
          isAccepted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          {runResult.status}
        </span>
      </div>

      <div className="space-y-4">
        {runResult.testResults?.map((tc, idx) => (
          <div key={idx} className={`p-4 rounded-xl border ${
            tc.passed ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-rose-500/5 border-rose-500/15'
          }`}>
            <div className="flex justify-between items-center font-bold mb-2">
              <span className="text-slate-800">Case {idx + 1}</span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                tc.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>{tc.passed ? 'PASS' : 'FAIL'}</span>
            </div>
            <div className="space-y-1.5 text-slate-700">
              <div><span className="text-slate-400 font-bold">Input:</span> {tc.input}</div>
              <div><span className="text-slate-400 font-bold">Expected:</span> {tc.expectedOutput}</div>
              <div><span className="text-slate-400 font-bold">Actual:</span> {tc.actualOutput || '(trống)'}</div>
              {tc.status && tc.status !== 'Passed' && (
                <div className="text-[10px] text-rose-600 font-bold">Trạng thái: {tc.status}</div>
              )}
              {tc.executionTimeMs !== undefined && (
                <div className="text-[10px] text-slate-400">Thời gian chạy: {tc.executionTimeMs} ms</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SubmitResultTab({ submitResult, submitting }) {
  if (submitting) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
        <span className="font-bold text-xs text-slate-500">Submitting Solution...</span>
      </div>
    );
  }

  if (!submitResult) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <Award className="w-10 h-10 text-slate-200 mb-2" />
        <p className="text-xs font-bold text-slate-400">Hãy Submit để nhận kết quả chấm.</p>
      </div>
    );
  }

  const isAccepted = submitResult.status === 'Accepted';

  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
        <span className="font-black text-slate-800 text-sm flex items-center gap-1.5">
          {isAccepted ? (
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-500" />
          )}
          {submitResult.status || 'Accepted'}
        </span>
        <div className="text-right">
          <span className="text-xs text-slate-400">Passed: </span>
          <span className="font-black text-slate-800 text-sm">{submitResult.passedTestCases} / {submitResult.totalTestCases}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5 pt-2">
        <div className="bg-slate-50 border border-slate-150 rounded-xl p-3">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Score</div>
          <div className="text-lg font-black text-blue-600">{submitResult.score || 0} / 100</div>
        </div>

        <div className="bg-slate-50 border border-slate-150 rounded-xl p-3">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Runtime</div>
          <div className="text-lg font-black text-slate-700">{submitResult.runtimeMs || 0} ms</div>
        </div>

        <div className="bg-slate-50 border border-slate-150 rounded-xl p-3">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Memory</div>
          <div className="text-lg font-black text-slate-700">{submitResult.memoryUsageMb || 0} MB</div>
        </div>

        <div className="bg-slate-50 border border-slate-150 rounded-xl p-3">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Time Complexity</div>
          <div className="text-lg font-black text-violet-600">{submitResult.aiFeedback?.timeComplexity || 'O(n)'}</div>
        </div>

        <div className="bg-slate-50 border border-slate-150 rounded-xl p-3">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Space Complexity</div>
          <div className="text-lg font-black text-violet-600">{submitResult.aiFeedback?.spaceComplexity || 'O(n)'}</div>
        </div>
      </div>
    </div>
  );
}

export function AiFeedbackTab({ submitResult, submitting }) {
  if (submitting) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500 mb-3" />
        <span className="font-bold text-xs text-slate-500">Loading AI Feedback...</span>
      </div>
    );
  }

  if (!submitResult || !submitResult.aiFeedback) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <Sparkles className="w-10 h-10 text-slate-200 mb-2" />
        <p className="text-xs font-bold text-slate-400">Hãy Submit để nhận AI Feedback.</p>
      </div>
    );
  }

  const feedback = submitResult.aiFeedback;

  return (
    <div className="space-y-4 text-xs font-semibold">
      {/* Strengths */}
      <div>
        <h4 className="font-bold text-emerald-700 flex items-center gap-1.5 mb-2">
          <Check className="w-4 h-4 text-emerald-500" />
          ĐIỂM MẠNH
        </h4>
        <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3.5 space-y-2">
          {feedback.strengths && feedback.strengths.length > 0 ? (
            feedback.strengths.map((str, i) => (
              <div key={i} className="flex gap-2 text-slate-700 text-xs">
                <span className="text-emerald-600">✓</span>
                <span>{str}</span>
              </div>
            ))
          ) : (
            <span className="text-slate-400 italic">Không có đánh giá cụ thể.</span>
          )}
        </div>
      </div>

      {/* Weaknesses */}
      <div>
        <h4 className="font-bold text-rose-700 flex items-center gap-1.5 mb-2">
          <XCircle className="w-4 h-4 text-rose-500" />
          ĐIỂM YẾU
        </h4>
        <div className="bg-rose-500/5 border border-rose-500/15 rounded-xl p-3.5 space-y-2">
          {feedback.weaknesses && feedback.weaknesses.length > 0 ? (
            feedback.weaknesses.map((weak, i) => (
              <div key={i} className="flex gap-2 text-slate-700 text-xs">
                <span className="text-rose-600 font-bold">✗</span>
                <span>{weak}</span>
              </div>
            ))
          ) : (
            <span className="text-slate-400 italic">Không tìm thấy điểm yếu nghiêm trọng.</span>
          )}
        </div>
      </div>

      {/* Suggestions */}
      <div>
        <h4 className="font-bold text-violet-700 flex items-center gap-1.5 mb-2">
          <Lightbulb className="w-4 h-4 text-violet-500" />
          GỢI Ý CẢI THIỆN
        </h4>
        <div className="bg-violet-500/5 border border-violet-500/15 rounded-xl p-3.5 space-y-2">
          {feedback.suggestions && feedback.suggestions.length > 0 ? (
            feedback.suggestions.map((sug, i) => (
              <div key={i} className="flex gap-2 text-slate-700 text-xs">
                <span className="text-violet-600">•</span>
                <span>{sug}</span>
              </div>
            ))
          ) : (
            <span className="text-slate-400 italic">Giải thuật của bạn đã khá tối ưu.</span>
          )}
        </div>
      </div>

      {/* Complexity */}
      <div>
        <h4 className="font-bold text-blue-700 flex items-center gap-1.5 mb-2">
          <BarChart2 className="w-4 h-4 text-blue-500" />
          ĐỘ PHỨC TẠP
        </h4>
        <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-3.5 space-y-3 font-mono text-xs text-slate-700">
          <div>Time Complexity: <strong className="text-blue-700">{feedback.timeComplexity || 'O(n)'}</strong></div>
          <div>Space Complexity: <strong className="text-blue-700">{feedback.spaceComplexity || 'O(n)'}</strong></div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// STARTER CODES
// ==========================================
const DEFAULT_STARTER = {
  Python: `def solution():\n    # Your code here\n    pass`,
  JavaScript: `function solution() {\n    // Your code here\n}`,
  Java: `import java.util.*;\n\nclass Solution {\n    public int[] solution(int[] nums, int target) {\n        // Your code here\n        return new int[]{};\n    }\n}`,
  'C#': `public class Solution {\n    public void Solve() {\n        // Your code here\n    }\n}`
};

// ==========================================
// MAIN WORKSPACE PAGE
// ==========================================

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
  const [isFullScreen, setIsFullScreen] = useState(false);

  // History states
  const [attempts, setAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  // Right Console panel state
  const [consoleTab, setConsoleTab] = useState('testcases'); // 'testcases' | 'run' | 'submit' | 'aifeedback'
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [toast, setToast] = useState(null);

  // Left panel active tab
  const [leftTab, setLeftTab] = useState('description'); // 'description' | 'submissions'

  // Ref to store changes
  const lastCopiedCode = useRef('');

  // Fetch attempts and calculate stats
  const fetchAttempts = useCallback(async () => {
    setLoadingAttempts(true);
    try {
      const data = await codingPracticeApi.getProblemHistory(id);
      setAttempts(data || []);
    } catch (err) {
      console.error('Failed to load attempt history', err);
    } finally {
      setLoadingAttempts(false);
    }
  }, [id]);

  const fetchProblemDetails = useCallback(async () => {
    setLoadingProblem(true);
    try {
      const p = await codingPracticeApi.getProblemById(id);
      if (p) {
        setProblem(p);

        // Setup supported languages and starters
        const supported = p.supportedLanguages && p.supportedLanguages.length > 0
          ? p.supportedLanguages
          : ['Python', 'JavaScript', 'Java', 'C#'];
        setAvailableLanguages(supported);

        // Default language
        const defaultLang = supported[0] || 'Python';
        setLanguage(defaultLang);

        const map = p.starterCode || {};
        // Fill defaults if missing
        supported.forEach(lang => {
          if (!map[lang]) {
            map[lang] = DEFAULT_STARTER[lang] || '';
          }
        });
        setStarterCodeMap(map);
        setCode(map[defaultLang] || '');
      }
    } catch (err) {
      console.error('Failed to load coding problem details', err);
      setToast({ type: 'error', message: 'Không thể tải chi tiết bài toán.' });
    } finally {
      setLoadingProblem(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProblemDetails();
    fetchAttempts();
  }, [fetchProblemDetails, fetchAttempts]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleLanguageChange = (lang) => {
    setStarterCodeMap(prev => ({ ...prev, [language]: code }));
    setLanguage(lang);
    setCode(starterCodeMap[lang] || DEFAULT_STARTER[lang] || '');
  };

  const handleResetCode = () => {
    if (window.confirm('Khôi phục code về mẫu khởi tạo mặc định?')) {
      const starter = (problem?.starterCode && problem.starterCode[language])
        || DEFAULT_STARTER[language]
        || '';
      setCode(starter);
      setToast({ type: 'success', message: 'Đã khôi phục code mẫu mặc định.' });
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setToast({ type: 'success', message: 'Đã sao chép code vào bộ nhớ đệm!' });
  };

  const handleRunCode = async () => {
    if (!code.trim()) return;
    setRunning(true);
    setConsoleTab('run');
    setRunResult(null);
    try {
      const res = await codingPracticeApi.runCode(id, {
        language,
        code
      });
      setRunResult(res);
    } catch (err) {
      console.error('Failed to run code', err);
      const message = err?.response?.data?.message || err?.response?.data?.detail || 'Lỗi thực thi code chạy thử.';
      setToast({ type: 'error', message });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!code.trim()) return;
    setSubmitting(true);
    setConsoleTab('submit');
    setSubmitResult(null);
    try {
      const res = await codingPracticeApi.submitCode(id, {
        language,
        code
      });
      setSubmitResult(res);
      setToast({ type: 'success', message: 'Nộp bài và nhận đánh giá AI thành công!' });
      // Reload history statistics
      fetchAttempts();
    } catch (err) {
      console.error('Failed to submit code', err);
      const message = err?.response?.data?.message || err?.response?.data?.detail || 'Lỗi nộp bài đánh giá.';
      setToast({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
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

  // Compute attempts details
  const attemptCount = attempts.length;
  const scores = attempts.map(att => att.score !== null && att.score !== undefined ? att.score : Math.round((att.passedTestCases / att.totalTestCases) * 100));
  const bestScore = attemptCount > 0 ? Math.max(...scores) : 0;
  const latestScore = attemptCount > 0 ? scores[0] : 0;

  if (loadingProblem) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="text-sm font-bold text-slate-500 mt-4">Đang tải không gian làm bài...</p>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-slate-50 text-center p-6">
        <AlertCircle className="w-14 h-14 text-rose-500 mb-4" />
        <h2 className="text-lg font-black text-slate-900">Không tìm thấy bài coding</h2>
        <p className="text-xs text-slate-500 mt-2 font-medium">Thử thách này không tồn tại hoặc đã bị ẩn.</p>
        <button onClick={() => navigate('/coding-practice')} className="mt-5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md">
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] overflow-hidden text-[#0F172A] font-sans">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl border shadow-xl text-xs font-bold animate-fade-in ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4.5 h-4.5 text-emerald-600" /> : <AlertCircle className="w-4.5 h-4.5 text-rose-600" />}
          {toast.message}
        </div>
      )}

      {/* TOP HEADER */}
      <header className="bg-white border-b border-[#E2E8F0] h-14 px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/coding-practice')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-xs font-bold"
          >
            <ChevronLeft className="w-4 h-4" />
            Quay lại
          </button>
          <div className="h-4 w-[1px] bg-slate-200" />
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-slate-800">{problem.title}</h2>
            <DifficultyBadge difficulty={problem.difficulty} />
            {problem.recommendedLevel && (
              <RecommendedLevelBadge level={problem.recommendedLevel} />
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Selector Dropdown */}
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm transition-all"
          >
            {availableLanguages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>

          <button
            onClick={handleResetCode}
            className="px-3 py-1.5 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
            title="Khôi phục code mặc định"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          <button
            onClick={handleRunCode}
            disabled={running || submitting || !code.trim()}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            Run Code
          </button>

          <button
            onClick={handleSubmitCode}
            disabled={running || submitting || !code.trim()}
            className="px-4 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white disabled:opacity-40 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Submit
          </button>
        </div>
      </header>

      {/* WORKSPACE CONTENT AREA */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL (40%) */}
        <section className="w-[40%] bg-white border-r border-[#E2E8F0] flex flex-col h-full overflow-hidden">
          <div className="flex border-b border-slate-100 bg-slate-50 shrink-0">
            <button
              onClick={() => setLeftTab('description')}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all relative ${
                leftTab === 'description' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Description
              {leftTab === 'description' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#2563EB]" />
              )}
            </button>
            <button
              onClick={() => setLeftTab('submissions')}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all relative ${
                leftTab === 'submissions' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <History className="w-4 h-4" /> Submissions
              {leftTab === 'submissions' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#2563EB]" />
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {leftTab === 'description' ? (
              <ProblemDescriptionPanel problem={problem} />
            ) : (
              <SubmissionHistoryPanel attempts={attempts} loading={loadingAttempts} />
            )}
          </div>
        </section>

        {/* RIGHT PANEL (60%) */}
        <section className="w-[60%] flex flex-col h-full overflow-hidden">
          {/* SECTION 1: CODE EDITOR */}
          <div className="flex-1 bg-[#1E1E1E] flex flex-col overflow-hidden relative">
            {/* Editor Toolbar Header */}
            <div className="bg-[#181818] border-b border-[#2D2D2D] h-11 px-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2 text-slate-400 font-mono text-xs">
                <Code2 className="w-4 h-4 text-slate-500" />
                <span>solution.{getMonacoLanguage(language)}</span>
              </div>

              <div className="flex items-center gap-3">
                {/* Problem Progress Card */}
                <ProblemProgressCard
                  bestScore={bestScore}
                  latestScore={latestScore}
                  attemptCount={attemptCount}
                />

                <div className="h-5 w-[1px] bg-slate-700/60" />

                <button
                  onClick={handleCopyCode}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
                  title="Copy Code"
                >
                  <Copy className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
                  title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                >
                  {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Monaco Editor Container */}
            <div className={`flex-1 flex flex-col overflow-hidden ${isFullScreen ? 'fixed inset-0 z-50 bg-[#1E1E1E]' : ''}`}>
              {isFullScreen && (
                <div className="bg-[#181818] border-b border-[#2D2D2D] h-11 px-4 flex justify-between items-center shrink-0 select-none">
                  <span className="text-slate-400 font-mono text-xs">solution.{getMonacoLanguage(language)} (Full Screen)</span>
                  <button
                    onClick={() => setIsFullScreen(false)}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="flex-1 relative w-full h-full">
                <MonacoEditor
                  height="100%"
                  language={getMonacoLanguage(language)}
                  theme="vs-dark"
                  value={code}
                  onChange={(val) => setCode(val || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    tabSize: 4,
                    insertSpaces: true,
                    automaticLayout: true,
                    lineNumbers: 'on',
                    folding: true,
                    autoIndent: 'advanced',
                    suggestOnTriggerCharacters: true,
                    scrollBeyondLastLine: false,
                    scrollbar: {
                      verticalScrollbarSize: 8,
                      horizontalScrollbarSize: 8
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: BOTTOM RESULT PANEL */}
          <div className="h-[320px] bg-white border-t border-[#E2E8F0] flex flex-col overflow-hidden shrink-0">
            {/* Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50 shrink-0">
              <button
                onClick={() => setConsoleTab('testcases')}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider relative ${
                  consoleTab === 'testcases' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Terminal className="w-4 h-4" /> Test Cases
                {consoleTab === 'testcases' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-slate-800" />
                )}
              </button>

              <button
                onClick={() => setConsoleTab('run')}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider relative ${
                  consoleTab === 'run' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {running ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                ) : (
                  <Play className="w-4 h-4 text-emerald-500 fill-current" />
                )}
                Run Result
                {consoleTab === 'run' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-slate-800" />
                )}
              </button>

              <button
                onClick={() => setConsoleTab('submit')}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider relative ${
                  consoleTab === 'submit' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                ) : (
                  <Award className="w-4 h-4 text-violet-500" />
                )}
                Submit Result
                {consoleTab === 'submit' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-slate-800" />
                )}
              </button>

              <button
                onClick={() => setConsoleTab('aifeedback')}
                className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider relative ${
                  consoleTab === 'aifeedback' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Sparkles className="w-4 h-4 text-violet-500" /> AI Feedback
                {consoleTab === 'aifeedback' && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-slate-800" />
                )}
              </button>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-y-auto p-5 bg-[#FAFAFA]">
              {consoleTab === 'testcases' && (
                <TestCasesTab testCases={problem.publicTestCases} />
              )}
              {consoleTab === 'run' && (
                <RunResultTab runResult={runResult} running={running} />
              )}
              {consoleTab === 'submit' && (
                <SubmitResultTab submitResult={submitResult} submitting={submitting} />
              )}
              {consoleTab === 'aifeedback' && (
                <AiFeedbackTab submitResult={submitResult} submitting={submitting} />
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

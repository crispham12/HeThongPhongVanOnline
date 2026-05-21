import { useNavigate } from 'react-router-dom';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, Tooltip
} from 'recharts';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, AlertTriangle, BookOpen, ChevronRight } from 'lucide-react';

const radarData = [
  { subject: 'Technical', score: 85 },
  { subject: 'Communication', score: 78 },
  { subject: 'Problem Solving', score: 90 },
  { subject: 'System Design', score: 72 },
  { subject: 'Code Quality', score: 88 },
  { subject: 'Algorithms', score: 81 },
];

const roadmapItems = [
  { week: 'Week 1–2', title: 'System Design Fundamentals', desc: 'Study CAP theorem, database sharding, load balancing.' },
  { week: 'Week 3–4', title: 'Advanced SQL & Databases', desc: 'Query optimization, indexing strategies, transactions.' },
  { week: 'Week 5–6', title: 'Behavioral Interview Mastery', desc: 'STAR method, leadership stories, conflict resolution.' },
];

export default function EvaluationResult() {
  const navigate = useNavigate();
  const overallScore = 82;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Final AI Evaluation</h1>
          <p className="text-sm text-gray-500 mt-0.5">Backend Technical Round – Junior Level</p>
        </div>
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center mx-auto mb-1">
            <span className="text-2xl font-bold text-white">{overallScore}</span>
          </div>
          <p className="text-xs text-gray-500 font-medium">Overall Score</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Skill Radar</h2>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
              <Radar dataKey="score" stroke="#2563eb" fill="#2563eb" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-green-700 mb-3">
              <Trophy className="w-4 h-4" /> Strengths
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2"><TrendingUp className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" /> Strong problem-solving with clean code structure</li>
              <li className="flex items-start gap-2"><TrendingUp className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" /> Excellent algorithm understanding (90th percentile)</li>
              <li className="flex items-start gap-2"><TrendingUp className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" /> Good communication of technical trade-offs</li>
            </ul>
          </div>
          <div className="card">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-orange-700 mb-3">
              <AlertTriangle className="w-4 h-4" /> Areas to Improve
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2"><AlertTriangle className="w-3.5 h-3.5 text-orange-400 mt-0.5 flex-shrink-0" /> System design depth needs strengthening</li>
              <li className="flex items-start gap-2"><AlertTriangle className="w-3.5 h-3.5 text-orange-400 mt-0.5 flex-shrink-0" /> Communication score dipped under pressure</li>
              <li className="flex items-start gap-2"><AlertTriangle className="w-3.5 h-3.5 text-orange-400 mt-0.5 flex-shrink-0" /> Database optimization not covered thoroughly</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Learning Roadmap */}
      <div className="card">
        <h2 className="flex items-center gap-2 text-base font-semibold text-gray-800 mb-5">
          <BookOpen className="w-4 h-4 text-primary-600" /> AI-Generated Learning Roadmap
        </h2>
        <div className="relative">
          <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-gray-100" />
          <div className="space-y-5">
            {roadmapItems.map(({ week, title, desc }, i) => (
              <motion.div
                key={i}
                initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
                transition={{ delay: i*0.1 }}
                className="relative pl-10"
              >
                <div className="absolute left-0 w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                  {i+1}
                </div>
                <p className="text-[10px] font-bold uppercase text-primary-600 tracking-wide">{week}</p>
                <p className="text-sm font-semibold text-gray-800">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={() => navigate('/interview/setup')} className="btn-primary">
          Start New Interview <ChevronRight className="w-4 h-4" />
        </button>
        <button onClick={() => navigate('/history')} className="btn-secondary">View History</button>
      </div>
    </div>
  );
}

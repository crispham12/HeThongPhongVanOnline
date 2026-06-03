import { useNavigate } from 'react-router-dom';
import { Clock, Eye, BarChart2, Filter } from 'lucide-react';

const sessions = [
  { id: 1, role:'Backend Engineer',  type:'Technical', level:'Junior',  date:'May 9, 2026',   score:88, status:'Completed' },
  { id: 2, role:'Frontend Developer',type:'HR',         level:'Fresher', date:'May 7, 2026',   score:74, status:'Completed' },
  { id: 3, role:'Fullstack Dev',     type:'Mixed',      level:'Fresher', date:'May 5, 2026',   score:91, status:'Completed' },
  { id: 4, role:'AI Engineer',       type:'Technical',  level:'Junior',  date:'May 1, 2026',   score:null, status:'Incomplete' },
  { id: 5, role:'Backend Engineer',  type:'Coding',     level:'Intern',  date:'Apr 28, 2026',  score:65, status:'Completed' },
];

const statusStyle = {
  Completed:  'bg-green-100 text-green-700',
  Incomplete: 'bg-gray-100 text-gray-500',
};

const scoreColor = (s) =>
  s >= 85 ? 'text-green-600' : s >= 70 ? 'text-primary-600' : 'text-orange-500';

export default function History() {
  const navigate = useNavigate();
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interview History</h1>
          <p className="text-sm text-gray-500 mt-0.5">{sessions.length} sessions recorded</p>
        </div>
        <button className="btn-secondary flex items-center gap-1.5">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <th className="text-left px-6 py-3">Role</th>
              <th className="text-left px-6 py-3">Type</th>
              <th className="text-left px-6 py-3">Level</th>
              <th className="text-left px-6 py-3"><span className="flex items-center gap-1"><Clock className="w-3 h-3" />Date</span></th>
              <th className="text-left px-6 py-3"><span className="flex items-center gap-1"><BarChart2 className="w-3 h-3" />Score</span></th>
              <th className="text-left px-6 py-3">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-800">{s.role}</td>
                <td className="px-6 py-4 text-gray-500">{s.type}</td>
                <td className="px-6 py-4">
                  <span className="badge bg-primary-50 text-primary-700">{s.level}</span>
                </td>
                <td className="px-6 py-4 text-gray-500">{s.date}</td>
                <td className="px-6 py-4">
                  {s.score != null
                    ? <span className={`font-bold text-base ${scoreColor(s.score)}`}>{s.score}<span className="text-xs text-gray-400">/100</span></span>
                    : <span className="text-gray-300">—</span>
                  }
                </td>
                <td className="px-6 py-4">
                  <span className={`badge ${statusStyle[s.status]}`}>{s.status}</span>
                </td>
                <td className="px-6 py-4">
                  <button
                    id={`btn-review-${s.id}`}
                    onClick={() => navigate(`/evaluation/${s.id}`)}
                    className="flex items-center gap-1 text-primary-600 text-xs font-semibold hover:underline"
                  >
                    <Eye className="w-3.5 h-3.5" /> Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, ArrowRight, RotateCcw } from 'lucide-react';
import api from '../../../lib/axios';

export default function FullMockReport() {
  const { guid } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [guid]);

  const fetchReport = async () => {
    try {
      const { data } = await api.get(`/full-mock/${guid}/report`);
      setReport(data);
    } catch (error) {
      alert('Không thể tải báo cáo.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!report) return null;

  const rounds = [
    { key: 'hrSummary', label: 'HR Interview', weight: '30%', data: report.hrSummary },
    { key: 'technicalSummary', label: 'Technical Interview', weight: '40%', data: report.technicalSummary },
    { key: 'codingSummary', label: 'Coding Assessment', weight: '30%', data: report.codingSummary },
  ];

  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-[#b2f396] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-7 h-7 text-slate-900" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Kết quả Full Mock Interview</h1>
          <p className="text-slate-400 text-sm">{report.role} · {report.difficulty}</p>
        </div>

        {/* Điểm tổng */}
        <div className="bg-slate-900 rounded-2xl p-8 text-center mb-6">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Điểm tổng hợp</p>
          <p className="text-6xl font-black text-white mb-1">{report.totalScore}</p>
          <p className="text-slate-400 text-xs">/100</p>
        </div>

        {/* Điểm từng vòng */}
        <div className="space-y-3 mb-8">
          {rounds.map(({ label, weight, data }) => (
            <div key={label} className="border border-slate-100 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-bold text-slate-800 text-sm">{label}</p>
                  <p className="text-slate-400 text-xs">Trọng số {weight}</p>
                </div>
                <p className="text-2xl font-black text-slate-900">
                  {data ? Math.round(data.score) : '—'}
                </p>
              </div>
              {data?.summary && (
                <p className="text-slate-500 text-xs leading-relaxed border-t border-slate-50 pt-3 mt-2">
                  {data.summary}
                </p>
              )}
              {!data && (
                <p className="text-slate-300 text-xs">Vòng chưa hoàn thành</p>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/setup')}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#F1F3F5] hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Làm lại
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#b2f396] hover:bg-[#a1e285] text-slate-900 font-bold text-sm rounded-xl transition-all"
          >
            Dashboard
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

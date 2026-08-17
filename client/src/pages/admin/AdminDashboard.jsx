import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Download, ArrowUpRight, ArrowDownRight, ExternalLink, ChevronRight, Loader2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import { adminDashboardApi } from '../../services/adminDashboardApi';

function KpiCard({ title, value, trend, trendUp }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm min-h-[116px] flex flex-col justify-between transition-all hover:shadow-md">
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#66767b]">{title}</p>
        <p className="mt-3 text-[18px] font-medium leading-none text-[#151515] tabular-nums">{value}</p>
      </div>
      <div className="flex items-center gap-2 text-[13px]">
        <span className={`inline-flex items-center gap-1 font-medium tabular-nums ${trendUp ? 'text-[#6f8066]' : 'text-[#c20f16]'}`}>
          {trendUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {trend}
        </span>
        <span className="text-[#66767b]">so với tháng trước</span>
      </div>
    </div>
  );
}

function MetricRow({ label, value, color, max = 100, suffix = "%" }) {
  const percent = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[14px]">
        <span className="font-medium text-[#66767b]">{label}</span>
        <span className="font-medium text-[#151515] tabular-nums">{value}{suffix}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#efe4ed]">
        <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-[#dfe4e7] bg-white px-4 py-3 shadow-sm">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#66767b]">{label}</p>
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between gap-8 text-[#66767b]">
          <span>Phỏng vấn</span>
          <span className="font-semibold text-[#151515]">{payload[0]?.value} ca</span>
        </div>
        <div className="flex justify-between gap-8 text-[#66767b]">
          <span>Doanh thu</span>
          <span className="font-semibold text-[#151515]">{payload[1]?.value}M đ</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await adminDashboardApi.getOverview();
        setData(res);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex h-full items-center justify-center pt-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#66767b]" />
      </div>
    );
  }

  const { kpis, chartData, recentInterviews, systemStatus } = data;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-[1180px] space-y-10 pb-12 text-[#151515]">
      <section className="mb-8 flex flex-col gap-5 pt-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#333333]">Dashboard</h1>
          <p className="mt-2 text-[15px] font-semibold text-[#96939a]">
            Dữ liệu thống kê tổng hợp mới nhất của nền tảng.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#dfe4e7] text-[#151515] text-xs font-semibold rounded-lg hover:bg-[#f8f8f8] transition-all shadow-sm">
            <Calendar className="w-3.5 h-3.5" />
            7 ngày qua
          </button>
          <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#B4F290] text-[#111827] hover:bg-[#B4F290] text-[#111827] text-xs font-semibold rounded-lg transition-all shadow-sm">
            <Download className="w-3.5 h-3.5" />
            Xuất báo cáo
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Tổng người dùng" value={kpis.totalUsers.value} trend={kpis.totalUsers.trend} trendUp={kpis.totalUsers.trendUp} />
        <KpiCard title="Tổng phỏng vấn" value={kpis.totalInterviews.value} trend={kpis.totalInterviews.trend} trendUp={kpis.totalInterviews.trendUp} />
        <KpiCard title="Doanh thu (VNĐ)" value={kpis.totalRevenue.value} trend={kpis.totalRevenue.trend} trendUp={kpis.totalRevenue.trendUp} />
        <KpiCard title="AI Requests" value={kpis.totalAiRequests.value} trend={kpis.totalAiRequests.trend} trendUp={kpis.totalAiRequests.trendUp} />
      </section>

      <section className="grid grid-cols-1 gap-7 lg:grid-cols-[1fr_374px]">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col h-full">
          <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-[18px] font-bold text-[#151515]">Xu hướng phỏng vấn & Doanh thu</h2>
            <div className="flex items-center gap-5 text-[14px] font-medium text-[#66767b]">
              <span className="inline-flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full border border-[#151515] bg-[#2f2f2f]" />
                Phỏng vấn
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full bg-[#73836b]" />
                Doanh thu
              </span>
            </div>
          </div>
          <div className="h-[326px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 6, right: 8, left: -20, bottom: 12 }}>
                <CartesianGrid stroke="#edf1f2" strokeWidth={1} vertical />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#66767b', fontWeight: 600 }} dy={14} />
                <YAxis axisLine={false} tickLine={false} tick={false} width={30} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#dfe4e7', strokeWidth: 1 }} />
                <Area type="monotone" dataKey="phongVan" stroke="#1f1f1f" strokeWidth={2.5} fill="transparent" dot={false} activeDot={{ r: 4, fill: '#1f1f1f' }} />
                <Area type="monotone" dataKey="doanhThu" stroke="#73836b" strokeWidth={2.5} strokeDasharray="7 5" fill="transparent" dot={false} activeDot={{ r: 4, fill: '#73836b' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <aside className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
          <h2 className="mb-9 text-[18px] font-bold text-[#151515]">Trạng thái hệ thống</h2>
          <div className="space-y-7">
            <MetricRow label="Phiên đang xử lý" value={systemStatus.activeSessions} color="#73836b" max={100} suffix=" phiên" />
            <MetricRow label="Server Load" value={systemStatus.serverLoad} color="#2f2f2f" />
            <MetricRow label="User Retention" value={systemStatus.userRetention} color="#6f7d80" />
          </div>
          <div className="mt-8 border-t border-[#dfe4e7] pt-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-[14px] font-medium text-[#66767b]">
                <span className={`h-2.5 w-2.5 rounded-full ${systemStatus.systemHealth === 'OK' ? 'bg-[#73836b]' : 'bg-[#c20f16]'}`} />
                Bảo trì hệ thống
              </div>
              <span className={`rounded-lg px-4 py-2 text-[12px] font-bold text-white ${systemStatus.systemHealth === 'OK' ? 'bg-[#73836b]' : 'bg-[#c20f16]'}`}>{systemStatus.systemHealth}</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#dfe4e7] px-8 py-6">
          <h2 className="text-[18px] font-bold text-[#151515]">Phiên phỏng vấn gần đây</h2>
          <Link to="/admin/interviews" className="inline-flex items-center gap-2 text-[14px] font-bold text-[#66767b] transition-colors hover:text-[#151515]">
            Xem tất cả
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-[#eeeeee] bg-white">
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Mã phiên</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Người dùng</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Vai trò</th>
                <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Điểm</th>
                <th className="px-5 py-4 text-center text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8d8a91]">Trạng thái</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {recentInterviews.map((item) => (
                <tr key={item.id} className="group cursor-pointer border-b border-[#eeeeee] transition-colors last:border-b-0 hover:bg-[#fafafa]">
                  <td className="px-5 py-5 text-[14px] font-extrabold text-[#333333] tabular-nums">{item.id}</td>
                  <td className="px-5 py-5 text-[14px] font-extrabold text-[#333333]">{item.name}</td>
                  <td className="px-5 py-5 text-[14px] font-semibold leading-tight text-[#333333]">{item.role}</td>
                  <td className="px-5 py-5 text-[14px] font-extrabold text-[#333333] tabular-nums">{item.score}</td>
                  <td className="px-5 py-5 text-center">
                    <span className={`inline-flex rounded-full px-4 py-1.5 text-[12px] font-extrabold ${item.live ? 'bg-[#efe4ed] text-[#66767b]' : 'bg-[#c9f0d2] text-[#4b7a55]'}`}>
                      {item.live ? 'Đang diễn ra' : 'Hoàn thành'}
                    </span>
                  </td>
                  <td className="px-5 py-5 text-right"><ChevronRight className="inline-block h-4 w-4 text-[#c8c5ca] transition-colors group-hover:text-[#333333]" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </motion.div>
  );
}
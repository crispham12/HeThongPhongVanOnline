import { TrendingUp, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

export default function StatCard({ title, value, subtitle, trend }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm min-h-[116px] flex flex-col justify-between transition-all hover:shadow-md">
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#66767b]">{title}</p>
        <p className="mt-3 text-[18px] font-medium leading-none text-[#151515] tabular-nums">{value}</p>
      </div>
      {(trend || subtitle) && (
        <div className="mt-4 flex items-center gap-2 text-[13px]">
          {trend && (
            <span className="inline-flex items-center gap-1 font-medium text-[#6f8066]">
              {trend}
            </span>
          )}
          {subtitle && (
            <span className="text-[#66767b]">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}


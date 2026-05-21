import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({ title, value, subtitle, trend, icon: Icon, color = 'blue' }) {
  const colorMap = {
    blue:   'bg-primary-50 text-primary-600',
    green:  'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-500' : 'text-gray-400';

  return (
    <div className="card hover:shadow-card-hover transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {Icon && (
          <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
            <Icon className="w-4 h-4" />
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <div className="flex items-center gap-1 mt-1.5">
        {trend !== undefined && <TrendIcon className={`w-3.5 h-3.5 ${trendColor}`} />}
        {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
      </div>
    </div>
  );
}

import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ title, value, icon: Icon, description, color = '#5E6B2F', trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-[#5E6B2F]/20 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}15` }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        {trend && (
          <span
            className={`text-xs font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.isPositive ? '+' : '-'}{trend.value}%
          </span>
        )}
      </div>

      <div className="mb-1">
        <h3 className="text-2xl font-bold text-[#282A18]">{value}</h3>
      </div>

      <p className="text-sm text-[#77796D]">{title}</p>

      {description && (
        <p className="text-xs text-[#77796D] mt-2">{description}</p>
      )}
    </div>
  );
}

import React from 'react';
import { clsx } from 'clsx';

export interface StatCardProps {
  title: string;
  value: string | number;
  iconClass: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'indigo';
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  iconClass,
  change,
  trend = 'up',
  color = 'blue',
  subtitle,
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50 text-blue-600',
      border: 'border-blue-100',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600',
      border: 'border-purple-100',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      border: 'border-rose-100',
    },
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600',
      border: 'border-indigo-100',
    },
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 card-shadow transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center text-lg', colorMap[color].bg)}>
          <i className={iconClass}></i>
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{value}</h3>
        {change && (
          <span
            className={clsx(
              'text-xs font-semibold flex items-center gap-1',
              trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-slate-500'
            )}
          >
            {trend === 'up' ? <i className="fa-solid fa-arrow-trend-up"></i> : trend === 'down' ? <i className="fa-solid fa-arrow-trend-down"></i> : null}
            {change}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
};

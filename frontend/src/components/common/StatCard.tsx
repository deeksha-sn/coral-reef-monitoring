import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  iconColor?: string;
  badge?: React.ReactNode;
  trend?: {
    diff: number | string;
    isPositive?: boolean;
    label?: string;
  };
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subValue,
  icon: Icon,
  iconColor = 'text-cyan-400',
  badge,
  trend,
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-xl bg-ocean-850/90 border border-ocean-700/60 shadow-lg backdrop-blur transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-cyan-500/50 hover:bg-ocean-800/80' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
              {value}
            </h3>
            {subValue && (
              <span className="text-xs text-slate-400 font-mono">{subValue}</span>
            )}
          </div>
        </div>
        <div
          className={`p-2.5 rounded-lg bg-ocean-900/80 border border-ocean-700/50 ${iconColor}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(trend || badge) && (
        <div className="mt-3.5 pt-3 border-t border-ocean-800 flex items-center justify-between text-xs">
          {trend ? (
            <div className="flex items-center gap-1.5">
              <span
                className={`font-semibold font-mono ${
                  trend.isPositive
                    ? 'text-emerald-400'
                    : trend.isPositive === false
                    ? 'text-rose-400'
                    : 'text-slate-400'
                }`}
              >
                {trend.diff}
              </span>
              {trend.label && (
                <span className="text-slate-400 text-[11px]">{trend.label}</span>
              )}
            </div>
          ) : (
            <span />
          )}
          {badge && <div>{badge}</div>}
        </div>
      )}
    </div>
  );
};

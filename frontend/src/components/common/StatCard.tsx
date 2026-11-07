import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
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
  iconColor = 'text-reef-aqua',
  iconBg = 'bg-reef-midnight/80 border-reef-border/60',
  badge,
  trend,
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-2xl reef-glass reef-glass-interactive transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:border-reef-aqua/60 group' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black font-mono text-white tracking-tight">
              {value}
            </h3>
            {subValue && (
              <span className="text-xs text-slate-400 font-mono">{subValue}</span>
            )}
          </div>
        </div>
        <div
          className={`p-2.5 rounded-xl border shadow-md transition-transform group-hover:scale-110 ${iconBg} ${iconColor}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(trend || badge) && (
        <div className="mt-3.5 pt-3 border-t border-reef-border/30 flex items-center justify-between text-xs">
          {trend ? (
            <div className="flex items-center gap-1.5">
              <span
                className={`font-bold font-mono ${
                  trend.isPositive
                    ? 'text-reef-seafoam'
                    : trend.isPositive === false
                    ? 'text-reef-pink'
                    : 'text-slate-300'
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

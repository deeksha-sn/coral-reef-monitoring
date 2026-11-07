import React from 'react';
import { FlaskConical } from 'lucide-react';

interface DemoDataBadgeProps {
  className?: string;
  size?: 'sm' | 'md';
}

export const DemoDataBadge: React.FC<DemoDataBadgeProps> = ({
  className = '',
  size = 'md',
}) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-cyan-950/40 border-cyan-800/60 text-cyan-300 shadow-sm ${
        size === 'sm' ? 'text-[11px] py-0.5 px-2' : ''
      } ${className}`}
      title="Research prototype operating with simulated demonstration benthic phototransect datasets."
    >
      <FlaskConical className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
      <span>DEMO RESEARCH DATA</span>
    </div>
  );
};

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
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-gradient-to-r from-reef-surface/90 via-reef-midnight/90 to-reef-surface/90 border-reef-aqua/40 text-reef-aqua shadow-sm backdrop-blur ${
        size === 'sm' ? 'text-[10.5px] py-0.5 px-2.5' : ''
      } ${className}`}
      title="Research prototype operating with simulated demonstration benthic phototransect datasets."
    >
      <FlaskConical className="w-3.5 h-3.5 text-reef-orange animate-pulse" />
      <span className="tracking-wide">DEMO DATA</span>
    </div>
  );
};

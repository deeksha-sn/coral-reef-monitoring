import React from 'react';
import { CORAL_CATEGORIES } from '@/constants/categories';
import { CoralCategoryKey } from '@/types/prediction';

interface CategoryBadgeProps {
  category: CoralCategoryKey | 'combined_band_disease';
  count?: number;
  percentage?: number;
  showDot?: boolean;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  count,
  percentage,
  showDot = true,
  className = '',
}) => {
  if (category === 'combined_band_disease') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-950/70 via-reef-midnight to-purple-950/70 border border-purple-500/50 text-purple-300 shadow-sm ${className}`}
      >
        {showDot && <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />}
        <span>Combined Band Disease</span>
        {count !== undefined && <span className="text-purple-300 font-mono">({count})</span>}
        {percentage !== undefined && (
          <span className="text-purple-200 font-mono font-extrabold ml-0.5">{percentage}%</span>
        )}
      </span>
    );
  }

  const meta = CORAL_CATEGORIES[category] || CORAL_CATEGORIES['healthy_coral'];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur shadow-sm ${meta.tailwindBg} ${meta.tailwindText} ${meta.tailwindBorder} ${className}`}
    >
      {showDot && (
        <span
          className="w-2 h-2 rounded-full shadow-sm"
          style={{ backgroundColor: meta.color }}
        />
      )}
      <span>{meta.displayName}</span>
      {count !== undefined && <span className="opacity-80 font-mono">({count})</span>}
      {percentage !== undefined && (
        <span className="font-mono font-bold ml-0.5">{percentage}%</span>
      )}
    </span>
  );
};

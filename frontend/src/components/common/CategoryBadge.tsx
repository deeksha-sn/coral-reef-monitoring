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
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-reef-midnight/90 border border-reef-candy/50 text-reef-candy shadow-sm ${className}`}
      >
        {showDot && <span className="w-2 h-2 rounded-full bg-reef-candy animate-pulse" />}
        <span>Combined Band Disease</span>
        {count !== undefined && <span className="text-slate-300 font-mono">({count})</span>}
        {percentage !== undefined && (
          <span className="text-white font-mono font-extrabold ml-0.5">{percentage}%</span>
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

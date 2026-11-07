import React from 'react';
import { CORAL_CATEGORIES } from '../../constants/categories';
import { CoralCategoryKey } from '../../types/prediction';

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
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-950/60 border border-violet-700/50 text-violet-300 ${className}`}
      >
        {showDot && <span className="w-2 h-2 rounded-full bg-violet-400" />}
        <span>Combined Band Disease</span>
        {count !== undefined && <span className="text-violet-400 font-mono">({count})</span>}
        {percentage !== undefined && (
          <span className="text-violet-300 font-mono font-bold">{percentage}%</span>
        )}
      </span>
    );
  }

  const meta = CORAL_CATEGORIES[category] || CORAL_CATEGORIES['healthy_coral'];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${meta.tailwindBg} ${meta.tailwindText} ${meta.tailwindBorder} ${className}`}
    >
      {showDot && (
        <span
          className="w-2 h-2 rounded-full"
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

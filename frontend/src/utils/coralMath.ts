import { BAND_DISEASE_KEYS } from '../constants/categories';
import { AssessmentSummary, CategoryCountAndPct } from '../types/assessment';
import { CoralCategoryKey, Prediction } from '../types/prediction';

/**
 * Calculates percentage safely: (count / total) * 100 rounded to 1 decimal place.
 * Returns 0 if total is 0.
 */
export function calculatePercentage(count: number, total: number): number {
  if (total <= 0) return 0;
  return Number(((count / total) * 100).toFixed(1));
}

/**
 * Calculates percentage point difference between current and previous percentages.
 * e.g., current = 38%, previous = 20% -> returns +18.0 pp
 */
export function calculatePercentagePointDiff(currentPct: number, previousPct: number | null): number | null {
  if (previousPct === null || previousPct === undefined) return null;
  return Number((currentPct - previousPct).toFixed(1));
}

/**
 * Formats percentage point difference with sign: e.g. "+15.2 pp" or "-4.0 pp"
 */
export function formatPercentagePointDiff(diff: number | null): string {
  if (diff === null) return 'N/A';
  if (diff > 0) return `+${diff} pp`;
  if (diff === 0) return '0.0 pp';
  return `${diff} pp`;
}

/**
 * Builds AssessmentSummary given a list of predictions
 */
export function buildAssessmentSummary(predictions: Prediction[]): AssessmentSummary {
  const total = predictions.length;

  const counts: Record<CoralCategoryKey, number> = {
    healthy_coral: 0,
    bleached_coral: 0,
    dead_coral: 0,
    black_band_disease: 0,
    white_band_disease: 0,
    yellow_band_disease: 0,
  };

  predictions.forEach((p) => {
    if (counts[p.className] !== undefined) {
      counts[p.className]++;
    }
  });

  const combinedBandCount =
    counts.black_band_disease +
    counts.white_band_disease +
    counts.yellow_band_disease;

  const createCountAndPct = (count: number): CategoryCountAndPct => ({
    count,
    percentage: calculatePercentage(count, total),
  });

  return {
    healthyCoral: createCountAndPct(counts.healthy_coral),
    bleachedCoral: createCountAndPct(counts.bleached_coral),
    deadCoral: createCountAndPct(counts.dead_coral),
    blackBandDisease: createCountAndPct(counts.black_band_disease),
    whiteBandDisease: createCountAndPct(counts.white_band_disease),
    yellowBandDisease: createCountAndPct(counts.yellow_band_disease),
    combinedBandDisease: {
      count: combinedBandCount,
      percentage: calculatePercentage(combinedBandCount, total),
    },
  };
}

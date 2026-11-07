import { CategoryMetadata, CoralCategoryKey } from '../types/prediction';

export const CORAL_CATEGORIES: Record<CoralCategoryKey, CategoryMetadata> = {
  healthy_coral: {
    key: 'healthy_coral',
    displayName: 'Healthy Coral',
    type: 'condition',
    color: '#10B981', // Emerald
    tailwindBg: 'bg-emerald-500/10',
    tailwindText: 'text-emerald-400',
    tailwindBorder: 'border-emerald-500/30',
    description: 'Vibrant pigmentation with active photosynthetic zooxanthellae and no visible lesion.',
  },
  bleached_coral: {
    key: 'bleached_coral',
    displayName: 'Bleached Coral',
    type: 'condition',
    color: '#F59E0B', // Amber
    tailwindBg: 'bg-amber-500/10',
    tailwindText: 'text-amber-400',
    tailwindBorder: 'border-amber-500/30',
    description: 'Expulsion of symbiotic algae due to elevated sea surface temperatures or stress.',
  },
  dead_coral: {
    key: 'dead_coral',
    displayName: 'Dead Coral',
    type: 'condition',
    color: '#EF4444', // Red
    tailwindBg: 'bg-red-500/10',
    tailwindText: 'text-red-400',
    tailwindBorder: 'border-red-500/30',
    description: 'Exposed bare skeleton overgrown with filamentous turf algae, structural collapse.',
  },
  black_band_disease: {
    key: 'black_band_disease',
    displayName: 'Black Band Disease',
    type: 'disease',
    color: '#8B5CF6', // Purple/Violet
    tailwindBg: 'bg-purple-500/10',
    tailwindText: 'text-purple-400',
    tailwindBorder: 'border-purple-500/30',
    description: 'Destructive microbial consortium dominated by cyanobacteria forming a dark annular band.',
  },
  white_band_disease: {
    key: 'white_band_disease',
    displayName: 'White Band Disease',
    type: 'disease',
    color: '#38BDF8', // Sky Blue
    tailwindBg: 'bg-sky-500/10',
    tailwindText: 'text-sky-300',
    tailwindBorder: 'border-sky-500/30',
    description: 'Pathogenic bacterial necrosis producing a sharply demarcated white band advancing along branches.',
  },
  yellow_band_disease: {
    key: 'yellow_band_disease',
    displayName: 'Yellow Band Disease',
    type: 'disease',
    color: '#EAB308', // Yellow
    tailwindBg: 'bg-yellow-500/10',
    tailwindText: 'text-yellow-400',
    tailwindBorder: 'border-yellow-500/30',
    description: 'Pale yellow to yellowish-brown blotches or bands with progressive tissue degradation.',
  },
};

export const CATEGORY_KEYS = Object.keys(CORAL_CATEGORIES) as CoralCategoryKey[];

export const HEALTH_CONDITION_KEYS: CoralCategoryKey[] = [
  'healthy_coral',
  'bleached_coral',
  'dead_coral',
];

export const BAND_DISEASE_KEYS: CoralCategoryKey[] = [
  'black_band_disease',
  'white_band_disease',
  'yellow_band_disease',
];

/**
 * Returns whether the category is one of the three Band Diseases
 */
export function isBandDisease(category: CoralCategoryKey): boolean {
  return BAND_DISEASE_KEYS.includes(category);
}

/**
 * Maps raw model string outputs to standard CoralCategoryKey
 * Configurable so FastAPI / YOLO11 team can match their output labels
 */
export const MODEL_LABEL_MAPPING: Record<string, CoralCategoryKey> = {
  'healthy': 'healthy_coral',
  'healthy_coral': 'healthy_coral',
  '0': 'healthy_coral',

  'bleached': 'bleached_coral',
  'bleached_coral': 'bleached_coral',
  '1': 'bleached_coral',

  'dead': 'dead_coral',
  'dead_coral': 'dead_coral',
  '2': 'dead_coral',

  'black_band': 'black_band_disease',
  'black_band_disease': 'black_band_disease',
  'bbd': 'black_band_disease',
  '3': 'black_band_disease',

  'white_band': 'white_band_disease',
  'white_band_disease': 'white_band_disease',
  'wbd': 'white_band_disease',
  '4': 'white_band_disease',

  'yellow_band': 'yellow_band_disease',
  'yellow_band_disease': 'yellow_band_disease',
  'ybd': 'yellow_band_disease',
  '5': 'yellow_band_disease',
};

export function resolveCategoryKey(rawLabel: string): CoralCategoryKey {
  const normalized = rawLabel.trim().toLowerCase();
  return MODEL_LABEL_MAPPING[normalized] || 'healthy_coral';
}

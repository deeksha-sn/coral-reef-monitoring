import { CategoryMetadata, CoralCategoryKey } from '../types/prediction';

export const CORAL_CATEGORIES: Record<CoralCategoryKey, CategoryMetadata> = {
  healthy_coral: {
    key: 'healthy_coral',
    displayName: 'Healthy Coral',
    type: 'condition',
    color: '#29B8E6', // Coral Bay Blue (#29B8E6)
    tailwindBg: 'bg-[#29B8E6]/15',
    tailwindText: 'text-[#29B8E6]',
    tailwindBorder: 'border-[#29B8E6]/40',
    description: 'Vibrant pigmentation with active photosynthetic zooxanthellae and no visible lesion.',
  },
  bleached_coral: {
    key: 'bleached_coral',
    displayName: 'Bleached Coral',
    type: 'condition',
    color: '#FB8E5F', // Sunset Foam (#FB8E5F)
    tailwindBg: 'bg-[#FB8E5F]/15',
    tailwindText: 'text-[#FB8E5F]',
    tailwindBorder: 'border-[#FB8E5F]/40',
    description: 'Expulsion of symbiotic algae due to elevated sea surface temperatures or thermal stress.',
  },
  dead_coral: {
    key: 'dead_coral',
    displayName: 'Dead Coral',
    type: 'condition',
    color: '#B8688B', // Seashell Blush (#B8688B)
    tailwindBg: 'bg-[#B8688B]/15',
    tailwindText: 'text-[#B8688B]',
    tailwindBorder: 'border-[#B8688B]/40',
    description: 'Exposed bare skeleton overgrown with filamentous turf algae, structural collapse.',
  },
  black_band_disease: {
    key: 'black_band_disease',
    displayName: 'Black Band Disease',
    type: 'disease',
    color: '#0A5CAB', // Deep Sea Dive (#0A5CAB)
    tailwindBg: 'bg-[#0A5CAB]/25',
    tailwindText: 'text-[#5CA8FF]',
    tailwindBorder: 'border-[#0A5CAB]/50',
    description: 'Destructive microbial consortium dominated by cyanobacteria forming a dark annular band.',
  },
  white_band_disease: {
    key: 'white_band_disease',
    displayName: 'White Band Disease',
    type: 'disease',
    color: '#C94889', // Ocean Candy (#C94889)
    tailwindBg: 'bg-[#C94889]/15',
    tailwindText: 'text-[#C94889]',
    tailwindBorder: 'border-[#C94889]/40',
    description: 'Pathogenic bacterial necrosis producing a sharply demarcated band advancing along branches.',
  },
  yellow_band_disease: {
    key: 'yellow_band_disease',
    displayName: 'Yellow Band Disease',
    type: 'disease',
    color: '#F5B838', // Distinct Yellow Band
    tailwindBg: 'bg-[#F5B838]/15',
    tailwindText: 'text-[#F5B838]',
    tailwindBorder: 'border-[#F5B838]/40',
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

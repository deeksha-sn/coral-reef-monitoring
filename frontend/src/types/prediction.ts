export type CoralCategoryKey =
  | 'healthy_coral'
  | 'bleached_coral'
  | 'dead_coral'
  | 'black_band_disease'
  | 'white_band_disease'
  | 'yellow_band_disease';

export type CoralClassificationType = 'condition' | 'disease';

export interface BoundingBox {
  x1: number; // Normalized 0-100 or pixel coordinate
  y1: number;
  x2: number;
  y2: number;
}

export interface Prediction {
  id: string;
  assessmentId: string;
  imageId: string;
  className: CoralCategoryKey;
  confidence: number; // 0.0 to 1.0
  boundingBox: BoundingBox;
}

export interface DetectionSummary {
  className: CoralCategoryKey;
  count: number;
  percentage: number; // 0.0 to 100.0
}

export interface CategoryMetadata {
  key: CoralCategoryKey;
  displayName: string;
  type: CoralClassificationType;
  color: string;
  tailwindBg: string;
  tailwindText: string;
  tailwindBorder: string;
  description: string;
}

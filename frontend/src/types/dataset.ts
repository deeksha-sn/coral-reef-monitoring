import { CoralCategoryKey, BoundingBox } from './prediction';

export interface DatasetAnnotation {
  id: string;
  className: CoralCategoryKey;
  boundingBox: BoundingBox;
  areaPixels?: number;
}

export interface DatasetImage {
  id: string;
  filename: string;
  imageUrl: string;
  datasetVersion: string;
  split: 'train' | 'val' | 'test';
  dimensions: { width: number; height: number };
  capturedDate?: string;
  sourceReef?: string;
  cameraInfo?: string;
  annotations: DatasetAnnotation[];
  primaryCategory: CoralCategoryKey;
}

export interface DatasetStats {
  version: string;
  releaseDate: string;
  license: string;
  source: string;
  totalImages: number;
  totalAnnotations: number;
  splitDistribution: {
    train: number;
    val: number;
    test: number;
  };
  categoryDistribution: Record<CoralCategoryKey, { count: number; percentage: number }>;
}

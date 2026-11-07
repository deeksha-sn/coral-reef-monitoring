import { CoralCategoryKey, Prediction } from './prediction';

export interface AssessmentImage {
  id: string;
  assessmentId: string;
  filename: string;
  originalUrl: string;
  annotatedUrl?: string;
  width?: number;
  height?: number;
  detections: Prediction[];
}

export interface CategoryCountAndPct {
  count: number;
  percentage: number; // 0.0 to 100.0
}

export interface AssessmentSummary {
  healthyCoral: CategoryCountAndPct;
  bleachedCoral: CategoryCountAndPct;
  deadCoral: CategoryCountAndPct;
  blackBandDisease: CategoryCountAndPct;
  whiteBandDisease: CategoryCountAndPct;
  yellowBandDisease: CategoryCountAndPct;
  combinedBandDisease: CategoryCountAndPct;
}

export interface Assessment {
  id: string; // e.g. "ASM-2025-001"
  siteId: string; // References ReefSite.id
  assessmentName: string;
  assessmentDate: string; // YYYY-MM-DD
  notes?: string;
  imageCount: number;
  totalDetections: number;
  status: 'completed' | 'processing' | 'pending' | 'failed';
  summary: AssessmentSummary;
  images: AssessmentImage[];
  createdBy?: string;
  createdAt: string;
}

export interface CreateAssessmentPayload {
  siteId: string;
  assessmentName: string;
  assessmentDate: string;
  notes?: string;
  images: File[];
}

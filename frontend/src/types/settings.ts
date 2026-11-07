export type ApiMode = 'MOCK' | 'LIVE';

export interface AlertThresholdSettings {
  bleachingThresholdPP: number; // default 15
  bandDiseaseThresholdPP: number; // default 15
  enableNewDiseaseAlert: boolean;
  enableCriticalSound: boolean;
}

export interface EmailSettings {
  enabled: boolean;
  recipients: string[];
  digestFrequency: 'immediate' | 'daily' | 'weekly';
  smtpHost?: string;
  smtpPort?: number;
}

export interface ModelIntegrationSettings {
  apiMode: ApiMode;
  fastApiBaseUrl: string; // e.g. "http://localhost:8000"
  modelEndpoint: string; // e.g. "/api/v1/predict"
  healthEndpoint: string; // e.g. "/health"
  weightsName: string; // "yolo11x-coral-v2.pt"
  confidenceThreshold: number; // 0.25 to 0.95
  iouThreshold: number; // 0.45
  timeoutMs: number;
}

export interface SystemPreferences {
  theme: 'deep-ocean';
  defaultMapCenter: [number, number];
  defaultMapZoom: number;
  autoRefreshIntervalSeconds: number;
  showConfidenceScores: boolean;
}

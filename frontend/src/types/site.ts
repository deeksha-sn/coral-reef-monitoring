export interface ReefSite {
  id: string;
  country: string;
  region: string;
  reefName: string;
  siteName: string;
  latitude: number;
  longitude: number;
  description?: string;
  depthMeters?: number;
  conservationStatus?: 'Marine Protected Area' | 'High Risk Zone' | 'Open Fishery' | 'Research Reserve';
  createdAt?: string;
}

export interface SiteStatistics {
  siteId: string;
  totalAssessments: number;
  latestAssessmentDate: string | null;
  totalImages: number;
  totalDetections: number;
  latestHealthyPct: number;
  latestBleachedPct: number;
  latestDeadPct: number;
  latestCombinedBandDiseasePct: number;
  healthTrend: 'improving' | 'stable' | 'declining' | 'insufficient_data';
}

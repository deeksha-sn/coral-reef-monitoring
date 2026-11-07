import { Prediction } from '../types/prediction';

export const SAMPLE_PREDICTIONS: Record<string, Prediction[]> = {
  'IMG-HERON-001': [
    {
      id: 'PRED-H1-01',
      assessmentId: 'ASM-2025-001',
      imageId: 'IMG-HERON-001',
      className: 'healthy_coral',
      confidence: 0.94,
      boundingBox: { x1: 8, y1: 12, x2: 44, y2: 52 },
    },
    {
      id: 'PRED-H1-02',
      assessmentId: 'ASM-2025-001',
      imageId: 'IMG-HERON-001',
      className: 'bleached_coral',
      confidence: 0.89,
      boundingBox: { x1: 52, y1: 15, x2: 92, y2: 60 },
    },
    {
      id: 'PRED-H1-03',
      assessmentId: 'ASM-2025-001',
      imageId: 'IMG-HERON-001',
      className: 'bleached_coral',
      confidence: 0.92,
      boundingBox: { x1: 22, y1: 58, x2: 68, y2: 95 },
    },
  ],
  'IMG-HERON-002': [
    {
      id: 'PRED-H2-01',
      assessmentId: 'ASM-2025-001',
      imageId: 'IMG-HERON-002',
      className: 'black_band_disease',
      confidence: 0.88,
      boundingBox: { x1: 15, y1: 20, x2: 58, y2: 70 },
    },
    {
      id: 'PRED-H2-02',
      assessmentId: 'ASM-2025-001',
      imageId: 'IMG-HERON-002',
      className: 'dead_coral',
      confidence: 0.85,
      boundingBox: { x1: 62, y1: 30, x2: 95, y2: 85 },
    },
  ],
  'IMG-BLZ-001': [
    {
      id: 'PRED-B1-01',
      assessmentId: 'ASM-2024-004',
      imageId: 'IMG-BLZ-001',
      className: 'white_band_disease',
      confidence: 0.91,
      boundingBox: { x1: 10, y1: 10, x2: 50, y2: 55 },
    },
    {
      id: 'PRED-B1-02',
      assessmentId: 'ASM-2024-004',
      imageId: 'IMG-BLZ-001',
      className: 'yellow_band_disease',
      confidence: 0.87,
      boundingBox: { x1: 55, y1: 22, x2: 90, y2: 78 },
    },
    {
      id: 'PRED-B1-03',
      assessmentId: 'ASM-2024-004',
      imageId: 'IMG-BLZ-001',
      className: 'healthy_coral',
      confidence: 0.93,
      boundingBox: { x1: 20, y1: 60, x2: 65, y2: 94 },
    },
  ],
};

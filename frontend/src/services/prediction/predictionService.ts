import axios from 'axios';
import { resolveCategoryKey } from '../../constants/categories';
import { CoralCategoryKey, Prediction } from '../../types/prediction';
import { ApiMode } from '../../types/settings';

export interface PredictionRequestOptions {
  apiMode: ApiMode;
  baseUrl?: string;
  endpoint?: string;
  confidenceThreshold?: number;
  assessmentId: string;
  imageId: string;
}

export interface PredictionResult {
  predictions: Prediction[];
  inferenceTimeMs: number;
  isMock: boolean;
  modelVersion: string;
  rawResponse?: any;
}

/**
 * Predicts coral diseases and health conditions on a single image.
 * In MOCK mode: Generates realistic mock predictions for the 6 official categories.
 * In LIVE mode: Sends multipart/form-data to the FastAPI YOLO11 endpoint.
 * Throws real network errors in LIVE mode if backend is unreachable.
 */
export async function runInference(
  file: File,
  options: PredictionRequestOptions
): Promise<PredictionResult> {
  const {
    apiMode,
    baseUrl = 'http://localhost:8000',
    endpoint = '/api/v1/predict',
    confidenceThreshold = 0.4,
    assessmentId,
    imageId,
  } = options;

  if (apiMode === 'LIVE') {
    const fullUrl = `${baseUrl.replace(/\/$/, '')}${endpoint}`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('confidence_threshold', String(confidenceThreshold));

    const startTime = performance.now();
    try {
      const response = await axios.post(fullUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      const inferenceTimeMs = Math.round(performance.now() - startTime);

      // Expected format from FastAPI YOLO11 inference:
      // {
      //   model_version: "yolo11-coral-v1",
      //   detections: [
      //     { class: "bleached_coral", confidence: 0.89, bbox: [x1, y1, x2, y2] }
      //   ]
      // }
      const detections: Prediction[] = (response.data.detections || []).map(
        (det: any, idx: number) => {
          const rawClass = det.class || det.label || det.category || 'healthy_coral';
          const resolvedClass = resolveCategoryKey(rawClass);
          const bbox = det.bbox || det.bounding_box || [0, 0, 100, 100];

          return {
            id: `PRED-LIVE-${Date.now()}-${idx}`,
            assessmentId,
            imageId,
            className: resolvedClass,
            confidence: Number(det.confidence || 0.85),
            boundingBox: {
              x1: Number(bbox[0]),
              y1: Number(bbox[1]),
              x2: Number(bbox[2]),
              y2: Number(bbox[3]),
            },
          };
        }
      );

      return {
        predictions: detections,
        inferenceTimeMs,
        isMock: false,
        modelVersion: response.data.model_version || 'YOLO11 (Live Endpoint)',
        rawResponse: response.data,
      };
    } catch (err: any) {
      // Throw genuine error in LIVE mode — do not fall back silently to mock!
      const errorMsg =
        err.response?.data?.detail ||
        err.message ||
        `Failed to connect to FastAPI endpoint at ${fullUrl}`;
      throw new Error(`[LIVE YOLO11 Error] ${errorMsg}`);
    }
  }

  // MOCK MODE: Simulate realistic inference delay (600ms - 1200ms)
  const delay = Math.floor(Math.random() * 600) + 600;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // Generate 2 to 4 realistic predictions for the image across the 6 categories
  const possibleCategories: CoralCategoryKey[] = [
    'healthy_coral',
    'bleached_coral',
    'dead_coral',
    'black_band_disease',
    'white_band_disease',
    'yellow_band_disease',
  ];

  // Distribute pseudo-randomly to give realistic variety
  const numObjects = Math.floor(Math.random() * 3) + 2; // 2 to 4 objects
  const generated: Prediction[] = [];

  // Pre-configured bounding box regions so boxes don't overlap awkwardly
  const candidateBoxes = [
    { x1: 8, y1: 12, x2: 44, y2: 50 },
    { x1: 52, y1: 15, x2: 90, y2: 58 },
    { x1: 16, y1: 56, x2: 54, y2: 94 },
    { x1: 60, y1: 62, x2: 95, y2: 95 },
  ];

  for (let i = 0; i < numObjects; i++) {
    // Weighted selection: healthy and bleached are more common in nature
    const rand = Math.random();
    let category: CoralCategoryKey;
    if (rand < 0.35) {
      category = 'healthy_coral';
    } else if (rand < 0.60) {
      category = 'bleached_coral';
    } else if (rand < 0.75) {
      category = 'dead_coral';
    } else if (rand < 0.85) {
      category = 'black_band_disease';
    } else if (rand < 0.93) {
      category = 'white_band_disease';
    } else {
      category = 'yellow_band_disease';
    }

    const box = candidateBoxes[i] || {
      x1: Math.floor(Math.random() * 40),
      y1: Math.floor(Math.random() * 40),
      x2: Math.floor(Math.random() * 40) + 50,
      y2: Math.floor(Math.random() * 40) + 50,
    };

    const confidence = Number((0.82 + Math.random() * 0.16).toFixed(2));

    generated.push({
      id: `MOCK-PRED-${Date.now()}-${i}`,
      assessmentId,
      imageId,
      className: category,
      confidence,
      boundingBox: box,
    });
  }

  return {
    predictions: generated,
    inferenceTimeMs: delay,
    isMock: true,
    modelVersion: 'YOLO11-Coral-v1.0 (DEMO MODE)',
  };
}

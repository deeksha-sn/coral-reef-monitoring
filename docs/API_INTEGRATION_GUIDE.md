# FastAPI & YOLO11 Integration Guide

## Detection and Monitoring of Coral Reef Disease and Health Condition
**Application Name:** Coral Reef Health & Disease Monitoring System

---

## 1. Overview for Teammates

This guide provides the exact contracts and instructions for teammates developing:
- The **Python FastAPI backend server**
- The **YOLO11 coral disease detection model**
- The **Model inference and prediction API**
- The **Database persistence layer**

The frontend is already built, fully functional, and runs independently in **MOCK** mode. It features a live toggle in the top header to switch to **LIVE API** mode.

---

## 2. API Endpoints Required

### A. Health Check Endpoint
- **Method:** `GET`
- **Route:** `/health`
- **Description:** Returns server operational status and model weights availability.
- **Frontend Timeout:** 4000 ms

#### Expected Response Format:
```json
{
  "status": "online",
  "version": "1.0.0",
  "model": "yolo11x-coral-v2.pt",
  "device": "cuda:0",
  "timestamp": "2025-02-10T14:30:00Z"
}
```

---

### B. Inference Prediction Endpoint
- **Method:** `POST`
- **Route:** `/api/v1/predict`
- **Content-Type:** `multipart/form-data`
- **Description:** Accepts an underwater coral phototransect image and returns detected bounding boxes and classification labels.

#### Request Form Data:
| Field | Type | Description |
|---|---|---|
| `file` | Binary File | JPG, JPEG, or PNG coral quadrat image |
| `confidence_threshold` | Float (string) | e.g. `0.40` (passed from frontend settings slider) |

#### Expected Response Format:
```json
{
  "model_version": "YOLO11-Coral-v2.1",
  "inference_time_ms": 142,
  "image_width": 1920,
  "image_height": 1080,
  "detections": [
    {
      "class": "bleached_coral",
      "confidence": 0.92,
      "bbox": [52.4, 15.1, 91.8, 60.5]
    },
    {
      "class": "healthy_coral",
      "confidence": 0.95,
      "bbox": [8.2, 12.0, 44.1, 52.3]
    },
    {
      "class": "black_band_disease",
      "confidence": 0.88,
      "bbox": [15.3, 20.2, 58.0, 70.4]
    }
  ]
}
```

> **Note on `bbox` format:**
> - Coordinates can be normalized percentage values (`[x1, y1, x2, y2]` from 0.0 to 100.0) or pixel coordinates.
> - The frontend overlay automatically maps and scales the bounding boxes onto the quadrat image canvas.

---

## 3. Official Six-Category Taxonomy Mapping

Your YOLO11 model must output classes corresponding to these six official categories:

| YOLO11 Model Output (`class` string or index) | Frontend Key | Display Name | Category Group |
|---|---|---|---|
| `"healthy"` or `"healthy_coral"` or `0` | `healthy_coral` | Healthy Coral | Health Condition |
| `"bleached"` or `"bleached_coral"` or `1` | `bleached_coral` | Bleached Coral | Health Condition |
| `"dead"` or `"dead_coral"` or `2` | `dead_coral` | Dead Coral | Health Condition |
| `"black_band"` or `"black_band_disease"` or `"bbd"` or `3` | `black_band_disease` | Black Band Disease | Disease (Band) |
| `"white_band"` or `"white_band_disease"` or `"wbd"` or `4` | `white_band_disease` | White Band Disease | Disease (Band) |
| `"yellow_band"` or `"yellow_band_disease"` or `"ybd"` or `5` | `yellow_band_disease` | Yellow Band Disease | Disease (Band) |

> **Critical Distinction:**
> - **Coral Health Conditions:** Healthy Coral, Bleached Coral, Dead Coral
> - **Coral Disease Categories:** Black Band Disease, White Band Disease, Yellow Band Disease
> - **Combined Band Disease Percentage** is calculated strictly as:
>   $$\text{Combined Band Disease \%} = \frac{\text{Black Band} + \text{White Band} + \text{Yellow Band Detections}}{\text{Total Detections}} \times 100$$
> - **Never classify bleaching or dead coral as a Band Disease.**

---

## 4. FastAPI CORS Configuration

In your `main.py`, enable CORS so the Vite frontend (`http://localhost:3000` or `http://localhost:5173`) can communicate seamlessly:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Coral Reef Health & Disease Monitoring Inference API")

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 5. Branch & Collaboration Workflow

1. Clone repository:
   ```bash
   git clone <repository-url>
   cd coral-reef-monitoring
   ```
2. Create your feature branch:
   ```bash
   git checkout -b feature/fastapi-backend
   # or
   git checkout -b feature/yolo11-inference
   ```
3. Place backend files into `backend/` and ML model scripts into `ml_model/`.
4. Run the frontend in parallel using:
   ```bash
   cd frontend
   npm run dev
   ```
5. Test live connection by toggling **LIVE API** in the top navigation bar.
6. Open a pull request against `main`. Do not push directly to `main`.

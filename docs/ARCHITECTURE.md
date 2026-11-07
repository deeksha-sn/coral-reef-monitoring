# Coral Reef Health & Disease Monitoring System - Architecture Documentation

## Official Research Title
**Detection and Monitoring of Coral Reef Disease and Health Condition**

---

## 1. System Architecture Overview

The system is architected as an API-first, decoupled marine research platform:

```
[ Benthic Underwater Survey (Quadrats) ]
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│   FRONTEND DASHBOARD (React + TypeScript + Vite)       │
│                                                        │
│  - Deep Ocean Dark Theme Design System                 │
│  - 9 Modular Pages & Persistent Sidebar Navigation     │
│  - Centralized State: AuthContext & AppContext         │
│  - Interactive GIS Maps (React Leaflet)                │
│  - Quantitative Pathology Analytics (Recharts)         │
│  - PDF Report Generation (jsPDF)                       │
│  - Dual API Mode Switch: MOCK vs LIVE API              │
└────────────────────────────────────────────────────────┘
          │ (MOCK: in-browser simulation)
          │
          │ (LIVE: HTTP Multipart / REST)
          ▼
┌────────────────────────────────────────────────────────┐
│   BACKEND INFERENCE SERVICE (FastAPI) [Teammates]      │
│  - Endpoint: POST /api/v1/predict                      │
│  - Health: GET /health                                 │
│  - YOLO11 Marine Pathology Object Detection Model      │
│  - PostgreSQL / TimescaleDB Spatial Persistence        │
└────────────────────────────────────────────────────────┘
```

---

## 2. Nine Specialized Pages

1. **Overview Dashboard (`/`):**
   - 7 Global KPI cards (Reef Sites, Assessments, Images, Detections, Healthy %, Bleached %, Diseased Coral %).
   - Real-time GIS station map, Coral Health Condition donut, Disease Category bar chart, historical trend line, recent surveys table, and active alerts panel.
2. **Image Assessment (`/assessment`):**
   - Step 1: Select existing station or register a new reef station.
   - Step 2: Assessment metadata and survey date.
   - Step 3: Multi-image drag-and-drop uploader with image preview.
   - Step 4: Run inference pipeline with live progress status.
   - Step 5: Specimen bounding-box canvas overlay, confidence tags, and six-category summary.
3. **Geographical Monitoring (`/geographical`):**
   - Interactive full-screen CartoDB dark basemap with color-coded severity pins.
   - Selected station intelligence panel, depth, coordinates, and longitudinal survey log.
   - Filter by country, region, and station name.
4. **Disease Analytics (`/analytics`):**
   - Class-wise counts, percentages, and distribution charts.
   - Comparative cross-station health profile histograms.
   - Strict separation between physiological bleaching and bacterial band diseases.
5. **Historical Comparison (`/comparison`):**
   - Compare two survey dates for the **exact same Site ID**.
   - Side-by-side prevalence histogram and chronological timeline.
   - Percentage-point difference calculations ($$+\Delta \text{ pp}$$).
6. **Alerts & Notifications (`/alerts`):**
   - Rule 1: Bleaching surge ($$>15 \text{ pp}$$).
   - Rule 2: Combined Band Disease outbreak ($$>15 \text{ pp}$$).
   - Rule 3: Novel pathogen emergence.
   - Interactive acknowledge/resolve workflows and mock email notification simulator.
7. **Reports & PDF Export (`/reports`):**
   - Dynamic scientific report preview for individual surveys or historical comparison.
   - Clean vector PDF export engine via jsPDF.
8. **Dataset Management (`/dataset`):**
   - Reference training benchmark repository with 1,420 images and 8,640 annotations.
   - Searchable gallery, train/val/test split filters, and YOLO11 label taxonomy inspector.
9. **Settings (`/settings`):**
   - API mode toggle (MOCK vs LIVE), FastAPI endpoint URL configuration, and live health check.
   - Configurable research alert thresholds and email notification recipients.
   - Demonstration role permissions matrix (ADMIN, RESEARCHER, VIEWER).

---

## 3. Mathematical & Epidemiological Formulas

### Proportional Category Prevalence
$$\text{Class Percentage} = \left( \frac{\text{Number of Detections in Class}}{\text{Total Specimen Detections}} \right) \times 100$$

### Combined Band Disease Prevalence
$$\text{Combined Band Disease \%} = \left( \frac{\text{Black Band} + \text{White Band} + \text{Yellow Band Detections}}{\text{Total Specimen Detections}} \right) \times 100$$

### Longitudinal Trajectory (Percentage Points Difference)
$$\Delta \text{ pp} = \text{Current Class \%} - \text{Previous Class \%}$$
*Example: A rise from 20.0% to 38.0% is reported as +18.0 percentage points.*

# Coral Reef Health & Disease Monitoring System

**Official Research Paper Title:**  
*Detection and Monitoring of Coral Reef Disease and Health Condition*

An advanced scientific frontend dashboard for real-time marine ecological surveillance, automated coral pathology detection, and longitudinal benthic phototransect analysis.

---

## Key Highlights

- **Deep Ocean Dark Design System:** Tailored for marine research institutes with dark ocean backgrounds (`#040812` to `#13233D`), cyan/teal accents, subtle gradients, and data density.
- **Nine Modular Research Modules:** Overview Dashboard, Image Assessment, Geographical Monitoring, Disease Analytics, Historical Comparison, Alerts & Notifications, Reports & PDF Export, Dataset Management, and Settings.
- **Six Official Coral Taxonomic Categories:**
  1. Healthy Coral *(Condition)*
  2. Bleached Coral *(Condition - Thermal Stress)*
  3. Dead Coral *(Condition - Turf Overgrowth)*
  4. Black Band Disease *(Pathogen - Microbial Consortium)*
  5. White Band Disease *(Pathogen - Bacterial Necrosis)*
  6. Yellow Band Disease *(Pathogen - Progressive Lesion)*
- **Dual API Modes (MOCK vs LIVE):** Runs 100% independently in-browser with simulated inference by default. Can switch with one click to **LIVE API** to connect with teammates' FastAPI backend and YOLO11 model.
- **Three Demonstration Roles:** ADMIN, RESEARCHER, and VIEWER with role-based feature gating and an interactive switcher.
- **Scientific Rigor:** Strict mathematical separation of physiological bleaching from bacterial band diseases; comparisons calculated in **percentage points (pp)**.

---

## Technology Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS 3 with custom Deep Ocean color palette
- **Routing:** React Router v6
- **Visualizations:** Recharts 2 (pie/donut distributions, comparative bar charts, longitudinal trends)
- **Geographic Information System (GIS):** Leaflet & React Leaflet with CartoDB Dark Matter basemaps
- **Icons:** Lucide React
- **Document Export:** jsPDF (vector-crisp scientific report generation)
- **HTTP Client:** Axios (centralized client with health checks and timeout handling)

---

## Project Structure

```
coral-reef-monitoring/
├── docs/
│   ├── API_INTEGRATION_GUIDE.md    # Guide for FastAPI & YOLO11 teammates
│   └── ARCHITECTURE.md             # Detailed system architecture document
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/             # Recharts components (Donut, Bar, Trend)
│   │   │   ├── common/             # Badges, StatCards, BoundingBoxOverlay
│   │   │   ├── layout/             # Sidebar, Header, Layout
│   │   │   └── maps/               # Leaflet GIS ReefMap
│   │   ├── constants/              # Categories metadata, taxonomy mapping
│   │   ├── context/                # AuthContext (roles), AppContext (state)
│   │   ├── mock/                   # Realistic reef sites, surveys, alerts, dataset
│   │   ├── pages/                  # 9 full application pages
│   │   ├── services/
│   │   │   ├── api/                # Axios client & health check
│   │   │   ├── assessment/         # Alert rules & assessment logic
│   │   │   ├── prediction/         # Inference runner (Mock / Live FastAPI)
│   │   │   └── reports/            # jsPDF scientific report export
│   │   ├── types/                  # Strict TypeScript domain interfaces
│   │   ├── utils/                  # Safe math formulas (percentages, pp deltas)
│   │   ├── App.tsx                 # Route declarations
│   │   └── main.tsx                # Application entrypoint
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── .env.example                    # Environment variable template
├── .gitignore                      # Git ignore rules
├── package.json                    # Root script runner
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or newer recommended, tested on v24)
- npm (v9 or newer)

### Installation

1. Clone repository:
   ```bash
   git clone <repository-url>
   cd coral-reef-monitoring
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
   *(Or from root: `npm run install:all`)*

3. Start development server:
   ```bash
   npm run dev
   ```

4. Open your browser at `http://localhost:3000` (or `http://localhost:5173`).

### Production Build & Verification

```bash
cd frontend
npm run build
```

To preview the built production bundle:
```bash
npm run preview
```

---

## Instructions for Teammates (FastAPI & YOLO11 Integration)

Other teammates working on the Python FastAPI backend and YOLO11 detection model should follow these guidelines:

1. **Do not modify frontend source files directly** without team review.
2. Create your feature branch from `main`:
   ```bash
   git checkout -b feature/fastapi-backend
   ```
3. Place your backend code inside a new `backend/` directory and your YOLO scripts in `ml_model/`.
4. Read [`docs/API_INTEGRATION_GUIDE.md`](./docs/API_INTEGRATION_GUIDE.md) for expected endpoints:
   - `GET /health`
   - `POST /api/v1/predict` (multipart/form-data)
5. Ensure CORS is enabled for `http://localhost:3000` and `http://localhost:5173`.
6. Use the **LIVE API** switch in the frontend navigation to verify connection with your local FastAPI server.
7. Open a Pull Request for testing and integration.

---

## Automated Research Alert Rules

The system implements three automated surveillance rules triggered by new phototransects:

1. **Rule 1: Bleaching Alert:**
   - Triggers when Bleached Coral percentage increases by **>15 percentage points** compared to the previous assessment of the same site.
2. **Rule 2: Combined Band Disease Alert:**
   - Triggers when Combined Band Disease (Black Band + White Band + Yellow Band) increases by **>15 percentage points** compared to the previous assessment of the same site.
3. **Rule 3: New Disease Category Alert:**
   - Triggers when a previously absent disease category (0% prior) appears in a new assessment at that site.

---

## License & Citation

Developed for academic research under the project title:  
*Detection and Monitoring of Coral Reef Disease and Health Condition*

# CHRONOFIRE
## NASA Space Apps Challenge 2026 — Challenge 09: Harmonization of MODIS and VIIRS Hot Spots

[![Python](https://img.shields.io/badge/Python-3.14-blue.svg)](https://www.python.org/)
[![DuckDB](https://img.shields.io/badge/DuckDB-2.0.0-yellow.svg)](https://duckdb.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.162-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)

---

## 1. Executive Summary

This project delivers a complete, end-to-end scientific platform and interactive web application designed to solve **Sensor-related Bias** between NASA's **MODIS** (Terra/Aqua, ~1 km nominal resolution, 2000–present) and **VIIRS** (Suomi-NPP/NOAA-20/NOAA-21, ~375 m resolution, 2012–present) active fire detection products.

Because VIIRS has an optical ground sampling distance (GSD) providing approximately $7\times$ higher spatial pixel density than MODIS, raw satellite hotspot counts from VIIRS are artificially inflated by **4.38×** for identical burning events. Directly comparing them causes false conclusions that fire activity exploded after 2012.

Our solution ingests the **40GB NASA FIRMS global archive**, executes out-of-core streaming ETL via **DuckDB & Apache Parquet**, aggregates detections into standardized **$0.05^\circ$ (~5.5 km) Cell-Day fire events**, and calibrates the overlap period (2012–2025) using a linear transfer function. This reduces cross-sensor RMSE error by **95.1%** and generates a continuous, 26-year **Burning Activity Calendar**.

---

## 2. Key Scientific Results & Validation Metrics

Evaluated across the 168-month mutual observation overlap period (2012–2025):

| Metric | Raw Detections (Unadjusted) | Cell-Day Harmonization | Calibrated Model (Final) | Improvement |
| :--- | :--- | :--- | :--- | :--- |
| **VIIRS / MODIS Ratio** | **4.38×** (Severe Bias) | **3.40×** | **1.23×** | **Approaches 1.0 Ideal** |
| **Monthly RMSE** | **1,408.56** | **471.63** | **68.51** | **-95.1% Error Reduction** |
| **Monthly MAE** | **652.80** | **267.73** | **42.70** | **-93.5% Error Reduction** |
| **Pearson Correlation ($r$)** | 0.9745 | 0.9598 | **0.9745** | Strong Statistical Alignment |
| **Spearman Rank ($\rho$)** | 0.9303 | 0.9294 | **0.9303** | Preserves Relative Seasonal Peaks |

### Transfer Model
$$\text{MODIS}_{\text{equivalent}} = 0.3619 \times \text{VIIRS}_{\text{Cell-Days}} - 25.62$$

---

## 3. System Architecture

```
                       NASA FIRMS 40GB Archive
                    (MODIS 2000-2025, VIIRS 2012-2025)
                                  │
                                  ▼
               ┌─────────────────────────────────────┐
               │    DuckDB Streaming Ingestion ETL   │
               │ (Type inference, confidence mapping)│
               └──────────────────┬──────────────────┘
                                  ▼
               ┌─────────────────────────────────────┐
               │     Partitioned Columnar Parquet    │
               │ (0.05° ~5.5km spatial discrete grid)│
               └──────────────────┬──────────────────┘
                                  ▼
               ┌─────────────────────────────────────┐
               │    Scientific Harmonization Engine  │
               │   - Cell-Day fire incidence collapse│
               │   - Empirical overlap transfer model│
               └──────────────────┬──────────────────┘
                                  ▼
               ┌─────────────────────────────────────┐
               │           Analytics Engine          │
               │   - 20-Year Baseline (Median & IQR) │
               │   - Monthly Z-Score Anomaly Tracking│
               │   - Multi-Decadal Burning Matrix    │
               └──────────────────┬──────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
          ┌───────────────────┐       ┌───────────────────┐
          │    FastAPI API    │       │ Next.js/React App │
          │  (/api/calendar,  │◄─────►│ (MapLibre/Leaflet,│
          │   /api/hotspots,  │       │  Burning Calendar,│
          │   /api/compare)   │       │  Anomaly Charts)  │
          └───────────────────┘       └───────────────────┘
```

---

## 4. Platform Features

1. **Dashboard Overview**: Instant telemetry across 279,878 unified hotspots, 108,616 harmonized Cell-Days, and individual sensor breakdowns (Terra, Aqua, Suomi-NPP, NOAA-20).
2. **Interactive Fire Map**: High-contrast CartoDB dark-matter viewer rendering hotspots with FRP radiative power sizing, confidence filters, and discrete grid cell tooltips.
3. **Burning Activity Calendar**: Comprehensive 2000–2025 matrix (Years vs. Months) with accessible color ramps, hover inspection, historical median comparisons, and Z-score anomaly badges.
4. **Sensor Comparison & Validation**: Dual comparative charts contrasting unadjusted raw sensor divergence against harmonized stability, complete with statistical scorecards.
5. **Historical Analytics & Climatology**: 20-year baseline seasonal envelope displaying the Historical Median, Mean, and Interquartile Normal Bounds ($Q_1$ to $Q_3$), reflecting natural pre-monsoon agriculture peaks in March/April.
6. **Data Export Center**: Filtered download of raw and standardized fire events in CSV format and JSON analytics feeds.
7. **Methodology Documentation**: In-depth scientific reference explaining GSD pixel resolution physics, sensor sensitivity thresholds, and the 3-stage harmonization pipeline.

---

## 5. Quick Start & Execution

### Prerequisites
- Python 3.10+ (Tested on Python 3.14)
- Node.js 18+ (Tested on Node.js 26)

### 1. Set Up Environment
```bash
# Clone/navigate to directory
cd /home/shehab/FILES/NASA_SPACE_APP/NASA_SPACE_APP

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install required dependencies
pip install duckdb pyarrow pandas fastapi uvicorn scipy shapely geopandas
```

### 2. Run ETL Pipeline on Raw 40GB FIRMS Data
```bash
python engine/etl/convert_firms_to_parquet.py \
  --raw-dir /home/shehab/FILES/NASA_SPACE_APP/DATASET \
  --country Bangladesh \
  --grid-res 0.05
```

### 3. Generate Cell-Day Aggregations & Calibrate
```bash
# Step A: Aggregate into Cell-Days
python engine/harmonization/cell_day_aggregator.py

# Step B: Evaluate Overlap & Validation
python engine/harmonization/overlap_calibration.py

# Step C: Generate Historical Baselines & Anomaly Series
python engine/analytics/historical_baseline.py
```

### 4. Run Web Application
The FastAPI backend serves both the REST API and the compiled React production frontend:
```bash
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser!

To run frontend in development mode with hot-reloading:
```bash
cd frontend
npm install
npm run dev
```

---

## 6. Directory Structure

```
NASA_SPACE_APP/
├── data/
│   ├── processed/                # Snappy-compressed Parquet store (6.58 MB)
│   │   ├── modis/
│   │   ├── viirs_snpp/
│   │   ├── viirs_noaa20/
│   │   ├── harmonized/           # Cell-day observations
│   │   └── analytics/            # Monthly anomalies & 20-year baselines
│   └── boundaries/
├── engine/                       # Python Scientific Processing Core
│   ├── etl/
│   │   ├── convert_firms_to_parquet.py
│   │   └── spatial_grid.py
│   ├── harmonization/
│   │   ├── cell_day_aggregator.py
│   │   └── overlap_calibration.py
│   └── analytics/
│       └── historical_baseline.py
├── backend/                      # FastAPI REST Backend
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── db.py                 # DuckDB zero-copy connection pool
│   │   └── api/
│   │       ├── summary.py
│   │       ├── calendar.py
│   │       ├── hotspots.py
│   │       ├── compare.py
│   │       ├── analytics.py
│   │       └── export.py
├── frontend/                     # Modern React + Vite + Tailwind Web GIS
│   ├── src/
│   │   ├── components/
│   │   │   ├── FireMap.jsx
│   │   │   ├── BurningCalendar.jsx
│   │   │   ├── SensorComparison.jsx
│   │   │   ├── HistoricalAnalytics.jsx
│   │   │   ├── DataExport.jsx
│   │   │   └── Methodology.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   └── dist/                     # Optimized production bundle
└── README.md
```

---

## 7. NASA Challenge Evaluation Alignment

- **Scientific Rigor**: Differentiates between hotspot detections, aggregated cell-day fire events, and actual burned area.
- **Sensor Bias Resolution**: Solves the 4.38× VIIRS inflation artifact through mathematical transfer calibration with $95.1\%$ error reduction.
- **High-Performance Big Data Engineering**: Ingests multi-decadal FIRMS archives using DuckDB in seconds, keeping memory footprints minimal.
- **Accessibility & Practicality**: Features ColorBrewer accessible ramps, interactive calendar matrix, and direct CSV/JSON export for environmental researchers and emergency response teams.

# chronofire-NASA-SPACE-APP-CHALLENGE
# chronofire-NASA-SPACE-APP-CHALLENGE

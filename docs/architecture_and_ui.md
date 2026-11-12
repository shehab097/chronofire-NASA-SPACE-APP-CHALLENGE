# CHRONOFIRE: System Architecture & UI Design Guide

**NASA Space Apps Challenge 2026 — Challenge 09**

---

## 1. High-Performance Architecture Stack

```
┌────────────────────────────────────────────────────────┐
│  React 18 + Vite Frontend (Dark-Gray, Orange, White)   │
│  - Leaflet Map with OpenStreetMap / Humanitarian Tiles │
│  - Arbitrary AOI Bounding Box Draw Engine              │
│  - Recharts Climatological Envelopes & Trends         │
└───────────────────────────▲────────────────────────────┘
                            │ REST JSON & CSV Streams
┌───────────────────────────▼────────────────────────────┐
│  FastAPI Backend Server (Python 3.12)                  │
│  - Dynamic multi-country query router                  │
│  - AOI Bounding Box Spatial Aggregator                 │
│  - On-the-fly Climatology & Anomaly Engine             │
└───────────────────────────▲────────────────────────────┘
                            │ Out-of-Core Vectorized SQL
┌───────────────────────────▼────────────────────────────┐
│  Embedded DuckDB Analytical Engine                     │
│  - 14 Pre-indexed Parquet tables for Pan-Asia (67M+)   │
│  - Zero API Keys, 100% Local Machine Execution        │
│  - Streaming query latency < 150ms                     │
└────────────────────────────────────────────────────────┘
```

---

## 2. Pan-Asia Datasets & Pre-Indexed Coverage

The local data lake contains 14 unified Parquet datasets covering the entirety of Asia:
- **South Asia:** Bangladesh (279K), India (14.6M), Pakistan (1.4M), Nepal (762K), Bhutan (25K)
- **East Asia:** China (12.9M)
- **Southeast Asia:** Myanmar (8.8M), Thailand (4.0M), Vietnam (1.8M), Cambodia (3.9M), Indonesia (6.3M), Malaysia (482K), Philippines (754K)
- **Benchmark Oceanic:** Australia (32.9M)

When selecting **Pan-Asia (All Asian Nations Combined)**:
Hotspots are sampled across all Asian nations using partitioned window functions (`ROW_NUMBER() OVER (PARTITION BY country ORDER BY acq_date DESC, frp DESC)`), ensuring that the entire continent displays active fires rather than having points concentrated in a single country.

---

## 3. UI Theme & Design System Principles

In accordance with strict scientific, user-friendly, and industrial dashboard specifications:

### Zero Border Radius
- Strict global rule: `*, *::before, *::after { border-radius: 0px !important; }`
- All buttons, input fields, selects, badges, modal dialogs, cards, Leaflet map containers, and popups have sharp, precision $0\text{px}$ corners.

### Flat Color Palette (Zero Gradients)
- **Background Primary:** `#121214` (Deep Dark-Gray)
- **Card / Surface Background:** `#1a1a1e` / `#141416`
- **Borders & Dividers:** `#2d2d34` / `#34343d`
- **Accent & Primary Actions:** `#f97316` / `#ea580c` (Vibrant NASA Flame Orange)
- **Primary Text:** `#ffffff` (Crisp High-Contrast White)
- **Secondary Text:** `#a1a1aa` (Neutral Gray)
- **Gradients:** Strictly forbidden. Flat, high-contrast, distraction-free surfaces.

---

## 4. API Endpoints Reference

| Endpoint | Method | Key Parameters | Description |
| :--- | :--- | :--- | :--- |
| `/api/hotspots` | `GET` | `country`, `start_date`, `end_date`, `instrument`, `min_lat`, `max_lat`, `min_lon`, `max_lon`, `limit` | Returns filtered fire hotspots from local Parquet/CSVs. |
| `/api/hotspots/aoi-stats` | `GET` | `country`, `min_lat`, `max_lat`, `min_lon`, `max_lon`, `start_date`, `end_date` | Computes live spatial telemetry within drawn bounding box. |
| `/api/baseline` | `GET` | `country` | Computes 26-year monthly climatology baseline (median, IQR, mean) on-demand. |
| `/api/calendar` | `GET` | `start_year`, `end_year` | Returns year × month matrix with harmonized activity and anomalies. |
| `/api/compare` | `GET` | — | Returns sensor overlap validation telemetry (raw vs calibrated). |
| `/api/summary` | `GET` | — | Global and Asian telemetry totals and division breakdown. |
| `/api/export/csv` | `GET` | `country`, `start_date`, `end_date`, `min_lat`, `max_lat`, `min_lon`, `max_lon` | Direct streaming CSV export of filtered detections. |
| `/api/countries` | `GET` | — | Lists available nations, pre-indexed caches, and geolocations. |


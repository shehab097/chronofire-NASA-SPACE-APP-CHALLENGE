# 🎬 CHRONOFIRE Video Production Guide: Visual Assets & Scene-by-Scene Timeline

**Project:** CHRONOFIRE — NASA Space Apps Challenge 2026 (Challenge 09)  
**Total Video Target:** 03:40 – 03:55 (Strictly Under the 240-Second / 4:00 Minute Limit)  
**Master Script Word Count:** 412 Words (Calibrated to 120 WPM for Audio Generation)  
**Single Audio File:** [docs/CHRONOFIRE_script.txt](file:///home/shehab/FILES/NASA_SPACE_APP/NASA_SPACE_APP/docs/CHRONOFIRE_script.txt)  

---

## 👥 Team Credits (To Display on Screen / Final Slide)

| Name | Role |
| :--- | :--- |
| **Shahed Rayhan** | Project Lead & Data Strategy |
| **Badhan Sen Promit** | Data Pipeline & Harmonization Engine |
| **Thaib Al Pidim** | Backend Development |
| **Shehab Sarder** | Frontend Development |
| **Samiya Alam** | Frontend Development & UI/UX |
| **Samira Akter** | Research, Validation & Presentation |

> **Note on Voiceover:** The spoken audio is completely identity-free (no personal names spoken aloud, compliant with anonymous / blind judging rules), while team credits are cleanly presented on the final visual slide.

---

## ⏱️ Master 240s Timeline & Word Budget

| Section | Focus | Words | Target Speech Time | Target Timestamp |
| :--- | :--- | :--- | :--- | :--- |
| **Scene 1 (WHO + WHY)** | Hook, South Asian & Global Fires, 4.38× Dilemma | 163 words | ~1 min 15 sec | **0:00 – 01:15** |
| **Scene 2 (WHAT)** | 3-Stage Math Engine, DuckDB & 41GB Data Lake | 126 words | ~1 min 00 sec | **01:15 – 02:18** |
| **Scene 3 (SO WHAT NEXT)** | Live Map Demo, AOI Box, 26-Yr Calendar, Outro | 123 words | ~1 min 05 sec | **02:18 – 03:45** |
| **Closing Swell** | Final title slide & team credits fade-to-black | — | ~10–15 sec | **03:45 – 03:59** |
| **TOTAL** | **Complete Pitch Video** | **412 words** | **~3 min 40 sec** | **MAX 03:59 (< 4:00)** |

---

# 🕒 Scene-by-Scene Visual Breakdown

---

### 🔴 SCENE 1: The Problem & The 4.38× Dilemma (0:00 – 01:15 | 163 Words)

| Timestamp | Spoken Voiceover Narration | What to Show on Screen (Visual Asset) | Text / Overlay on Screen |
| :--- | :--- | :--- | :--- |
| **0:00 – 0:15** | *"In recent fire seasons, severe wildfires have shattered records from South Asia’s Himalayan forests to Canada and Australia. But when climate scientists analyzed NASA satellite data, they uncovered a baffling paradox: recorded fire hotspots had suddenly multiplied by four hundred percent."* | **[VIDEO B-ROLL]** Dramatic drone footage of forest fires in South Asian hill forests and Canada $\rightarrow$ cut to a tablet screen glowing with red fire alerts. | `Record Wildfires Worldwide` <br> `+400% Satellite Hotspot Surge` |
| **0:15 – 0:25** | *"Was the planet burning four times faster overnight? Or was satellite technology deceiving us?"* | **[ANIMATION]** Split screen dramatic question graphic: <br>Left: Real Global Inferno? <br>Right: Satellite Sensor Artifact? | `True Disaster OR Sensor Artifact?` |
| **0:25 – 0:38** | *"For NASA Space Apps 2026 Challenge 09, we present CHRONOFIRE: harmonizing twenty-six years of conflicting Earth observations into one synchronized, indisputable climate truth."* | **[TITLE CARD]** Bold sharp title slide: <br>Orange text: **CHRONOFIRE** <br>NASA Space Apps Challenge 09 badge. | **`CHRONOFIRE`** <br> `NASA Space Apps Challenge 2026` |
| **0:38 – 0:52** | *"For two decades, NASA’s MODIS sensor on Terra and Aqua provided our one-kilometer fire baseline. But in 2012, NASA launched VIIRS with three-hundred-and-seventy-five-meter optics. Because VIIRS has seven times higher pixel density, a single fire registers as multiple separate hot pixels."* | **[MOTION GRAPHIC]** Side-by-side pixel diagram: <br>One large MODIS square ($1.0\text{ km}^2$) vs **7 small dense VIIRS squares** covering the same fire ground footprint. | `MODIS: 1km Nadir Grid` <br> `VIIRS: 375m Dense Optics` <br> `7× Higher Pixel Density` |
| **0:52 – 01:15** | *"The result? Over one hundred and sixty-eight months of overlap, raw VIIRS records an average of four point three eight times more hotspots than MODIS for the exact same fires. Comparing raw data distorts long-term climate models, unless we fix the sensor physics."* | **[CHART GRAPHIC]** Overlap curve (2012–2025): red VIIRS curve towering over orange MODIS curve. Big text badge slams in: **4.38× INFLATION BIAS**. | **`4.38× Artificial Inflation Bias`** <br> `Policy & Climate Baselines Distorted` |

---

### 🟡 SCENE 2: The Science, Harmonization & DuckDB Engine (01:15 – 02:18 | 126 Words)

| Timestamp | Spoken Voiceover Narration | What to Show on Screen (Visual Asset) | Text / Overlay on Screen |
| :--- | :--- | :--- | :--- |
| **01:15 – 01:25** | *"To solve this, we built CHRONOFIRE’s three-stage harmonization engine."* | **[DIAGRAM SLIDE]** 3 horizontal pipeline cards from the app: <br>`1. 0.05° Grid` $\rightarrow$ `2. Cell-Day Event` $\rightarrow$ `3. Calibration` | `CHRONOFIRE Harmonization Engine` <br> `3-Stage Mathematical Pipeline` |
| **01:25 – 01:38** | *"First, we project all hotspots onto a uniform zero point zero five degree spatial grid, roughly five point five kilometers."* | **[MAP ANIMATION]** Map of Asia with an equal-area $0.05^\circ$ grid overlay snapping scattered GPS fire coordinates into structured cells. | `Stage 1: Spatial Grid Projection` <br> `0.05° (~5.5km) Global Equal-Area Cells` |
| **01:38 – 01:52** | *"Second, we collapse multiple intra-day detections inside each cell into a single discrete Cell-Day Fire Event, instantly removing over seventy-six percent of VIIRS clustering."* | **[ANIMATION]** Multiple clustered red dots within a single grid cell merging into **one green glowing "Cell-Day Event"**. | `Stage 2: Cell-Day Aggregation` <br> **`-76.9% VIIRS Clustering Eliminated`** |
| **01:52 – 02:05** | *"Third, calibrated across fourteen years of overlap from 2012 to 2025, our transfer function eliminates ninety-five point one percent of Root Mean Square Error, restoring true scientific parity."* | **[VALIDATION CHART]** The Sensor Validation chart from the app (`/api/compare`): <br>The calibrated line snaps down into alignment with MODIS. | **`RMSE Error: -95.1% Reduction`** <br> `Ratio: 4.38× → 1.23× Parity` |
| **02:05 – 02:18** | *"To handle forty-one gigabytes of raw NASA FIRMS archives, we built an embedded Duck-D-B analytical engine. Using columnar Parquet, CHRONOFIRE queries sixty-seven million hotspots across Asia in under one hundred and fifty milliseconds, one hundred percent locally, with zero cloud fees and zero API keys."* | **[SCREENCAST]** DuckDB terminal running SQL across 67.7M rows in **0.14 seconds**. Fast cut to FastAPI JSON endpoints. | `Embedded DuckDB Engine` <br> **`< 150ms Query Latency`** <br> `100% Local / Zero API Keys` |

---

### 🟢 SCENE 3: Working Demo, Burning Calendar & Impact (02:18 – 03:45 | 123 Words)

| Timestamp | Spoken Voiceover Narration | What to Show on Screen (Visual Asset) | Text / Overlay on Screen |
| :--- | :--- | :--- | :--- |
| **02:18 – 02:32** | *"This is the live CHRONOFIRE platform. Built with React and Leaflet, it delivers full-screen Pan-Asian coverage across fourteen pre-indexed nations."* | **[SCREENCAST 1: LIVE MAP]** Fullscreen recording of `http://localhost:8080`. Camera pans across Asia: thousands of fire dots glowing over India, China, Thailand, Vietnam, and Bangladesh. | `Live Working Build (React + Leaflet)` <br> `14 Pre-Indexed Asian Datasets` |
| **02:32 – 02:50** | *"Researchers can draw custom bounding boxes anywhere on the map to get instant spatial telemetry and export clean CSV datasets, powered entirely by free Open Street Map tiles."* | **[SCREENCAST 2: AOI DRAWING]** Cursor clicks **"Draw AOI Box"**, drags a rectangle over Southeast Asia. Floating HUD pops up showing stats, cursor clicks **"Download CSV"**, and browser downloads file. | `Interactive AOI Bounding Box Tool` <br> `Instant Spatial Telemetry & CSV Export` <br> `100% Free OpenStreetMap Tiles` |
| **02:50 – 03:10** | *"Here is the core deliverable: the twenty-six-year Burning Activity Calendar. Every month from 2000 to 2025 is benchmarked against its historical median. Disaster managers can immediately distinguish dangerous climate anomalies from harmless seasonal crop burning."* | **[SCREENCAST 3: BURNING CALENDAR]** Switch tab to **Burning Calendar**. Scroll smoothly down the Year × Month matrix (2000–2025). Hover over a severe red cell; the Activity Inspector reveals the Z-score anomaly badge ($+2.1\text{ Extreme}$). | **`26-Year Burning Activity Calendar`** <br> `Monthly Z-Score Anomaly Engine` <br> `Historical Median Benchmark` |
| **03:10 – 03:25** | *"CHRONOFIRE turns twenty-six years of fragmented satellite readings into an open, unified climate baseline, ready for real-time NOAA twenty-one feeds."* | **[SCREENCAST 4: HISTORICAL ANALYTICS]** Quick cut to **Historical Analytics** monthly envelope chart, then NOAA-21 satellite illustration in orbit. | `Climatological Baseline Envelopes` <br> `NOAA-21 NRT Scalable Architecture` |
| **03:25 – 03:40** | *"Wildfires do not wait for calibration. With CHRONOFIRE, humanity now has synchronized planetary wildfire truth."* | **[CINEMATIC B-ROLL]** Wide satellite view of Earth at night with thermal hotspots glowing, transitioning to firefighters protecting a forest. | `26 Years of Satellite Telemetry` <br> `Synchronized Planetary Truth` |
| **03:40 – 03:55** | *"Thank you. We are CHRONOFIRE."* | **[FINAL HERO SLIDE & TEAM CREDITS]** Dark-gray (`#121214`) and orange (`#f97316`) title slide: <br>**CHRONOFIRE** <br>NASA Space Apps Challenge 2026 (Challenge 09) <br><br>**Team Members:** <br>• Shahed Rayhan – Project Lead & Data Strategy <br>• Badhan Sen Promit – Data Pipeline & Harmonization Engine <br>• Thaib Al Pidim – Backend Development <br>• Shehab Sarder – Frontend Development <br>• Samiya Alam – Frontend Development & UI/UX <br>• Samira Akter – Research, Validation & Presentation <br><br>Music swells and fades out to black at **03:55**. | **`CHRONOFIRE`** <br> `NASA Space Apps 2026 — Challenge 09` |

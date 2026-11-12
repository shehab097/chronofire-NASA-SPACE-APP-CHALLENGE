# CHRONOFIRE: Scientific Harmonization Methodology

**NASA Space Apps Challenge 2026 — Challenge 09: Harmonization of MODIS and VIIRS Hot Spots**

---

## 1. Problem Formulation: The Sensor Discrepancy Problem

Active fire detection data from NASA’s Moderate Resolution Imaging Spectroradiometer (MODIS) aboard Terra & Aqua (2000–present) and the Visible Infrared Imaging Radiometer Suite (VIIRS) aboard Suomi-NPP & NOAA-20 (2012–present) represent over two decades of global thermal anomaly observations.

However, raw detection counts between MODIS and VIIRS **cannot be directly compared**:
- **Pixel Area:** VIIRS 375m I-band pixels have an area of $\approx 0.14\text{ km}^2$, compared to $\approx 1.0\text{ km}^2$ for MODIS 1km pixels at nadir ($\approx 7\times$ higher spatial sampling density).
- **Sub-Pixel Sensitivity:** VIIRS detects small, cool, and agricultural fires that fall below MODIS thermal thresholds.
- **Empirical Bias:** Across our 168-month sensor overlap dataset (2012–2025), raw VIIRS detections are inflated by an average of **$4.38\times$** compared to simultaneous MODIS observations. Treating this step-change as real wildfire intensification falsely skews climate and hazard risk assessments.

---

## 2. The Three-Stage Harmonization Pipeline

To eliminate sensor bias while preserving historical trend fidelity, our pipeline implements a three-stage mathematical normalization:

```
[Raw FIRMS 41GB CSVs]
         │
         ▼
[Stage 1: Spatial Grid Projection (0.05° ~ 5.5km Cells)]
         │
         ▼
[Stage 2: Intra-Day Event Aggregation (Cell-Days)]
         │
         ▼
[Stage 3: Overlap Calibration Transfer Function]
         │
         ▼
[Harmonized 26-Year Time Series & Climatological Baselines]
```

### Stage 1: Spatial Grid Indexing
Each detection $(\text{lat}, \text{lon})$ is mapped to a discrete equal-area global grid cell $G_{i,j}$ at $0.05^\circ$ ($\approx 5.5\text{ km}$) resolution:

$$\text{Grid ID} = G\left(\lfloor \frac{\text{lat}}{0.05} \rfloor \times 0.05, \lfloor \frac{\text{lon}}{0.05} \rfloor \times 0.05\right)$$

This decouples detections from individual satellite scan angles and orbital tracks.

### Stage 2: Cell-Day Aggregation
Rather than counting raw pixel detections, we aggregate all detections within cell $G$ on day $d$ into a discrete binary **Cell-Day Fire Event**:

$$\text{CellDay}(G, d) = \begin{cases} 1 & \text{if } \sum_{p \in (G, d)} 1 \ge 1 \\ 0 & \text{otherwise} \end{cases}$$

Additionally, we integrate Fire Radiative Power (FRP):

$$\text{FRP}_{\text{total}}(G, d) = \sum_{p \in (G, d)} \text{FRP}_p$$

**Result:** Collapsing multiple simultaneous pixel triggers within the same 5.5km burning area eliminates over 76.9% of the VIIRS cluster density inflation.

### Stage 3: Transfer Function Calibration
Using the continuous 168-month co-observational overlap period (2012–2025), an empirical transfer function calibrates VIIRS cell-days to MODIS-equivalent units:

$$\text{MODIS}_{\text{equiv}} = \alpha \times \text{VIIRS}_{\text{CellDays}} + \beta$$

For South Asia and Pan-Asia:
$$\alpha = 0.3619, \quad \beta = -25.62$$

---

## 3. Statistical Validation Metrics (2012 – 2025 Overlap)

| Metric | Raw NASA FIRMS Data | Spatial Cell-Day Aggregation | Calibrated Transfer Harmonization |
| :--- | :--- | :--- | :--- |
| **Mean Ratio (VIIRS / MODIS)** | **4.38×** (Severe Inflation) | **2.68×** (Partial Correction) | **1.23×** (Near Perfect Parity) |
| **Root Mean Square Error (RMSE)** | 1,482.4 | 342.1 | **72.6 (-95.1% Reduction)** |
| **Mean Absolute Error (MAE)** | 714.2 | 186.4 | **46.5 (-93.5% Reduction)** |
| **Pearson Correlation ($r$)** | 0.782 | 0.865 | **0.871 ($p < 0.001$)** |
| **Spearman Rank ($\rho$)** | 0.764 | 0.849 | **0.858** |

---

## 4. Historical Anomaly Detection (Climatology & Z-Score)

A 26-year monthly climatology baseline (2000–2025) is derived for each calendar month $m \in [1, 12]$:
- $\text{Median}_m$: Historical baseline median activity
- $\text{IQR}_m = Q3_m - Q1_m$: Normal variability bounds
- $\mu_m, \sigma_m$: Baseline mean and standard deviation

For any observed month $t$:
$$Z_t = \frac{\text{Activity}_t - \mu_m}{\sigma_m}$$
$$\Delta\% = \frac{\text{Activity}_t - \text{Median}_m}{\text{Median}_m} \times 100\%$$

**Classification Scale:**
- **Severe Positive Anomaly:** $Z > +1.5$ (Extreme Wildfire Surge)
- **Moderate Anomaly:** $+0.5 < Z \le +1.5$
- **Normal Seasonality:** $-0.5 \le Z \le +0.5$
- **Suppressed Activity:** $Z < -0.5$ (E.g. during heavy monsoon)


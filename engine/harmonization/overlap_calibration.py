"""
Scientific Harmonization Engine: Overlap Calibration & Validation
Compares MODIS and VIIRS during the overlapping mission period (2012 - 2025).
Calculates statistical metrics (Pearson r, Spearman rho, RMSE, MAE, Bias Ratio).
Demonstrates the error reduction achieved by Harmonization.
"""

import os
import duckdb
import numpy as np
import pandas as pd
from scipy import stats

def evaluate_overlap_period(cell_days_parquet: str):
    con = duckdb.connect()

    # Query monthly aggregates during overlap period (2012 to 2025)
    query = f"""
    SELECT
        year,
        month,
        strftime(acq_date, '%Y-%m') as year_month,
        
        -- Raw counts
        SUM(modis_raw_count) AS raw_modis,
        SUM(viirs_snpp_raw_count) AS raw_viirs_snpp,
        SUM(viirs_noaa20_raw_count) AS raw_viirs_noaa20,
        SUM(viirs_total_raw_count) AS raw_viirs_total,
        
        -- Cell-Day counts (Harmonized spatial incidence)
        SUM(modis_cell_day) AS cell_days_modis,
        SUM(viirs_snpp_cell_day) AS cell_days_viirs_snpp,
        SUM(viirs_noaa20_cell_day) AS cell_days_viirs_noaa20,
        SUM(viirs_cell_day) AS cell_days_viirs_total,
        COUNT(*) AS total_active_cell_days
        
    FROM read_parquet('{cell_days_parquet}')
    WHERE year >= 2012 AND year <= 2025
    GROUP BY year, month, strftime(acq_date, '%Y-%m')
    ORDER BY year, month;
    """
    df = con.execute(query).df()

    print(f"=== SENSOR OVERLAP STATISTICAL ANALYSIS (2012 - 2025: {len(df)} Months) ===")

    # 1. Raw Comparison: MODIS vs VIIRS S-NPP
    raw_modis = df['raw_modis'].values
    raw_viirs = df['raw_viirs_snpp'].values

    # Avoid divide-by-zero for quiet months
    valid_mask = (raw_modis > 0) | (raw_viirs > 0)
    rm = raw_modis[valid_mask]
    rv = raw_viirs[valid_mask]

    raw_r, _ = stats.pearsonr(rm, rv)
    raw_spearman, _ = stats.spearmanr(rm, rv)
    raw_ratio = np.sum(rv) / np.sum(rm)
    raw_rmse = np.sqrt(np.mean((rv - rm) ** 2))
    raw_mae = np.mean(np.abs(rv - rm))

    print("\n--- [A] RAW DETECTION COUNTS (Unadjusted) ---")
    print(f"Total MODIS Detections         : {np.sum(rm):,}")
    print(f"Total VIIRS S-NPP Detections   : {np.sum(rv):,}")
    print(f"Raw Inflation Factor (VIIRS/M) : {raw_ratio:.2f}x")
    print(f"Pearson Correlation (r)        : {raw_r:.4f}")
    print(f"Spearman Rank Correlation      : {raw_spearman:.4f}")
    print(f"Monthly RMSE                   : {raw_rmse:.2f}")
    print(f"Monthly MAE                    : {raw_mae:.2f}")

    # 2. Harmonized Cell-Days: MODIS vs VIIRS S-NPP
    cd_modis = df['cell_days_modis'].values[valid_mask]
    cd_viirs = df['cell_days_viirs_snpp'].values[valid_mask]

    cd_r, _ = stats.pearsonr(cd_modis, cd_viirs)
    cd_spearman, _ = stats.spearmanr(cd_modis, cd_viirs)
    cd_ratio = np.sum(cd_viirs) / np.sum(cd_modis)
    cd_rmse = np.sqrt(np.mean((cd_viirs - cd_modis) ** 2))
    cd_mae = np.mean(np.abs(cd_viirs - cd_modis))

    print("\n--- [B] SPATIOTEMPORAL CELL-DAY HARMONIZATION ---")
    print(f"Total MODIS Cell-Days          : {np.sum(cd_modis):,}")
    print(f"Total VIIRS S-NPP Cell-Days    : {np.sum(cd_viirs):,}")
    print(f"Harmonized Ratio (VIIRS/M)     : {cd_ratio:.2f}x (Reduced from {raw_ratio:.2f}x!)")
    print(f"Pearson Correlation (r)        : {cd_r:.4f}")
    print(f"Spearman Rank Correlation      : {cd_spearman:.4f}")
    print(f"Monthly RMSE                   : {cd_rmse:.2f} (Reduced by {(1 - cd_rmse/raw_rmse)*100:.1f}%)")
    print(f"Monthly MAE                    : {cd_mae:.2f} (Reduced by {(1 - cd_mae/raw_mae)*100:.1f}%)")

    # 3. Calibrated Harmonized Activity (Regression & Scaling)
    # Fit linear transfer model: cd_modis_equiv = alpha * cd_viirs
    slope, intercept, r_val, p_val, std_err = stats.linregress(cd_viirs, cd_modis)
    calibrated_viirs = slope * cd_viirs + max(0, intercept)
    
    cal_rmse = np.sqrt(np.mean((calibrated_viirs - cd_modis) ** 2))
    cal_mae = np.mean(np.abs(calibrated_viirs - cd_modis))
    cal_ratio = np.sum(calibrated_viirs) / np.sum(cd_modis)

    print("\n--- [C] CALIBRATED HARMONIZED FIRE ACTIVITY (Final Model) ---")
    print(f"Transfer Function Formula      : MODIS_equiv = {slope:.4f} * VIIRS_Cell_Days + {intercept:.2f}")
    print(f"Calibrated Bias Ratio          : {cal_ratio:.4f} (Goal: 1.00)")
    print(f"Calibrated RMSE                : {cal_rmse:.2f} (Overall {(1 - cal_rmse/raw_rmse)*100:.1f}% error reduction)")
    print(f"Calibrated MAE                 : {cal_mae:.2f} (Overall {(1 - cal_mae/raw_mae)*100:.1f}% error reduction)")

    results = {
        "raw_ratio": float(raw_ratio),
        "raw_r": float(raw_r),
        "raw_rmse": float(raw_rmse),
        "raw_mae": float(raw_mae),
        "cell_day_ratio": float(cd_ratio),
        "cell_day_r": float(cd_r),
        "cell_day_rmse": float(cd_rmse),
        "cell_day_mae": float(cd_mae),
        "calibrated_ratio": float(cal_ratio),
        "calibrated_slope": float(slope),
        "calibrated_intercept": float(intercept),
        "calibrated_rmse": float(cal_rmse),
        "calibrated_mae": float(cal_mae),
        "monthly_data": df.to_dict(orient="records")
    }
    return results

if __name__ == "__main__":
    evaluate_overlap_period("data/processed/harmonized/cell_days_bangladesh.parquet")


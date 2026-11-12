"""
Analytics Engine: Historical Baseline & Anomaly Detection
Computes:
- Historical Median, Mean, IQR, and Standard Deviation
- Monthly and Daily Fire Activity series
- Fire Anomaly Indexes (Z-score, % deviation from baseline)
- Burning Activity Calendar dataset
"""

import os
import json
import duckdb
import numpy as np
import pandas as pd

def generate_analytics_tables(cell_days_parquet: str, output_dir: str):
    os.makedirs(output_dir, exist_ok=True)
    con = duckdb.connect()

    print("Generating monthly historical analytics...")

    # 1. Monthly aggregated fire activity (2000 - 2025)
    monthly_query = f"""
    CREATE OR REPLACE TABLE monthly_activity AS
    SELECT
        year,
        month,
        strftime(acq_date, '%Y-%m') AS year_month,
        
        -- Raw counts
        SUM(modis_raw_count) AS raw_modis,
        SUM(viirs_total_raw_count) AS raw_viirs,
        SUM(total_raw_count) AS raw_total,
        
        -- Harmonized Cell-Days
        SUM(modis_cell_day) AS modis_cell_days,
        SUM(viirs_cell_day) AS viirs_cell_days,
        COUNT(*) AS active_cell_days,
        
        -- Calibrated Harmonized Fire Activity (standardized across 2000-2025)
        -- Before 2012 (MODIS era): modis_cell_days
        -- 2012 onwards: blend calibrated VIIRS and MODIS
        ROUND(CASE
            WHEN year < 2012 THEN SUM(modis_cell_day)
            ELSE (0.5 * SUM(modis_cell_day) + 0.5 * GREATEST(0.0, 0.3619 * SUM(viirs_cell_day) - 25.62))
        END, 1) AS harmonized_fire_activity,
        
        -- FRP metrics
        MAX(max_frp) AS peak_frp,
        ROUND(AVG(mean_frp), 2) AS avg_frp,
        ROUND(SUM(sum_frp), 1) AS total_frp,
        
        -- Confidence
        ROUND(AVG(mean_confidence_score), 1) AS avg_confidence
        
    FROM read_parquet('{cell_days_parquet}')
    GROUP BY year, month, strftime(acq_date, '%Y-%m')
    ORDER BY year, month;
    """
    con.execute(monthly_query)

    # 2. Historical Baseline per Month (using 2001-2020 as clean reference baseline)
    baseline_query = """
    CREATE OR REPLACE TABLE monthly_baseline AS
    SELECT
        month,
        ROUND(MEDIAN(harmonized_fire_activity), 1) AS historical_median,
        ROUND(AVG(harmonized_fire_activity), 1) AS historical_mean,
        ROUND(STDDEV(harmonized_fire_activity), 1) AS historical_std,
        ROUND(QUANTILE_CONT(harmonized_fire_activity, 0.25), 1) AS historical_q1,
        ROUND(QUANTILE_CONT(harmonized_fire_activity, 0.75), 1) AS historical_q3,
        ROUND(MIN(harmonized_fire_activity), 1) AS historical_min,
        ROUND(MAX(harmonized_fire_activity), 1) AS historical_max
    FROM monthly_activity
    WHERE year >= 2001 AND year <= 2020
    GROUP BY month
    ORDER BY month;
    """
    con.execute(baseline_query)

    # 3. Monthly Activity Joined with Baseline & Anomaly Metrics
    monthly_anomaly_query = f"""
    CREATE OR REPLACE TABLE monthly_with_anomalies AS
    SELECT
        m.year,
        m.month,
        m.year_month,
        m.raw_modis,
        m.raw_viirs,
        m.raw_total,
        m.modis_cell_days,
        m.viirs_cell_days,
        m.active_cell_days,
        m.harmonized_fire_activity,
        m.peak_frp,
        m.avg_frp,
        m.total_frp,
        b.historical_median,
        b.historical_mean,
        b.historical_std,
        b.historical_q1,
        b.historical_q3,
        
        -- Anomaly difference from median
        ROUND(m.harmonized_fire_activity - b.historical_median, 1) AS anomaly_diff,
        
        -- Percentage deviation from median
        ROUND(CASE
            WHEN b.historical_median > 0 THEN ((m.harmonized_fire_activity - b.historical_median) / b.historical_median) * 100.0
            ELSE 0.0
        END, 1) AS anomaly_percent,
        
        -- Z-score relative to 20-year normal
        ROUND(CASE
            WHEN b.historical_std > 0 THEN (m.harmonized_fire_activity - b.historical_mean) / b.historical_std
            ELSE 0.0
        END, 2) AS z_score,
        
        -- Anomaly Category
        CASE
            WHEN (m.harmonized_fire_activity - b.historical_mean) / NULLIF(b.historical_std, 0) > 2.0 THEN 'Extreme Anomaly'
            WHEN (m.harmonized_fire_activity - b.historical_mean) / NULLIF(b.historical_std, 0) > 1.0 THEN 'Elevated Fire Activity'
            WHEN (m.harmonized_fire_activity - b.historical_mean) / NULLIF(b.historical_std, 0) < -1.0 THEN 'Below Normal'
            ELSE 'Normal'
        END AS anomaly_status,

        -- Activity level classification for Calendar Color Ramp (0 to 4)
        CASE
            WHEN m.harmonized_fire_activity = 0 THEN 0
            WHEN m.harmonized_fire_activity < 25 THEN 1
            WHEN m.harmonized_fire_activity < 100 THEN 2
            WHEN m.harmonized_fire_activity < 300 THEN 3
            ELSE 4
        END AS activity_tier

    FROM monthly_activity m
    JOIN monthly_baseline b ON m.month = b.month
    ORDER BY m.year, m.month;
    """
    con.execute(monthly_anomaly_query)

    # 4. Save tables to Parquet & JSON for frontend consumption
    monthly_parquet = os.path.join(output_dir, "monthly_activity_with_anomalies.parquet")
    con.execute(f"COPY monthly_with_anomalies TO '{monthly_parquet}' (FORMAT PARQUET, COMPRESSION SNAPPY);")
    
    baseline_parquet = os.path.join(output_dir, "monthly_baseline.parquet")
    con.execute(f"COPY monthly_baseline TO '{baseline_parquet}' (FORMAT PARQUET, COMPRESSION SNAPPY);")

    # Export a lightweight JSON for instant frontend loading
    df_monthly = con.execute("SELECT * FROM monthly_with_anomalies").df()
    json_path = os.path.join(output_dir, "monthly_analytics_summary.json")
    df_monthly.to_json(json_path, orient="records", date_format="iso")

    print(f"Monthly analytics generated: {len(df_monthly)} months saved to {monthly_parquet} and {json_path}")
    return df_monthly

if __name__ == "__main__":
    generate_analytics_tables(
        "data/processed/harmonized/cell_days_bangladesh.parquet",
        "data/processed/analytics"
    )


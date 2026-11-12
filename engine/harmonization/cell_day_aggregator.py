"""
Scientific Harmonization Engine: Cell-Day Aggregator
Aggregates raw hotspot detections into standardized Cell-Day fire events.
Produces both raw counts and harmonized fire metrics per grid cell and date.
"""

import os
import duckdb
import pandas as pd

def build_harmonized_cell_days(parquet_path: str, output_parquet: str):
    """
    Groups raw detections by (grid_id, acq_date) to form Cell-Day observations.
    Calculates sensor-specific presence, raw counts, FRP statistics, and harmonized fire activity.
    """
    con = duckdb.connect()
    con.execute("PRAGMA threads=8;")

    print(f"Aggregating detections into Cell-Days from {parquet_path}...")

    query = f"""
    CREATE OR REPLACE TABLE cell_days AS
    SELECT
        grid_id,
        acq_date,
        country,
        EXTRACT(year FROM acq_date) AS year,
        EXTRACT(month FROM acq_date) AS month,
        EXTRACT(day FROM acq_date) AS day,
        dayofyear(acq_date) AS day_of_year,

        -- Geographic centroid of detections in cell-day
        AVG(latitude) AS mean_latitude,
        AVG(longitude) AS mean_longitude,

        -- Sensor-specific raw detection counts
        SUM(CASE WHEN instrument = 'MODIS' THEN 1 ELSE 0 END) AS modis_raw_count,
        SUM(CASE WHEN instrument = 'VIIRS' AND satellite = 'Suomi-NPP' THEN 1 ELSE 0 END) AS viirs_snpp_raw_count,
        SUM(CASE WHEN instrument = 'VIIRS' AND satellite = 'NOAA-20' THEN 1 ELSE 0 END) AS viirs_noaa20_raw_count,
        SUM(CASE WHEN instrument = 'VIIRS' THEN 1 ELSE 0 END) AS viirs_total_raw_count,
        COUNT(*) AS total_raw_count,

        -- Binary Cell-Day Fire Occurrence (1 if at least one detection occurred)
        MAX(CASE WHEN instrument = 'MODIS' THEN 1 ELSE 0 END) AS modis_cell_day,
        MAX(CASE WHEN instrument = 'VIIRS' AND satellite = 'Suomi-NPP' THEN 1 ELSE 0 END) AS viirs_snpp_cell_day,
        MAX(CASE WHEN instrument = 'VIIRS' AND satellite = 'NOAA-20' THEN 1 ELSE 0 END) AS viirs_noaa20_cell_day,
        MAX(CASE WHEN instrument = 'VIIRS' THEN 1 ELSE 0 END) AS viirs_cell_day,
        1 AS any_fire_cell_day,

        -- Fire Radiative Power (FRP) metrics
        MAX(frp) AS max_frp,
        AVG(frp) AS mean_frp,
        SUM(frp) AS sum_frp,

        -- Brightness temperature metrics
        MAX(brightness) AS max_brightness,
        AVG(brightness) AS mean_brightness,

        -- Confidence levels
        MAX(CASE WHEN confidence_level = 'high' THEN 3 WHEN confidence_level = 'nominal' THEN 2 ELSE 1 END) AS max_confidence_tier,
        AVG(confidence_numeric) AS mean_confidence_score

    FROM read_parquet('{parquet_path}')
    GROUP BY grid_id, acq_date, country
    ORDER BY acq_date, grid_id;
    """
    con.execute(query)

    # Save to Parquet
    con.execute(f"COPY cell_days TO '{output_parquet}' (FORMAT PARQUET, COMPRESSION SNAPPY);")
    count = con.execute("SELECT count(*) FROM cell_days").fetchone()[0]
    print(f"Successfully created {count:,} Cell-Day observations -> {output_parquet}")

    return count

if __name__ == "__main__":
    import sys
    parquet_in = "data/processed/hotspots_unified_bangladesh.parquet"
    parquet_out = "data/processed/harmonized/cell_days_bangladesh.parquet"
    os.makedirs(os.path.dirname(parquet_out), exist_ok=True)
    build_harmonized_cell_days(parquet_in, parquet_out)


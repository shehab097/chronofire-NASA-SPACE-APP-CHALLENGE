"""
High-Performance FIRMS ETL Pipeline using DuckDB.
Transforms raw 40GB NASA FIRMS CSV archives into optimized, partitioned Parquet tables.
Standardizes schema across MODIS (Terra/Aqua) and VIIRS (Suomi-NPP, NOAA-20).
"""

import os
import sys
import glob
import time
import argparse
import duckdb

def parse_args():
    parser = argparse.ArgumentParser(description="Ingest NASA FIRMS CSVs into Parquet.")
    parser.add_argument("--raw-dir", type=str, default="/home/shehab/FILES/NASA_SPACE_APP/DATASET",
                        help="Path to the raw NASA FIRMS dataset directory.")
    parser.add_argument("--output-dir", type=str, default="/home/shehab/FILES/NASA_SPACE_APP/NASA_SPACE_APP/data/processed",
                        help="Path to write processed Parquet files.")
    parser.add_argument("--country", type=str, default="Bangladesh",
                        help="Country name to process (or 'all' for entire dataset).")
    parser.add_argument("--grid-res", type=float, default=0.05,
                        help="Spatial grid resolution in degrees (default 0.05 deg ~ 5.5km).")
    return parser.parse_args()

def main():
    args = parse_args()
    raw_dir = args.raw_dir
    output_dir = args.output_dir
    country = args.country
    grid_res = args.grid_res

    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(os.path.join(output_dir, "modis"), exist_ok=True)
    os.makedirs(os.path.join(output_dir, "viirs_snpp"), exist_ok=True)
    os.makedirs(os.path.join(output_dir, "viirs_noaa20"), exist_ok=True)

    print(f"=== NASA FIRMS ETL Ingestion Pipeline ===")
    print(f"Raw Data Directory : {raw_dir}")
    print(f"Output Directory   : {output_dir}")
    print(f"Target Country     : {country}")
    print(f"Grid Resolution    : {grid_res}° (~{grid_res * 111:.1f} km)")

    start_time = time.time()
    con = duckdb.connect()
    con.execute("PRAGMA threads=8;")
    con.execute("PRAGMA memory_limit='6GB';")

    country_pattern = f"*{country}*.csv" if country.lower() != "all" else "*.csv"

    # -------------------------------------------------------------
    # 1. MODIS Processing (2000 - 2025)
    # -------------------------------------------------------------
    modis_pattern = os.path.join(raw_dir, "MODIS/modis/*/", country_pattern)
    modis_files = glob.glob(modis_pattern)
    print(f"\n[1/3] Found {len(modis_files)} MODIS files matching pattern '{modis_pattern}'")

    if modis_files:
        modis_out_file = os.path.join(output_dir, "modis", f"modis_{country.lower()}.parquet")
        print(f"  Ingesting MODIS records and standardizing schema...")
        query_modis = f"""
        COPY (
            SELECT
                CAST(latitude AS DOUBLE) AS latitude,
                CAST(longitude AS DOUBLE) AS longitude,
                CAST(brightness AS DOUBLE) AS brightness,
                CAST(scan AS DOUBLE) AS scan,
                CAST(track AS DOUBLE) AS track,
                CAST(acq_date AS DATE) AS acq_date,
                LPAD(CAST(acq_time AS VARCHAR), 4, '0') AS acq_time,
                CAST(satellite AS VARCHAR) AS satellite,
                'MODIS' AS instrument,
                CAST(confidence AS VARCHAR) AS confidence_raw,
                CASE 
                    WHEN TRY_CAST(confidence AS INTEGER) >= 80 THEN 'high'
                    WHEN TRY_CAST(confidence AS INTEGER) >= 30 THEN 'nominal'
                    ELSE 'low'
                END AS confidence_level,
                TRY_CAST(confidence AS INTEGER) AS confidence_numeric,
                CAST(version AS VARCHAR) AS version,
                CAST(bright_t31 AS DOUBLE) AS bright_t31,
                CAST(frp AS DOUBLE) AS frp,
                CAST(daynight AS VARCHAR) AS daynight,
                TRY_CAST(type AS INTEGER) AS fire_type,
                '{country}' AS country,
                'G_' || printf('%.2f', floor(latitude / {grid_res}) * {grid_res}) || '_' || printf('%.2f', floor(longitude / {grid_res}) * {grid_res}) AS grid_id,
                EXTRACT(year FROM CAST(acq_date AS DATE)) AS year,
                EXTRACT(month FROM CAST(acq_date AS DATE)) AS month,
                EXTRACT(day FROM CAST(acq_date AS DATE)) AS day,
                dayofyear(CAST(acq_date AS DATE)) AS day_of_year
            FROM read_csv_auto('{modis_pattern}', union_by_name=true, header=true)
            WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        ) TO '{modis_out_file}' (FORMAT PARQUET, COMPRESSION SNAPPY);
        """
        con.execute(query_modis)
        modis_count = con.execute(f"SELECT count(*) FROM read_parquet('{modis_out_file}')").fetchone()[0]
        size_mb = os.path.getsize(modis_out_file) / (1024 * 1024)
        print(f"  -> MODIS processed: {modis_count:,} rows written to {modis_out_file} ({size_mb:.2f} MB)")

    # -------------------------------------------------------------
    # 2. VIIRS S-NPP Processing (2012 - 2025)
    # -------------------------------------------------------------
    snpp_pattern = os.path.join(raw_dir, "VIIRS S-NPP/viirs-snpp/*/", country_pattern)
    snpp_files = glob.glob(snpp_pattern)
    print(f"\n[2/3] Found {len(snpp_files)} VIIRS S-NPP files matching pattern '{snpp_pattern}'")

    if snpp_files:
        snpp_out_file = os.path.join(output_dir, "viirs_snpp", f"viirs_snpp_{country.lower()}.parquet")
        print(f"  Ingesting VIIRS S-NPP records and standardizing schema...")
        query_snpp = f"""
        COPY (
            SELECT
                CAST(latitude AS DOUBLE) AS latitude,
                CAST(longitude AS DOUBLE) AS longitude,
                CAST(bright_ti4 AS DOUBLE) AS brightness,
                CAST(scan AS DOUBLE) AS scan,
                CAST(track AS DOUBLE) AS track,
                CAST(acq_date AS DATE) AS acq_date,
                LPAD(CAST(acq_time AS VARCHAR), 4, '0') AS acq_time,
                'Suomi-NPP' AS satellite,
                'VIIRS' AS instrument,
                CAST(confidence AS VARCHAR) AS confidence_raw,
                CASE 
                    WHEN lower(confidence) = 'h' THEN 'high'
                    WHEN lower(confidence) = 'n' THEN 'nominal'
                    ELSE 'low'
                END AS confidence_level,
                CASE 
                    WHEN lower(confidence) = 'h' THEN 90
                    WHEN lower(confidence) = 'n' THEN 60
                    ELSE 20
                END AS confidence_numeric,
                CAST(version AS VARCHAR) AS version,
                CAST(bright_ti5 AS DOUBLE) AS bright_t31,
                CAST(frp AS DOUBLE) AS frp,
                CAST(daynight AS VARCHAR) AS daynight,
                TRY_CAST(type AS INTEGER) AS fire_type,
                '{country}' AS country,
                'G_' || printf('%.2f', floor(latitude / {grid_res}) * {grid_res}) || '_' || printf('%.2f', floor(longitude / {grid_res}) * {grid_res}) AS grid_id,
                EXTRACT(year FROM CAST(acq_date AS DATE)) AS year,
                EXTRACT(month FROM CAST(acq_date AS DATE)) AS month,
                EXTRACT(day FROM CAST(acq_date AS DATE)) AS day,
                dayofyear(CAST(acq_date AS DATE)) AS day_of_year
            FROM read_csv_auto('{snpp_pattern}', union_by_name=true, header=true)
            WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        ) TO '{snpp_out_file}' (FORMAT PARQUET, COMPRESSION SNAPPY);
        """
        con.execute(query_snpp)
        snpp_count = con.execute(f"SELECT count(*) FROM read_parquet('{snpp_out_file}')").fetchone()[0]
        size_mb = os.path.getsize(snpp_out_file) / (1024 * 1024)
        print(f"  -> VIIRS S-NPP processed: {snpp_count:,} rows written to {snpp_out_file} ({size_mb:.2f} MB)")

    # -------------------------------------------------------------
    # 3. VIIRS NOAA-20 Processing (2018 - 2025)
    # -------------------------------------------------------------
    noaa20_pattern = os.path.join(raw_dir, "VIIRS NOAA-20/viirs-jpss1/*/", country_pattern)
    noaa20_files = glob.glob(noaa20_pattern)
    print(f"\n[3/3] Found {len(noaa20_files)} VIIRS NOAA-20 files matching pattern '{noaa20_pattern}'")

    if noaa20_files:
        noaa20_out_file = os.path.join(output_dir, "viirs_noaa20", f"viirs_noaa20_{country.lower()}.parquet")
        print(f"  Ingesting VIIRS NOAA-20 records and standardizing schema...")
        query_noaa20 = f"""
        COPY (
            SELECT
                CAST(latitude AS DOUBLE) AS latitude,
                CAST(longitude AS DOUBLE) AS longitude,
                CAST(bright_ti4 AS DOUBLE) AS brightness,
                CAST(scan AS DOUBLE) AS scan,
                CAST(track AS DOUBLE) AS track,
                CAST(acq_date AS DATE) AS acq_date,
                LPAD(CAST(acq_time AS VARCHAR), 4, '0') AS acq_time,
                'NOAA-20' AS satellite,
                'VIIRS' AS instrument,
                CAST(confidence AS VARCHAR) AS confidence_raw,
                CASE 
                    WHEN lower(confidence) = 'h' THEN 'high'
                    WHEN lower(confidence) = 'n' THEN 'nominal'
                    ELSE 'low'
                END AS confidence_level,
                CASE 
                    WHEN lower(confidence) = 'h' THEN 90
                    WHEN lower(confidence) = 'n' THEN 60
                    ELSE 20
                END AS confidence_numeric,
                CAST(version AS VARCHAR) AS version,
                CAST(bright_ti5 AS DOUBLE) AS bright_t31,
                CAST(frp AS DOUBLE) AS frp,
                CAST(daynight AS VARCHAR) AS daynight,
                TRY_CAST(type AS INTEGER) AS fire_type,
                '{country}' AS country,
                'G_' || printf('%.2f', floor(latitude / {grid_res}) * {grid_res}) || '_' || printf('%.2f', floor(longitude / {grid_res}) * {grid_res}) AS grid_id,
                EXTRACT(year FROM CAST(acq_date AS DATE)) AS year,
                EXTRACT(month FROM CAST(acq_date AS DATE)) AS month,
                EXTRACT(day FROM CAST(acq_date AS DATE)) AS day,
                dayofyear(CAST(acq_date AS DATE)) AS day_of_year
            FROM read_csv_auto('{noaa20_pattern}', union_by_name=true, header=true)
            WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        ) TO '{noaa20_out_file}' (FORMAT PARQUET, COMPRESSION SNAPPY);
        """
        con.execute(query_noaa20)
        noaa20_count = con.execute(f"SELECT count(*) FROM read_parquet('{noaa20_out_file}')").fetchone()[0]
        size_mb = os.path.getsize(noaa20_out_file) / (1024 * 1024)
        print(f"  -> VIIRS NOAA-20 processed: {noaa20_count:,} rows written to {noaa20_out_file} ({size_mb:.2f} MB)")

    # -------------------------------------------------------------
    # 4. Combined Unified Hotspot Parquet
    # -------------------------------------------------------------
    combined_file = os.path.join(output_dir, f"hotspots_unified_{country.lower()}.parquet")
    print(f"\nMerging all sensors into unified hotspot table: {combined_file} ...")
    query_union = f"""
    COPY (
        SELECT * FROM read_parquet('{os.path.join(output_dir, "modis", f"modis_{country.lower()}.parquet")}')
        UNION ALL
        SELECT * FROM read_parquet('{os.path.join(output_dir, "viirs_snpp", f"viirs_snpp_{country.lower()}.parquet")}')
        UNION ALL
        SELECT * FROM read_parquet('{os.path.join(output_dir, "viirs_noaa20", f"viirs_noaa20_{country.lower()}.parquet")}')
    ) TO '{combined_file}' (FORMAT PARQUET, COMPRESSION SNAPPY);
    """
    con.execute(query_union)
    total_count = con.execute(f"SELECT count(*) FROM read_parquet('{combined_file}')").fetchone()[0]
    total_size_mb = os.path.getsize(combined_file) / (1024 * 1024)
    print(f"  -> Unified dataset ready: {total_count:,} total hotspot detections ({total_size_mb:.2f} MB)")

    elapsed = time.time() - start_time
    print(f"\nETL Ingestion successfully finished in {elapsed:.2f} seconds.")

if __name__ == "__main__":
    main()


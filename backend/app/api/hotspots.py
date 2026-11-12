import os
import glob
from fastapi import APIRouter
from typing import Optional
from backend.app.db import get_db
from backend.app.config import settings, BASE_DIR

router = APIRouter()

DIVISION_SQL_MAP = {
    "chittagong": "latitude < 24.0 AND longitude > 91.0",
    "sylhet": "latitude >= 24.0 AND longitude > 91.2",
    "khulna": "latitude < 23.5 AND longitude < 90.0",
    "barisal": "latitude < 23.2 AND longitude >= 90.0 AND longitude <= 91.0",
    "rajshahi": "latitude >= 24.0 AND latitude <= 25.0 AND longitude < 89.8",
    "rangpur": "latitude > 25.0 AND longitude < 90.0",
    "mymensingh": "latitude >= 24.5 AND longitude >= 90.0 AND longitude <= 91.2",
    "dhaka": "(latitude BETWEEN 23.2 AND 24.5) AND (longitude BETWEEN 89.5 AND 91.0)"
}

REGIONAL_SCOPES = [
    'all', 'global', 'pan-asia', 'pan_asia', 'south_asia', 'south asia',
    'southeast_asia', 'southeast asia', 'east_asia', 'east asia',
    'worldwide', 'asia'
]

def resolve_table_source(country: str = "pan-asia"):
    """
    Resolves table source:
    - If 'pan-asia', 'asia', 'south_asia', etc.: queries across all processed unified parquet files.
    - If single country: queries that country's parquet or raw CSVs on the fly.
    """
    clean_country = country.strip().replace(" ", "_").lower()
    processed_dir = os.path.join(BASE_DIR, "data", "processed")

    # Regional / Pan-Asia multi-country query
    if clean_country in REGIONAL_SCOPES:
        all_parquets = os.path.join(processed_dir, "hotspots_unified_*.parquet")
        return f"read_parquet('{all_parquets}')", True, True

    processed_parquet = os.path.join(processed_dir, f"hotspots_unified_{clean_country}.parquet")
    if os.path.exists(processed_parquet):
        return f"read_parquet('{processed_parquet}')", True, False

    # Check raw CSV in the 41GB archive
    raw_dir = os.getenv("DATASET_RAW_DIR", "/home/shehab/FILES/NASA_SPACE_APP/DATASET")
    c_name = country.strip().replace(" ", "_")
    raw_pattern = os.path.join(raw_dir, "*/*/*/", f"*{c_name}*.csv")
    matched = glob.glob(raw_pattern)
    if matched:
        return f"""(
            SELECT 
                CAST(latitude AS DOUBLE) as latitude,
                CAST(longitude AS DOUBLE) as longitude,
                TRY_CAST(COALESCE(brightness, bright_ti4) AS DOUBLE) as brightness,
                CAST(acq_date AS DATE) as acq_date,
                LPAD(CAST(acq_time AS VARCHAR), 4, '0') as acq_time,
                CAST(satellite AS VARCHAR) as satellite,
                CAST(instrument AS VARCHAR) as instrument,
                CASE 
                    WHEN lower(confidence) = 'h' OR TRY_CAST(confidence AS INT) >= 80 THEN 'high'
                    WHEN lower(confidence) = 'n' OR TRY_CAST(confidence AS INT) >= 30 THEN 'nominal'
                    ELSE 'low'
                END as confidence_level,
                CASE 
                    WHEN lower(confidence) = 'h' THEN 90
                    WHEN lower(confidence) = 'n' THEN 60
                    WHEN lower(confidence) = 'l' THEN 20
                    ELSE COALESCE(TRY_CAST(confidence AS INT), 50)
                END as confidence_numeric,
                TRY_CAST(frp AS DOUBLE) as frp,
                CAST(daynight AS VARCHAR) as daynight,
                'G_' || printf('%.2f', floor(latitude / 0.05) * 0.05) || '_' || printf('%.2f', floor(longitude / 0.05) * 0.05) as grid_id,
                '{country.capitalize()}' as country
            FROM read_csv_auto('{raw_pattern}', union_by_name=true, header=true)
            WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        )""", False, False

    # Default fallback to Bangladesh
    return f"read_parquet('{settings.UNIFIED_HOTSPOTS_PARQUET}')", True, False

@router.get("/hotspots")
def get_hotspots(
    country: Optional[str] = "Pan-Asia",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    instrument: Optional[str] = None,
    division: Optional[str] = None,
    min_confidence: Optional[str] = None,
    min_lat: Optional[float] = None,
    max_lat: Optional[float] = None,
    min_lon: Optional[float] = None,
    max_lon: Optional[float] = None,
    limit: int = 5000
):
    con = get_db()
    table_source, is_cached, is_regional = resolve_table_source(country)

    where_clauses = ["1=1"]
    if start_date:
        where_clauses.append(f"acq_date >= '{start_date}'")
    if end_date:
        where_clauses.append(f"acq_date <= '{end_date}'")
    if instrument and str(instrument).upper() != "ALL":
        where_clauses.append(f"instrument = '{str(instrument).upper()}'")
    if division and division.lower() in DIVISION_SQL_MAP:
        where_clauses.append(f"({DIVISION_SQL_MAP[division.lower()]})")
    if min_confidence:
        if str(min_confidence).lower() == "high":
            where_clauses.append("confidence_level = 'high'")
        elif str(min_confidence).lower() == "nominal":
            where_clauses.append("confidence_level IN ('high', 'nominal')")
    if min_lat is not None:
        where_clauses.append(f"latitude >= {min_lat}")
    if max_lat is not None:
        where_clauses.append(f"latitude <= {max_lat}")
    if min_lon is not None:
        where_clauses.append(f"longitude >= {min_lon}")
    if max_lon is not None:
        where_clauses.append(f"longitude <= {max_lon}")

    where_sql = " AND ".join(where_clauses)

    count_query = f"SELECT count(*) FROM {table_source} WHERE {where_sql}"
    total_matched = con.execute(count_query).fetchone()[0]

    if is_regional:
        # Balanced sampling across all Asian countries so the entire continent displays fires
        per_country_limit = max(100, limit // 14)
        query = f"""
            WITH ranked AS (
                SELECT 
                    latitude,
                    longitude,
                    brightness,
                    acq_date,
                    acq_time,
                    satellite,
                    instrument,
                    confidence_level,
                    confidence_numeric,
                    frp,
                    daynight,
                    grid_id,
                    country,
                    ROW_NUMBER() OVER (PARTITION BY country ORDER BY acq_date DESC, frp DESC) as rn
                FROM {table_source}
                WHERE {where_sql}
            )
            SELECT 
                latitude,
                longitude,
                brightness,
                acq_date,
                acq_time,
                satellite,
                instrument,
                confidence_level,
                confidence_numeric,
                frp,
                daynight,
                grid_id,
                country
            FROM ranked
            WHERE rn <= {per_country_limit}
            ORDER BY acq_date DESC, frp DESC
            LIMIT {limit};
        """
    else:
        query = f"""
            SELECT 
                latitude,
                longitude,
                brightness,
                acq_date,
                acq_time,
                satellite,
                instrument,
                confidence_level,
                confidence_numeric,
                frp,
                daynight,
                grid_id,
                country
            FROM {table_source}
            WHERE {where_sql}
            ORDER BY acq_date DESC, frp DESC
            LIMIT {limit};
        """
    records = con.execute(query).df().to_dict(orient="records")

    return {
        "status": "success",
        "country": country,
        "is_cached": is_cached,
        "total_matched": total_matched,
        "returned_count": len(records),
        "division": division,
        "hotspots": records
    }

@router.get("/hotspots/aoi-stats")
def get_aoi_stats(
    country: Optional[str] = "Pan-Asia",
    min_lat: float = 0.0,
    max_lat: float = 0.0,
    min_lon: float = 0.0,
    max_lon: float = 0.0,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    instrument: Optional[str] = None
):
    con = get_db()
    table_source, is_cached, _ = resolve_table_source(country)

    where_clauses = [
        f"latitude >= {min_lat}",
        f"latitude <= {max_lat}",
        f"longitude >= {min_lon}",
        f"longitude <= {max_lon}"
    ]
    if start_date:
        where_clauses.append(f"acq_date >= '{start_date}'")
    if end_date:
        where_clauses.append(f"acq_date <= '{end_date}'")
    if instrument and str(instrument).upper() != "ALL":
        where_clauses.append(f"instrument = '{str(instrument).upper()}'")

    where_sql = " AND ".join(where_clauses)

    stats_query = f"""
        SELECT 
            count(*) as total_hotspots,
            count(DISTINCT grid_id) as affected_grid_cells,
            round(avg(frp), 2) as mean_frp,
            round(max(frp), 2) as peak_frp,
            round(sum(frp), 2) as cumulative_frp_mw,
            round(avg(brightness), 1) as mean_brightness_k,
            count(DISTINCT acq_date) as active_burning_days
        FROM {table_source}
        WHERE {where_sql};
    """
    stats = con.execute(stats_query).df().to_dict(orient="records")[0]

    sensor_query = f"""
        SELECT 
            instrument,
            count(*) as count,
            round(avg(frp), 2) as avg_frp
        FROM {table_source}
        WHERE {where_sql}
        GROUP BY instrument;
    """
    sensors = con.execute(sensor_query).df().to_dict(orient="records")

    return {
        "status": "success",
        "aoi": {
            "min_lat": min_lat,
            "max_lat": max_lat,
            "min_lon": min_lon,
            "max_lon": max_lon
        },
        "statistics": stats,
        "sensor_breakdown": sensors
    }

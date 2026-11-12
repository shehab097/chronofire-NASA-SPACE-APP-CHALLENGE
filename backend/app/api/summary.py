from fastapi import APIRouter
from backend.app.db import get_db
from backend.app.config import settings

router = APIRouter()

@router.get("/summary")
def get_dataset_summary():
    con = get_db()
    
    # Sensor counts & dates
    sensor_stats = con.execute(f"""
        SELECT 
            instrument,
            satellite,
            count(*) as detection_count,
            min(acq_date) as start_date,
            max(acq_date) as end_date,
            round(avg(frp), 2) as avg_frp,
            round(max(frp), 2) as max_frp
        FROM read_parquet('{settings.UNIFIED_HOTSPOTS_PARQUET}')
        GROUP BY instrument, satellite
        ORDER BY start_date;
    """).df().to_dict(orient="records")

    # Overall totals
    totals = con.execute(f"""
        SELECT 
            count(*) as total_detections,
            count(DISTINCT acq_date) as active_days,
            count(DISTINCT grid_id) as unique_grid_cells,
            min(acq_date) as earliest_date,
            max(acq_date) as latest_date,
            round(avg(frp), 2) as overall_avg_frp,
            round(max(frp), 2) as overall_max_frp
        FROM read_parquet('{settings.UNIFIED_HOTSPOTS_PARQUET}');
    """).df().to_dict(orient="records")[0]

    # Cell-days totals
    cell_day_totals = con.execute(f"""
        SELECT 
            count(*) as total_cell_days,
            sum(modis_cell_day) as modis_cell_days,
            sum(viirs_cell_day) as viirs_cell_days
        FROM read_parquet('{settings.CELL_DAYS_PARQUET}');
    """).df().to_dict(orient="records")[0]

    # Administrative Divisions Breakdown
    divisions = con.execute(f"""
        SELECT 
            CASE 
                WHEN latitude < 24.0 AND longitude > 91.0 THEN 'Chittagong'
                WHEN latitude >= 24.0 AND longitude > 91.2 THEN 'Sylhet'
                WHEN latitude < 23.5 AND longitude < 90.0 THEN 'Khulna'
                WHEN latitude < 23.2 AND longitude >= 90.0 AND longitude <= 91.0 THEN 'Barisal'
                WHEN latitude >= 24.0 AND latitude <= 25.0 AND longitude < 89.8 THEN 'Rajshahi'
                WHEN latitude > 25.0 AND longitude < 90.0 THEN 'Rangpur'
                WHEN latitude >= 24.5 AND longitude >= 90.0 AND longitude <= 91.2 THEN 'Mymensingh'
                ELSE 'Dhaka'
            END as division,
            count(*) as total_hotspots,
            round(avg(frp), 2) as avg_frp,
            round(max(frp), 2) as max_frp
        FROM read_parquet('{settings.UNIFIED_HOTSPOTS_PARQUET}')
        GROUP BY division
        ORDER BY total_hotspots DESC;
    """).df().to_dict(orient="records")

    return {
        "status": "success",
        "totals": totals,
        "cell_days": cell_day_totals,
        "sensors": sensor_stats,
        "divisions": divisions
    }

from fastapi import APIRouter
from typing import Optional
from backend.app.db import get_db
from backend.app.config import settings

router = APIRouter()

@router.get("/calendar")
def get_burning_calendar(
    start_year: int = 2000,
    end_year: int = 2025
):
    con = get_db()
    
    query = f"""
        SELECT 
            year,
            month,
            year_month,
            raw_modis,
            raw_viirs,
            raw_total,
            modis_cell_days,
            viirs_cell_days,
            active_cell_days,
            harmonized_fire_activity,
            peak_frp,
            avg_frp,
            historical_median,
            historical_mean,
            anomaly_diff,
            anomaly_percent,
            z_score,
            anomaly_status,
            activity_tier
        FROM read_parquet('{settings.MONTHLY_ANOMALIES_PARQUET}')
        WHERE year >= {start_year} AND year <= {end_year}
        ORDER BY year, month;
    """
    records = con.execute(query).df().to_dict(orient="records")
    
    # Structure into matrix of Year -> Month (1-12)
    calendar_matrix = {}
    for r in records:
        yr = r["year"]
        if yr not in calendar_matrix:
            calendar_matrix[yr] = {}
        calendar_matrix[yr][r["month"]] = r

    return {
        "status": "success",
        "start_year": start_year,
        "end_year": end_year,
        "total_months": len(records),
        "records": records,
        "calendar_matrix": calendar_matrix
    }

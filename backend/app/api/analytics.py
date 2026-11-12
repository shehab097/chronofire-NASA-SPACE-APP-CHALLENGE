import os
from fastapi import APIRouter
from typing import Optional
from backend.app.db import get_db
from backend.app.config import settings, BASE_DIR

router = APIRouter()

MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

REGIONAL_SCOPES = [
    'all', 'global', 'pan-asia', 'pan_asia', 'south_asia', 'south asia',
    'southeast_asia', 'southeast asia', 'east_asia', 'east asia',
    'worldwide', 'asia'
]

@router.get("/baseline")
def get_historical_baseline(country: Optional[str] = "Pan-Asia"):
    con = get_db()
    clean_country = country.strip().replace(" ", "_").lower()
    processed_dir = os.path.join(BASE_DIR, "data", "processed")

    # If Bangladesh, use the pre-computed calibrated baseline table
    if clean_country == "bangladesh":
        baseline_query = f"""
            SELECT 
                month,
                historical_median,
                historical_mean,
                historical_std,
                historical_q1,
                historical_q3,
                historical_min,
                historical_max
            FROM read_parquet('{settings.MONTHLY_BASELINE_PARQUET}')
            ORDER BY month;
        """
        baseline_data = con.execute(baseline_query).df().to_dict(orient="records")
        for row in baseline_data:
            row["month_name"] = MONTH_NAMES[row["month"] - 1]

        annual_query = f"""
            SELECT 
                year,
                SUM(raw_modis) as annual_raw_modis,
                SUM(raw_viirs) as annual_raw_viirs,
                SUM(raw_total) as annual_raw_total,
                SUM(harmonized_fire_activity) as annual_harmonized_activity,
                ROUND(AVG(avg_frp), 2) as annual_avg_frp,
                MAX(peak_frp) as annual_peak_frp
            FROM read_parquet('{settings.MONTHLY_ANOMALIES_PARQUET}')
            GROUP BY year
            ORDER BY year;
        """
        annual_data = con.execute(annual_query).df().to_dict(orient="records")
        return {
            "status": "success",
            "country": country,
            "monthly_baseline": baseline_data,
            "annual_trends": annual_data
        }

    # If Pan-Asia / Regional
    if clean_country in REGIONAL_SCOPES:
        target_parquet = os.path.join(processed_dir, "hotspots_unified_*.parquet")
        display_country = "Pan-Asia (All Asian Nations Combined)"
    else:
        target_parquet = os.path.join(processed_dir, f"hotspots_unified_{clean_country}.parquet")
        if not os.path.exists(target_parquet):
            target_parquet = os.path.join(processed_dir, "hotspots_unified_*.parquet")
            display_country = "Pan-Asia (All Asian Nations Combined)"
        else:
            display_country = country

    # Compute on-demand monthly baseline
    baseline_query = f"""
        WITH monthly AS (
            SELECT 
                year,
                month,
                count(*) as monthly_hotspots,
                round(avg(frp), 2) as avg_frp
            FROM read_parquet('{target_parquet}')
            GROUP BY year, month
        )
        SELECT 
            month,
            round(median(monthly_hotspots), 1) as historical_median,
            round(avg(monthly_hotspots), 1) as historical_mean,
            round(stddev(monthly_hotspots), 1) as historical_std,
            round(quantile_cont(monthly_hotspots, 0.25), 1) as historical_q1,
            round(quantile_cont(monthly_hotspots, 0.75), 1) as historical_q3,
            min(monthly_hotspots) as historical_min,
            max(monthly_hotspots) as historical_max
        FROM monthly
        GROUP BY month
        ORDER BY month;
    """
    baseline_data = con.execute(baseline_query).df().to_dict(orient="records")
    for row in baseline_data:
        row["month_name"] = MONTH_NAMES[row["month"] - 1]

    # Compute on-demand annual trends
    annual_query = f"""
        SELECT 
            year,
            count(*) as annual_raw_total,
            count(*) as annual_harmonized_activity,
            round(avg(frp), 2) as annual_avg_frp,
            round(max(frp), 2) as annual_peak_frp
        FROM read_parquet('{target_parquet}')
        GROUP BY year
        ORDER BY year;
    """
    annual_data = con.execute(annual_query).df().to_dict(orient="records")

    return {
        "status": "success",
        "country": display_country,
        "monthly_baseline": baseline_data,
        "annual_trends": annual_data
    }

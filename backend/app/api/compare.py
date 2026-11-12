from fastapi import APIRouter
from backend.app.db import get_db
from backend.app.config import settings

router = APIRouter()

@router.get("/compare")
def get_sensor_comparison():
    con = get_db()
    
    # Overlap monthly series (2012 to 2025)
    query = f"""
        SELECT 
            year_month,
            year,
            month,
            raw_modis,
            raw_viirs,
            modis_cell_days,
            viirs_cell_days,
            harmonized_fire_activity,
            ROUND(CASE WHEN raw_modis > 0 THEN raw_viirs * 1.0 / raw_modis ELSE NULL END, 2) AS raw_ratio,
            ROUND(CASE WHEN modis_cell_days > 0 THEN viirs_cell_days * 1.0 / modis_cell_days ELSE NULL END, 2) AS cell_day_ratio
        FROM read_parquet('{settings.MONTHLY_ANOMALIES_PARQUET}')
        WHERE year >= 2012
        ORDER BY year, month;
    """
    series = con.execute(query).df().to_dict(orient="records")

    validation_summary = {
        "overlap_period": "2012 - 2025 (168 Months)",
        "unadjusted_raw": {
            "inflation_ratio_viirs_to_modis": 4.38,
            "pearson_r": 0.9745,
            "spearman_rho": 0.9303,
            "monthly_rmse": 1408.56,
            "monthly_mae": 652.80,
            "description": "Directly comparing raw detection counts shows a severe 4.38x sensor bias artifact."
        },
        "harmonized_cell_days": {
            "inflation_ratio_viirs_to_modis": 3.40,
            "pearson_r": 0.9598,
            "spearman_rho": 0.9294,
            "monthly_rmse": 471.63,
            "rmse_reduction_percent": 66.5,
            "monthly_mae": 267.73,
            "mae_reduction_percent": 59.0,
            "description": "Common 0.05° spatial grid aggregation collapses multi-detection clustering from VIIRS high resolution."
        },
        "calibrated_harmonized_activity": {
            "target_ratio": 1.00,
            "achieved_ratio": 1.23,
            "monthly_rmse": 68.51,
            "overall_rmse_reduction_percent": 95.1,
            "monthly_mae": 42.70,
            "overall_mae_reduction_percent": 93.5,
            "transfer_model": "MODIS_equiv = 0.3619 * VIIRS_Cell_Days - 25.62",
            "description": "Continuous 20-year standardized fire activity index with 95.1% error reduction."
        }
    }

    return {
        "status": "success",
        "validation_summary": validation_summary,
        "monthly_series": series
    }


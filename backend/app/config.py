import os
from pydantic import BaseModel

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
ENV_FILE = os.path.join(BASE_DIR, ".env")

# Simple native .env loader without requiring external packages
if os.path.exists(ENV_FILE):
    with open(ENV_FILE, "r") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

DATA_DIR = os.getenv("PROCESSED_DATA_DIR", os.path.join(BASE_DIR, "data", "processed"))

class Settings(BaseModel):
    APP_NAME: str = "CHRONOFIRE"
    VERSION: str = "1.0.0"
    APP_HOST: str = os.getenv("APP_HOST", "0.0.0.0")
    APP_PORT: int = int(os.getenv("APP_PORT", "8000"))
    FIRMS_MAP_KEY: str = os.getenv("FIRMS_MAP_KEY", "")
    
    UNIFIED_HOTSPOTS_PARQUET: str = os.path.join(DATA_DIR, "hotspots_unified_bangladesh.parquet")
    CELL_DAYS_PARQUET: str = os.path.join(DATA_DIR, "harmonized", "cell_days_bangladesh.parquet")
    MONTHLY_ANOMALIES_PARQUET: str = os.path.join(DATA_DIR, "analytics", "monthly_activity_with_anomalies.parquet")
    MONTHLY_BASELINE_PARQUET: str = os.path.join(DATA_DIR, "analytics", "monthly_baseline.parquet")
    MONTHLY_SUMMARY_JSON: str = os.path.join(DATA_DIR, "analytics", "monthly_analytics_summary.json")

settings = Settings()

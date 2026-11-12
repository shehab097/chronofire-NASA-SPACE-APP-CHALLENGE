import os
import json
from fastapi import APIRouter
from backend.app.config import BASE_DIR

router = APIRouter()

REF_FILE = os.path.join(BASE_DIR, "data", "reference_countries.json")

# Predefined coordinates and zoom levels for major regions and countries
COUNTRY_GEOLOCATIONS = {
    "world": {"center": [20.0, 0.0], "zoom": 2, "name": "Global / Worldwide"},
    "asia": {"center": [24.0, 95.0], "zoom": 4, "name": "Pan-Asia"},
    "south_asia": {"center": [23.5, 84.0], "zoom": 5, "name": "South Asia"},
    "southeast_asia": {"center": [12.0, 105.0], "zoom": 5, "name": "Southeast Asia"},
    "bangladesh": {"center": [23.6850, 90.3563], "zoom": 7, "name": "Bangladesh"},
    "myanmar": {"center": [21.9162, 95.9560], "zoom": 6, "name": "Myanmar"},
    "nepal": {"center": [28.3949, 84.1240], "zoom": 7, "name": "Nepal"},
    "bhutan": {"center": [27.5142, 90.4336], "zoom": 8, "name": "Bhutan"},
    "india": {"center": [20.5937, 78.9629], "zoom": 5, "name": "India"},
    "thailand": {"center": [15.8700, 100.9925], "zoom": 6, "name": "Thailand"},
    "indonesia": {"center": [-0.7893, 113.9213], "zoom": 5, "name": "Indonesia"},
    "vietnam": {"center": [14.0583, 108.2772], "zoom": 6, "name": "Vietnam"},
    "cambodia": {"center": [12.5657, 104.9910], "zoom": 7, "name": "Cambodia"},
    "pakistan": {"center": [30.3753, 69.3451], "zoom": 6, "name": "Pakistan"},
    "china": {"center": [35.8617, 104.1954], "zoom": 4, "name": "China"},
    "japan": {"center": [36.2048, 138.2529], "zoom": 5, "name": "Japan"},
    "malaysia": {"center": [4.2105, 101.9758], "zoom": 6, "name": "Malaysia"},
    "philippines": {"center": [12.8797, 121.7740], "zoom": 6, "name": "Philippines"},
    "australia": {"center": [-25.2744, 133.7751], "zoom": 4, "name": "Australia"},
    "brazil": {"center": [-14.2350, -51.9253], "zoom": 4, "name": "Brazil"},
    "united_states": {"center": [37.0902, -95.7129], "zoom": 4, "name": "United States"}
}

@router.get("/countries")
def get_available_countries():
    if os.path.exists(REF_FILE):
        with open(REF_FILE, "r") as f:
            data = json.load(f)
    else:
        data = {
            "countries": ["Bangladesh", "Bhutan", "India", "Myanmar", "Nepal", "Thailand", "Indonesia"],
            "regions": {}
        }
    
    # Check which countries have precomputed Parquet caches
    processed_dir = os.path.join(BASE_DIR, "data", "processed")
    cached_countries = []
    if os.path.exists(processed_dir):
        for f in os.listdir(processed_dir):
            if f.startswith("hotspots_unified_") and f.endswith(".parquet"):
                cname = f.replace("hotspots_unified_", "").replace(".parquet", "").capitalize()
                cached_countries.append(cname)

    return {
        "status": "success",
        "total_countries": len(data.get("countries", [])),
        "cached_instant_countries": cached_countries,
        "regions": data.get("regions", {}),
        "countries": data.get("countries", []),
        "geolocations": COUNTRY_GEOLOCATIONS
    }


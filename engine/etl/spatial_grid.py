"""
Spatial Grid Indexer for NASA FIRMS Harmonization
Provides continuous spatial discretization into equal-angle grid cells (nominally ~5.5km at 0.05 degrees).
"""

import numpy as np

GRID_RESOLUTION_DEG = 0.05  # approximately 5.5 km at the equator

def compute_grid_id(lat: float, lon: float, resolution: float = GRID_RESOLUTION_DEG) -> str:
    """
    Computes a discrete grid cell identifier based on latitude and longitude.
    Returns format: "GRID_lat_lon" with 2 decimal precision.
    """
    lat_bin = np.floor(lat / resolution) * resolution
    lon_bin = np.floor(lon / resolution) * resolution
    return f"G_{lat_bin:.2f}_{lon_bin:.2f}"

def get_grid_bounds(grid_id: str, resolution: float = GRID_RESOLUTION_DEG):
    """
    Returns (min_lat, min_lon, max_lat, max_lon, center_lat, center_lon) for a given grid_id.
    """
    parts = grid_id.split('_')
    lat_min = float(parts[1])
    lon_min = float(parts[2])
    lat_max = lat_min + resolution
    lon_max = lon_min + resolution
    center_lat = (lat_min + lat_max) / 2.0
    center_lon = (lon_min + lon_max) / 2.0
    return {
        "min_lat": lat_min,
        "min_lon": lon_min,
        "max_lat": lat_max,
        "max_lon": lon_max,
        "center_lat": round(center_lat, 4),
        "center_lon": round(center_lon, 4)
    }


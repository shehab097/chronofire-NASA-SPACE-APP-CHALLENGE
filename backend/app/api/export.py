import io
from fastapi import APIRouter, Response
from typing import Optional
from backend.app.db import get_db
from backend.app.api.hotspots import resolve_table_source

router = APIRouter()

@router.get("/export/csv")
def export_hotspots_csv(
    country: Optional[str] = "Pan-Asia",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    instrument: Optional[str] = None,
    min_lat: Optional[float] = None,
    max_lat: Optional[float] = None,
    min_lon: Optional[float] = None,
    max_lon: Optional[float] = None,
    limit: int = 50000
):
    con = get_db()
    table_source, _, _ = resolve_table_source(country)

    where_clauses = ["1=1"]
    if start_date:
        where_clauses.append(f"acq_date >= '{start_date}'")
    if end_date:
        where_clauses.append(f"acq_date <= '{end_date}'")
    if instrument and str(instrument).upper() != "ALL":
        where_clauses.append(f"instrument = '{str(instrument).upper()}'")
    if min_lat is not None:
        where_clauses.append(f"latitude >= {min_lat}")
    if max_lat is not None:
        where_clauses.append(f"latitude <= {max_lat}")
    if min_lon is not None:
        where_clauses.append(f"longitude >= {min_lon}")
    if max_lon is not None:
        where_clauses.append(f"longitude <= {max_lon}")

    where_sql = " AND ".join(where_clauses)
    query = f"""
        SELECT 
            latitude,
            longitude,
            acq_date,
            acq_time,
            satellite,
            instrument,
            confidence_level,
            confidence_numeric,
            brightness,
            frp,
            daynight,
            grid_id
        FROM {table_source}
        WHERE {where_sql}
        ORDER BY acq_date DESC, frp DESC
        LIMIT {limit};
    """
    df = con.execute(query).df()
    csv_buffer = io.StringIO()
    df.to_csv(csv_buffer, index=False)
    
    aoi_tag = "aoi_" if min_lat is not None else ""
    country_tag = f"{country.strip().replace(' ', '_').lower()}_"
    filename = f"nasa_fire_hotspots_{country_tag}{aoi_tag}{start_date or 'all'}_to_{end_date or 'all'}.csv"
    return Response(
        content=csv_buffer.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

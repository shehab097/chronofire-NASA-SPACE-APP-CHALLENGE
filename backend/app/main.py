import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.app.config import settings
from backend.app.api import summary, calendar, hotspots, compare, analytics, export, countries

app = FastAPI(
    title="CHRONOFIRE",
    version=settings.VERSION,
    description="CHRONOFIRE - NASA Space Apps Challenge 2026: Harmonization of MODIS and VIIRS Hot Spots"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(summary.router, prefix="/api", tags=["Summary"])
app.include_router(calendar.router, prefix="/api", tags=["Burning Calendar"])
app.include_router(hotspots.router, prefix="/api", tags=["Hotspots Map"])
app.include_router(compare.router, prefix="/api", tags=["Sensor Comparison & Validation"])
app.include_router(analytics.router, prefix="/api", tags=["Historical Analytics"])
app.include_router(export.router, prefix="/api", tags=["Data Export"])
app.include_router(countries.router, prefix="/api", tags=["Countries & Global Catalog"])

# Serve Frontend static assets if built
FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))
if os.path.exists(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="static_assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "message": "NASA MODIS & VIIRS Wildfire Harmonization Platform API",
            "docs": "/docs",
            "version": settings.VERSION
        }

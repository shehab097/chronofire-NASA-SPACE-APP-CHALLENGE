import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Rectangle, Popup, useMap, useMapEvents } from 'react-leaflet';
import { 
  Flame, 
  Calendar, 
  Layers, 
  RefreshCw, 
  Square, 
  XCircle, 
  Download, 
  Compass, 
  Maximize2, 
  Minimize2, 
  Globe2, 
  Target
} from 'lucide-react';

const BASEMAP_TILES = {
  osm_standard: {
    name: "OpenStreetMap (Standard OpenMap)",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  osm_humanitarian: {
    name: "OpenStreetMap (Humanitarian HOT)",
    url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> & Humanitarian OSM'
  },
  opentopo: {
    name: "OpenTopoMap (Terrain & Topography)",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: 'Map data: &copy; OSM, SRTM | Map style: &copy; OpenTopoMap'
  },
  esri_satellite: {
    name: "Satellite Earth Imagery (Esri)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; Esri, Earthstar Geographics'
  }
};

const REGION_PRESETS = {
  "Pan-Asia": { center: [20.0, 92.0], zoom: 4, label: "Pan-Asia (All Asian Nations Combined)" },
  "South Asia": { center: [23.5, 84.0], zoom: 5, label: "South Asia Subcontinent" },
  "Southeast Asia": { center: [13.0, 105.0], zoom: 5, label: "Southeast Asia" },
  "East Asia": { center: [34.0, 108.0], zoom: 4, label: "East Asia" },
  "Bangladesh": { center: [23.6850, 90.3563], zoom: 7, label: "Bangladesh" },
  "India": { center: [20.5937, 78.9629], zoom: 5, label: "India" },
  "China": { center: [35.8617, 104.1954], zoom: 4, label: "China" },
  "Myanmar": { center: [21.9162, 95.9560], zoom: 6, label: "Myanmar" },
  "Thailand": { center: [15.8700, 100.9925], zoom: 6, label: "Thailand" },
  "Vietnam": { center: [14.0583, 108.2772], zoom: 6, label: "Vietnam" },
  "Cambodia": { center: [12.5657, 104.9910], zoom: 7, label: "Cambodia" },
  "Indonesia": { center: [-0.7893, 113.9213], zoom: 5, label: "Indonesia" },
  "Malaysia": { center: [4.2105, 101.9758], zoom: 6, label: "Malaysia" },
  "Philippines": { center: [12.8797, 121.7740], zoom: 6, label: "Philippines" },
  "Pakistan": { center: [30.3753, 69.3451], zoom: 6, label: "Pakistan" },
  "Nepal": { center: [28.3949, 84.1240], zoom: 7, label: "Nepal" },
  "Bhutan": { center: [27.5142, 90.4336], zoom: 8, label: "Bhutan" },
  "Australia": { center: [-25.2744, 133.7751], zoom: 4, label: "Australia" }
};

function AutoFitController({ hotspots, shouldAutoFit, setShouldAutoFit }) {
  const map = useMap();
  useEffect(() => {
    if (shouldAutoFit && hotspots && hotspots.length > 0) {
      const bounds = hotspots.map(h => [h.latitude, h.longitude]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 9 });
      setShouldAutoFit(false);
    }
  }, [hotspots, shouldAutoFit, map, setShouldAutoFit]);
  return null;
}

function MapRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function MapDrawListener({ isDrawing, startCorner, setStartCorner, onCompleteBounds, setTempCorner }) {
  useMapEvents({
    click(e) {
      if (!isDrawing) return;
      if (!startCorner) {
        setStartCorner(e.latlng);
        setTempCorner(e.latlng);
      } else {
        const minLat = Math.min(startCorner.lat, e.latlng.lat);
        const maxLat = Math.max(startCorner.lat, e.latlng.lat);
        const minLon = Math.min(startCorner.lng, e.latlng.lng);
        const maxLon = Math.max(startCorner.lng, e.latlng.lng);
        onCompleteBounds({ minLat, maxLat, minLon, maxLon });
        setStartCorner(null);
        setTempCorner(null);
      }
    },
    mousemove(e) {
      if (isDrawing && startCorner) {
        setTempCorner(e.latlng);
      }
    }
  });
  return null;
}

export default function FireMap() {
  const [hotspots, setHotspots] = useState([]);
  const [totalMatched, setTotalMatched] = useState(0);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-04-30');
  const [instrument, setInstrument] = useState('ALL');
  const [selectedRegion, setSelectedRegion] = useState('Pan-Asia');
  const [minConfidence, setMinConfidence] = useState('');
  const [pointLimit, setPointLimit] = useState(5000);
  const [basemapKey, setBasemapKey] = useState('osm_standard');

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shouldAutoFit, setShouldAutoFit] = useState(false);

  // Drawing & AOI State
  const [isDrawing, setIsDrawing] = useState(false);
  const [startCorner, setStartCorner] = useState(null);
  const [tempCorner, setTempCorner] = useState(null);
  const [activeAOI, setActiveAOI] = useState(null);
  const [aoiStats, setAoiStats] = useState(null);

  const mapContainerRef = useRef(null);
  const currentView = REGION_PRESETS[selectedRegion] || REGION_PRESETS["Pan-Asia"];

  const fetchHotspots = async (autoFit = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        country: selectedRegion,
        start_date: startDate,
        end_date: endDate,
        limit: pointLimit.toString(),
      });
      if (instrument !== 'ALL') params.append('instrument', instrument);
      if (minConfidence) params.append('min_confidence', minConfidence);

      if (activeAOI) {
        params.append('min_lat', activeAOI.minLat.toString());
        params.append('max_lat', activeAOI.maxLat.toString());
        params.append('min_lon', activeAOI.minLon.toString());
        params.append('max_lon', activeAOI.maxLon.toString());
      }

      const res = await fetch(`/api/hotspots?${params.toString()}`);
      const data = await res.json();
      if (data.status === 'success') {
        setHotspots(data.hotspots || []);
        setTotalMatched(data.total_matched || 0);
        if (autoFit) setShouldAutoFit(true);
      }
    } catch (err) {
      console.error('Failed to load hotspots:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeAOI) {
      const fetchStats = async () => {
        try {
          const params = new URLSearchParams({
            country: selectedRegion,
            min_lat: activeAOI.minLat.toString(),
            max_lat: activeAOI.maxLat.toString(),
            min_lon: activeAOI.minLon.toString(),
            max_lon: activeAOI.maxLon.toString(),
            start_date: startDate,
            end_date: endDate,
          });
          if (instrument !== 'ALL') params.append('instrument', instrument);

          const res = await fetch(`/api/hotspots/aoi-stats?${params.toString()}`);
          const data = await res.json();
          if (data.status === 'success') {
            setAoiStats(data);
          }
        } catch (err) {
          console.error('Failed to fetch AOI stats:', err);
        }
      };
      fetchStats();
    } else {
      setAoiStats(null);
    }
  }, [activeAOI, selectedRegion, startDate, endDate, instrument]);

  useEffect(() => {
    fetchHotspots(true);
  }, [startDate, endDate, instrument, selectedRegion, minConfidence, pointLimit, activeAOI]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleBoxDrawn = (bounds) => {
    setActiveAOI(bounds);
    setIsDrawing(false);
  };

  const clearAOI = () => {
    setActiveAOI(null);
    setAoiStats(null);
    setIsDrawing(false);
    setStartCorner(null);
    setTempCorner(null);
  };

  const downloadAOICSV = () => {
    if (!activeAOI) return;
    const params = new URLSearchParams({
      country: selectedRegion,
      start_date: startDate,
      end_date: endDate,
      min_lat: activeAOI.minLat.toString(),
      max_lat: activeAOI.maxLat.toString(),
      min_lon: activeAOI.minLon.toString(),
      max_lon: activeAOI.maxLon.toString(),
    });
    if (instrument !== 'ALL') params.append('instrument', instrument);
    window.location.href = `/api/export/csv?${params.toString()}`;
  };

  const getMarkerColor = (point) => {
    if (point.instrument === 'MODIS') return '#ea580c'; // Vibrant Orange
    return point.satellite === 'NOAA-20' ? '#dc2626' : '#e11d48'; // Vivid Red / Rose
  };

  return (
    <div className={`relative transition-all duration-200 ${
      isFullscreen 
        ? 'fixed inset-0 z-[100] w-screen h-screen bg-[#121214] flex flex-col p-2' 
        : 'space-y-3 w-full h-[calc(100vh-140px)] flex flex-col'
    }`}>
      {/* Top Floating Control Bar - Sharp Flat Dark Gray */}
      <div className="bg-[#1a1a1e] border border-[#2d2d34] p-3 shadow-lg z-20 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {/* Region / Pan-Asia Selector */}
            <div className="flex items-center gap-2 bg-[#141416] px-3 py-1.5 border border-[#34343d] text-xs">
              <Globe2 className="w-4 h-4 text-orange-500" />
              <select 
                value={selectedRegion} 
                onChange={(e) => {
                  setSelectedRegion(e.target.value);
                  if (activeAOI) clearAOI();
                }}
                className="bg-transparent border-0 text-white font-semibold focus:outline-none cursor-pointer text-xs"
              >
                <optgroup label="Regional Asian Scopes" className="bg-[#1a1a1e] font-bold text-orange-400">
                  <option value="Pan-Asia">🌏 Pan-Asia (All Asian Nations Combined)</option>
                  <option value="South Asia">🌏 South Asia Subcontinent</option>
                  <option value="Southeast Asia">🌏 Southeast Asia</option>
                  <option value="East Asia">🌏 East Asia</option>
                </optgroup>
                <optgroup label="Pre-Indexed Asian Nations" className="bg-[#1a1a1e] font-semibold text-neutral-200">
                  <option value="Bangladesh">🇧🇩 Bangladesh</option>
                  <option value="India">🇮🇳 India (14.6M)</option>
                  <option value="China">🇨🇳 China (12.9M)</option>
                  <option value="Myanmar">🇲🇲 Myanmar (8.8M)</option>
                  <option value="Thailand">🇹🇭 Thailand (4.0M)</option>
                  <option value="Vietnam">🇻🇳 Vietnam (1.8M)</option>
                  <option value="Cambodia">🇰🇭 Cambodia (3.9M)</option>
                  <option value="Indonesia">🇮🇩 Indonesia (6.3M)</option>
                  <option value="Malaysia">🇲🇾 Malaysia (482K)</option>
                  <option value="Philippines">🇵🇭 Philippines (754K)</option>
                  <option value="Pakistan">🇵🇰 Pakistan (1.4M)</option>
                  <option value="Nepal">🇳🇵 Nepal (762K)</option>
                  <option value="Bhutan">🇧🇹 Bhutan (25K)</option>
                  <option value="Australia">🇦🇺 Australia (32.9M)</option>
                </optgroup>
              </select>
            </div>

            {/* Basemap Switcher (100% Free OpenMap - Zero API Keys) */}
            <div className="flex items-center gap-2 bg-[#141416] px-3 py-1.5 border border-[#34343d] text-xs">
              <Compass className="w-4 h-4 text-neutral-300" />
              <select 
                value={basemapKey} 
                onChange={(e) => setBasemapKey(e.target.value)}
                className="bg-transparent border-0 text-white focus:outline-none text-xs cursor-pointer font-medium"
              >
                {Object.entries(BASEMAP_TILES).map(([key, item]) => (
                  <option key={key} value={key} className="bg-[#1a1a1e] text-white">{item.name}</option>
                ))}
              </select>
            </div>

            {/* Date Range Selector */}
            <div className="flex items-center gap-2 bg-[#141416] px-3 py-1.5 border border-[#34343d] text-xs">
              <Calendar className="w-4 h-4 text-orange-500" />
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-0 text-white focus:outline-none text-xs w-28 font-mono"
              />
              <span className="text-neutral-500">to</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-0 text-white focus:outline-none text-xs w-28 font-mono"
              />
            </div>

            {/* Sensor Selection */}
            <div className="flex items-center gap-2 bg-[#141416] px-3 py-1.5 border border-[#34343d] text-xs">
              <Layers className="w-4 h-4 text-orange-500" />
              <select 
                value={instrument} 
                onChange={(e) => setInstrument(e.target.value)}
                className="bg-transparent border-0 text-white focus:outline-none text-xs cursor-pointer"
              >
                <option value="ALL" className="bg-[#1a1a1e]">All Sensors (MODIS + VIIRS)</option>
                <option value="MODIS" className="bg-[#1a1a1e]">MODIS Only (1km)</option>
                <option value="VIIRS" className="bg-[#1a1a1e]">VIIRS Only (375m)</option>
              </select>
            </div>

            {/* Point Limit Selector */}
            <div className="flex items-center gap-2 bg-[#141416] px-3 py-1.5 border border-[#34343d] text-xs">
              <span className="text-neutral-400">Limit:</span>
              <select
                value={pointLimit}
                onChange={(e) => setPointLimit(Number(e.target.value))}
                className="bg-transparent border-0 text-white focus:outline-none text-xs cursor-pointer font-mono"
              >
                <option value={2000} className="bg-[#1a1a1e]">2,000 pts</option>
                <option value={5000} className="bg-[#1a1a1e]">5,000 pts</option>
                <option value={8000} className="bg-[#1a1a1e]">8,000 pts</option>
              </select>
            </div>
          </div>

          {/* Action Tools - Flat, Sharp, Rectangular Buttons */}
          <div className="flex items-center gap-2">
            {/* Auto Fit Hotspots Button */}
            <button
              onClick={() => setShouldAutoFit(true)}
              className="px-3 py-1.5 text-xs font-semibold bg-[#26262e] hover:bg-[#32323b] text-white border border-[#3d3d47] flex items-center gap-1.5 transition-colors"
              title="Fit map around all visible fire hotspots"
            >
              <Target className="w-3.5 h-3.5 text-orange-400" />
              <span>Fit View</span>
            </button>

            {/* AOI Draw Button */}
            {!activeAOI ? (
              <button
                onClick={() => {
                  setIsDrawing(!isDrawing);
                  setStartCorner(null);
                  setTempCorner(null);
                }}
                className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isDrawing 
                    ? 'bg-orange-500 text-black border border-white' 
                    : 'bg-orange-600 hover:bg-orange-500 text-white'
                }`}
              >
                <Square className="w-3.5 h-3.5" />
                {isDrawing ? 'Click 2 Points on Map' : 'Draw AOI Box'}
              </button>
            ) : (
              <button
                onClick={clearAOI}
                className="px-3 py-1.5 text-xs font-semibold bg-[#3d1818] hover:bg-[#521e1e] text-red-200 border border-red-700 flex items-center gap-1.5 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                Clear AOI
              </button>
            )}

            {/* Refresh Button */}
            <button
              onClick={() => fetchHotspots(false)}
              disabled={loading}
              className="p-2 bg-[#26262e] hover:bg-[#32323b] text-neutral-200 border border-[#3d3d47] transition-colors flex items-center text-xs"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-orange-400 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="px-3 py-1.5 bg-[#26262e] hover:bg-[#32323b] text-white border border-[#3d3d47] font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-orange-400" />
                  <span>Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-white" />
                  <span>Fullscreen Map</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Canvas - Sharp Rectangular Frame */}
      <div 
        ref={mapContainerRef}
        className="relative flex-1 w-full bg-[#121214] border border-[#2d2d34] overflow-hidden shadow-lg"
      >
        <MapContainer 
          center={currentView.center} 
          zoom={currentView.zoom} 
          scrollWheelZoom={true} 
          className={`w-full h-full ${isDrawing ? 'cursor-crosshair' : ''}`}
        >
          {/* 100% Free OpenStreetMap / OpenMap Basemap Tile Layer */}
          <TileLayer
            key={basemapKey}
            attribution={BASEMAP_TILES[basemapKey].attribution}
            url={BASEMAP_TILES[basemapKey].url}
          />
          <MapRecenter center={currentView.center} zoom={currentView.zoom} />
          <AutoFitController 
            hotspots={hotspots} 
            shouldAutoFit={shouldAutoFit} 
            setShouldAutoFit={setShouldAutoFit} 
          />

          {/* Interactive Draw Event Listener */}
          <MapDrawListener 
            isDrawing={isDrawing}
            startCorner={startCorner}
            setStartCorner={setStartCorner}
            onCompleteBounds={handleBoxDrawn}
            setTempCorner={setTempCorner}
          />

          {/* Drawing preview */}
          {isDrawing && startCorner && tempCorner && (
            <Rectangle
              bounds={[
                [Math.min(startCorner.lat, tempCorner.lat), Math.min(startCorner.lng, tempCorner.lng)],
                [Math.max(startCorner.lat, tempCorner.lat), Math.max(startCorner.lng, tempCorner.lng)]
              ]}
              pathOptions={{
                color: '#f97316',
                fillColor: '#f97316',
                fillOpacity: 0.2,
                dashArray: '4, 4',
                weight: 2
              }}
            />
          )}

          {/* Active AOI Selection Box */}
          {activeAOI && (
            <Rectangle
              bounds={[
                [activeAOI.minLat, activeAOI.minLon],
                [activeAOI.maxLat, activeAOI.maxLon]
              ]}
              pathOptions={{
                color: '#ea580c',
                fillColor: '#ea580c',
                fillOpacity: 0.15,
                weight: 2,
                dashArray: '6, 6'
              }}
            />
          )}

          {/* Render Active Fire Hotspots */}
          {hotspots.map((pt, idx) => (
            <CircleMarker
              key={`${pt.acq_date}-${pt.latitude}-${pt.longitude}-${idx}`}
              center={[pt.latitude, pt.longitude]}
              radius={Math.min(7, Math.max(3, (pt.frp || 5) * 0.25))}
              pathOptions={{
                color: getMarkerColor(pt),
                fillColor: getMarkerColor(pt),
                fillOpacity: 0.85,
                weight: 1
              }}
            >
              <Popup>
                <div className="p-3 text-xs font-sans space-y-1.5 bg-[#1c1c20] text-white min-w-[220px]">
                  <div className="flex items-center justify-between border-b border-[#33333a] pb-1.5">
                    <span className="font-bold text-orange-400 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" /> {pt.instrument}
                    </span>
                    <span className="text-neutral-400 font-mono text-[11px]">{pt.satellite}</span>
                  </div>
                  {pt.country && (
                    <div><span className="text-neutral-400">Country:</span> <strong className="text-white">{pt.country}</strong></div>
                  )}
                  <div><span className="text-neutral-400">Acquisition:</span> {pt.acq_date} {pt.acq_time} UTC</div>
                  <div><span className="text-neutral-400">Coords:</span> {pt.latitude.toFixed(4)}°N, {pt.longitude.toFixed(4)}°E</div>
                  <div><span className="text-neutral-400">FRP:</span> <strong className="text-orange-400 font-mono">{pt.frp} MW</strong></div>
                  <div><span className="text-neutral-400">Brightness:</span> {pt.brightness} K</div>
                  <div><span className="text-neutral-400">Confidence:</span> <span className="uppercase font-semibold text-orange-300">{pt.confidence_level}</span> ({pt.confidence_numeric}%)</div>
                  <div><span className="text-neutral-400">Grid Cell:</span> <code className="bg-[#121214] text-neutral-200 px-1 py-0.5 border border-[#33333a] text-[10px]">{pt.grid_id}</code></div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Telemetry Status Bar (Bottom Left) */}
        <div className="absolute bottom-4 left-4 z-20 bg-[#1a1a1e]/95 border border-[#2d2d34] px-4 py-2 shadow-lg flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500"></span>
            <span className="text-white font-medium">
              Showing <strong className="text-orange-400 font-mono">{hotspots.length.toLocaleString()}</strong> of <strong className="text-white font-mono">{totalMatched.toLocaleString()}</strong> Asian Hotspots
            </span>
          </div>
          <span className="text-neutral-600">|</span>
          <div className="text-neutral-300">
            Region: <strong className="text-white">{selectedRegion}</strong>
          </div>
          <span className="text-neutral-600">|</span>
          <div className="text-neutral-300">
            Map: <strong className="text-neutral-100">{BASEMAP_TILES[basemapKey].name.split(' (')[0]}</strong>
          </div>
        </div>

        {/* Map Legend (Bottom Right) */}
        <div className="absolute bottom-4 right-4 z-20 bg-[#1a1a1e]/95 border border-[#2d2d34] px-3.5 py-2 shadow-lg flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#ea580c]"></span>
            <span className="text-neutral-200">MODIS (1km)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#e11d48]"></span>
            <span className="text-neutral-200">VIIRS S-NPP (375m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#dc2626]"></span>
            <span className="text-neutral-200">VIIRS NOAA-20 (375m)</span>
          </div>
        </div>

        {/* Floating AOI Live HUD (Top Right) */}
        {activeAOI && (
          <div className="absolute top-4 right-4 z-20 w-80 bg-[#1a1a1e] border border-orange-500 p-4 shadow-2xl text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#2d2d34] pb-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Square className="w-4 h-4 text-orange-500" /> Active AOI Selection
              </span>
              <button 
                onClick={clearAOI}
                className="text-neutral-400 hover:text-white transition-colors"
                title="Clear AOI"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <div className="font-mono text-[11px] text-neutral-300 space-y-0.5">
              <div>Lat: {activeAOI.minLat.toFixed(3)}°N to {activeAOI.maxLat.toFixed(3)}°N</div>
              <div>Lon: {activeAOI.minLon.toFixed(3)}°E to {activeAOI.maxLon.toFixed(3)}°E</div>
            </div>

            {aoiStats ? (
              <div className="space-y-2 pt-2 border-t border-[#2d2d34]">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#121214] p-2 border border-[#2d2d34]">
                    <span className="text-[10px] text-neutral-400 block uppercase">Hotspots</span>
                    <span className="font-mono font-bold text-orange-400 text-sm">
                      {aoiStats.statistics.total_hotspots.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-[#121214] p-2 border border-[#2d2d34]">
                    <span className="text-[10px] text-neutral-400 block uppercase">Grid Cells</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {aoiStats.statistics.affected_grid_cells.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-[#121214] p-2 border border-[#2d2d34] text-[11px]">
                  <span className="text-neutral-400">Peak FRP in AOI:</span>
                  <span className="font-mono font-bold text-orange-400">{aoiStats.statistics.peak_frp || 0} MW</span>
                </div>

                <div className="flex justify-between items-center text-[11px] text-neutral-400 px-1">
                  <span>Mean FRP: <strong className="text-white font-mono">{aoiStats.statistics.mean_frp || 0} MW</strong></span>
                  <span>Active Days: <strong className="text-white font-mono">{aoiStats.statistics.active_burning_days || 0}</strong></span>
                </div>

                <button
                  onClick={downloadAOICSV}
                  className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download AOI Hotspots (CSV)
                </button>
              </div>
            ) : (
              <div className="text-center py-2 text-neutral-400 text-[11px]">
                Calculating AOI spatial telemetry...
              </div>
            )}
          </div>
        )}

        {/* Loading Spinner Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center">
            <div className="flex items-center gap-2.5 bg-[#1a1a1e] border border-orange-500 px-4 py-2.5 text-sm text-white shadow-2xl">
              <RefreshCw className="w-4 h-4 text-orange-500 animate-spin" />
              <span>Querying Pan-Asia Parquet database via DuckDB...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

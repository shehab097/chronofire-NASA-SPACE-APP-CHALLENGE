import React, { useState } from 'react';
import { Download, FileText, Check, Database, Calendar, Globe2 } from 'lucide-react';

export default function DataExport() {
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [instrument, setInstrument] = useState('ALL');
  const [country, setCountry] = useState('Pan-Asia');
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    const params = new URLSearchParams({
      country: country,
      start_date: startDate,
      end_date: endDate,
    });
    if (instrument !== 'ALL') params.append('instrument', instrument);
    
    window.location.href = `/api/export/csv?${params.toString()}`;
    setTimeout(() => setDownloading(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header - Sharp Flat Dark Gray */}
      <div className="bg-[#1a1a1e] border border-[#2d2d34] p-5 shadow-lg">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Download className="w-5 h-5 text-orange-500" />
          Data Export & Analytical Reports
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          Export full harmonized datasets, NASA FIRMS standardized detections, and historical climatology in open formats (CSV / JSON).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hotspot CSV Export Form */}
        <div className="bg-[#1a1a1e] border border-[#2d2d34] p-5 shadow-lg space-y-4">
          <div className="border-b border-[#2d2d34] pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-orange-500" />
              Download Hotspots (CSV)
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Extract raw and standardized fire detections with geographic coordinates, radiative power, and discrete grid indices.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-neutral-400 block mb-1">Target Region / Country:</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-[#121214] border border-[#34343d] p-2 text-white focus:outline-none"
              >
                <option value="Pan-Asia">🌏 Pan-Asia (All Asian Nations Combined)</option>
                <option value="Bangladesh">🇧🇩 Bangladesh</option>
                <option value="India">🇮🇳 India</option>
                <option value="China">🇨🇳 China</option>
                <option value="Myanmar">🇲🇲 Myanmar</option>
                <option value="Thailand">🇹🇭 Thailand</option>
                <option value="Vietnam">🇻🇳 Vietnam</option>
                <option value="Cambodia">🇰🇭 Cambodia</option>
                <option value="Indonesia">🇮🇩 Indonesia</option>
                <option value="Malaysia">🇲🇾 Malaysia</option>
                <option value="Philippines">🇵🇭 Philippines</option>
                <option value="Pakistan">🇵🇰 Pakistan</option>
                <option value="Nepal">🇳🇵 Nepal</option>
                <option value="Bhutan">🇧🇹 Bhutan</option>
              </select>
            </div>

            <div>
              <label className="text-neutral-400 block mb-1">Time Period:</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-[#121214] border border-[#34343d] p-2 text-white focus:outline-none font-mono"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-[#121214] border border-[#34343d] p-2 text-white focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-neutral-400 block mb-1">Sensor Instrument:</label>
              <select
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                className="w-full bg-[#121214] border border-[#34343d] p-2 text-white focus:outline-none"
              >
                <option value="ALL">All Sensors (MODIS Terra/Aqua + VIIRS S-NPP/NOAA-20)</option>
                <option value="MODIS">MODIS Only (1km nadir)</option>
                <option value="VIIRS">VIIRS Only (375m I-band)</option>
              </select>
            </div>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full mt-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              {downloading ? 'Preparing CSV Stream...' : 'Download Hotspots (CSV)'}
            </button>
          </div>
        </div>

        {/* API Endpoints & JSON Feeds */}
        <div className="bg-[#1a1a1e] border border-[#2d2d34] p-5 shadow-lg space-y-4">
          <div className="border-b border-[#2d2d34] pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-500" />
              Direct REST API Feeds (JSON)
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Programmatic endpoints for researchers, automated GIS pipelines, and climate scientists.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-[#121214] p-3 border border-[#2d2d34]">
              <div className="flex justify-between items-center">
                <span className="font-mono text-orange-400 font-bold">GET /api/hotspots</span>
                <span className="text-[10px] text-neutral-400 bg-[#26262e] px-1.5 py-0.5 border border-[#3d3d47]">JSON</span>
              </div>
              <p className="text-neutral-400 mt-1">Query filtered fire hotspots by country, date range, bounding box, and sensor.</p>
              <a href="/api/hotspots?country=Pan-Asia&limit=10" target="_blank" rel="noreferrer" className="text-orange-400 hover:underline mt-1.5 block font-mono text-[11px]">
                /api/hotspots?country=Pan-Asia&limit=10 →
              </a>
            </div>

            <div className="bg-[#121214] p-3 border border-[#2d2d34]">
              <div className="flex justify-between items-center">
                <span className="font-mono text-orange-400 font-bold">GET /api/baseline</span>
                <span className="text-[10px] text-neutral-400 bg-[#26262e] px-1.5 py-0.5 border border-[#3d3d47]">JSON</span>
              </div>
              <p className="text-neutral-400 mt-1">26-year monthly climatological baseline and IQR envelopes computed on-demand.</p>
              <a href="/api/baseline?country=Pan-Asia" target="_blank" rel="noreferrer" className="text-orange-400 hover:underline mt-1.5 block font-mono text-[11px]">
                /api/baseline?country=Pan-Asia →
              </a>
            </div>

            <div className="bg-[#121214] p-3 border border-[#2d2d34]">
              <div className="flex justify-between items-center">
                <span className="font-mono text-orange-400 font-bold">GET /api/summary</span>
                <span className="text-[10px] text-neutral-400 bg-[#26262e] px-1.5 py-0.5 border border-[#3d3d47]">JSON</span>
              </div>
              <p className="text-neutral-400 mt-1">High-level telemetry totals, division stats, and satellite mission breakdowns.</p>
              <a href="/api/summary" target="_blank" rel="noreferrer" className="text-orange-400 hover:underline mt-1.5 block font-mono text-[11px]">
                /api/summary →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

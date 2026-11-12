import React from 'react';
import { BookOpen, Layers, ShieldCheck, Cpu, GitCommit } from 'lucide-react';

export default function Methodology() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header - Sharp Flat Dark Gray */}
      <div className="bg-[#1a1a1e] border border-[#2d2d34] p-6 shadow-lg">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-orange-500" />
          CHRONOFIRE: Harmonization Methodology & Scientific Principles
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          Technical documentation for CHRONOFIRE — NASA Space Apps Challenge 2026 (Challenge 09: Harmonization of MODIS and VIIRS Hot Spots).
        </p>
      </div>

      {/* Sensor Characteristics Table */}
      <div className="bg-[#1a1a1e] border border-[#2d2d34] p-6 shadow-lg space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-orange-500" />
          1. Sensor Comparison & Physics Discrepancies
        </h3>
        <p className="text-xs text-neutral-300 leading-relaxed">
          MODIS and VIIRS use different optical designs, spatial resolutions, and detector geometries. Comparing their raw detection counts directly produces an artificial 4.38× surge in detected fire hotspots, falsely skewing climate trends.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border border-[#2d2d34]">
            <thead className="bg-[#121214] text-neutral-300 font-semibold border-b border-[#2d2d34]">
              <tr>
                <th className="p-3">Attribute</th>
                <th className="p-3 text-orange-400">MODIS</th>
                <th className="p-3 text-neutral-100">VIIRS (I-Band 375m)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#26262d] text-neutral-400">
              <tr className="hover:bg-[#232329]">
                <td className="p-3 font-medium text-neutral-200">Satellites</td>
                <td className="p-3">Terra, Aqua</td>
                <td className="p-3">Suomi-NPP, NOAA-20, NOAA-21</td>
              </tr>
              <tr className="hover:bg-[#232329]">
                <td className="p-3 font-medium text-neutral-200">Nominal Resolution</td>
                <td className="p-3">~1.0 km (at nadir)</td>
                <td className="p-3">~375 m (constant across scan)</td>
              </tr>
              <tr className="hover:bg-[#232329]">
                <td className="p-3 font-medium text-neutral-200">Pixel Area</td>
                <td className="p-3">~1.0 km²</td>
                <td className="p-3">~0.14 km² (~7× higher spatial density)</td>
              </tr>
              <tr className="hover:bg-[#232329]">
                <td className="p-3 font-medium text-neutral-200">Mission Record</td>
                <td className="p-3">2000 – Present (24+ years)</td>
                <td className="p-3">2012 – Present (S-NPP), 2018 – Present (NOAA-20)</td>
              </tr>
              <tr className="hover:bg-[#232329]">
                <td className="p-3 font-medium text-neutral-200">Sensitivity Threshold</td>
                <td className="p-3">Misses small/cool sub-pixel burns</td>
                <td className="p-3">Detects agricultural & sub-hectare fires</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3-Stage Pipeline Breakdown */}
      <div className="bg-[#1a1a1e] border border-[#2d2d34] p-6 shadow-lg space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-orange-500" />
          2. Three-Stage Scientific Harmonization Pipeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-[#121214] p-4 border border-[#2d2d34] space-y-2">
            <div className="w-6 h-6 bg-[#26262e] border border-[#3d3d47] text-orange-400 font-bold flex items-center justify-center text-xs">
              1
            </div>
            <h4 className="text-sm font-bold text-white">Spatial Grid Normalization</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Detections are mapped to a standardized discrete global grid cell system (0.05° ~ 5.5km resolution), partitioning space independently of satellite scan geometry.
            </p>
          </div>

          <div className="bg-[#121214] p-4 border border-[#2d2d34] space-y-2">
            <div className="w-6 h-6 bg-[#26262e] border border-[#3d3d47] text-orange-400 font-bold flex items-center justify-center text-xs">
              2
            </div>
            <h4 className="text-sm font-bold text-white">Cell-Day Event Aggregation</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Multiple intra-day detections inside the same grid cell are collapsed into a single discrete <em>Cell-Day Fire Event</em>, neutralizing VIIRS 7× pixel density inflation.
            </p>
          </div>

          <div className="bg-[#121214] p-4 border border-[#2d2d34] space-y-2">
            <div className="w-6 h-6 bg-[#26262e] border border-[#3d3d47] text-orange-400 font-bold flex items-center justify-center text-xs">
              3
            </div>
            <h4 className="text-sm font-bold text-white">Transfer Function Calibration</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Using the 168-month sensor overlap period (2012–2025), linear calibration maps VIIRS cell-days into MODIS-equivalent units with a 95.1% RMSE reduction.
            </p>
          </div>
        </div>
      </div>

      {/* Validation & Statistical Integrity */}
      <div className="bg-[#1a1a1e] border border-[#2d2d34] p-6 shadow-lg space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-orange-500" />
          3. Scientific Integrity & Repeatability
        </h3>
        <p className="text-xs text-neutral-300 leading-relaxed">
          All data processing, spatial indexing, statistical baselines, and calibration curves are performed locally using high-performance DuckDB streaming engines. Zero proprietary APIs, zero black-box services, and 100% open algorithms reproducible from the raw NASA FIRMS archive.
        </p>
      </div>
    </div>
  );
}

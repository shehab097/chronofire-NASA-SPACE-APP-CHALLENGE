import React, { useState, useEffect } from 'react';
import { Calendar, Info, AlertTriangle, TrendingUp, Sparkles, Filter } from 'lucide-react';

export default function BurningCalendar() {
  const [calendarData, setCalendarData] = useState([]);
  const [calendarMatrix, setCalendarMatrix] = useState({});
  const [startYear, setStartYear] = useState(2000);
  const [endYear, setEndYear] = useState(2025);
  const [selectedCell, setSelectedCell] = useState(null);
  const [loading, setLoading] = useState(false);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  useEffect(() => {
    const fetchCalendar = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/calendar?start_year=${startYear}&end_year=${endYear}`);
        const data = await res.json();
        if (data.status === 'success') {
          setCalendarData(data.records);
          setCalendarMatrix(data.calendar_matrix);
          if (data.records.length > 0) {
            setSelectedCell(data.records[data.records.length - 1]);
          }
        }
      } catch (err) {
        console.error('Failed to load burning calendar:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendar();
  }, [startYear, endYear]);

  // Color ramp based on Harmonized Fire Activity / Activity Tier - Flat solid colors, no gradients
  const getCellColor = (record) => {
    if (!record || record.harmonized_fire_activity === 0) {
      return 'bg-[#141416] border-[#26262d] text-neutral-600'; // No fire / zero
    }
    const val = record.harmonized_fire_activity;
    if (val < 25) return 'bg-[#182a1d] border-[#22442b] text-emerald-400 hover:bg-[#203a27]'; // Very Low
    if (val < 100) return 'bg-[#3b2a14] border-[#5e431c] text-amber-300 hover:bg-[#4f3818]'; // Moderate
    if (val < 350) return 'bg-[#522510] border-[#823916] text-orange-200 hover:bg-[#692f14]'; // High
    return 'bg-[#7a1919] border-[#ab2626] text-white font-bold hover:bg-[#942020]'; // Severe / Extreme
  };

  const years = [];
  for (let y = endYear; y >= startYear; y--) {
    years.push(y);
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls - Sharp Flat Dark Gray */}
      <div className="bg-[#1a1a1e] border border-[#2d2d34] p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              Harmonized Burning Activity Calendar (2000 – 2025)
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Multi-decadal seasonal matrix displaying harmonized Cell-Day fire events across MODIS & VIIRS.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Time Range:</span>
            <select
              value={startYear}
              onChange={(e) => setStartYear(Number(e.target.value))}
              className="bg-[#121214] border border-[#34343d] text-white text-xs px-2.5 py-1.5 focus:outline-none"
            >
              {[2000, 2005, 2010, 2012, 2015, 2020].map((y) => (
                <option key={y} value={y} className="bg-[#1a1a1e]">From {y}</option>
              ))}
            </select>
            <span className="text-neutral-500 text-xs">to</span>
            <select
              value={endYear}
              onChange={(e) => setEndYear(Number(e.target.value))}
              className="bg-[#121214] border border-[#34343d] text-white text-xs px-2.5 py-1.5 focus:outline-none"
            >
              {[2020, 2021, 2022, 2023, 2024, 2025].map((y) => (
                <option key={y} value={y} className="bg-[#1a1a1e]">{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-5 mt-4 pt-4 border-t border-[#2d2d34] text-xs">
          <span className="text-neutral-400 font-medium">Activity Levels:</span>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 bg-[#141416] border border-[#26262d]"></span>
            <span className="text-neutral-400">0 (Zero Fires)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 bg-[#182a1d] border border-[#22442b]"></span>
            <span className="text-emerald-400">1–25 (Low)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 bg-[#3b2a14] border border-[#5e431c]"></span>
            <span className="text-amber-300">25–100 (Moderate)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 bg-[#522510] border border-[#823916]"></span>
            <span className="text-orange-300">100–350 (High)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 bg-[#7a1919] border border-[#ab2626]"></span>
            <span className="text-white font-semibold">&gt; 350 (Severe / Peak)</span>
          </div>
        </div>
      </div>

      {/* Main Grid & Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Heatmap Matrix */}
        <div className="lg:col-span-3 bg-[#1a1a1e] border border-[#2d2d34] p-5 shadow-lg overflow-x-auto">
          <table className="w-full text-center border-separate border-spacing-1.5">
            <thead>
              <tr>
                <th className="text-xs font-semibold text-neutral-400 text-left p-1 w-16">Year</th>
                {monthNames.map((m) => (
                  <th key={m} className="text-xs font-semibold text-neutral-300 p-1 w-12">
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {years.map((year) => (
                <tr key={year}>
                  <td className="text-xs font-mono font-medium text-neutral-400 text-left pr-2">{year}</td>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => {
                    const record = calendarMatrix[year]?.[month];
                    const isSelected = selectedCell && selectedCell.year === year && selectedCell.month === month;
                    return (
                      <td key={month} className="p-0">
                        <button
                          onClick={() => record && setSelectedCell(record)}
                          className={`w-full h-8 border transition-colors text-[11px] flex items-center justify-center font-mono ${getCellColor(record)} ${isSelected ? 'border-orange-500 scale-105 z-10' : ''}`}
                          title={record ? `${year}-${monthNames[month-1]}: ${record.harmonized_fire_activity} Cell-Days` : 'No data'}
                        >
                          {record ? Math.round(record.harmonized_fire_activity) : '-'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Selected Cell Inspection Card */}
        <div className="bg-[#1a1a1e] border border-[#2d2d34] p-5 shadow-lg space-y-4">
          <div className="border-b border-[#2d2d34] pb-3">
            <span className="text-xs uppercase tracking-wider text-orange-400 font-semibold">Activity Inspector</span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              {selectedCell ? `${monthNames[selectedCell.month - 1]} ${selectedCell.year}` : 'Select a Month'}
            </h3>
          </div>

          {selectedCell ? (
            <div className="space-y-4 text-xs">
              <div className="bg-[#121214] p-3.5 border border-[#2d2d34] space-y-2">
                <div className="text-neutral-400">Harmonized Fire Activity:</div>
                <div className="text-2xl font-bold text-orange-400 font-mono">
                  {selectedCell.harmonized_fire_activity} <span className="text-xs text-neutral-500 font-normal">Cell-Days</span>
                </div>
                <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 pt-1 border-t border-[#26262d]">
                  <span>Historical Baseline Median:</span>
                  <strong className="text-white font-mono">{selectedCell.historical_median}</strong>
                </div>
              </div>

              {/* Anomaly Status */}
              <div className="bg-[#121214] p-3.5 border border-[#2d2d34] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Anomaly Status:</span>
                  <span className={`px-2 py-0.5 font-semibold text-[11px] border ${
                    selectedCell.z_score > 1.5 ? 'bg-[#3d1818] text-red-300 border-red-700' :
                    selectedCell.z_score > 0.5 ? 'bg-[#3b2a14] text-amber-300 border-[#5e431c]' :
                    selectedCell.z_score < -0.5 ? 'bg-[#182333] text-sky-300 border-sky-800' :
                    'bg-[#26262e] text-neutral-300 border-[#3d3d47]'
                  }`}>
                    {selectedCell.anomaly_status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                  <div>
                    <span className="text-neutral-500 block text-[10px]">Z-Score:</span>
                    <span className="text-white font-semibold">{selectedCell.z_score > 0 ? `+${selectedCell.z_score}` : selectedCell.z_score}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block text-[10px]">Deviation:</span>
                    <span className={`${selectedCell.anomaly_percent >= 0 ? 'text-amber-400' : 'text-sky-400'} font-semibold`}>
                      {selectedCell.anomaly_percent >= 0 ? `+${selectedCell.anomaly_percent}%` : `${selectedCell.anomaly_percent}%`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Raw Sensor Counts */}
              <div className="bg-[#121214] p-3.5 border border-[#2d2d34] space-y-2">
                <span className="text-neutral-400 font-medium block">Raw Detection Breakdowns:</span>
                <div className="space-y-1.5 font-mono">
                  <div className="flex justify-between items-center text-neutral-300">
                    <span className="text-orange-400 font-sans">MODIS (Terra/Aqua):</span>
                    <span className="font-semibold">{selectedCell.raw_modis.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-neutral-300">
                    <span className="text-neutral-300 font-sans">VIIRS (S-NPP/NOAA):</span>
                    <span className="font-semibold">{selectedCell.raw_viirs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-neutral-300 pt-1 border-t border-[#26262d]">
                    <span className="text-neutral-400 font-sans">Total Raw Detections:</span>
                    <span className="font-semibold text-white">{selectedCell.raw_total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Peak Energy */}
              <div className="bg-[#121214] p-3 border border-[#2d2d34] flex justify-between items-center font-mono">
                <span className="text-neutral-400 font-sans">Peak Fire Energy (FRP):</span>
                <span className="font-bold text-orange-400">{selectedCell.peak_frp} MW</span>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-neutral-500 text-xs">
              Click on any cell in the matrix to inspect detailed sensor metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

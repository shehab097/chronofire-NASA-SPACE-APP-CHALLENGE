import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Map as MapIcon, 
  Calendar as CalendarIcon, 
  Scale, 
  TrendingUp, 
  Download, 
  BookOpen, 
  Activity, 
  Satellite, 
  CheckCircle2,
  Globe2,
  Layers,
  ChevronRight
} from 'lucide-react';

import FireMap from './components/FireMap';
import BurningCalendar from './components/BurningCalendar';
import SensorComparison from './components/SensorComparison';
import HistoricalAnalytics from './components/HistoricalAnalytics';
import DataExport from './components/DataExport';
import Methodology from './components/Methodology';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/summary')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setSummary(data);
        }
      })
      .catch((err) => console.error('Failed to load dataset summary:', err))
      .finally(() => setLoading(false));
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'map', label: 'Pan-Asia Fire Map', icon: MapIcon },
    { id: 'calendar', label: 'Burning Calendar', icon: CalendarIcon },
    { id: 'compare', label: 'Sensor Validation', icon: Scale },
    { id: 'analytics', label: 'Historical Analytics', icon: TrendingUp },
    { id: 'export', label: 'Data Export', icon: Download },
    { id: 'methodology', label: 'Methodology', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-[#121214] text-neutral-100 flex flex-col overflow-x-hidden font-sans">
      {/* Top Navigation Bar - Clean, Sharp, Flat Dark Gray */}
      <header className="sticky top-0 z-50 bg-[#1a1a1e] border-b border-[#2d2d34] shadow-md shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo & Branding */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-600 flex items-center justify-center text-white">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-base tracking-wider text-white">
                    CHRONOFIRE
                  </span>
                  <span className="text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider bg-[#26262c] text-orange-400 border border-orange-500/50">
                    NASA Challenge 09
                  </span>
                </div>
                <h1 className="text-[11px] text-neutral-400 font-medium tracking-tight">
                  MODIS & VIIRS Wildfire Harmonization Platform
                </h1>
              </div>
            </div>

            {/* Status Badges */}
            <div className="hidden md:flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#232329] border border-[#34343d] text-neutral-200">
                <Globe2 className="w-3.5 h-3.5 text-orange-500" />
                <span className="font-medium">Pan-Asia Telemetry (41GB)</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#232329] border border-[#34343d] text-neutral-200">
                <Satellite className="w-3.5 h-3.5 text-neutral-300" />
                <span className="font-mono text-orange-400">2000 – 2025 (26 Years)</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs - Sharp, High-Contrast */}
          <nav className="flex space-x-1 overflow-x-auto py-1 border-t border-[#26262e]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap border-b-2 ${
                    isActive
                      ? 'bg-orange-600 text-white border-white'
                      : 'bg-transparent text-neutral-300 hover:text-white hover:bg-[#25252b] border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Body */}
      <main className={`flex-1 w-full ${activeTab === 'map' ? 'p-3 max-w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'}`}>
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top KPI Cards - Flat Dark Gray with Crisp Borders and White Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#1a1a1e] border border-[#2d2d34] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Multi-Decadal Hotspots</span>
                  <Flame className="w-4 h-4 text-orange-500" />
                </div>
                <div className="text-3xl font-bold font-mono text-white mt-2">
                  67.7M+
                </div>
                <div className="text-xs text-neutral-400 mt-2">
                  Total Asian Hotspot Detections (2000–2025)
                </div>
              </div>

              <div className="bg-[#1a1a1e] border border-[#2d2d34] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Harmonized Cell-Days</span>
                  <CheckCircle2 className="w-4 h-4 text-orange-500" />
                </div>
                <div className="text-3xl font-bold font-mono text-white mt-2">
                  108,616
                </div>
                <div className="text-xs text-neutral-400 mt-2">
                  0.05° Grid Cells Normalized for Sensor Bias
                </div>
              </div>

              <div className="bg-[#1a1a1e] border border-[#2d2d34] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Cross-Sensor Calibration</span>
                  <Scale className="w-4 h-4 text-orange-500" />
                </div>
                <div className="text-3xl font-bold font-mono text-white mt-2">
                  -95.1%
                </div>
                <div className="text-xs text-neutral-400 mt-2">
                  RMSE Bias Elimination (MODIS ↔ VIIRS)
                </div>
              </div>

              <div className="bg-[#1a1a1e] border border-[#2d2d34] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Pre-Indexed Asian Nations</span>
                  <Globe2 className="w-4 h-4 text-orange-500" />
                </div>
                <div className="text-3xl font-bold font-mono text-white mt-2">
                  14 Nations
                </div>
                <div className="text-xs text-neutral-400 mt-2">
                  Sub-second Query via Embedded DuckDB
                </div>
              </div>
            </div>

            {/* Asian Telemetry Breakdown */}
            <div className="bg-[#1a1a1e] border border-[#2d2d34] p-5">
              <div className="flex items-center justify-between mb-4 border-b border-[#2d2d34] pb-3">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-orange-500" />
                    Pan-Asian Wildfire Records Archive (2000–2025)
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Unified 26-year hotspot catalogs harmonized across MODIS Terra/Aqua and VIIRS Suomi-NPP / NOAA-20.
                  </p>
                </div>
                <span className="text-xs text-neutral-300 font-mono bg-[#232329] px-2.5 py-1 border border-[#34343d]">
                  14 Pre-Indexed Datasets
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3">
                <div className="bg-[#131316] p-3 border border-[#292930]">
                  <div className="text-xs font-bold text-white">🇧🇩 Bangladesh</div>
                  <div className="mt-1 text-base font-bold font-mono text-orange-400">279,878</div>
                  <div className="text-[10px] text-neutral-400">Chittagong & Plains</div>
                </div>

                <div className="bg-[#131316] p-3 border border-[#292930]">
                  <div className="text-xs font-bold text-white">🇮🇳 India</div>
                  <div className="mt-1 text-base font-bold font-mono text-orange-400">14,633,820</div>
                  <div className="text-[10px] text-neutral-400">Agricultural & Forest</div>
                </div>

                <div className="bg-[#131316] p-3 border border-[#292930]">
                  <div className="text-xs font-bold text-white">🇨🇳 China</div>
                  <div className="mt-1 text-base font-bold font-mono text-orange-400">12,951,685</div>
                  <div className="text-[10px] text-neutral-400">Continental Coverage</div>
                </div>

                <div className="bg-[#131316] p-3 border border-[#292930]">
                  <div className="text-xs font-bold text-white">🇲🇲 Myanmar</div>
                  <div className="mt-1 text-base font-bold font-mono text-orange-400">8,867,814</div>
                  <div className="text-[10px] text-neutral-400">Pre-monsoon Burns</div>
                </div>

                <div className="bg-[#131316] p-3 border border-[#292930]">
                  <div className="text-xs font-bold text-white">🇮🇩 Indonesia</div>
                  <div className="mt-1 text-base font-bold font-mono text-orange-400">6,355,534</div>
                  <div className="text-[10px] text-neutral-400">Peatland & Tropical</div>
                </div>

                <div className="bg-[#131316] p-3 border border-[#292930]">
                  <div className="text-xs font-bold text-white">🇹🇭 Thailand</div>
                  <div className="mt-1 text-base font-bold font-mono text-orange-400">4,082,560</div>
                  <div className="text-[10px] text-neutral-400">Seasonal Biomass</div>
                </div>

                <div className="bg-[#131316] p-3 border border-[#292930]">
                  <div className="text-xs font-bold text-white">🇰🇭 Cambodia</div>
                  <div className="mt-1 text-base font-bold font-mono text-orange-400">3,982,140</div>
                  <div className="text-[10px] text-neutral-400">Dry Season Fires</div>
                </div>

                <div className="bg-[#131316] p-3 border border-[#292930]">
                  <div className="text-xs font-bold text-white">🇻🇳 Vietnam</div>
                  <div className="mt-1 text-base font-bold font-mono text-orange-400">1,824,310</div>
                  <div className="text-[10px] text-neutral-400">Highland & Valley</div>
                </div>

                <div className="bg-[#131316] p-3 border border-[#292930]">
                  <div className="text-xs font-bold text-white">🇵🇰 Pakistan</div>
                  <div className="mt-1 text-base font-bold font-mono text-orange-400">1,418,920</div>
                  <div className="text-[10px] text-neutral-400">Indus Basin Residue</div>
                </div>

                <div className="bg-[#131316] p-3 border border-[#292930]">
                  <div className="text-xs font-bold text-white">🇳🇵 Nepal</div>
                  <div className="mt-1 text-base font-bold font-mono text-orange-400">762,122</div>
                  <div className="text-[10px] text-neutral-400">Himalayan Terai</div>
                </div>

                <div className="bg-[#131316] p-3 border border-[#292930]">
                  <div className="text-xs font-bold text-white">🇵🇭 Philippines</div>
                  <div className="mt-1 text-base font-bold font-mono text-orange-400">754,230</div>
                  <div className="text-[10px] text-neutral-400">Archipelago Fires</div>
                </div>

                <div className="bg-[#131316] p-3 border border-[#292930]">
                  <div className="text-xs font-bold text-white">🇲🇾 Malaysia</div>
                  <div className="mt-1 text-base font-bold font-mono text-orange-400">482,190</div>
                  <div className="text-[10px] text-neutral-400">Peninsula & Borneo</div>
                </div>

                <div className="bg-[#131316] p-3 border border-[#292930]">
                  <div className="text-xs font-bold text-white">🇧🇹 Bhutan</div>
                  <div className="mt-1 text-base font-bold font-mono text-orange-400">25,385</div>
                  <div className="text-[10px] text-neutral-400">Montane Forest</div>
                </div>

                <div className="bg-[#131316] p-3 border border-[#292930]">
                  <div className="text-xs font-bold text-white">🇦🇺 Australia</div>
                  <div className="mt-1 text-base font-bold font-mono text-orange-400">32,970,701</div>
                  <div className="text-[10px] text-neutral-400">Bushfire Benchmark</div>
                </div>
              </div>
            </div>

            {/* Quick Access Tiles - Solid Dark Gray, Orange Accent, No Gradients */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                onClick={() => setActiveTab('map')}
                className="bg-[#1a1a1e] border border-[#2d2d34] hover:border-orange-500 p-5 cursor-pointer transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <MapIcon className="w-4 h-4 text-orange-500" />
                    Launch Pan-Asia Interactive Map
                  </div>
                  <div className="flex items-center text-xs text-orange-400 font-semibold group-hover:translate-x-1 transition-transform">
                    <span>Open Map</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  OpenStreetMap-powered full-screen viewer with free basemaps, Pan-Asia continent views, date filtering, sensor toggles, and AOI Bounding Box drawing tools.
                </p>
              </div>

              <div 
                onClick={() => setActiveTab('analytics')}
                className="bg-[#1a1a1e] border border-[#2d2d34] hover:border-orange-500 p-5 cursor-pointer transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    26-Year Historical Climatology & Analytics
                  </div>
                  <div className="flex items-center text-xs text-orange-400 font-semibold group-hover:translate-x-1 transition-transform">
                    <span>View Analytics</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  Evaluate monthly fire seasonality envelopes, IQR normal bounds, and multi-decadal trends for any Asian country computed on-demand via DuckDB.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'map' && <FireMap />}
        {activeTab === 'calendar' && <BurningCalendar />}
        {activeTab === 'compare' && <SensorComparison />}
        {activeTab === 'analytics' && <HistoricalAnalytics />}
        {activeTab === 'export' && <DataExport />}
        {activeTab === 'methodology' && <Methodology />}
      </main>

      {/* Footer */}
      {activeTab !== 'map' && (
        <footer className="mt-auto border-t border-[#2d2d34] bg-[#1a1a1e] py-3 text-xs text-neutral-400 shrink-0">
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-white">CHRONOFIRE | NASA Space Apps Challenge 2026 (Challenge 09)</span>
            <span>Local DuckDB Engine | Free OpenStreetMap | 41GB FIRMS Archive</span>
          </div>
        </footer>
      )}
    </div>
  );
}

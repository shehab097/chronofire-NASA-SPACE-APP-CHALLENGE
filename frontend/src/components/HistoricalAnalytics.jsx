import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, ComposedChart, Line, Area, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { TrendingUp, BarChart2, Globe2, RefreshCw } from 'lucide-react';

const SUPPORTED_ANALYTICS_COUNTRIES = [
  { id: 'Pan-Asia', name: '🌏 Pan-Asia (All Asian Nations Combined)' },
  { id: 'Bangladesh', name: '🇧🇩 Bangladesh (Calibrated Baseline)' },
  { id: 'India', name: '🇮🇳 India (14.6M Records)' },
  { id: 'China', name: '🇨🇳 China (12.9M Records)' },
  { id: 'Myanmar', name: '🇲🇲 Myanmar (8.8M Records)' },
  { id: 'Thailand', name: '🇹🇭 Thailand (4.0M Records)' },
  { id: 'Vietnam', name: '🇻🇳 Vietnam (1.8M Records)' },
  { id: 'Cambodia', name: '🇰🇭 Cambodia (3.9M Records)' },
  { id: 'Indonesia', name: '🇮🇩 Indonesia (6.3M Records)' },
  { id: 'Malaysia', name: '🇲🇾 Malaysia (482K Records)' },
  { id: 'Philippines', name: '🇵🇭 Philippines (754K Records)' },
  { id: 'Pakistan', name: '🇵🇰 Pakistan (1.4M Records)' },
  { id: 'Nepal', name: '🇳🇵 Nepal (762K Records)' },
  { id: 'Bhutan', name: '🇧🇹 Bhutan (25K Records)' },
  { id: 'Australia', name: '🇦🇺 Australia (32.9M Records)' },
];

export default function HistoricalAnalytics() {
  const [selectedCountry, setSelectedCountry] = useState('Pan-Asia');
  const [baselineData, setBaselineData] = useState([]);
  const [annualData, setAnnualData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async (countryName) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/baseline?country=${encodeURIComponent(countryName)}`);
      const data = await res.json();
      if (data.status === 'success') {
        setBaselineData(data.monthly_baseline || []);
        setAnnualData(data.annual_trends || []);
      }
    } catch (err) {
      console.error('Failed to load historical baseline:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(selectedCountry);
  }, [selectedCountry]);

  return (
    <div className="space-y-6">
      {/* Header & Country Selector - Sharp Flat Dark Gray */}
      <div className="bg-[#1a1a1e] border border-[#2d2d34] p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              26-Year Historical Climatology & Seasonality (2000 – 2025)
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Multi-decadal climatological reference baselines derived across 26 years to benchmark abnormal fire activity against natural seasonal variation in Asia.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#121214] px-3 py-1.5 border border-[#34343d] text-xs">
            <Globe2 className="w-4 h-4 text-orange-500" />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-transparent border-0 text-white font-semibold focus:outline-none cursor-pointer text-xs"
            >
              {SUPPORTED_ANALYTICS_COUNTRIES.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#1a1a1e] text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-neutral-400 flex items-center justify-center gap-2 bg-[#1a1a1e] border border-[#2d2d34]">
          <RefreshCw className="w-5 h-5 text-orange-500 animate-spin" />
          <span>Computing 26-year historical baseline via DuckDB...</span>
        </div>
      ) : (
        <>
          {/* Chart 1: Monthly Seasonal Envelope */}
          <div className="bg-[#1a1a1e] border border-[#2d2d34] p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-[#2d2d34] pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-orange-500" />
                  1. Natural Fire Seasonality Envelope (Monthly Climatology for {selectedCountry})
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Shows Historical Median and the Normal Interquartile Range (IQR: 25th to 75th percentile).
                </p>
              </div>
              <span className="px-2.5 py-1 bg-[#26262e] text-orange-400 border border-orange-500/40 text-[11px] font-semibold font-mono">
                26-Year Median
              </span>
            </div>

            <div className="h-[320px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={baselineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#282830]" />
                  <XAxis dataKey="month_name" stroke="#888894" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#888894" tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181c', borderColor: '#ea580c', borderRadius: '0px', fontSize: '12px', color: '#ffffff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Area type="monotone" dataKey="historical_q3" name="75th Percentile (Upper Normal)" stroke="#f97316" fill="#f97316" fillOpacity={0.15} />
                  <Line type="monotone" dataKey="historical_median" name="Historical Median Activity" stroke="#ea580c" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="historical_mean" name="Historical Average" stroke="#ffffff" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                  <Line type="monotone" dataKey="historical_q1" name="25th Percentile (Lower Normal)" stroke="#fdba74" strokeWidth={1} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Multi-Year Fire Activity Trends */}
          <div className="bg-[#1a1a1e] border border-[#2d2d34] p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-[#2d2d34] pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  2. Annual Fire Activity Trends (2000 – 2025: {selectedCountry})
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Long-term annual fire activity and radiative power across the complete satellite mission history.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-[#26262e] text-neutral-300 border border-[#3d3d47] text-[11px] font-semibold">
                Decadal Series
              </span>
            </div>

            <div className="h-[300px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={annualData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#282830" />
                  <XAxis dataKey="year" stroke="#888894" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" stroke="#888894" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#ea580c" tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181c', borderColor: '#ea580c', borderRadius: '0px', fontSize: '12px', color: '#ffffff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar yAxisId="left" dataKey="annual_harmonized_activity" name="Annual Fire Activity" fill="#f97316" radius={[0, 0, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="annual_avg_frp" name="Average FRP (MW)" stroke="#ffffff" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Climatological Table */}
          <div className="bg-[#1a1a1e] border border-[#2d2d34] p-5 shadow-lg overflow-x-auto">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-orange-500" />
              Monthly Statistical Climatology Breakdown ({selectedCountry})
            </h3>
            <table className="w-full text-xs text-left border border-[#2d2d34]">
              <thead className="bg-[#121214] text-neutral-300 border-b border-[#2d2d34] font-semibold">
                <tr>
                  <th className="p-2.5">Month</th>
                  <th className="p-2.5 text-orange-400">Historical Median</th>
                  <th className="p-2.5 text-white">Historical Mean</th>
                  <th className="p-2.5 text-neutral-400">Normal Range (IQR: Q1 – Q3)</th>
                  <th className="p-2.5 text-neutral-400">Record Min</th>
                  <th className="p-2.5 text-orange-400">Record Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26262d] text-neutral-300 font-mono">
                {baselineData.map((row) => (
                  <tr key={row.month} className="hover:bg-[#232329] transition-colors">
                    <td className="p-2.5 font-sans font-medium text-white">{row.month_name}</td>
                    <td className="p-2.5 font-bold text-orange-400">{row.historical_median?.toLocaleString()}</td>
                    <td className="p-2.5 text-white">{row.historical_mean?.toLocaleString()}</td>
                    <td className="p-2.5 text-neutral-400">{row.historical_q1?.toLocaleString()} – {row.historical_q3?.toLocaleString()}</td>
                    <td className="p-2.5 text-neutral-500">{row.historical_min?.toLocaleString()}</td>
                    <td className="p-2.5 text-orange-400 font-semibold">{row.historical_max?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

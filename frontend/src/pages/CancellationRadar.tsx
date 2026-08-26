import React, { useState, useEffect } from 'react';
import { RadarPoint } from '../types';
import { fetchRadarPoints } from '../api/client';
import { RiskBadge } from '../components/RiskBadge';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Radar as RadarIcon, Info, Filter, ArrowRight } from 'lucide-react';

export const CancellationRadar: React.FC = () => {
  const [points, setPoints] = useState<RadarPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<RadarPoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterHotel, setFilterHotel] = useState<string>('ALL');

  useEffect(() => {
    loadPoints();
  }, []);

  const loadPoints = async () => {
    try {
      setLoading(true);
      const data = await fetchRadarPoints(150);
      setPoints(data.points || []);
      if (data.points && data.points.length > 0) {
        setSelectedPoint(data.points[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = points.filter((p) => {
    if (filterHotel === 'ALL') return true;
    return p.hotel === filterHotel;
  });

  const getPointColor = (tier: string) => {
    switch (tier) {
      case 'CRITICAL': return '#ef4444';
      case 'HIGH': return '#f97316';
      case 'MODERATE': return '#f59e0b';
      case 'LOW':
      default:
        return '#10b981';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="p-4 rounded-xl glass-panel border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <RadarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Live Cancellation Risk Radar
            </h2>
            <p className="text-[11px] text-slate-400">
              X = Lead Time (days) · Y = Model Cancellation Probability · Bubble Size = Gross Booking Value ($)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter Hotel:
          </span>
          <select
            value={filterHotel}
            onChange={(e) => setFilterHotel(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500"
          >
            <option value="ALL">All Properties</option>
            <option value="City Hotel">City Hotel</option>
            <option value="Resort Hotel">Resort Hotel</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Chart */}
        <div className="lg:col-span-8 p-5 rounded-xl glass-panel border border-slate-800 flex flex-col justify-between">
          <div className="h-[480px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  type="number"
                  dataKey="lead_time"
                  name="Lead Time"
                  unit="d"
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Lead Time (Days)', position: 'insideBottom', offset: -10, fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="cancellation_probability"
                  name="Probability"
                  domain={[0, 1]}
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                  label={{ value: 'Cancellation Probability', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
                />
                <ZAxis type="number" dataKey="booking_value" range={[50, 450]} name="Booking Value" unit="$" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as RadarPoint;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg text-xs shadow-xl space-y-1">
                          <div className="font-mono font-bold text-cyan-400">{data.booking_id} ({data.hotel})</div>
                          <div className="text-slate-300">Lead Time: <span className="font-mono">{data.lead_time} days</span></div>
                          <div className="text-slate-300">Cancellation Prob: <span className="font-mono font-bold text-rose-400">{(data.cancellation_probability * 100).toFixed(1)}%</span></div>
                          <div className="text-slate-300">Booking Value: <span className="font-mono">${data.booking_value}</span></div>
                          <div className="text-slate-300">Revenue at Risk: <span className="font-mono font-bold text-amber-400">${data.revenue_at_risk}</span></div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter
                  name="Bookings"
                  data={filtered}
                  onClick={(node) => setSelectedPoint(node as RadarPoint)}
                >
                  {filtered.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getPointColor(entry.risk_tier)}
                      stroke="#0f172a"
                      strokeWidth={1}
                      className="cursor-pointer transition-transform hover:scale-125"
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-800 text-xs font-mono">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Low (&lt;25%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Moderate (25-50%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> High (50-75%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Critical (&ge;75%)</span>
          </div>
        </div>

        {/* Selected Booking Detail Panel */}
        <div className="lg:col-span-4 p-5 rounded-xl glass-panel border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">POINT INSPECTOR</span>
                <h3 className="text-sm font-bold font-mono text-cyan-400">
                  {selectedPoint ? selectedPoint.booking_id : 'Select a bubble'}
                </h3>
              </div>
              {selectedPoint && <RiskBadge tier={selectedPoint.risk_tier} probability={selectedPoint.cancellation_probability} showProb />}
            </div>

            {selectedPoint ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hotel Property</span>
                    <span className="font-mono text-slate-200">{selectedPoint.hotel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Market Segment</span>
                    <span className="font-mono text-slate-200">{selectedPoint.market_segment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Deposit Type</span>
                    <span className="font-mono text-slate-200">{selectedPoint.deposit_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lead Time</span>
                    <span className="font-mono text-cyan-400 font-bold">{selectedPoint.lead_time} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gross Booking Value</span>
                    <span className="font-mono text-slate-200">${selectedPoint.booking_value.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-2">
                    <span className="text-slate-400 font-bold">Estimated Revenue at Risk</span>
                    <span className="font-mono font-bold text-rose-400">${selectedPoint.revenue_at_risk.toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-slate-300">
                  <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold mb-1">
                    Operational Recommendation
                  </div>
                  {selectedPoint.risk_tier === 'CRITICAL' || selectedPoint.risk_tier === 'HIGH' ? (
                    <p className="text-[11px] leading-relaxed">
                      Elevated risk detected. Implement strategic overbooking allocation or trigger automated pre-arrival deposit / re-confirmation request.
                    </p>
                  ) : (
                    <p className="text-[11px] leading-relaxed">
                      Booking shows stable retention characteristics. No proactive overbooking penalty required.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Click on any bubble on the radar to inspect its attributes.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

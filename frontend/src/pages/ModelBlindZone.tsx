import React, { useState, useEffect } from 'react';
import {
  fetchModelBlindZoneOverview,
  fetchModelBlindZoneBookings
} from '../api/client';
import {
  EyeOff,
  AlertOctagon,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  Filter,
  RefreshCw,
  Search,
  Sliders,
  HelpCircle
} from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';

export const ModelBlindZone: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlindZoneData();
  }, [filterStatus]);

  const loadBlindZoneData = async () => {
    setLoading(true);
    try {
      const [ov, bkg] = await Promise.all([
        fetchModelBlindZoneOverview(),
        fetchModelBlindZoneBookings(filterStatus, 25)
      ]);
      setOverview(ov);
      setBookings(bkg.bookings || []);
      if (bkg.bookings && bkg.bookings.length > 0 && !selectedBooking) {
        setSelectedBooking(bkg.bookings[0]);
      }
    } catch (e) {
      console.error('Blind Zone fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  const getApplicabilityBadge = (status: string) => {
    switch (status) {
      case 'HIGH BLIND-ZONE RISK':
        return 'bg-rose-950/80 text-rose-300 border-rose-700 font-bold';
      case 'UNUSUAL':
        return 'bg-amber-950/80 text-amber-300 border-amber-700 font-bold';
      case 'NORMAL':
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700 font-medium';
    }
  };

  const getEvidenceStatusColor = (status: string) => {
    switch (status) {
      case 'EXTREME OUTLIER':
      case 'RARE CATEGORY':
        return 'text-rose-400 font-bold';
      case 'UNUSUAL':
        return 'text-amber-400 font-semibold';
      case 'NORMAL':
      default:
        return 'text-emerald-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-xl glass-panel border border-cyan-500/40 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 flex flex-wrap items-center justify-between gap-4 shadow-xl shadow-cyan-950/20">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <EyeOff className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                MODEL BLIND ZONE & INPUT FAMILIARITY MONITOR
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                APPLICABILITY DIAGNOSTIC
              </span>
            </div>
            <div className="text-xs text-slate-300 mt-0.5">
              Identify reservations where input characteristics diverge from the model's reference training distribution.
            </div>
          </div>
        </div>

        <button
          onClick={loadBlindZoneData}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
          title="Refresh Blind Zone"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* Caution Callout */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-slate-200 font-bold">MODEL APPLICABILITY NOTICE: </span>
          This assessment evaluates input familiarity relative to training distributions. It concerns model applicability and covariate shift, not prediction correctness.
        </div>
      </div>

      {/* Overview Metric Cards (NORMAL, UNUSUAL, HIGH BLIND-ZONE RISK) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Normal Tier */}
        <div className="p-5 rounded-xl glass-panel border border-emerald-500/30 bg-emerald-950/10 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 text-[10px] font-mono uppercase">
            <span className="text-emerald-400 font-bold">NORMAL APPLICABILITY</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-bold font-mono text-emerald-400">
              {overview?.normal_percentage || '78.2'}%
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {overview?.normal_bookings || 782} / {overview?.total_evaluated_bookings || 1000} reservations
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Features within P5–P95 reference boundaries
          </div>
        </div>

        {/* Unusual Tier */}
        <div className="p-5 rounded-xl glass-panel border border-amber-500/30 bg-amber-950/10 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 text-[10px] font-mono uppercase">
            <span className="text-amber-400 font-bold">UNUSUAL COHORT</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-bold font-mono text-amber-400">
              {overview?.unusual_percentage || '16.5'}%
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {overview?.unusual_bookings || 165} / {overview?.total_evaluated_bookings || 1000} reservations
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            1–2 features in tail percentiles (&lt;P5 or &gt;P95)
          </div>
        </div>

        {/* High Blind-Zone Risk Tier */}
        <div className="p-5 rounded-xl glass-panel border border-rose-500/30 bg-rose-950/10 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 text-[10px] font-mono uppercase">
            <span className="text-rose-400 font-bold">HIGH BLIND-ZONE RISK</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-bold font-mono text-rose-400">
              {overview?.high_blind_zone_percentage || '5.3'}%
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {overview?.high_blind_zone_bookings || 53} / {overview?.total_evaluated_bookings || 1000} reservations
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Extreme outliers (&gt;P99) or rare category values
          </div>
        </div>
      </div>

      {/* SELECTED BOOKING DUAL VIEW: PREDICTION + APPLICABILITY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dual Prediction & Applicability Card */}
        <div className="lg:col-span-5 p-6 rounded-xl glass-panel border border-cyan-500/40 bg-gradient-to-b from-slate-900 to-[#080d1a] flex flex-col justify-between space-y-5">
          <div>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">SELECTED RESERVATION</span>
                <h3 className="text-sm font-bold font-mono text-cyan-400">
                  {selectedBooking ? selectedBooking.booking_id : 'Select a Booking'}
                </h3>
              </div>
              {selectedBooking && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getApplicabilityBadge(selectedBooking.model_applicability)}`}>
                  {selectedBooking.model_applicability}
                </span>
              )}
            </div>

            {selectedBooking ? (
              <div className="space-y-4 font-mono text-xs">
                {/* Dual Side-by-Side Indicator */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Model Prediction */}
                  <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
                    <span className="text-[10px] uppercase text-slate-400 block mb-1">
                      MODEL PREDICTION
                    </span>
                    <div className="text-2xl font-bold text-cyan-400">
                      {(selectedBooking.cancellation_probability * 100).toFixed(1)}%
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Cancellation Risk
                    </span>
                  </div>

                  {/* Model Applicability */}
                  <div className={`p-3.5 rounded-lg border text-center ${
                    selectedBooking.model_applicability === 'HIGH BLIND-ZONE RISK'
                      ? 'bg-rose-950/30 border-rose-800/60 text-rose-300'
                      : selectedBooking.model_applicability === 'UNUSUAL'
                      ? 'bg-amber-950/30 border-amber-800/60 text-amber-300'
                      : 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                  }`}>
                    <span className="text-[10px] uppercase block mb-1 font-bold">
                      MODEL APPLICABILITY
                    </span>
                    <div className="text-lg font-bold">
                      {selectedBooking.model_applicability === 'NORMAL' ? 'NORMAL ✓' : 'UNUSUAL ⚠'}
                    </div>
                    <span className="text-[10px] opacity-80">
                      Input Environment
                    </span>
                  </div>
                </div>

                {/* Applicability Explanation Narrative */}
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px] leading-relaxed">
                  <div className="text-[10px] font-bold text-cyan-400 uppercase mb-1">
                    Applicability Assessment Narrative
                  </div>
                  {selectedBooking.applicability_reason}
                </div>

                {/* Booking basic traits */}
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
                  <div className="flex justify-between"><span>Property:</span> <span className="text-slate-200">{selectedBooking.hotel}</span></div>
                  <div className="flex justify-between"><span>Segment:</span> <span className="text-slate-200">{selectedBooking.market_segment}</span></div>
                  <div className="flex justify-between"><span>Lead Time:</span> <span className="text-slate-200">{selectedBooking.lead_time_days} days</span></div>
                  <div className="flex justify-between"><span>ADR:</span> <span className="text-slate-200">${selectedBooking.adr.toFixed(2)}</span></div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Select a reservation to view dual prediction and applicability.</p>
            )}
          </div>
        </div>

        {/* Feature-Level Evidence Table */}
        <div className="lg:col-span-7 p-6 rounded-xl glass-panel border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-3">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  WHY IS THIS BOOKING IN THIS APPLICABILITY TIER?
                </h3>
                <p className="text-[11px] text-slate-400">
                  Feature-by-feature empirical comparison against 119,390 reference training distributions
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                FEATURE EVIDENCE
              </span>
            </div>

            {selectedBooking && selectedBooking.evidence ? (
              <div className="space-y-2.5">
                {selectedBooking.evidence.map((ev: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between font-mono text-xs"
                  >
                    <div>
                      <div className="font-bold text-white text-xs">{ev.feature}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Current: <span className="text-cyan-400 font-bold">{ev.current_value}</span> · Reference: {ev.reference_info}
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      ev.status === 'NORMAL'
                        ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/60'
                        : ev.status === 'UNUSUAL'
                        ? 'bg-amber-950/50 text-amber-400 border-amber-800/60'
                        : 'bg-rose-950/50 text-rose-400 border-rose-800/60'
                    }`}>
                      {ev.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 font-mono py-8 text-center">
                Select a booking to inspect feature evidence.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PORTFOLIO BLIND-ZONE BOOKINGS TABLE */}
      <div className="p-5 rounded-xl glass-panel border border-slate-800 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Portfolio Blind-Zone Diagnostic Table
            </h3>
            <p className="text-[11px] text-slate-400">
              Filtered by input familiarity status. Click any row to inspect dual prediction and feature evidence.
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {['ALL', 'NORMAL', 'UNUSUAL', 'HIGH BLIND-ZONE RISK'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded text-[10px] transition-colors ${
                  filterStatus === st
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="pb-3 px-3">BOOKING ID</th>
                <th className="pb-3 px-3">PROPERTY</th>
                <th className="pb-3 px-3">SEGMENT</th>
                <th className="pb-3 px-3">ARRIVAL</th>
                <th className="pb-3 px-3 text-right">LEAD TIME</th>
                <th className="pb-3 px-3 text-right">ADR</th>
                <th className="pb-3 px-3 text-right">MODEL PROB</th>
                <th className="pb-3 px-3">MODEL RISK</th>
                <th className="pb-3 px-3">MODEL APPLICABILITY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {bookings.map((b, idx) => {
                const isSelected = selectedBooking?.booking_id === b.booking_id;
                return (
                  <tr
                    key={idx}
                    onClick={() => setSelectedBooking(b)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-cyan-950/30' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-white">{b.booking_id}</td>
                    <td className="py-2.5 px-3 text-slate-300">{b.hotel}</td>
                    <td className="py-2.5 px-3 text-slate-400">{b.market_segment}</td>
                    <td className="py-2.5 px-3 text-slate-400">{b.arrival_date}</td>
                    <td className="py-2.5 px-3 text-right text-slate-300">{b.lead_time_days}d</td>
                    <td className="py-2.5 px-3 text-right text-slate-300">${b.adr.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-rose-400">
                      {(b.cancellation_probability * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3">
                      <RiskBadge tier={b.model_risk_tier} />
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${getApplicabilityBadge(b.model_applicability)}`}>
                        {b.model_applicability}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

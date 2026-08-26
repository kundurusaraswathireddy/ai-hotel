import React, { useState, useEffect } from 'react';
import {
  fetchCancellationDnaSignatures,
  fetchCancellationDnaBookings
} from '../api/client';
import {
  Dna,
  Fingerprint,
  Layers,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Info,
  DollarSign,
  Users,
  RefreshCw,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { RiskBadge } from '../components/RiskBadge';

export const CancellationDNA: React.FC = () => {
  const [signatures, setSignatures] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [selectedSig, setSelectedSig] = useState<any>(null);
  const [drillBookings, setDrillBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Comparison State
  const [compSigA, setCompSigA] = useState<string>('DNA-01');
  const [compSigB, setCompSigB] = useState<string>('DNA-04');

  useEffect(() => {
    loadDnaData();
  }, []);

  const loadDnaData = async () => {
    setLoading(true);
    try {
      const res = await fetchCancellationDnaSignatures();
      setSignatures(res.signatures || []);
      setOverview(res.portfolio_overview || null);
      if (res.signatures && res.signatures.length > 0) {
        setSelectedSig(res.signatures[0]);
        loadBookings(res.signatures[0].id);
      }
    } catch (e) {
      console.error('DNA fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async (sigId: string) => {
    setLoadingBookings(true);
    try {
      const res = await fetchCancellationDnaBookings(sigId, 15);
      setDrillBookings(res.bookings || []);
    } catch (e) {
      console.error('Bookings fetch error', e);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleSelectSig = (sig: any) => {
    setSelectedSig(sig);
    loadBookings(sig.id);
  };

  const sigA = signatures.find((s) => s.id === compSigA) || signatures[0];
  const sigB = signatures.find((s) => s.id === compSigB) || signatures[1];

  // Comparison Radar Chart Data
  const compRadarData = (sigA && sigB)
    ? sigA.fingerprint.map((fpA: any, idx: number) => ({
        axis: fpA.axis,
        [sigA.name]: fpA.value,
        [sigB.name]: sigB.fingerprint[idx]?.value || 0,
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-xl glass-panel border border-cyan-500/40 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 flex flex-wrap items-center justify-between gap-4 shadow-xl shadow-cyan-950/20">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Dna className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                CANCELLATION DNA & RISK SIGNATURE DISCOVERY
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                DESCRIPTIVE PATTERNS
              </span>
            </div>
            <div className="text-xs text-slate-300 mt-0.5">
              Empirical risk signatures characterizing the hotel's actual booking patterns and cancellation behavior.
            </div>
          </div>
        </div>

        <button
          onClick={loadDnaData}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
          title="Refresh DNA"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* Caution & Non-Causality Callout */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-slate-200 font-bold">DESCRIPTIVE RISK ASSESSMENT: </span>
          Risk signatures describe patterns observed in the current data and model predictions. They do not prove that these characteristics cause cancellation.
        </div>
      </div>

      {/* PORTFOLIO DNA FINGERPRINT + SELECTED SIGNATURE RADAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Large Diagnostic Fingerprint Radar */}
        <div className="lg:col-span-7 p-5 rounded-xl glass-panel border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-cyan-400" />
                Portfolio DNA Fingerprint vs Selected Signature
              </h3>
              <p className="text-[11px] text-slate-400">
                6-Axis Diagnostic Vector: Lead Time, Pricing ADR, Model Risk, Channel, Deposit Rigidity & Engagement
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
              6-AXIS RADAR
            </span>
          </div>

          <div className="h-[360px] w-full flex items-center justify-center">
            {overview && selectedSig ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={selectedSig.fingerprint}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="axis" stroke="#94a3b8" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <PolarRadiusAxis domain={[0, 100]} stroke="#475569" tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Radar name={selectedSig.name} dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500 font-mono">Loading fingerprint vector...</div>
            )}
          </div>
        </div>

        {/* Selected Signature Deep-Dive Card */}
        <div className="lg:col-span-5 p-5 rounded-xl glass-panel border border-cyan-500/40 bg-gradient-to-b from-slate-900 to-[#080d1a] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start border-b border-slate-800 pb-3 mb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">SELECTED RISK SIGNATURE</span>
                <h3 className="text-sm font-bold font-mono text-cyan-400 mt-0.5">
                  {selectedSig ? selectedSig.name : 'Select a Signature'}
                </h3>
              </div>
              {selectedSig && <RiskBadge tier={selectedSig.risk_tier} probability={selectedSig.avg_cancellation_probability} showProb />}
            </div>

            {selectedSig && (
              <div className="space-y-3.5 text-xs font-mono">
                <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
                  {selectedSig.description}
                </p>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Portfolio Share:</span>
                    <span className="text-white font-bold">{selectedSig.booking_count} bookings ({selectedSig.portfolio_percentage}%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg Model Cancellation Probability:</span>
                    <span className="text-rose-400 font-bold">{(selectedSig.avg_cancellation_probability * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Signature Strength Score:</span>
                    <span className="text-amber-400 font-bold">{selectedSig.signature_strength_score} / 100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gross Booking Value:</span>
                    <span className="text-slate-200">${selectedSig.total_booking_value.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-2">
                    <span className="text-slate-400 font-bold">Estimated Revenue Exposure:</span>
                    <span className="text-rose-400 font-bold">${selectedSig.estimated_revenue_exposure.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1.5">
                    Dominant Pattern Traits
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSig.dominant_traits.map((t: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TOP RISK SIGNATURES GRID */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Discovered Portfolio Risk Signatures
            </h3>
            <p className="text-[11px] text-slate-400">
              Click any signature to inspect its diagnostic vector and underlying bookings
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {signatures.length} Signatures Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {signatures.map((sig) => {
            const isSelected = selectedSig?.id === sig.id;
            return (
              <div
                key={sig.id}
                onClick={() => handleSelectSig(sig)}
                className={`p-4 rounded-xl glass-panel border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-cyan-500/60 bg-gradient-to-b from-cyan-950/20 to-slate-900 shadow-lg shadow-cyan-950/20'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start border-b border-slate-800 pb-2.5 mb-2.5">
                  <span className="text-[10px] font-mono font-bold text-cyan-400">{sig.id}</span>
                  <RiskBadge tier={sig.risk_tier} probability={sig.avg_cancellation_probability} showProb />
                </div>
                <h4 className="text-xs font-mono font-bold text-white mb-2 leading-tight">
                  {sig.name}
                </h4>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Bookings:</span>
                    <span>{sig.booking_count} ({sig.portfolio_percentage}%)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Strength Score:</span>
                    <span className="text-amber-400 font-bold">{sig.signature_strength_score}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Exposure:</span>
                    <span className="text-rose-400 font-bold">${sig.estimated_revenue_exposure.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DNA SIGNATURE COMPARISON */}
      <div className="p-5 rounded-xl glass-panel border border-slate-800 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              DNA Signature Comparative Intelligence
            </h3>
            <p className="text-[11px] text-slate-400">
              Side-by-side empirical contrast between two distinct risk signatures
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            PAIRWISE COMPARISON
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1">SIGNATURE A</label>
            <select
              value={compSigA}
              onChange={(e) => setCompSigA(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono"
            >
              {signatures.map((s) => (
                <option key={s.id} value={s.id}>{s.id}: {s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1">SIGNATURE B</label>
            <select
              value={compSigB}
              onChange={(e) => setCompSigB(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono"
            >
              {signatures.map((s) => (
                <option key={s.id} value={s.id}>{s.id}: {s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Side-by-Side Comparison Cards */}
        {sigA && sigB && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-2.5 font-mono text-xs">
              <div className="font-bold text-cyan-400 text-xs">{sigA.name}</div>
              <div className="flex justify-between"><span className="text-slate-400">Bookings:</span> <span>{sigA.booking_count} ({sigA.portfolio_percentage}%)</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Cancellation Prob:</span> <span className="text-rose-400 font-bold">{(sigA.avg_cancellation_probability * 100).toFixed(1)}%</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Avg Lead Time:</span> <span>{sigA.avg_lead_time_days} days</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Avg ADR:</span> <span>${sigA.avg_adr}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Estimated Exposure:</span> <span className="text-rose-400 font-bold">${sigA.estimated_revenue_exposure.toLocaleString()}</span></div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/30 space-y-2.5 font-mono text-xs">
              <div className="font-bold text-purple-400 text-xs">{sigB.name}</div>
              <div className="flex justify-between"><span className="text-slate-400">Bookings:</span> <span>{sigB.booking_count} ({sigB.portfolio_percentage}%)</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Cancellation Prob:</span> <span className="text-rose-400 font-bold">{(sigB.avg_cancellation_probability * 100).toFixed(1)}%</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Avg Lead Time:</span> <span>{sigB.avg_lead_time_days} days</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Avg ADR:</span> <span>${sigB.avg_adr}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Estimated Exposure:</span> <span className="text-rose-400 font-bold">${sigB.estimated_revenue_exposure.toLocaleString()}</span></div>
            </div>
          </div>
        )}
      </div>

      {/* DRILL DOWN: SIGNATURE BOOKING EXPLORER */}
      <div className="p-5 rounded-xl glass-panel border border-slate-800 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Signature Booking Explorer: {selectedSig?.name || 'Selected'}
            </h3>
            <p className="text-[11px] text-slate-400">
              Actual reservations in the verified dataset matching this risk signature
            </p>
          </div>
          <span className="text-[10px] font-mono text-cyan-400">
            {drillBookings.length} Sample Records
          </span>
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
                <th className="pb-3 px-3 text-right">VALUE</th>
                <th className="pb-3 px-3">RISK TIER</th>
                <th className="pb-3 px-3 text-right">MODEL PROB</th>
                <th className="pb-3 px-3">DEPOSIT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {drillBookings.map((b, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-white">{b.booking_id}</td>
                  <td className="py-2.5 px-3 text-slate-300">{b.hotel}</td>
                  <td className="py-2.5 px-3 text-slate-400">{b.market_segment}</td>
                  <td className="py-2.5 px-3 text-slate-400">{b.arrival_date}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{b.lead_time_days}d</td>
                  <td className="py-2.5 px-3 text-right text-slate-300">${b.adr.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right text-slate-200 font-semibold">${b.booking_value.toFixed(2)}</td>
                  <td className="py-2.5 px-3"><RiskBadge tier={b.risk_tier} /></td>
                  <td className="py-2.5 px-3 text-right font-bold text-rose-400">
                    {(b.cancellation_probability * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{b.deposit_type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

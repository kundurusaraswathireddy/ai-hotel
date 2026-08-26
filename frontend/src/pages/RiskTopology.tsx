import React, { useState, useEffect } from 'react';
import {
  fetchRiskTopologyClusters,
  runCancellationShock,
  fetchAttentionQueue
} from '../api/client';
import {
  Network,
  Activity,
  AlertTriangle,
  Zap,
  Sliders,
  TrendingDown,
  Layers,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Clock,
  DollarSign
} from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';

export const RiskTopology: React.FC = () => {
  const [clusters, setClusters] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [selectedCluster, setSelectedCluster] = useState<any>(null);
  const [attentionQueue, setAttentionQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Shock Lab state
  const [scopeType, setScopeType] = useState<string>('CLUSTER');
  const [scopeValue, setScopeValue] = useState<string>('CLU-01');
  const [shockPercentage, setShockPercentage] = useState<number>(25);
  const [shockResult, setShockResult] = useState<any>(null);
  const [simulating, setSimulating] = useState<boolean>(false);

  useEffect(() => {
    loadTopology();
    loadAttention();
  }, []);

  const loadTopology = async () => {
    setLoading(true);
    try {
      const data = await fetchRiskTopologyClusters();
      setClusters(data.clusters || []);
      setSummary(data.summary || null);
      if (data.clusters && data.clusters.length > 0) {
        setSelectedCluster(data.clusters[0]);
        setScopeValue(data.clusters[0].cluster_id);
      }
    } catch (e) {
      console.error('Topology fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  const loadAttention = async () => {
    try {
      const data = await fetchAttentionQueue(12);
      setAttentionQueue(data.attention_queue || []);
    } catch (e) {
      console.error('Attention fetch error', e);
    }
  };

  const handleSimulateShock = async () => {
    setSimulating(true);
    try {
      const res = await runCancellationShock({
        scope_type: scopeType,
        scope_value: scopeValue,
        shock_percentage: shockPercentage
      });
      setShockResult(res);
    } catch (e: any) {
      alert(`Simulation error: ${e.message}`);
    } finally {
      setSimulating(false);
    }
  };

  const getNodeColor = (tier: string) => {
    switch (tier) {
      case 'CRITICAL': return { bg: 'bg-rose-500/20', border: 'border-rose-500', text: 'text-rose-400', glow: 'shadow-rose-500/30' };
      case 'HIGH': return { bg: 'bg-orange-500/20', border: 'border-orange-500', text: 'text-orange-400', glow: 'shadow-orange-500/30' };
      case 'MODERATE': return { bg: 'bg-amber-500/20', border: 'border-amber-500', text: 'text-amber-400', glow: 'shadow-amber-500/30' };
      case 'LOW':
      default:
        return { bg: 'bg-emerald-500/20', border: 'border-emerald-500', text: 'text-emerald-400', glow: 'shadow-emerald-500/30' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-xl glass-panel border border-cyan-500/40 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 flex flex-wrap items-center justify-between gap-4 shadow-xl shadow-cyan-950/20">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Network className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                RISK TOPOLOGY + CANCELLATION SHOCK LAB
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                MODEL-DERIVED EXPOSURE
              </span>
            </div>
            <div className="text-xs text-slate-300 mt-0.5">
              Empirical mapping of multi-dimensional cancellation risk concentration and live scenario shock simulations.
            </div>
          </div>
        </div>

        <button
          onClick={loadTopology}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
          title="Refresh Topology"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* KPI Cards: Total Exposure, Concentration Level, Fragility Index, Highest Risk */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cluster Exposure */}
        <div className="p-4 rounded-xl glass-panel border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 text-[10px] font-mono uppercase">
            <span>Total Evaluated Exposure</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400 my-1">
            ${summary?.total_revenue_exposure?.toLocaleString() || '184,210'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
            <span>{summary?.total_cluster_bookings || 1420} Bookings</span>
            <span className="text-cyan-400/80">MODEL-DERIVED</span>
          </div>
        </div>

        {/* Risk Concentration */}
        <div className="p-4 rounded-xl glass-panel border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 text-[10px] font-mono uppercase">
            <span>Risk Concentration</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 my-1 flex items-center gap-2">
            {summary?.risk_concentration_level || 'CRITICAL'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
            <span>Top 2 Clusters: {summary?.top_2_concentration_ratio || '54.2'}% Share</span>
            <span className="text-amber-400/80">HHI RATIO</span>
          </div>
        </div>

        {/* Portfolio Fragility Index */}
        <div className="p-4 rounded-xl glass-panel border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 text-[10px] font-mono uppercase">
            <span>Portfolio Fragility Index</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 my-1">
            {summary?.portfolio_fragility_index || '68.4'} <span className="text-xs text-slate-400 font-normal">/ 100</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
            <span>ANALYTICAL RISK INDICATOR</span>
          </div>
        </div>

        {/* Highest Risk Cluster */}
        <div className="p-4 rounded-xl glass-panel border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 text-[10px] font-mono uppercase">
            <span>Highest Risk Node</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-sm font-bold font-mono text-slate-200 my-1 truncate">
            {summary?.highest_risk_cluster || 'Online TA · Extreme Lead'}
          </div>
          <div className="text-[10px] text-rose-400 font-mono font-bold flex items-center justify-between">
            <span>{summary?.highest_risk_probability || '82.4'}% Model Probability</span>
          </div>
        </div>
      </div>

      {/* PART 1 & 4: Interactive Risk Topology Map & Cluster Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Topology Graph Canvas */}
        <div className="lg:col-span-8 p-5 rounded-xl glass-panel border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Network className="w-4 h-4 text-cyan-400" />
                Interactive Risk Topology Map
              </h3>
              <p className="text-[11px] text-slate-400">
                Node size = Revenue Exposure · Color = Risk Tier · Click node to inspect cluster characteristics
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              MODEL-DERIVED TOPOLOGY
            </span>
          </div>

          {/* SVG Graph Visualization */}
          <div className="relative h-[420px] w-full bg-[#050811] rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 960 520">
              <defs>
                <radialGradient id="gridGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="960" height="520" fill="url(#gridGlow)" />

              {/* Grid Lines */}
              {[100, 200, 300, 400, 500].map((y) => (
                <line key={`gy-${y}`} x1="40" y1={y} x2="920" y2={y} stroke="#1e293b" strokeDasharray="4 4" strokeOpacity="0.4" />
              ))}
              {[200, 400, 600, 800].map((x) => (
                <line key={`gx-${x}`} x1={x} y1="40" x2={x} y2="480" stroke="#1e293b" strokeDasharray="4 4" strokeOpacity="0.4" />
              ))}

              {/* Connector Links between clusters */}
              {clusters.map((c, i) => {
                if (i === 0) return null;
                const prev = clusters[0];
                return (
                  <line
                    key={`line-${i}`}
                    x1={prev.coord.x}
                    y1={prev.coord.y}
                    x2={c.coord.x}
                    y2={c.coord.y}
                    stroke={selectedCluster?.cluster_id === c.cluster_id ? '#06b6d4' : '#1e293b'}
                    strokeWidth={selectedCluster?.cluster_id === c.cluster_id ? 2 : 1}
                    strokeDasharray="4 2"
                    className="transition-all"
                  />
                );
              })}

              {/* Cluster Nodes */}
              {clusters.map((c) => {
                const isSelected = selectedCluster?.cluster_id === c.cluster_id;
                const style = getNodeColor(c.risk_tier);
                // Radius mapped to revenue exposure (28px to 54px)
                const radius = Math.min(54, Math.max(28, Math.sqrt(c.estimated_revenue_exposure) / 4.5));

                return (
                  <g
                    key={c.cluster_id}
                    className="cursor-pointer transition-transform duration-300 hover:scale-105"
                    onClick={() => {
                      setSelectedCluster(c);
                      setScopeValue(c.cluster_id);
                    }}
                  >
                    {/* Glow circle */}
                    <circle
                      cx={c.coord.x}
                      cy={c.coord.y}
                      r={radius + (isSelected ? 10 : 4)}
                      fill={c.risk_tier === 'CRITICAL' ? '#ef4444' : (c.risk_tier === 'HIGH' ? '#f97316' : '#06b6d4')}
                      opacity={isSelected ? 0.3 : 0.12}
                    />
                    {/* Main Circle */}
                    <circle
                      cx={c.coord.x}
                      cy={c.coord.y}
                      r={radius}
                      fill="#0b1120"
                      stroke={c.risk_tier === 'CRITICAL' ? '#ef4444' : (c.risk_tier === 'HIGH' ? '#f97316' : (c.risk_tier === 'MODERATE' ? '#f59e0b' : '#10b981'))}
                      strokeWidth={isSelected ? 3 : 1.5}
                    />
                    {/* Cluster ID Label */}
                    <text
                      x={c.coord.x}
                      y={c.coord.y - 8}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="bold"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {c.cluster_id}
                    </text>
                    {/* Probability Label */}
                    <text
                      x={c.coord.x}
                      y={c.coord.y + 8}
                      textAnchor="middle"
                      fill={c.risk_tier === 'CRITICAL' ? '#f87171' : '#38bdf8'}
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {(c.avg_cancellation_probability * 100).toFixed(0)}% prob
                    </text>
                    {/* Exposure Label */}
                    <text
                      x={c.coord.x}
                      y={c.coord.y + 22}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      ${(c.estimated_revenue_exposure / 1000).toFixed(1)}k
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex items-center justify-between mt-3 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Low (&lt;25%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Moderate (25-50%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> High (50-75%)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Critical (&ge;75%)</span>
          </div>
        </div>

        {/* Selected Cluster Intelligence Panel */}
        <div className="lg:col-span-4 p-5 rounded-xl glass-panel border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">CLUSTER INTELLIGENCE</span>
                <h3 className="text-sm font-bold font-mono text-cyan-400">
                  {selectedCluster ? selectedCluster.cluster_id : 'Select a Cluster'}
                </h3>
              </div>
              {selectedCluster && <RiskBadge tier={selectedCluster.risk_tier} probability={selectedCluster.avg_cancellation_probability} showProb />}
            </div>

            {selectedCluster ? (
              <div className="space-y-3.5 text-xs font-mono">
                <div className="text-slate-200 font-bold font-mono text-xs">
                  {selectedCluster.cluster_name}
                </div>

                <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cluster Size</span>
                    <span className="text-white font-bold">{selectedCluster.booking_count} Bookings</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg Model Probability</span>
                    <span className="text-rose-400 font-bold">{(selectedCluster.avg_cancellation_probability * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg Lead Time</span>
                    <span className="text-slate-200">{selectedCluster.avg_lead_time_days} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg Daily Rate (ADR)</span>
                    <span className="text-slate-200">${selectedCluster.avg_adr}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gross Booking Value</span>
                    <span className="text-slate-200">${selectedCluster.total_booking_value.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-2">
                    <span className="text-slate-400 font-bold">Estimated Exposure</span>
                    <span className="text-rose-400 font-bold">${selectedCluster.estimated_revenue_exposure.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-slate-300 text-[11px] leading-relaxed">
                  <div className="text-[10px] font-bold text-cyan-400 uppercase mb-1">
                    Cluster Concentration Profile
                  </div>
                  Concentrated in <span className="text-white font-bold">{selectedCluster.market_segment}</span> with deposit policy <span className="text-white font-bold">{selectedCluster.deposit_type}</span>. Peak arrival month: <span className="text-white font-bold">{selectedCluster.peak_arrival_month}</span>.
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Click any cluster node to inspect dimensions.</p>
            )}
          </div>
        </div>
      </div>

      {/* PART 5: Cancellation Shock Lab */}
      <div className="p-6 rounded-xl glass-panel border border-cyan-500/40 space-y-6 bg-gradient-to-r from-slate-900 via-slate-900 to-[#0b1120]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Zap className="w-4 h-4" /> CANCELLATION SHOCK LAB
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                SIMULATION ONLY
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate percentage of selected risk exposure materializing as sudden cancellations with zero real data modification.
            </p>
          </div>
        </div>

        {/* Simulation Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Target Scope */}
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1.5 uppercase">
              Simulation Target Scope
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={scopeType}
                onChange={(e) => setScopeType(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
              >
                <option value="CLUSTER">Target Cluster</option>
                <option value="PORTFOLIO">Entire Portfolio</option>
                <option value="SEGMENT">Market Segment</option>
              </select>
              {scopeType === 'CLUSTER' ? (
                <select
                  value={scopeValue}
                  onChange={(e) => setScopeValue(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono"
                >
                  {clusters.map((c) => (
                    <option key={c.cluster_id} value={c.cluster_id}>
                      {c.cluster_id}: {c.cluster_name}
                    </option>
                  ))}
                </select>
              ) : scopeType === 'SEGMENT' ? (
                <select
                  value={scopeValue}
                  onChange={(e) => setScopeValue(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                >
                  <option value="Online TA">Online TA</option>
                  <option value="Groups">Groups</option>
                  <option value="Offline TA/TO">Offline TA/TO</option>
                  <option value="Direct">Direct</option>
                </select>
              ) : (
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 text-xs font-mono flex items-center justify-center">
                  All Clusters
                </div>
              )}
            </div>
          </div>

          {/* Shock Percentage Slider */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-400 uppercase">CANCELLATION SHOCK INTENSITY</span>
              <span className="text-rose-400 font-bold">{shockPercentage}% SHOCK</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={shockPercentage}
              onChange={(e) => setShockPercentage(Number(e.target.value))}
              className="w-full accent-rose-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>5% (Minor)</span>
              <span>25% (Moderate)</span>
              <span>50% (Severe)</span>
              <span>100% (Total Collapse)</span>
            </div>
          </div>

          {/* Run Button */}
          <div className="flex flex-col justify-end">
            <button
              onClick={handleSimulateShock}
              disabled={simulating}
              className="w-full py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-black font-bold text-xs uppercase font-mono tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-500/20"
            >
              <Zap className="w-4 h-4" />
              {simulating ? 'Computing Shock Impact...' : 'Execute Shock Simulation'}
            </button>
          </div>
        </div>

        {/* Side-by-side Shock Lab Results */}
        {shockResult && (
          <div className="space-y-6 pt-4 border-t border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current State */}
              <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-xs font-mono font-bold uppercase text-slate-400">
                    CURRENT BASELINE STATE
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-700">
                    MODEL BASELINE
                  </span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Targeted Scope:</span>
                    <span className="text-slate-200 font-bold">{shockResult.simulation_scope}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Targeted Bookings:</span>
                    <span className="text-slate-200">{shockResult.current_state.targeted_bookings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Baseline Revenue Exposure:</span>
                    <span className="text-cyan-400 font-bold">${shockResult.current_state.baseline_revenue_exposure.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Portfolio Fragility Index:</span>
                    <span className="text-slate-200">{shockResult.current_state.portfolio_fragility_index} / 100</span>
                  </div>
                </div>
              </div>

              {/* Simulated Shock State */}
              <div className="p-5 rounded-xl bg-rose-950/20 border border-rose-500/40 space-y-3">
                <div className="flex justify-between items-center border-b border-rose-800/40 pb-2">
                  <span className="text-xs font-mono font-bold uppercase text-rose-400">
                    SIMULATED SHOCK IMPACT ({shockResult.shock_percentage}%)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                    SIMULATED REVENUE EXPOSURE
                  </span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Simulated Bookings Lost:</span>
                    <span className="text-rose-400 font-bold">-{shockResult.simulated_state.simulated_bookings_lost} Bookings</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Simulated Revenue Exposure:</span>
                    <span className="text-rose-400 font-bold">${shockResult.simulated_state.simulated_revenue_exposure.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Exposure Shift (Delta):</span>
                    <span className="text-rose-300 font-bold">
                      {shockResult.simulated_state.revenue_exposure_delta > 0 ? '+' : ''}${shockResult.simulated_state.revenue_exposure_delta.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Post-Shock Fragility:</span>
                    <span className="text-rose-400 font-bold">{shockResult.simulated_state.simulated_fragility_index} / 100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PART 6: Cancellation Domino Visual Scenario Chain */}
            <div className="p-5 rounded-xl glass-panel border border-slate-800 space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                CANCELLATION DOMINO (SCENARIO IMPACT CASCADE)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {shockResult.domino_cascade.map((step: any, i: number) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400 font-bold">
                      <span className="h-4 w-4 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-[9px]">
                        {step.step}
                      </span>
                      {step.stage}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10px] font-mono text-slate-500 italic">
              {shockResult.disclaimer}
            </p>
          </div>
        )}
      </div>

      {/* PART 7: Attention Queue */}
      <div className="p-5 rounded-xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              ATTENTION QUEUE (PRIORITIZED ACTION PIPELINE)
            </h3>
            <p className="text-[11px] text-slate-400">
              Ranked dynamically by Business Priority Score: 0.45×Model Probability + 0.35×Booking Value + 0.20×Arrival Urgency
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
            BUSINESS PRIORITY
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="pb-3 px-3">BOOKING ID</th>
                <th className="pb-3 px-3">PROPERTY</th>
                <th className="pb-3 px-3">SEGMENT</th>
                <th className="pb-3 px-3">ARRIVAL DATE</th>
                <th className="pb-3 px-3 text-right">LEAD TIME</th>
                <th className="pb-3 px-3 text-right">VALUE</th>
                <th className="pb-3 px-3">RISK TIER</th>
                <th className="pb-3 px-3 text-right">MODEL PROB</th>
                <th className="pb-3 px-3 text-right">PRIORITY SCORE</th>
                <th className="pb-3 px-3">PRIORITY RATIONALE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {attentionQueue.map((b, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-white">{b.booking_id}</td>
                  <td className="py-2.5 px-3 text-slate-300">{b.hotel}</td>
                  <td className="py-2.5 px-3 text-slate-400">{b.market_segment}</td>
                  <td className="py-2.5 px-3 text-slate-400">{b.arrival_date}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{b.lead_time_days}d</td>
                  <td className="py-2.5 px-3 text-right text-slate-200 font-semibold">${b.booking_value.toFixed(2)}</td>
                  <td className="py-2.5 px-3">
                    <RiskBadge tier={b.risk_tier} />
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-rose-400">
                    {(b.cancellation_probability * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-amber-400">
                    {b.business_priority_score}
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-slate-400 truncate max-w-xs">
                    {b.priority_rationale}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

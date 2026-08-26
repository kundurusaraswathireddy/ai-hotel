import React from 'react';
import { ShieldCheck, Database, Zap, RefreshCw } from 'lucide-react';
import { OverviewStats } from '../types';

interface HeaderProps {
  stats: OverviewStats | null;
  activeTab: string;
  onRefresh: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ stats, activeTab, onRefresh, isLoading }) => {
  const titles: Record<string, { title: string; subtitle: string }> = {
    'control-room': { title: 'HOTELGUARD CONTROL ROOM', subtitle: 'Autonomous revenue protection & booking cancellation radar' },
    'prediction-center': { title: 'BOOKING PREDICTION CENTER', subtitle: 'Real-time cancellation probability, risk tiering & local SHAP drivers' },
    'cancellation-dna': { title: 'CANCELLATION DNA & RISK SIGNATURE DISCOVERY', subtitle: 'Empirical risk patterns, 6-axis diagnostic fingerprints & portfolio signatures' },
    'model-blind-zone': { title: 'MODEL BLIND ZONE & INPUT FAMILIARITY MONITOR', subtitle: 'Identify reservations with unusual features relative to model reference distributions' },
    'risk-topology': { title: 'RISK TOPOLOGY & CANCELLATION SHOCK LAB', subtitle: 'Multi-dimensional risk concentration mapping, fragility index & shock scenarios' },
    'cancellation-radar': { title: 'CANCELLATION RISK RADAR', subtitle: '2D exposure matrix: Lead Time vs Cancellation Probability vs Booking Value' },
    'smart-waitlist': { title: 'SMART WAITING & OVERBOOKING QUEUE', subtitle: 'Proactive cancellation pairing, priority ranking & auto-reallocation engine' },
    'revenue-intelligence': { title: 'REVENUE EXPOSURE MAP', subtitle: 'Quantified revenue loss exposure across channels, segments & deposit types' },
    'what-if': { title: 'WHAT-IF REVENUE SIMULATOR', subtitle: 'Evaluate live policy adjustments and parameter variations against champion model' },
    'model-arena': { title: 'MODEL ARENA & LEADERBOARD', subtitle: 'Empirical comparison of 6 trained classification architectures' },
    'model-registry': { title: 'MODEL REGISTRY & VERSIONS', subtitle: 'Registered model pipelines, lifecycle states, and serial artifacts' },
    'model-health': { title: 'MODEL MONITORING & DRIFT', subtitle: 'Live telemetry, inference throughput, error metrics and calibration' },
    'my-hotel-data': { title: 'HOTEL DATA INGESTION', subtitle: 'Upload custom CSV/Excel files with smart schema mapping & batch scoring' },
    'data-explorer': { title: 'HISTORICAL DATA EXPLORER', subtitle: 'Searchable database of real verified booking demand records' },
    'reports': { title: 'AUDIT & EXECUTIVE REPORTS', subtitle: 'Export risk summaries, model validation reports, and executive briefings' },
  };

  const current = titles[activeTab] || { title: 'HOTELGUARD TERMINAL', subtitle: 'Autonomous Hotel Cancellation Intelligence' };

  return (
    <header className="h-16 border-b border-slate-800/90 bg-[#0a0f1d]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-sm font-bold font-mono tracking-wider text-white flex items-center gap-2">
          {current.title}
        </h1>
        <p className="text-[11px] text-slate-400 font-sans">{current.subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Model status indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/60 text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">CHAMPION:</span>
          <span className="text-cyan-400 font-semibold">{stats?.champion_model || 'LightGBM'} v{stats?.model_version || '1.0.0'}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
            τ={stats?.optimal_threshold || 0.15}
          </span>
        </div>

        {/* Dataset indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/60 text-xs font-mono">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">DATASET:</span>
          <span className="text-slate-200 font-semibold">{stats?.total_bookings ? stats.total_bookings.toLocaleString() : '119,390'} ROWS</span>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>
    </header>
  );
};

import React from 'react';
import { OverviewStats } from '../types';
import {
  Users,
  AlertTriangle,
  TrendingDown,
  Clock,
  DollarSign,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ControlRoomProps {
  stats: OverviewStats | null;
  cancellationData: any;
  leadTimeData: any;
  setActiveTab: (tab: string) => void;
}

export const ControlRoom: React.FC<ControlRoomProps> = ({
  stats,
  cancellationData,
  leadTimeData,
  setActiveTab,
}) => {
  const kpis = [
    {
      title: 'TOTAL BOOKINGS',
      value: stats ? stats.total_bookings.toLocaleString() : '119,390',
      subtext: 'Verified historical dataset',
      icon: Users,
      color: 'text-cyan-400',
      border: 'border-cyan-500/20',
      bg: 'bg-cyan-950/20'
    },
    {
      title: 'CANCELLATION RATE',
      value: stats ? `${(stats.cancellation_rate * 100).toFixed(1)}%` : '37.0%',
      subtext: `${stats ? stats.canceled_bookings.toLocaleString() : '44,224'} total cancellations`,
      icon: AlertTriangle,
      color: 'text-rose-400',
      border: 'border-rose-500/20',
      bg: 'bg-rose-950/20'
    },
    {
      title: 'AVERAGE LEAD TIME',
      value: stats ? `${stats.average_lead_time_days} days` : '104.0 days',
      subtext: 'High-risk horizon > 120d',
      icon: Clock,
      color: 'text-amber-400',
      border: 'border-amber-500/20',
      bg: 'bg-amber-950/20'
    },
    {
      title: 'AVERAGE DAILY RATE (ADR)',
      value: stats ? `$${stats.average_adr.toFixed(2)}` : '$101.83',
      subtext: 'Average revenue / room night',
      icon: DollarSign,
      color: 'text-emerald-400',
      border: 'border-emerald-500/20',
      bg: 'bg-emerald-950/20'
    },
    {
      title: 'HISTORICAL REVENUE LOSS',
      value: stats ? `$${(stats.historical_canceled_revenue_loss / 1000000).toFixed(2)}M` : '$13.2M',
      subtext: 'From unmitigated cancellations',
      icon: TrendingDown,
      color: 'text-rose-400',
      border: 'border-rose-500/20',
      bg: 'bg-rose-950/20'
    },
    {
      title: 'CHAMPION MODEL',
      value: stats ? `${stats.champion_model}` : 'LightGBM',
      subtext: `Optimal threshold τ = ${stats?.optimal_threshold || 0.15}`,
      icon: ShieldAlert,
      color: 'text-cyan-300',
      border: 'border-cyan-500/30',
      bg: 'bg-cyan-950/30'
    }
  ];

  const monthlyChart = cancellationData?.by_month || [];
  const leadCohorts = leadTimeData?.lead_time_cohorts || [];

  const hotelPie = cancellationData?.by_hotel?.map((h: any) => ({
    name: h.hotel,
    value: h.total,
    rate: (h.rate * 100).toFixed(1)
  })) || [];

  const PIE_COLORS = ['#06b6d4', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      <div className="p-4 rounded-xl glass-panel border border-cyan-500/30 flex items-center justify-between bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              Autonomous Intelligence Engine Active
            </div>
            <div className="text-xs text-slate-300">
              All metrics and predictions are calibrated against 119,390 real hotel reservations with zero data leakage.
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('prediction-center')}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            Predict Booking Risk <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setActiveTab('model-arena')}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
          >
            Model Arena
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl glass-panel border ${kpi.border} ${kpi.bg} flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono tracking-wider font-bold text-slate-400 uppercase">
                  {kpi.title}
                </span>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <div className="my-2">
                <div className={`text-xl font-bold font-mono ${kpi.color}`}>{kpi.value}</div>
                <div className="text-[11px] text-slate-400 truncate">{kpi.subtext}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Cancellation Trend */}
        <div className="lg:col-span-2 p-5 rounded-xl glass-panel border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                Monthly Cancellation Rate Trend
              </h3>
              <p className="text-[11px] text-slate-400">Historical monthly cancellation percentage</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
              Seasonality Index
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyChart}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="arrival_date_month" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
                  formatter={(value: any) => [`${(Number(value) * 100).toFixed(1)}%`, 'Cancellation Rate']}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRate)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hotel Composition Breakdown */}
        <div className="p-5 rounded-xl glass-panel border border-slate-800 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Hotel Type Volume & Risk
            </h3>
            <p className="text-[11px] text-slate-400">City Hotel vs Resort Hotel distribution</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={hotelPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {hotelPie.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  formatter={(val: any, name: any, item: any) => [
                    `${val.toLocaleString()} bookings (${item.payload.rate}% canc)`,
                    name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-2 pt-2 border-t border-slate-800 text-xs font-mono">
            {hotelPie.map((h: any, i: number) => (
              <div key={i} className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }}></span>
                  {h.name}
                </span>
                <span className="text-slate-400">
                  {h.value.toLocaleString()} <span className="text-rose-400 font-bold">({h.rate}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lead Time Cohorts Bar Chart */}
      <div className="p-5 rounded-xl glass-panel border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Lead Time Risk Cohorts (Days in Advance)
            </h3>
            <p className="text-[11px] text-slate-400">
              Higher booking lead times correlate strongly with increased cancellation rates
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400">
            Cohort Analysis
          </span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={leadCohorts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="lead_group" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                formatter={(val: any) => [`${(Number(val) * 100).toFixed(1)}%`, 'Cancellation Rate']}
              />
              <Bar dataKey="cancellation_rate" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

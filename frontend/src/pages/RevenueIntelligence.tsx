import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { DollarSign, Layers, Compass, CreditCard, ShieldAlert } from 'lucide-react';

interface RevenueIntelligenceProps {
  cancellationData: any;
  channelData: any;
}

export const RevenueIntelligence: React.FC<RevenueIntelligenceProps> = ({
  cancellationData,
  channelData,
}) => {
  const segments = cancellationData?.by_market_segment || [];
  const deposits = cancellationData?.by_deposit_type || [];
  const channels = channelData?.distribution_channels || [];

  return (
    <div className="space-y-6">
      {/* Revenue Intelligence Header */}
      <div className="p-4 rounded-xl glass-panel border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Revenue Exposure & Yield Intelligence
            </h2>
            <p className="text-[11px] text-slate-400">
              Quantifying cancellation attrition by channel, deposit policy, and guest acquisition stream
            </p>
          </div>
        </div>
      </div>

      {/* Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Channels */}
        <div className="p-5 rounded-xl glass-panel border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase text-slate-200 flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                Distribution Channel Performance
              </h3>
              <p className="text-[11px] text-slate-400">Average ADR vs Cancellation Rate</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channels}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="distribution_channel" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  stroke="#06b6d4"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `$${v}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#f59e0b"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar yAxisId="left" dataKey="avg_adr" fill="#06b6d4" name="Avg ADR ($)" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="cancellation_rate" fill="#f59e0b" name="Cancellation Rate" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Market Segments */}
        <div className="p-5 rounded-xl glass-panel border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Market Segment Cancellation Rate
              </h3>
              <p className="text-[11px] text-slate-400">Historical cancellation rate by customer segment</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={segments} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  type="number"
                  domain={[0, 1]}
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                />
                <YAxis dataKey="market_segment" type="category" stroke="#64748b" tick={{ fontSize: 11 }} width={90} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  formatter={(val: any) => [`${(Number(val) * 100).toFixed(1)}%`, 'Cancellation Rate']}
                />
                <Bar dataKey="rate" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Deposit Intelligence & Caution Callout */}
      <div className="p-5 rounded-xl glass-panel border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase text-slate-200 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" />
              Deposit Type Intelligence
            </h3>
            <p className="text-[11px] text-slate-400">
              Historical Association across deposit structures (Caution: Association != Direct Causation)
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
            Historical Association
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {deposits.map((d: any, idx: number) => (
            <div key={idx} className="p-4 rounded-lg bg-slate-900/80 border border-slate-800">
              <div className="text-xs font-bold font-mono text-slate-300">{d.deposit_type}</div>
              <div className="my-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-cyan-400">
                  {(d.rate * 100).toFixed(1)}%
                </span>
                <span className="text-xs text-slate-500 font-mono">cancellation rate</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Total Volume: {d.total.toLocaleString()} bookings ({d.canceled.toLocaleString()} canceled)
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

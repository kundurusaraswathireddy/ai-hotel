import React, { useState, useEffect } from 'react';
import { fetchSampleBookings } from '../api/client';
import { Database, Search, Download } from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';

export const DataExplorer: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchSampleBookings(40);
      setBookings(data.bookings || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = bookings.filter((b) => {
    return (
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.hotel.toLowerCase().includes(search.toLowerCase()) ||
      b.market_segment.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl glass-panel border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Verified Historical Data Explorer
            </h2>
            <p className="text-[11px] text-slate-400">
              Real booking records from 119,390 dataset with evaluated model risk outputs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none w-48 font-mono"
            />
          </div>
        </div>
      </div>

      <div className="p-5 rounded-xl glass-panel border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="pb-3 px-3">ID</th>
                <th className="pb-3 px-3">HOTEL</th>
                <th className="pb-3 px-3 text-right">LEAD TIME</th>
                <th className="pb-3 px-3 text-right">NIGHTS</th>
                <th className="pb-3 px-3 text-right">ADR</th>
                <th className="pb-3 px-3 text-right">VALUE</th>
                <th className="pb-3 px-3">RISK TIER</th>
                <th className="pb-3 px-3 text-right">MODEL PROB</th>
                <th className="pb-3 px-3 text-right">REVENUE AT RISK</th>
                <th className="pb-3 px-3">ACTUAL OUTCOME</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((b, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-white">{b.id}</td>
                  <td className="py-2.5 px-3 text-slate-300">{b.hotel}</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">{b.lead_time}d</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">{b.stays_nights}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300">${b.adr.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right text-slate-200 font-semibold">${b.booking_value.toFixed(2)}</td>
                  <td className="py-2.5 px-3">
                    <RiskBadge tier={b.risk_tier} />
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-cyan-400">
                    {(b.cancellation_probability * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-rose-400">
                    ${b.estimated_revenue_at_risk.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 font-bold">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded ${
                        b.actual_outcome === 'Canceled'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {b.actual_outcome}
                    </span>
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

import React, { useState, useEffect } from 'react';
import {
  fetchWaitlistOverview,
  fetchWaitlistEntries,
  runSmartMatch,
  reallocateWaitlistBooking,
  addWaitlistEntry
} from '../api/client';
import {
  Hourglass,
  Users,
  DollarSign,
  ShieldCheck,
  Zap,
  ArrowRight,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Crown,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';

export const SmartWaitlist: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New waitlist form state
  const [newGuest, setNewGuest] = useState({
    guest_name: '',
    hotel: 'City Hotel',
    room_type: 'A',
    check_in: '2017-08-15',
    nights: 2,
    willingness_adr: 150.0,
    loyalty_tier: 'Gold',
    party_size: 2,
    days_on_waitlist: 1
  });

  useEffect(() => {
    loadWaitlistData();
  }, []);

  const loadWaitlistData = async () => {
    setLoading(true);
    try {
      const [ov, ent] = await Promise.all([
        fetchWaitlistOverview(),
        fetchWaitlistEntries()
      ]);
      setOverview(ov);
      setEntries(ent.entries || []);
    } catch (e) {
      console.error('Waitlist data error', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunSmartMatch = async () => {
    setMatching(true);
    setSuccessMsg(null);
    try {
      const res = await runSmartMatch(0.60);
      setMatches(res.matches || []);
    } catch (e: any) {
      alert(`Smart Match error: ${e.message}`);
    } finally {
      setMatching(false);
    }
  };

  const handleReallocate = async (match: any) => {
    try {
      const res = await reallocateWaitlistBooking({
        match_id: match.match_id,
        waitlist_id: match.waitlisted_guest.id,
        booking_id: match.at_risk_booking.booking_id
      });
      setSuccessMsg(res.message);
      loadWaitlistData();
      // Remove match from list
      setMatches((prev) => prev.filter((m) => m.match_id !== match.match_id));
    } catch (e: any) {
      alert(`Reallocation error: ${e.message}`);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuest.guest_name.trim()) return;
    try {
      await addWaitlistEntry(newGuest);
      setShowAddModal(false);
      setNewGuest({
        guest_name: '',
        hotel: 'City Hotel',
        room_type: 'A',
        check_in: '2017-08-15',
        nights: 2,
        willingness_adr: 150.0,
        loyalty_tier: 'Gold',
        party_size: 2,
        days_on_waitlist: 1
      });
      loadWaitlistData();
    } catch (e: any) {
      alert(`Failed adding to waitlist: ${e.message}`);
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'Platinum':
        return 'bg-purple-950/80 text-purple-300 border-purple-700';
      case 'Gold':
        return 'bg-amber-950/80 text-amber-300 border-amber-700';
      case 'Silver':
        return 'bg-slate-800 text-slate-300 border-slate-600';
      default:
        return 'bg-slate-900 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-xl glass-panel border border-cyan-500/40 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Hourglass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              Autonomous Smart Waiting & Overbooking Queue
            </div>
            <div className="text-xs text-slate-300">
              Proactively pair predicted cancellations with high-yield waitlisted guests to secure 100% occupancy.
            </div>
          </div>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs transition-colors flex items-center gap-1.5 border border-slate-700"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" /> Add to Waitlist
          </button>
          <button
            onClick={handleRunSmartMatch}
            disabled={matching}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            {matching ? 'Matching Queue...' : 'Run Smart Auto-Match'}
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl glass-panel border border-slate-800 bg-slate-900/60">
          <div className="flex justify-between items-center text-slate-400 text-[10px] font-mono uppercase">
            <span>Active Queue Depth</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400 my-1">
            {overview?.active_queue_depth || 6} Guests
          </div>
          <div className="text-[11px] text-slate-500 font-mono">Ranked by Priority Algorithm</div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800 bg-slate-900/60">
          <div className="flex justify-between items-center text-slate-400 text-[10px] font-mono uppercase">
            <span>Recoverable Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 my-1">
            ${overview?.potential_revenue_recovery?.toLocaleString() || '2,750'}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">From active queue pipeline</div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800 bg-slate-900/60">
          <div className="flex justify-between items-center text-slate-400 text-[10px] font-mono uppercase">
            <span>Avg Priority Score</span>
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 my-1">
            {overview?.average_priority_index || 76.4} / 100
          </div>
          <div className="text-[11px] text-slate-500 font-mono">Weighted yield & loyalty index</div>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-slate-800 bg-slate-900/60">
          <div className="flex justify-between items-center text-slate-400 text-[10px] font-mono uppercase">
            <span>Overbooking Buffer</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-400 my-1">
            +{overview?.overbooking_safety_buffer_pct || 8.5}%
          </div>
          <div className="text-[11px] text-slate-500 font-mono">Dynamic safe overbooking limit</div>
        </div>
      </div>

      {/* Auto-Match Intelligence Panel */}
      {matches.length > 0 && (
        <div className="p-5 rounded-xl glass-panel border border-cyan-500/40 space-y-4 bg-gradient-to-b from-cyan-950/20 to-slate-900">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Smart Cancellation Reallocation Engine
              </h3>
              <p className="text-[11px] text-slate-400">
                Identified {matches.length} high-risk cancellations that can be seamlessly reallocated to waitlist guests
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
              Occupancy Protection Active
            </span>
          </div>

          <div className="space-y-3">
            {matches.map((m, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                {/* At-risk Booking */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">AT-RISK BOOKING:</span>
                    <span className="font-mono font-bold text-white text-xs">{m.at_risk_booking.booking_id}</span>
                    <RiskBadge tier={m.at_risk_booking.risk_tier} probability={m.at_risk_booking.cancellation_probability} showProb />
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {m.at_risk_booking.hotel} · Room {m.at_risk_booking.room_type} · Lead Time: {m.at_risk_booking.lead_time}d · Revenue Exposure: ${m.at_risk_booking.revenue_at_risk}
                  </div>
                </div>

                <ArrowRight className="w-5 h-5 text-cyan-400 shrink-0 hidden md:block" />

                {/* Waitlisted Guest Match */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">RECOMMENDED WAITLIST MATCH:</span>
                    <span className="font-bold text-cyan-400 text-xs">{m.waitlisted_guest.guest_name}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${getTierBadge(m.waitlisted_guest.loyalty_tier)}`}>
                      {m.waitlisted_guest.loyalty_tier}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Priority Score: <span className="text-amber-400 font-bold">{m.waitlisted_guest.priority_score}</span> · Willingness ADR: ${m.waitlisted_guest.willingness_adr} · Recovery: ${m.waitlisted_guest.recovery_value}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleReallocate(m)}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs transition-all shrink-0 flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Reallocate & Protect Occupancy
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Priority Waitlist Table */}
      <div className="p-5 rounded-xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Live Smart Waitlist Queue
            </h3>
            <p className="text-[11px] text-slate-400">
              Ranked dynamically by Guest Willingness ADR, Loyalty Tier, Stay Duration, and Queue Wait Time
            </p>
          </div>
          <button
            onClick={loadWaitlistData}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="Refresh Waitlist"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="pb-3 px-3">QUEUE ID</th>
                <th className="pb-3 px-3">GUEST NAME</th>
                <th className="pb-3 px-3">LOYALTY</th>
                <th className="pb-3 px-3">PROPERTY</th>
                <th className="pb-3 px-3">ROOM</th>
                <th className="pb-3 px-3">CHECK-IN</th>
                <th className="pb-3 px-3 text-right">NIGHTS</th>
                <th className="pb-3 px-3 text-right">WILLINGNESS ADR</th>
                <th className="pb-3 px-3 text-right">REVENUE POTENTIAL</th>
                <th className="pb-3 px-3 text-right">PRIORITY SCORE</th>
                <th className="pb-3 px-3">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {entries.map((e, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-bold text-white">{e.id}</td>
                  <td className="py-3 px-3 font-medium text-slate-200">{e.guest_name}</td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${getTierBadge(e.loyalty_tier)}`}>
                      {e.loyalty_tier}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{e.hotel}</td>
                  <td className="py-3 px-3 text-slate-300">Room {e.room_type}</td>
                  <td className="py-3 px-3 text-slate-400">{e.check_in}</td>
                  <td className="py-3 px-3 text-right text-slate-300">{e.nights}n</td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-400">${e.willingness_adr}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-200">${e.estimated_value}</td>
                  <td className="py-3 px-3 text-right font-bold text-amber-400">{e.priority_score}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        e.status === 'CONFIRMED'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : 'bg-cyan-950 text-cyan-400 border-cyan-800'
                      }`}
                    >
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add to Waitlist Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1120] border border-cyan-500/40 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl shadow-cyan-950/40 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Add Guest to Smart Waitlist
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">GUEST NAME</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rachel Adams"
                  value={newGuest.guest_name}
                  onChange={(e) => setNewGuest({ ...newGuest, guest_name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 text-[11px]">HOTEL PROPERTY</label>
                  <select
                    value={newGuest.hotel}
                    onChange={(e) => setNewGuest({ ...newGuest, hotel: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="City Hotel">City Hotel</option>
                    <option value="Resort Hotel">Resort Hotel</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 text-[11px]">ROOM TYPE</label>
                  <select
                    value={newGuest.room_type}
                    onChange={(e) => setNewGuest({ ...newGuest, room_type: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="A">Room A</option>
                    <option value="C">Room C</option>
                    <option value="D">Room D</option>
                    <option value="E">Room E</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 text-[11px]">WILLINGNESS ADR ($)</label>
                  <input
                    type="number"
                    min="50"
                    value={newGuest.willingness_adr}
                    onChange={(e) => setNewGuest({ ...newGuest, willingness_adr: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 text-[11px]">LOYALTY TIER</label>
                  <select
                    value={newGuest.loyalty_tier}
                    onChange={(e) => setNewGuest({ ...newGuest, loyalty_tier: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="Platinum">Platinum</option>
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 text-[11px]">STAY NIGHTS</label>
                  <input
                    type="number"
                    min="1"
                    value={newGuest.nights}
                    onChange={(e) => setNewGuest({ ...newGuest, nights: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 text-[11px]">CHECK-IN DATE</label>
                  <input
                    type="date"
                    value={newGuest.check_in}
                    onChange={(e) => setNewGuest({ ...newGuest, check_in: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono tracking-wider transition-all mt-2 cursor-pointer"
              >
                Add Guest to Queue
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

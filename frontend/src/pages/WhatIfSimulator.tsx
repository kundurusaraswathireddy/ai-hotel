import React, { useState } from 'react';
import { simulateWhatIf } from '../api/client';
import { SlidersHorizontal, ArrowRight, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';

export const WhatIfSimulator: React.FC = () => {
  const baseBooking = {
    hotel: 'City Hotel',
    lead_time: 120,
    arrival_date_year: 2017,
    arrival_date_month: 'August',
    arrival_date_week_number: 33,
    arrival_date_day_of_month: 15,
    stays_in_weekend_nights: 2,
    stays_in_week_nights: 3,
    adults: 2,
    children: 0,
    babies: 0,
    meal: 'BB',
    country: 'PRT',
    market_segment: 'Online TA',
    distribution_channel: 'TA/TO',
    is_repeated_guest: 0,
    previous_cancellations: 0,
    previous_bookings_not_canceled: 0,
    reserved_room_type: 'A',
    assigned_room_type: 'A',
    booking_changes: 0,
    deposit_type: 'No Deposit',
    days_in_waiting_list: 0,
    customer_type: 'Transient',
    adr: 140.0,
    required_car_parking_spaces: 0,
    total_of_special_requests: 0,
  };

  const [leadTime, setLeadTime] = useState<number>(120);
  const [adr, setAdr] = useState<number>(140);
  const [specialRequests, setSpecialRequests] = useState<number>(0);
  const [depositType, setDepositType] = useState<string>('No Deposit');
  const [marketSegment, setMarketSegment] = useState<string>('Online TA');

  const [simResult, setSimResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await simulateWhatIf({
        base_booking: baseBooking,
        modified_features: {
          lead_time: leadTime,
          adr: adr,
          total_of_special_requests: specialRequests,
          deposit_type: depositType,
          market_segment: marketSegment,
        },
      });
      setSimResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl glass-panel border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              What-If Revenue & Risk Simulator
            </h2>
            <p className="text-[11px] text-slate-400">
              Test policy variations and evaluate real-time probability impact on the Champion LightGBM pipeline
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="lg:col-span-6 p-6 rounded-xl glass-panel border border-slate-800 space-y-5">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
            Simulated Scenario Parameters
          </h3>

          {/* Lead time slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">LEAD TIME (DAYS IN ADVANCE)</span>
              <span className="text-cyan-400 font-bold">{leadTime} days</span>
            </div>
            <input
              type="range"
              min="0"
              max="365"
              value={leadTime}
              onChange={(e) => setLeadTime(Number(e.target.value))}
              className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0 (Last-minute)</span>
              <span>120 (Standard)</span>
              <span>365 (Long horizon)</span>
            </div>
          </div>

          {/* ADR slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">AVERAGE DAILY RATE ($)</span>
              <span className="text-emerald-400 font-bold">${adr}</span>
            </div>
            <input
              type="range"
              min="40"
              max="400"
              value={adr}
              onChange={(e) => setAdr(Number(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Special requests slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">SPECIAL REQUESTS (ENGAGEMENT PROXY)</span>
              <span className="text-amber-400 font-bold">{specialRequests} requests</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(Number(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Deposit type & segment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">DEPOSIT POLICY</label>
              <select
                value={depositType}
                onChange={(e) => setDepositType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
              >
                <option value="No Deposit">No Deposit</option>
                <option value="Non Refund">Non Refund</option>
                <option value="Refundable">Refundable</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">MARKET SEGMENT</label>
              <select
                value={marketSegment}
                onChange={(e) => setMarketSegment(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
              >
                <option value="Online TA">Online TA</option>
                <option value="Direct">Direct</option>
                <option value="Corporate">Corporate</option>
                <option value="Groups">Groups</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSimulate}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase font-mono tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <Sparkles className="w-4 h-4" /> Run Scenario Simulation
          </button>
        </div>

        {/* Results */}
        <div className="lg:col-span-6 space-y-6">
          {simResult ? (
            <div className="p-6 rounded-xl glass-panel border border-cyan-500/40 space-y-5 bg-gradient-to-b from-slate-900 to-[#080d1a]">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                Simulation Delta Comparison
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Baseline */}
                <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Baseline Booking</div>
                  <div className="text-2xl font-bold font-mono text-slate-300 my-1">
                    {(simResult.base_probability * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Exposure: ${simResult.base_revenue_at_risk.toFixed(2)}
                  </div>
                </div>

                {/* Scenario */}
                <div className="p-4 rounded-lg bg-slate-950/80 border border-cyan-500/30 text-center">
                  <div className="text-[10px] font-mono uppercase text-cyan-400">Simulated Scenario</div>
                  <div className="text-2xl font-bold font-mono text-cyan-400 my-1">
                    {(simResult.scenario_probability * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Exposure: ${simResult.scenario_revenue_at_risk.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Delta Banner */}
              <div
                className={`p-4 rounded-lg border text-xs font-mono flex items-center justify-between ${
                  simResult.probability_difference > 0
                    ? 'bg-rose-950/30 border-rose-800/40 text-rose-300'
                    : simResult.probability_difference < 0
                    ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {simResult.probability_difference > 0 ? (
                    <TrendingUp className="w-4 h-4 text-rose-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-emerald-400" />
                  )}
                  <span>
                    PROBABILITY SHIFT:{' '}
                    {simResult.probability_difference > 0 ? '+' : ''}
                    {(simResult.probability_difference * 100).toFixed(1)}%
                  </span>
                </div>
                <span className="font-bold">
                  Revenue Impact: {simResult.revenue_difference > 0 ? '+' : ''}$
                  {simResult.revenue_difference.toFixed(2)}
                </span>
              </div>

              <p className="text-[10px] font-mono text-slate-500 italic">
                {simResult.disclaimer}
              </p>
            </div>
          ) : (
            <div className="p-8 rounded-xl glass-panel border border-slate-800 text-center flex flex-col items-center justify-center min-h-[300px]">
              <SlidersHorizontal className="w-10 h-10 text-slate-600 mb-3" />
              <div className="text-xs font-mono text-slate-400 font-bold uppercase">
                Awaiting Scenario Execution
              </div>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Adjust sliders and click "Run Scenario Simulation" to evaluate model responses.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

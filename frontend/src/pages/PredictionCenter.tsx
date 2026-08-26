import React, { useState } from 'react';
import { BookingInput, PredictionResult } from '../types';
import { predictSingleBooking } from '../api/client';
import { RiskBadge } from '../components/RiskBadge';
import {
  Sparkles,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  Layers,
  HelpCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export const PredictionCenter: React.FC = () => {
  const [formData, setFormData] = useState<BookingInput>({
    hotel: 'City Hotel',
    lead_time: 75,
    arrival_date_year: 2017,
    arrival_date_month: 'August',
    arrival_date_week_number: 33,
    arrival_date_day_of_month: 15,
    stays_in_weekend_nights: 1,
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
    adr: 130.0,
    required_car_parking_spaces: 0,
    total_of_special_requests: 0,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await predictSingleBooking(formData);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Booking Input Form */}
      <div className="lg:col-span-7 p-6 rounded-xl glass-panel border border-slate-800 space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Booking Parameter Ingestion
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Input verified reservation attributes. Evaluated against calibrated champion pipeline.
          </p>
        </div>

        <form onSubmit={handlePredict} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Hotel Type */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">HOTEL TYPE</label>
              <select
                name="hotel"
                value={formData.hotel}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="City Hotel">City Hotel</option>
                <option value="Resort Hotel">Resort Hotel</option>
              </select>
            </div>

            {/* Lead Time */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">LEAD TIME (DAYS)</label>
              <input
                type="number"
                name="lead_time"
                value={formData.lead_time}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* ADR */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">AVERAGE DAILY RATE ($)</label>
              <input
                type="number"
                step="0.1"
                name="adr"
                value={formData.adr}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Stay Nights & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">WEEKEND NIGHTS</label>
              <input
                type="number"
                name="stays_in_weekend_nights"
                value={formData.stays_in_weekend_nights}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">WEEK NIGHTS</label>
              <input
                type="number"
                name="stays_in_week_nights"
                value={formData.stays_in_week_nights}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">MONTH</label>
              <select
                name="arrival_date_month"
                value={formData.arrival_date_month}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
              >
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">SPECIAL REQUESTS</label>
              <input
                type="number"
                name="total_of_special_requests"
                value={formData.total_of_special_requests}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
              />
            </div>
          </div>

          {/* Segment, Channel, Deposit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">MARKET SEGMENT</label>
              <select
                name="market_segment"
                value={formData.market_segment}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
              >
                <option value="Online TA">Online TA</option>
                <option value="Offline TA/TO">Offline TA/TO</option>
                <option value="Direct">Direct</option>
                <option value="Corporate">Corporate</option>
                <option value="Groups">Groups</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">DISTRIBUTION CHANNEL</label>
              <select
                name="distribution_channel"
                value={formData.distribution_channel}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
              >
                <option value="TA/TO">TA/TO</option>
                <option value="Direct">Direct</option>
                <option value="Corporate">Corporate</option>
                <option value="GDS">GDS</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">DEPOSIT TYPE</label>
              <select
                name="deposit_type"
                value={formData.deposit_type}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
              >
                <option value="No Deposit">No Deposit</option>
                <option value="Non Refund">Non Refund</option>
                <option value="Refundable">Refundable</option>
              </select>
            </div>
          </div>

          {/* Guest History */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">PRIOR CANCELLATIONS</label>
              <input
                type="number"
                name="previous_cancellations"
                value={formData.previous_cancellations}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">BOOKINGS NOT CANCELED</label>
              <input
                type="number"
                name="previous_bookings_not_canceled"
                value={formData.previous_bookings_not_canceled}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">REPEATED GUEST?</label>
              <select
                name="is_repeated_guest"
                value={formData.is_repeated_guest}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
              >
                <option value={0}>No (0)</option>
                <option value={1}>Yes (1)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">CUSTOMER TYPE</label>
              <select
                name="customer_type"
                value={formData.customer_type}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
              >
                <option value="Transient">Transient</option>
                <option value="Transient-Party">Transient-Party</option>
                <option value="Contract">Contract</option>
                <option value="Group">Group</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider font-mono transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            {loading ? (
              <>Running Champion Inference...</>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Compute Cancellation Probability & Revenue Exposure
              </>
            )}
          </button>
        </form>
      </div>

      {/* Prediction Output & Risk Breakdown */}
      <div className="lg:col-span-5 space-y-6">
        {result ? (
          <div className="p-6 rounded-xl glass-panel border border-cyan-500/40 space-y-5 bg-gradient-to-b from-slate-900 via-slate-900 to-[#080d1a]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  PREDICTION VERDICT
                </span>
                <div className="text-xs font-bold text-slate-200">
                  {result.model_name} v{result.model_version}
                </div>
              </div>
              <RiskBadge tier={result.risk_tier} probability={result.cancellation_probability} showProb />
            </div>

            {/* Gauge & Main Metrics */}
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-[10px] font-mono uppercase text-slate-400">
                  Cancellation Probability
                </div>
                <div className="text-3xl font-extrabold font-mono text-cyan-400 my-1">
                  {(result.cancellation_probability * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Threshold: τ = {result.threshold}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
                <div className="text-[10px] font-mono uppercase text-slate-400">
                  Revenue at Risk
                </div>
                <div className="text-3xl font-extrabold font-mono text-rose-400 my-1">
                  ${result.estimated_revenue_at_risk.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Booking Value: ${result.booking_value.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Risk Story */}
            <div className="p-3.5 rounded-lg bg-cyan-950/20 border border-cyan-500/20 text-xs text-slate-300 leading-relaxed font-sans">
              <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1">
                Risk Narrative & Advisory
              </div>
              {result.risk_story}
            </div>

            {/* Key Drivers */}
            <div>
              <h4 className="text-[11px] font-mono font-bold uppercase text-slate-400 mb-2">
                Top Contributing Risk Drivers
              </h4>
              <div className="space-y-2">
                {result.key_drivers.map((driver, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="text-slate-200 font-medium">{driver.feature}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{driver.value}</div>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        driver.direction === 'increase'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : driver.direction === 'decrease'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {driver.impact}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-xl glass-panel border border-slate-800 text-center flex flex-col items-center justify-center h-full min-h-[380px]">
            <HelpCircle className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Awaiting Booking Input
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Adjust the reservation attributes on the left and click "Compute Cancellation Probability" to generate empirical risk metrics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

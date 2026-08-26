import React, { useState } from 'react';
import { validateDatasetUpload, predictBatch } from '../api/client';
import { UploadCloud, CheckCircle2, AlertTriangle, FileText, Play, ArrowRight } from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';

export const MyHotelData: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [batchResults, setBatchResults] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setValidationResult(null);
      setBatchResults([]);
    }
  };

  const handleValidate = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await validateDatasetUpload(file);
      setValidationResult(res);
    } catch (e: any) {
      alert(`Validation error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreBatch = async () => {
    if (!validationResult || !validationResult.sample_preview) return;
    setScoring(true);
    try {
      const res = await predictBatch(validationResult.sample_preview);
      setBatchResults(res.predictions || []);
    } catch (e: any) {
      alert(`Batch prediction error: ${e.message}`);
    } finally {
      setScoring(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl glass-panel border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Custom Hotel Dataset Ingestion & Validation
            </h2>
            <p className="text-[11px] text-slate-400">
              Upload CSV/Excel booking files. Validates column schema, flags leakage, and runs batch scoring.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Card */}
        <div className="lg:col-span-5 p-6 rounded-xl glass-panel border border-slate-800 space-y-5">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
            Upload Booking Dataset
          </h3>

          <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl p-8 text-center transition-colors">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              id="file-upload"
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
              <UploadCloud className="w-10 h-10 text-cyan-400 mb-2 animate-bounce" />
              <span className="text-xs font-mono text-slate-300 font-bold">
                {file ? file.name : 'Click to select CSV or Excel file'}
              </span>
              <span className="text-[10px] text-slate-500 mt-1">
                Supports standard hotel reservation schemas
              </span>
            </label>
          </div>

          <button
            onClick={handleValidate}
            disabled={!file || loading}
            className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold text-xs uppercase font-mono tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? 'Validating Schema...' : 'Validate Dataset Schema'}
          </button>
        </div>

        {/* Diagnostic Report */}
        <div className="lg:col-span-7 p-6 rounded-xl glass-panel border border-slate-800 space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            Dataset Diagnostic & Compatibility Report
          </h3>

          {validationResult ? (
            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">TOTAL ROWS</div>
                  <div className="text-base font-bold text-cyan-400">
                    {validationResult.total_rows.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">MATCHED COLS</div>
                  <div className="text-base font-bold text-emerald-400">
                    {validationResult.matched_columns.length} / 27
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">COMPATIBILITY</div>
                  <div className="text-base font-bold text-cyan-400">
                    {validationResult.compatibility_percentage}%
                  </div>
                </div>
              </div>

              {/* Mode & Leakage status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">DATASET INGESTION MODE:</span>
                  <span className="font-bold text-cyan-400">{validationResult.mode}</span>
                </div>

                {validationResult.has_leakage_columns && (
                  <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Leakage columns detected (reservation_status). Automatically filtered out from inference.</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleScoreBatch}
                disabled={scoring}
                className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase font-mono tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <Play className="w-3.5 h-3.5" />
                {scoring ? 'Scoring Sample...' : 'Run Champion Batch Scoring on Sample'}
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              Upload a file and click "Validate Dataset Schema" to view schema matching and run batch inference.
            </p>
          )}
        </div>
      </div>

      {/* Batch Results Table */}
      {batchResults.length > 0 && (
        <div className="p-5 rounded-xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-200">
              Batch Scoring Results (Prioritized by Risk)
            </h3>
            <span className="text-[10px] font-mono text-cyan-400">
              {batchResults.length} records scored
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="pb-3 px-3">ID</th>
                  <th className="pb-3 px-3">RISK TIER</th>
                  <th className="pb-3 px-3 text-right">PROBABILITY</th>
                  <th className="pb-3 px-3 text-right">BOOKING VALUE</th>
                  <th className="pb-3 px-3 text-right">REVENUE AT RISK</th>
                  <th className="pb-3 px-3">NARRATIVE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {batchResults.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-bold text-white">{r.booking_id}</td>
                    <td className="py-2.5 px-3">
                      <RiskBadge tier={r.risk_tier} />
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-cyan-400">
                      {(r.cancellation_probability * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300">${r.booking_value}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-rose-400">
                      ${r.estimated_revenue_at_risk}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 truncate max-w-xs">{r.risk_story}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

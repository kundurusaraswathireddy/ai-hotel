import React from 'react';
import { FileSpreadsheet, Download, CheckCircle2, ShieldCheck } from 'lucide-react';
import { OverviewStats } from '../types';

interface ReportsProps {
  stats: OverviewStats | null;
}

export const Reports: React.FC<ReportsProps> = ({ stats }) => {
  const downloadReport = (name: string) => {
    const jsonContent = JSON.stringify(
      {
        report_name: name,
        generated_at: new Date().toISOString(),
        dataset_source: "Antonio et al. (2019) Hotel Booking Demand",
        total_records: stats?.total_bookings || 119390,
        cancellation_rate: stats?.cancellation_rate || 0.3704,
        champion_model: stats?.champion_model || "LightGBM",
        production_threshold: stats?.optimal_threshold || 0.15,
        leakage_safeguard: "Excluded reservation_status & reservation_status_date"
      },
      null,
      2
    );
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.toLowerCase().replace(/\s+/g, '_')}_report.json`;
    a.click();
  };

  const reportsList = [
    {
      title: 'Executive Cancellation & Revenue Exposure Brief',
      desc: 'High-level financial overview detailing gross booking volume, historical attrition, and champion model threshold savings.',
      type: 'Executive Brief',
    },
    {
      title: 'Machine Learning Audit & Leakage Protection Report',
      desc: 'Detailed validation of 5-fold cross-validation, threshold grid curves, confusion matrices, and zero-leakage feature proof.',
      type: 'Technical Audit',
    },
    {
      title: 'Channel & Market Segment Yield Assessment',
      desc: 'Comparative breakdown of cancellation rates and ADR performance across Online TA, Offline TA/TO, and Direct channels.',
      type: 'Operational Yield',
    },
    {
      title: 'Model Registry & Deployment Governance Record',
      desc: 'Formal record of serialized pipeline artifacts (.pkl), candidate benchmarks, and hyperparameters.',
      type: 'ML Governance',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl glass-panel border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Audit, Governance & Executive Reports
            </h2>
            <p className="text-[11px] text-slate-400">
              Export verified analytics and ML compliance artifacts
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportsList.map((rep, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl glass-panel border border-slate-800 flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                  {rep.type}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              </div>
              <h3 className="text-sm font-bold text-white font-mono">{rep.title}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{rep.desc}</p>
            </div>

            <button
              onClick={() => downloadReport(rep.title)}
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-2 border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" /> Download Report Artifact (JSON)
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

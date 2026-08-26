import React, { useState, useEffect } from 'react';
import { ModelEntry } from '../types';
import { fetchModelComparison } from '../api/client';
import {
  Trophy,
  Swords,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  LineChart as LineIcon
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export const ModelArena: React.FC = () => {
  const [data, setData] = useState<{ champion: any; models: ModelEntry[]; selection_weights: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<ModelEntry | null>(null);

  useEffect(() => {
    loadComparison();
  }, []);

  const loadComparison = async () => {
    try {
      setLoading(true);
      const res = await fetchModelComparison();
      setData(res);
      const champ = res.models.find((m: any) => m.status === 'CHAMPION') || res.models[0];
      setSelectedModel(champ);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!data || !selectedModel) {
    return <div className="p-8 text-center text-slate-500 font-mono">Loading Model Arena...</div>;
  }

  const champion = data.models.find((m) => m.status === 'CHAMPION') || data.models[0];

  return (
    <div className="space-y-6">
      {/* Champion Card */}
      <div className="p-6 rounded-xl glass-panel border border-cyan-500/50 bg-gradient-to-r from-cyan-950/50 via-slate-900 to-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl shadow-cyan-950/20">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center text-black font-extrabold shadow-lg shadow-cyan-500/30 shrink-0">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                CHAMPION DESIGNATION
              </span>
              <span className="text-xs font-mono text-slate-400">Score: {champion.model_selection_score}</span>
            </div>
            <h2 className="text-xl font-bold font-mono text-white mt-1">
              {champion.name} <span className="text-cyan-400 font-normal">v{champion.version}</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              {champion.champion_rationale || "Winning model evaluated across test benchmarks."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 shrink-0">
          <div className="text-center px-2">
            <div className="text-[10px] font-mono text-slate-400 uppercase">ROC-AUC</div>
            <div className="text-base font-bold font-mono text-cyan-400">{champion.metrics.roc_auc}</div>
          </div>
          <div className="text-center px-2">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Recall</div>
            <div className="text-base font-bold font-mono text-emerald-400">{champion.metrics.recall}</div>
          </div>
          <div className="text-center px-2">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Threshold</div>
            <div className="text-base font-bold font-mono text-amber-400">τ={champion.optimal_threshold}</div>
          </div>
          <div className="text-center px-2">
            <div className="text-[10px] font-mono text-slate-400 uppercase">5-Fold CV</div>
            <div className="text-base font-bold font-mono text-purple-400">{champion.cv_roc_auc_mean}</div>
          </div>
        </div>
      </div>

      {/* Model Leaderboard Table */}
      <div className="p-5 rounded-xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Swords className="w-4 h-4 text-cyan-400" />
            Model Benchmark Leaderboard
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            Formula: 0.30×ROC + 0.25×PR + 0.25×Recall + 0.10×F1 - 0.10×NormCost
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="pb-3 px-3">MODEL</th>
                <th className="pb-3 px-3">STATUS</th>
                <th className="pb-3 px-3 text-right">SCORE</th>
                <th className="pb-3 px-3 text-right">ROC-AUC</th>
                <th className="pb-3 px-3 text-right">PR-AUC</th>
                <th className="pb-3 px-3 text-right">RECALL</th>
                <th className="pb-3 px-3 text-right">F1</th>
                <th className="pb-3 px-3 text-right">ACCURACY</th>
                <th className="pb-3 px-3 text-right">THRESHOLD</th>
                <th className="pb-3 px-3 text-right">BUSINESS COST</th>
                <th className="pb-3 px-3 text-right">5-FOLD CV</th>
                <th className="pb-3 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.models
                .filter((m) => m.status !== 'UNAVAILABLE')
                .sort((a, b) => b.model_selection_score - a.model_selection_score)
                .map((m, idx) => {
                  const isChamp = m.status === 'CHAMPION';
                  const isSelected = selectedModel?.name === m.name;
                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-cyan-950/30' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                        {isChamp && <Trophy className="w-3.5 h-3.5 text-cyan-400" />}
                        {m.name}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            isChamp
                              ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-cyan-400">{m.model_selection_score}</td>
                      <td className="py-3 px-3 text-right text-slate-200">{m.metrics.roc_auc}</td>
                      <td className="py-3 px-3 text-right text-slate-200">{m.metrics.pr_auc}</td>
                      <td className="py-3 px-3 text-right text-emerald-400 font-semibold">{m.metrics.recall}</td>
                      <td className="py-3 px-3 text-right text-slate-200">{m.metrics.f1}</td>
                      <td className="py-3 px-3 text-right text-slate-200">{m.metrics.accuracy}</td>
                      <td className="py-3 px-3 text-right text-amber-400 font-bold">{m.optimal_threshold}</td>
                      <td className="py-3 px-3 text-right text-rose-400">${m.metrics.business_cost.toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-slate-400">{m.cv_roc_auc_mean} ± {m.cv_roc_auc_std}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedModel(m)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] transition-colors"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Inspection Panel for Selected Model */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threshold Optimization Curve */}
        <div className="p-5 rounded-xl glass-panel border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase text-slate-200">
                {selectedModel.name} — Threshold Optimization Curve
              </h3>
              <p className="text-[11px] text-slate-400">
                Recall vs Precision vs Business Cost across probability thresholds [0.10 - 0.90]
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={selectedModel.threshold_curve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="threshold" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" domain={[0, 1]} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="recall" stroke="#10b981" name="Recall" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="precision" stroke="#06b6d4" name="Precision" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="f1" stroke="#f59e0b" name="F1 Score" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion Matrix & Business Loss */}
        <div className="p-5 rounded-xl glass-panel border border-slate-800 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-200">
              {selectedModel.name} — Confusion Matrix (@ Threshold {selectedModel.optimal_threshold})
            </h3>
            <p className="text-[11px] text-slate-400">Evaluated on 17,909 unseen test reservations</p>
          </div>

          <div className="grid grid-cols-2 gap-3 my-2 font-mono text-xs">
            <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-center">
              <div className="text-[10px] text-emerald-400 uppercase">True Negatives (TN)</div>
              <div className="text-xl font-bold text-white my-1">
                {selectedModel.metrics.confusion_matrix.tn.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400">Correctly identified checked-out</div>
            </div>

            <div className="p-4 rounded-lg bg-amber-950/30 border border-amber-800/40 text-center">
              <div className="text-[10px] text-amber-400 uppercase">False Positives (FP)</div>
              <div className="text-xl font-bold text-white my-1">
                {selectedModel.metrics.confusion_matrix.fp.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400">False alarms ($35 unit cost)</div>
            </div>

            <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-800/50 text-center">
              <div className="text-[10px] text-rose-400 uppercase font-bold">False Negatives (FN)</div>
              <div className="text-xl font-bold text-rose-400 my-1">
                {selectedModel.metrics.confusion_matrix.fn.toLocaleString()}
              </div>
              <div className="text-[10px] text-rose-300">Missed cancellations ($180 loss)</div>
            </div>

            <div className="p-4 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-center">
              <div className="text-[10px] text-cyan-400 uppercase">True Positives (TP)</div>
              <div className="text-xl font-bold text-white my-1">
                {selectedModel.metrics.confusion_matrix.tp.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400">Correctly captured cancellations</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400">Total Business Cost on Test Set:</span>
            <span className="text-sm font-bold text-rose-400">
              ${selectedModel.metrics.business_cost.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

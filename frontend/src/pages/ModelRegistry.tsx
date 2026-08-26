import React, { useState, useEffect } from 'react';
import { ModelEntry } from '../types';
import { fetchModelRegistry } from '../api/client';
import { Layers, CheckCircle2, Archive, XCircle, Code, ShieldCheck } from 'lucide-react';

export const ModelRegistry: React.FC = () => {
  const [models, setModels] = useState<ModelEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRegistry();
  }, []);

  const loadRegistry = async () => {
    try {
      setLoading(true);
      const data = await fetchModelRegistry();
      setModels(data || []);
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
          <div className="h-9 w-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Enterprise Model Registry & Serialization
            </h2>
            <p className="text-[11px] text-slate-400">
              Tracked ML pipeline artifacts, hyperparameters, and production deployment lifecycle
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map((model, idx) => {
          const isChamp = model.status === 'CHAMPION';
          const isUnavail = model.status === 'UNAVAILABLE';

          return (
            <div
              key={idx}
              className={`p-5 rounded-xl glass-panel border flex flex-col justify-between ${
                isChamp
                  ? 'border-cyan-500/50 bg-gradient-to-b from-cyan-950/20 to-slate-900 shadow-lg shadow-cyan-950/20'
                  : 'border-slate-800 bg-slate-900/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {model.type.toUpperCase()}
                    </span>
                    <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                      {model.name}
                      {isChamp && <ShieldCheck className="w-4 h-4 text-cyan-400" />}
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      isChamp
                        ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
                        : isUnavail
                        ? 'bg-rose-950/50 text-rose-400 border-rose-800/60'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {model.status}
                  </span>
                </div>

                {!isUnavail ? (
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-slate-300">
                      <span>Selection Score</span>
                      <span className="font-bold text-cyan-400">{model.model_selection_score}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Test ROC-AUC</span>
                      <span>{model.metrics.roc_auc}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Test Recall</span>
                      <span className="text-emerald-400 font-semibold">{model.metrics.recall}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Threshold (τ)</span>
                      <span className="text-amber-400">{model.optimal_threshold}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Inference Latency</span>
                      <span>{model.inference_time_ms_per_1k} ms / 1k</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Training Time</span>
                      <span>{model.training_time_seconds}s</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-rose-950/20 border border-rose-800/40 text-xs text-rose-300 font-mono">
                    Library not available in environment. Mark: UNAVAILABLE.
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex justify-between items-center">
                <span>Version: {model.version}</span>
                <span>Artifact: .pkl</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

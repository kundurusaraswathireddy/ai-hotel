import React, { useState } from 'react';
import { askCopilot } from '../api/client';
import { Bot, X, Send, Sparkles, Database } from 'lucide-react';

interface CopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CopilotModal: React.FC<CopilotModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    {
      sender: 'bot',
      text: 'Greetings. I am the HotelGuard AI Copilot. I answer operational, yield, and model performance inquiries strictly using our verified 119,390 hotel booking dataset and trained LightGBM champion pipeline. Ask me anything!',
    },
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userText = query;
    setQuery('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await askCopilot(userText);
      setMessages((prev) => [...prev, { sender: 'bot', text: res.answer }]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Error querying copilot service.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'Which model won and why?',
    'What is the optimal production threshold?',
    'What is the historical cancellation rate?',
    'How does lead time impact cancellations?',
    'Which market segment has the highest risk?',
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0b1120] border border-cyan-500/40 rounded-2xl w-full max-w-2xl h-[560px] flex flex-col shadow-2xl shadow-cyan-950/40">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                HotelGuard AI Copilot
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Empirically grounded on real dataset & model outputs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-xl leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-cyan-600 text-white font-medium'
                    : 'bg-slate-900 border border-slate-800 text-slate-200'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin" /> Querying verified dataset...
              </div>
            </div>
          )}
        </div>

        {/* Quick prompt suggestions */}
        <div className="p-2 border-t border-slate-800/80 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono text-slate-400">
          <span className="shrink-0 px-1 text-slate-500 font-bold">Suggestions:</span>
          {samplePrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(p);
              }}
              className="shrink-0 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700/60 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Query Input */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            placeholder="Ask anything about model performance, cancellation rates, lead times..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none font-sans"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" /> Send
          </button>
        </form>
      </div>
    </div>
  );
};

import React from 'react';
import {
  LayoutDashboard,
  Cpu,
  Radar,
  DollarSign,
  Swords,
  Layers,
  Activity,
  SlidersHorizontal,
  UploadCloud,
  Database,
  FileSpreadsheet,
  Bot,
  Hourglass,
  Network,
  Dna,
  EyeOff
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openCopilot: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, openCopilot }) => {
  const menuItems = [
    { id: 'control-room', label: 'Control Room', icon: LayoutDashboard, category: 'OPERATIONS' },
    { id: 'prediction-center', label: 'Prediction Center', icon: Cpu, category: 'OPERATIONS' },
    { id: 'cancellation-dna', label: 'Cancellation DNA', icon: Dna, category: 'INTELLIGENCE' },
    { id: 'model-blind-zone', label: 'Model Blind Zone', icon: EyeOff, category: 'INTELLIGENCE' },
    { id: 'risk-topology', label: 'Risk Topology & Shock Lab', icon: Network, category: 'INTELLIGENCE' },
    { id: 'cancellation-radar', label: 'Cancellation Radar', icon: Radar, category: 'INTELLIGENCE' },
    { id: 'smart-waitlist', label: 'Smart Waitlist System', icon: Hourglass, category: 'INTELLIGENCE' },
    { id: 'revenue-intelligence', label: 'Revenue Intelligence', icon: DollarSign, category: 'INTELLIGENCE' },
    { id: 'what-if', label: 'What-If Simulator', icon: SlidersHorizontal, category: 'INTELLIGENCE' },
    { id: 'model-arena', label: 'Model Arena', icon: Swords, category: 'MACHINE LEARNING' },
    { id: 'model-registry', label: 'Model Registry', icon: Layers, category: 'MACHINE LEARNING' },
    { id: 'model-health', label: 'Model Health', icon: Activity, category: 'MACHINE LEARNING' },
    { id: 'my-hotel-data', label: 'My Hotel Data', icon: UploadCloud, category: 'DATA MANAGEMENT' },
    { id: 'data-explorer', label: 'Data Explorer', icon: Database, category: 'DATA MANAGEMENT' },
    { id: 'reports', label: 'Audit Reports', icon: FileSpreadsheet, category: 'DATA MANAGEMENT' },
  ];

  const categories = ['OPERATIONS', 'INTELLIGENCE', 'MACHINE LEARNING', 'DATA MANAGEMENT'];

  return (
    <aside className="w-64 bg-[#0a0f1d] border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <svg className="w-5 h-5 text-black font-bold" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm0 11.99h7c-.53 4.12-3.28 7.79-7 8.94V14H5V8.26l7-3.89v9.62z"/>
            </svg>
          </div>
          <div>
            <div className="font-extrabold tracking-wider text-sm text-white flex items-center gap-1.5 font-mono">
              HOTELGUARD<span className="text-cyan-400">AI</span>
            </div>
            <div className="text-[10px] uppercase font-mono tracking-widest text-slate-400">
              Risk Terminal v1.0
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-190px)]">
          {categories.map((cat) => (
            <div key={cat} className="space-y-1">
              <div className="px-3 text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
                {cat}
              </div>
              {menuItems
                .filter((item) => item.category === cat)
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10 font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
            </div>
          ))}
        </nav>
      </div>

      {/* Copilot Trigger */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
        <button
          onClick={openCopilot}
          className="w-full flex items-center justify-between p-2.5 rounded-lg bg-gradient-to-r from-cyan-950 to-slate-900 border border-cyan-700/40 hover:border-cyan-500/70 transition-all text-left group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40 group-hover:bg-cyan-500 group-hover:text-black transition-colors">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-cyan-300">AI Copilot</div>
              <div className="text-[10px] text-slate-400 font-mono">Ask live intelligence</div>
            </div>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold">
            ⌘K
          </span>
        </button>
      </div>
    </aside>
  );
};

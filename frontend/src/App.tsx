import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ControlRoom } from './pages/ControlRoom';
import { PredictionCenter } from './pages/PredictionCenter';
import { CancellationDNA } from './pages/CancellationDNA';
import { ModelBlindZone } from './pages/ModelBlindZone';
import { RiskTopology } from './pages/RiskTopology';
import { CancellationRadar } from './pages/CancellationRadar';
import { SmartWaitlist } from './pages/SmartWaitlist';
import { RevenueIntelligence } from './pages/RevenueIntelligence';
import { ModelArena } from './pages/ModelArena';
import { ModelRegistry } from './pages/ModelRegistry';
import { ModelHealth } from './pages/ModelHealth';
import { WhatIfSimulator } from './pages/WhatIfSimulator';
import { MyHotelData } from './pages/MyHotelData';
import { DataExplorer } from './pages/DataExplorer';
import { Reports } from './pages/Reports';
import { CopilotModal } from './pages/CopilotModal';
import { OverviewStats } from './types';
import {
  fetchOverview,
  fetchCancellationAnalytics,
  fetchLeadTimeAnalytics,
  fetchChannelAnalytics,
} from './api/client';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('control-room');
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [cancellationData, setCancellationData] = useState<any>(null);
  const [leadTimeData, setLeadTimeData] = useState<any>(null);
  const [channelData, setChannelData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);

  useEffect(() => {
    loadAllData();

    // Keyboard shortcut for Copilot (Cmd+K / Ctrl+K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCopilotOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [ov, canc, lead, chan] = await Promise.all([
        fetchOverview(),
        fetchCancellationAnalytics(),
        fetchLeadTimeAnalytics(),
        fetchChannelAnalytics(),
      ]);
      setStats(ov);
      setCancellationData(canc);
      setLeadTimeData(lead);
      setChannelData(chan);
    } catch (e) {
      console.error('Failed to load telemetry & stats', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#080c14] text-slate-100 selection:bg-cyan-500 selection:text-white">
      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openCopilot={() => setIsCopilotOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          stats={stats}
          activeTab={activeTab}
          onRefresh={loadAllData}
          isLoading={isLoading}
        />

        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'control-room' && (
            <ControlRoom
              stats={stats}
              cancellationData={cancellationData}
              leadTimeData={leadTimeData}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'prediction-center' && <PredictionCenter />}

          {activeTab === 'cancellation-dna' && <CancellationDNA />}

          {activeTab === 'model-blind-zone' && <ModelBlindZone />}

          {activeTab === 'risk-topology' && <RiskTopology />}

          {activeTab === 'cancellation-radar' && <CancellationRadar />}

          {activeTab === 'smart-waitlist' && <SmartWaitlist />}

          {activeTab === 'revenue-intelligence' && (
            <RevenueIntelligence
              cancellationData={cancellationData}
              channelData={channelData}
            />
          )}

          {activeTab === 'what-if' && <WhatIfSimulator />}

          {activeTab === 'model-arena' && <ModelArena />}

          {activeTab === 'model-registry' && <ModelRegistry />}

          {activeTab === 'model-health' && <ModelHealth />}

          {activeTab === 'my-hotel-data' && <MyHotelData />}

          {activeTab === 'data-explorer' && <DataExplorer />}

          {activeTab === 'reports' && <Reports stats={stats} />}
        </main>
      </div>

      {/* AI Copilot Modal */}
      <CopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />
    </div>
  );
};

export default App;

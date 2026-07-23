import React from 'react';
import { useTelemetryWs } from './hooks/useTelemetryWs';
import { Header } from './components/Header';
import { AnalyticsGauge } from './components/AnalyticsGauge';
import { StepTimeline } from './components/StepTimeline';
import { MonacoDiff } from './components/MonacoDiff';
import { ControlPanel } from './components/ControlPanel';

export function App() {
  const {
    events,
    selectedStep,
    selectedStepId,
    setSelectedStepId,
    status,
    sendAction,
    clearHistory,
  } = useTelemetryWs();

  return (
    <div className="flex flex-col h-screen w-screen bg-[#090d16] text-slate-100 overflow-hidden">
      {/* Top Header */}
      <Header
        status={status}
        sessionCount={events.length > 0 ? 1 : 0}
        totalEvents={events.length}
        onClear={clearHistory}
      />

      {/* Main Bento Grid Workspace */}
      <main className="flex-1 p-4 grid grid-rows-[auto_1fr_auto] gap-3 min-h-0 overflow-hidden">
        {/* Top: Analytics & Velocity Stats */}
        <section className="w-full">
          <AnalyticsGauge events={events} />
        </section>

        {/* Middle: Split Pane Bento (Step Feed + Monaco Diff) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 h-full overflow-hidden">
          {/* Left Column: Vertical Step Timeline (5 cols) */}
          <div className="lg:col-span-5 h-full min-h-0 overflow-hidden">
            <StepTimeline
              events={events}
              selectedStepId={selectedStepId}
              onSelectStep={setSelectedStepId}
            />
          </div>

          {/* Right Column: Monaco Code Diff Viewer (7 cols) */}
          <div className="lg:col-span-7 h-full min-h-0 overflow-hidden">
            <MonacoDiff step={selectedStep} />
          </div>
        </section>

        {/* Bottom: Operator Control & Panic Deck */}
        <footer className="w-full">
          <ControlPanel
            selectedStep={selectedStep}
            onSendAction={sendAction}
          />
        </footer>
      </main>
    </div>
  );
}

export default App;

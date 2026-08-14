import { useTelemetryWs } from './hooks/useTelemetryWs';
import { MOCK_TELEMETRY_EVENTS } from './mock/mockEvents';
import { Header } from './components/Header';
import { StepTimeline } from './components/StepTimeline';
import { MonacoDiff } from './components/MonacoDiff';
import { AnalyticsGauge } from './components/AnalyticsGauge';
import { PolicyPanel } from './components/PolicyPanel';
import { SandboxPanel } from './components/SandboxPanel';
import { ControlPanel } from './components/ControlPanel';

function NoiseOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none z-[999] overflow-hidden">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-[0.04]">
        <filter id="ag-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#ag-grain)" />
      </svg>
    </div>
  );
}

function Vignette() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-[997]"
      style={{
        background: 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(8,7,5,0.88) 100%)',
      }}
    />
  );
}

function RegMark({ top, right, bottom, left }: { top?: number; right?: number; bottom?: number; left?: number }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      className="absolute opacity-20 pointer-events-none z-[998]"
      style={{ top, right, bottom, left }}
    >
      <line x1="11" y1="0" x2="11" y2="7" stroke="#D8CDB7" strokeWidth="0.6" />
      <line x1="11" y1="15" x2="11" y2="22" stroke="#D8CDB7" strokeWidth="0.6" />
      <line x1="0" y1="11" x2="7" y2="11" stroke="#D8CDB7" strokeWidth="0.6" />
      <line x1="15" y1="11" x2="22" y2="11" stroke="#D8CDB7" strokeWidth="0.6" />
      <circle cx="11" cy="11" r="3.2" fill="none" stroke="#D8CDB7" strokeWidth="0.6" />
      <circle cx="11" cy="11" r="0.8" fill="#D8CDB7" />
    </svg>
  );
}

export function App() {
  const {
    events: liveEvents,
    selectedStep,
    selectedStepId,
    setSelectedStepId,
    status,
    sendAction,
    clearHistory,
  } = useTelemetryWs();

  // Use live events if connected and available; fallback to authentic mock events when idle
  const displayEvents = liveEvents.length > 0 ? liveEvents : MOCK_TELEMETRY_EVENTS;
  const activeStep = selectedStep || displayEvents[0] || null;
  const activeStepId = selectedStepId || activeStep?.step_id || null;

  return (
    <div className="min-w-screen min-h-screen bg-[#050403] flex items-start justify-center overflow-auto select-none">
      {/* Full-viewport Cockpit Canvas */}
      <div
        className="w-full h-screen bg-[#080705] flex flex-col relative overflow-hidden shrink-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(58,51,40,0.35) 1px, transparent 1px)',
          backgroundSize: '10px 10px',
        }}
      >
        <NoiseOverlay />
        <Vignette />
        <RegMark top={4} left={4} />
        <RegMark top={4} right={4} />
        <RegMark bottom={4} left={4} />
        <RegMark bottom={4} right={4} />

        {/* Top Header Bar */}
        <Header
          status={status}
          sessionCount={1}
          totalEvents={displayEvents.length}
          activeSessionId={activeStep?.session_id || 'SESS_9823F4A'}
          onClear={clearHistory}
        />

        {/* 3-Column Bento Grid Workspace */}
        <main
          className="flex-1 p-[16px_24px] gap-[16px] overflow-hidden min-h-0"
          style={{
            display: 'grid',
            gridTemplateColumns: '360px 1fr 360px',
            gridTemplateRows: '1fr',
          }}
        >
          {/* Column 1: Live Step Timeline */}
          <section className="h-full min-h-0 overflow-hidden">
            <StepTimeline
              events={displayEvents}
              selectedStepId={activeStepId}
              onSelectStep={setSelectedStepId}
            />
          </section>

          {/* Column 2: Monaco Code Diff Inspector */}
          <section className="h-full min-h-0 overflow-hidden">
            <MonacoDiff step={activeStep} />
          </section>

          {/* Column 3: Stacked Telemetry & Policy & Sandbox */}
          <section className="flex flex-col gap-3 h-full min-h-0 overflow-hidden">
            <AnalyticsGauge events={displayEvents} />
            <PolicyPanel violationCount={activeStep?.security_assessment?.policy_violations?.length || 0} />
            <SandboxPanel stepCount={displayEvents.length} />
          </section>
        </main>

        {/* Bottom Hardware Control Deck */}
        <ControlPanel
          selectedStep={activeStep}
          onSendAction={sendAction}
        />
      </div>
    </div>
  );
}

export default App;

import React from 'react';
import { WireEvent } from '../types/telemetry';

interface StepTimelineProps {
  events: WireEvent[];
  selectedStepId: string | null;
  onSelectStep: (stepId: string) => void;
}

function RiskPill({ level }: { level: string }) {
  const norm = level.toUpperCase();
  const style =
    norm === 'CRITICAL' || norm === 'HIGH'
      ? { bg: 'rgba(225,74,54,0.18)', fg: '#E14A36', br: 'rgba(225,74,54,0.45)' }
      : norm === 'MEDIUM' || norm === 'MED'
      ? { bg: 'rgba(240,168,58,0.16)', fg: '#F0A83A', br: 'rgba(240,168,58,0.42)' }
      : { bg: 'rgba(154,195,106,0.16)', fg: '#9AC36A', br: 'rgba(154,195,106,0.42)' };

  const label = norm === 'CRITICAL' ? 'CRIT' : norm === 'MEDIUM' ? 'MED' : norm === 'HIGH' ? 'HIGH' : 'LOW';

  return (
    <span
      className="font-mono text-[12px] font-bold px-2 py-0.5 tracking-[0.1em] rounded-[2px]"
      style={{
        backgroundColor: style.bg,
        color: style.fg,
        border: `1px solid ${style.br}`,
      }}
    >
      {label}
    </span>
  );
}

export const StepTimeline: React.FC<StepTimelineProps> = ({
  events,
  selectedStepId,
  onSelectStep,
}) => {
  const totalCount = Math.max(events.length, 1);
  const activeIndex = events.findIndex(e => e.step_id === selectedStepId);
  const progressPercent = activeIndex >= 0 ? Math.round(((activeIndex + 1) / totalCount) * 100) : 100;

  return (
    <div className="bg-[#16130F] border border-[#3A3328] shadow-[4px_4px_0_#000] h-full flex flex-col overflow-hidden select-none">
      {/* Panel Header */}
      <div className="h-10 px-4 bg-[#0E0C09] border-b border-[#3A3328] flex items-center justify-between shrink-0">
        <span className="ag-panel-title text-[14px]">
          ▸ LIVE STEP TIMELINE
        </span>
        <span className="font-mono text-[13px] text-[#B8AD99] font-bold">
          {String(events.length).padStart(3, '0')} / 045
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-[3px] bg-[#3A3328] shrink-0 relative">
        <div
          className="absolute left-0 top-0 h-full bg-[#F05A2A] opacity-80 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-0 divide-y divide-[#3A3328]/40">
        {events.length === 0 ? (
          <div className="p-8 text-center text-[#B8AD99] font-mono text-[14px] flex flex-col items-center justify-center h-full">
            <span className="text-[#F05A2A] mb-2 animate-spin text-[18px]">◈</span>
            AWAITING STEP EVENTS...
          </div>
        ) : (
          events.map((step) => {
            const active = step.step_id === selectedStepId;
            const risk = step.security_assessment?.risk_level || 'LOW';
            const timeStr = step.timestamp ? new Date(step.timestamp).toLocaleTimeString() + '.124Z' : '12:00:15.124Z';

            return (
              <div
                key={`${step.step_id}-${step.timestamp}`}
                onClick={() => onSelectStep(step.step_id)}
                className={`py-3 px-4 relative overflow-hidden cursor-pointer transition-colors ${
                  active
                    ? 'bg-[#1A1108] border-l-[3px] border-l-[#F05A2A]'
                    : 'bg-[#16130F] hover:bg-[#1C1914] border-l-[3px] border-l-transparent'
                }`}
              >
                {/* Scanline pattern for active step */}
                {active && (
                  <div className="absolute inset-0 pointer-events-none scanlines-amber" />
                )}

                {/* Top Row: ID & Risk Pill */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`font-mono text-[14px] tracking-[0.08em] font-bold ${
                      active ? 'text-[#F05A2A]' : 'text-[#C8BDA8]'
                    }`}
                  >
                    {step.step_id.toUpperCase()}
                  </span>
                  <RiskPill level={risk} />
                </div>

                {/* Timestamp */}
                <div className="font-mono text-[12px] text-[#B8AD99] tracking-[0.03em] mb-2">
                  {timeStr}
                </div>

                {/* Command Chip */}
                {step.command && (
                  <div className="inline-flex items-center gap-2 bg-[#0A0906] border border-[#3A3328] px-2.5 py-1 font-mono text-[14px] text-[#D8CDB7] mb-2 rounded-[2px] max-w-full truncate">
                    <span className="text-[#F05A2A] text-[13px] font-bold">$</span>
                    <span className="truncate">{step.command}</span>
                  </div>
                )}

                {/* Violations Warning if any */}
                {step.security_assessment?.policy_violations?.length > 0 && (
                  <div className="mb-2 p-1.5 px-2 rounded bg-[rgba(225,74,54,0.14)] border border-[rgba(225,74,54,0.35)] font-mono text-[12px] text-[#E14A36]">
                    {step.security_assessment.policy_violations.join('; ')}
                  </div>
                )}

                {/* File chips */}
                {step.affected_files && step.affected_files.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {step.affected_files.map((file) => (
                      <span
                        key={file}
                        className="bg-[rgba(154,195,106,0.1)] border border-[rgba(154,195,106,0.25)] font-mono text-[12px] text-[#82B454] px-1.5 py-0.5 rounded-[1px] truncate max-w-[220px]"
                      >
                        {file}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="h-9 px-4 border-t border-[#3A3328] bg-[#0E0C09] flex items-center justify-between shrink-0">
        <span className="font-sans text-[13px] text-[#B8AD99]">
          {events.length} steps recorded
        </span>
        <span className="font-mono text-[13px] text-[#9AC36A] font-bold">
          RUNNING
        </span>
      </div>
    </div>
  );
};

import React from 'react';
import { WireEvent, RiskLevel } from '../types/telemetry';

interface StepTimelineProps {
  events: WireEvent[];
  selectedStepId: string | null;
  onSelectStep: (stepId: string) => void;
}

function RiskPill({ level }: { level: string }) {
  const norm = level.toUpperCase();
  const style =
    norm === 'CRITICAL' || norm === 'HIGH'
      ? { bg: 'rgba(214,69,51,0.15)', fg: '#D64533', br: 'rgba(214,69,51,0.42)' }
      : norm === 'MEDIUM' || norm === 'MED'
      ? { bg: 'rgba(232,163,61,0.13)', fg: '#E8A33D', br: 'rgba(232,163,61,0.38)' }
      : { bg: 'rgba(138,182,97,0.13)', fg: '#8AB661', br: 'rgba(138,182,97,0.38)' };

  const label = norm === 'CRITICAL' ? 'CRIT' : norm === 'MEDIUM' ? 'MED' : norm === 'HIGH' ? 'HIGH' : 'LOW';

  return (
    <span
      className="font-mono text-[7px] px-1.5 py-0.5 tracking-[0.14em] rounded-[2px]"
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
    <div className="bg-[#171512] border border-[#2A2721] shadow-[4px_4px_0_#000] h-full flex flex-col overflow-hidden select-none">
      {/* Panel Header */}
      <div className="h-8 px-3 bg-[#0F0E0C] border-b border-[#2A2721] flex items-center justify-between shrink-0">
        <span className="font-mono text-[7px] text-[#E4572E] tracking-[0.2em]">
          ▸ LIVE STEP TIMELINE
        </span>
        <span className="font-mono text-[8px] text-[#8A8578]">
          {String(events.length).padStart(3, '0')} / 045
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-[2px] bg-[#2A2721] shrink-0 relative">
        <div
          className="absolute left-0 top-0 h-full bg-[#E4572E] opacity-70 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-0 divide-y divide-[#2A2721]/50">
        {events.length === 0 ? (
          <div className="p-8 text-center text-[#8A8578] font-mono text-[9px] flex flex-col items-center justify-center h-full">
            <span className="text-[#E4572E] mb-2 animate-spin">◈</span>
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
                className={`p-2.5 px-3 relative overflow-hidden cursor-pointer transition-colors ${
                  active
                    ? 'bg-[#1d1108] border-l-[3px] border-l-[#E4572E]'
                    : 'bg-[#171512] hover:bg-[#1C1A16] border-l border-l-[#2A2721]'
                }`}
              >
                {/* Scanline pattern for active step */}
                {active && (
                  <div className="absolute inset-0 pointer-events-none scanlines-amber" />
                )}

                {/* Top Row: ID & Risk Pill */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`font-mono text-[9px] tracking-[0.11em] font-semibold ${
                      active ? 'text-[#E4572E]' : 'text-[#B8B0A4]'
                    }`}
                  >
                    {step.step_id.toUpperCase()}
                  </span>
                  <RiskPill level={risk} />
                </div>

                {/* Timestamp */}
                <div className="font-mono text-[8px] text-[#8A8578] tracking-[0.03em] mb-1.5">
                  {timeStr}
                </div>

                {/* Command Chip */}
                {step.command && (
                  <div className="inline-flex items-center gap-1.5 bg-[#0A0906] border border-[#2A2721] px-2 py-0.5 font-mono text-[9px] text-[#EDE6D6] mb-1.5 rounded-[2px] max-w-full truncate">
                    <span className="text-[#E4572E] text-[8px]">$</span>
                    <span className="truncate">{step.command}</span>
                  </div>
                )}

                {/* Violations Warning if any */}
                {step.security_assessment?.policy_violations?.length > 0 && (
                  <div className="mb-1.5 p-1 px-1.5 rounded bg-[rgba(214,69,51,0.12)] border border-[rgba(214,69,51,0.3)] font-mono text-[7px] text-[#D64533]">
                    {step.security_assessment.policy_violations.join('; ')}
                  </div>
                )}

                {/* File chips */}
                {step.affected_files && step.affected_files.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {step.affected_files.map((file) => (
                      <span
                        key={file}
                        className="bg-[rgba(138,182,97,0.07)] border border-[rgba(138,182,97,0.2)] font-mono text-[7px] text-[#7AA855] px-1 py-0.5 rounded-[1px] truncate max-w-[200px]"
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
      <div className="h-7 px-3 border-t border-[#2A2721] bg-[#0F0E0C] flex items-center justify-between shrink-0">
        <span className="font-sans text-[9px] text-[#8A8578]">
          {events.length} steps recorded
        </span>
        <span className="font-mono text-[8px] text-[#8AB661] font-semibold">
          RUNNING
        </span>
      </div>
    </div>
  );
};

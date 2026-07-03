import React, { useState } from 'react';
import { WireEvent } from '../types/telemetry';

interface ControlPanelProps {
  selectedStep: WireEvent | null;
  onSendAction: (action: string, payload?: unknown) => boolean;
}

function KeycapButton({
  label,
  bgColor,
  icon,
  hazard = false,
  disabled = false,
  onClick,
}: {
  label: string;
  bgColor: string;
  icon: string;
  hazard?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const [pressed, setPressed] = useState(false);

  const btn = (
    <button
      disabled={disabled}
      onClick={onClick}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      className="font-mono text-[9px] font-bold tracking-[0.14em] text-[#0C0B08] px-4.5 h-[42px] flex items-center gap-2 cursor-pointer select-none whitespace-nowrap rounded-[3px] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        backgroundColor: pressed ? `color-mix(in srgb, ${bgColor} 80%, #000)` : bgColor,
        border: `2px solid color-mix(in srgb, ${bgColor} 60%, #000)`,
        borderBottom: pressed
          ? `2px solid color-mix(in srgb, ${bgColor} 60%, #000)`
          : `4px solid color-mix(in srgb, ${bgColor} 40%, #000)`,
        borderRight: pressed
          ? `2px solid color-mix(in srgb, ${bgColor} 60%, #000)`
          : `4px solid color-mix(in srgb, ${bgColor} 40%, #000)`,
        transform: pressed ? 'translate(2px, 2px)' : 'translate(0, 0)',
        boxShadow: pressed ? '1px 1px 0 #000' : '4px 4px 0 #000',
      }}
    >
      <span className="text-[13px] leading-none">{icon}</span>
      <span>{label}</span>
    </button>
  );

  if (hazard) {
    return (
      <div className="p-1 rounded-[5px] border border-[rgba(214,69,51,0.3)] hazard-border">
        {btn}
      </div>
    );
  }
  return btn;
}

function Waveform() {
  const bars = Array.from({ length: 36 }, (_, i) => {
    const t = i / 35;
    return Math.max(
      0.06,
      Math.abs(
        Math.sin(t * Math.PI * 3.2) * 0.56 +
          Math.sin(t * Math.PI * 7.7) * 0.26 +
          Math.sin(t * Math.PI * 15.1) * 0.18
      )
    );
  });

  return (
    <div className="flex items-center gap-[1.5px] h-7 shrink-0">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-[3px] shrink-0 bg-[#E4572E]"
          style={{
            height: `${Math.max(2, Math.round(h * 24))}px`,
            opacity: 0.45 + 0.55 * h,
          }}
        />
      ))}
    </div>
  );
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  selectedStep,
  onSendAction,
}) => {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleApproveMerge = () => {
    if (!selectedStep) return;
    onSendAction('APPROVE_MERGE', { step_id: selectedStep.step_id });
    showToast(`MERGED: ${selectedStep.step_id}`);
  };

  const handleStepUndo = () => {
    if (!selectedStep) return;
    onSendAction('ROLLBACK_STEP', { step_id: selectedStep.step_id });
    showToast(`ROLLED BACK: ${selectedStep.step_id}`);
  };

  const handlePanicKill = () => {
    onSendAction('PANIC', { reason: 'Operator emergency kill triggered' });
    showToast('🚨 SIGTERM SENT — RUNTIME HALTED');
  };

  return (
    <div className="h-[72px] bg-[#0C0B09] border-t-2 border-[#2A2721] flex items-center px-6 gap-3.5 shrink-0 select-none z-20">
      {/* Keycap Actions */}
      <KeycapButton
        label="APPROVE & MERGE"
        bgColor="#8AB661"
        icon="✓"
        disabled={!selectedStep}
        onClick={handleApproveMerge}
      />
      <div className="w-[1px] h-11 bg-[#2A2721]" />
      <KeycapButton
        label="STEP UNDO"
        bgColor="#E8A33D"
        icon="↩"
        disabled={!selectedStep}
        onClick={handleStepUndo}
      />
      <div className="w-[1px] h-11 bg-[#2A2721]" />
      <KeycapButton
        label="KILL PROCESS"
        bgColor="#D64533"
        icon="■"
        hazard
        onClick={handlePanicKill}
      />

      {/* Toast Feedback */}
      {toast && (
        <div className="font-mono text-[9px] text-[#E4572E] border border-[#E4572E]/40 px-3 py-1 bg-[#171512] shadow-[2px_2px_0_#000] ml-2 animate-bounce">
          {toast}
        </div>
      )}

      <div className="flex-1" />

      {/* Waveform audio/event stream indicator */}
      <Waveform />

      <div className="w-[1px] h-11 bg-[#2A2721] ml-1.5" />

      {/* Auxiliary switches */}
      <div className="flex gap-1.5">
        <button
          onClick={() => showToast('AUTO-SCROLL: ENGAGED')}
          className="bg-transparent border border-[#2A2721] hover:border-[#4A4640] text-[#8A8578] hover:text-[#EDE6D6] font-mono text-[7px] tracking-[0.14em] px-3 py-1 rounded-full cursor-pointer transition-colors"
        >
          SCROLL
        </button>
        <button
          onClick={() => showToast('FEED PAUSED')}
          className="bg-transparent border border-[#2A2721] hover:border-[#4A4640] text-[#8A8578] hover:text-[#EDE6D6] font-mono text-[7px] tracking-[0.14em] px-3 py-1 rounded-full cursor-pointer transition-colors"
        >
          STOP
        </button>
      </div>
    </div>
  );
};

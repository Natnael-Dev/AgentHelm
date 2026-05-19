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
      className="font-mono text-[15px] font-bold tracking-[0.1em] text-[#0C0B08] px-5 h-[54px] flex items-center gap-2.5 cursor-pointer select-none whitespace-nowrap rounded-[3px] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
      <span className="text-[16px] leading-none">{icon}</span>
      <span>{label}</span>
    </button>
  );

  if (hazard) {
    return (
      <div className="p-1 rounded-[5px] border border-[rgba(225,74,54,0.35)] hazard-border">
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
    <div className="flex items-center gap-[1.5px] h-8 shrink-0">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-[3px] shrink-0 bg-[#F05A2A]"
          style={{
            height: `${Math.max(2, Math.round(h * 28))}px`,
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
    <div className="h-[82px] bg-[#0A0908] border-t-2 border-[#3A3328] flex items-center px-6 gap-4 shrink-0 select-none z-20">
      {/* Keycap Actions */}
      <KeycapButton
        label="APPROVE & MERGE"
        bgColor="#9AC36A"
        icon="✓"
        disabled={!selectedStep}
        onClick={handleApproveMerge}
      />
      <div className="w-[1px] h-12 bg-[#3A3328]" />
      <KeycapButton
        label="STEP UNDO"
        bgColor="#F0A83A"
        icon="↩"
        disabled={!selectedStep}
        onClick={handleStepUndo}
      />
      <div className="w-[1px] h-12 bg-[#3A3328]" />
      <KeycapButton
        label="KILL PROCESS"
        bgColor="#E14A36"
        icon="■"
        hazard
        onClick={handlePanicKill}
      />

      {/* Toast Feedback */}
      {toast && (
        <div className="font-mono text-[13px] text-[#F05A2A] border border-[#F05A2A]/40 px-3 py-1.5 bg-[#16130F] shadow-[2px_2px_0_#000] ml-2 font-bold">
          {toast}
        </div>
      )}

      <div className="flex-1" />

      {/* Waveform audio/event stream indicator */}
      <Waveform />

      <div className="w-[1px] h-12 bg-[#3A3328] ml-2" />

      {/* Auxiliary switches */}
      <div className="flex gap-2">
        <button
          onClick={() => showToast('AUTO-SCROLL: ENGAGED')}
          className="bg-transparent border border-[#3A3328] hover:border-[#827869] text-[#B8AD99] hover:text-[#D8CDB7] font-mono text-[12px] font-bold tracking-[0.1em] px-3.5 py-1.5 rounded-full cursor-pointer transition-colors"
        >
          SCROLL
        </button>
        <button
          onClick={() => showToast('FEED PAUSED')}
          className="bg-transparent border border-[#3A3328] hover:border-[#827869] text-[#B8AD99] hover:text-[#D8CDB7] font-mono text-[12px] font-bold tracking-[0.1em] px-3.5 py-1.5 rounded-full cursor-pointer transition-colors"
        >
          STOP
        </button>
      </div>
    </div>
  );
};

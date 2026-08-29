import React, { useState, useEffect } from 'react';
import { ConnectionStatus } from '../types/telemetry';

interface HeaderProps {
  status: ConnectionStatus;
  sessionCount: number;
  totalEvents: number;
  activeSessionId?: string;
  onClear: () => void;
}

function getUtcString() {
  const d = new Date();
  return [d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()]
    .map(n => String(n).padStart(2, '0')).join(':') + ' UTC';
}

function LED({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 6px ${color}, 0 0 14px ${color}44`,
        }}
      />
      <span className="font-mono text-[13px] text-[#B8AD99] tracking-[0.06em]">
        {label}
      </span>
    </div>
  );
}

export const Header: React.FC<HeaderProps> = ({
  status,
  activeSessionId = 'SESS_9823F4A',
  onClear,
}) => {
  const [utcTime, setUtcTime] = useState(getUtcString);

  useEffect(() => {
    const id = setInterval(() => setUtcTime(getUtcString()), 1000);
    return () => clearInterval(id);
  }, []);

  const wsLedColor = status === 'connected' ? '#9AC36A' : status === 'connecting' || status === 'reconnecting' ? '#F0A83A' : '#E14A36';
  const wsLedText = status === 'connected' ? 'WS:8765 LINKED' : status === 'reconnecting' ? 'WS RECONNECTING' : 'WS OFFLINE';

  return (
    <header className="h-14 bg-[#0A0908] border-b-2 border-[#3A3328] flex items-center px-6 gap-5 shrink-0 z-20 select-none">
      {/* Wordmark */}
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full shrink-0 bg-[#F05A2A] shadow-[0_0_10px_#F05A2A,0_0_20px_rgba(240,90,42,0.4)] animate-[blink_1.4s_step-end_infinite]" />
        <span className="font-mono text-[16px] font-bold text-[#D8CDB7] tracking-[0.22em]">
          AGENTHELM LIVE
        </span>
        <span className="font-mono text-[11px] text-[#827869] tracking-[0.06em] ml-1">
          v2.4.1
        </span>
      </div>

      <div className="flex-1" />

      {/* Session Chip */}
      <div className="bg-[#C8BDA8] border border-[#3A3328] shadow-[2px_2px_0_#000] px-3.5 py-1.5 flex items-center gap-2.5 rounded-sm">
        <span className="font-mono text-[13px] text-[#11100C] tracking-[0.05em] font-bold">
          {activeSessionId.toUpperCase()}
        </span>
        <span className="text-[#11100C]/30 text-[12px]">•</span>
        <span className="font-mono text-[13px] text-[#11100C] tracking-[0.05em]">
          WORKTREE sandbox-042
        </span>
        <span className="text-[#11100C]/30 text-[12px]">•</span>
        <span className="font-mono text-[13px] text-[#1B6B0F] tracking-[0.05em] font-bold">
          CLEAN
        </span>
      </div>

      <div className="flex-1" />

      {/* LEDs + Clock */}
      <div className="flex items-center gap-5">
        <LED color={wsLedColor} label={wsLedText} />
        <LED color="#9AC36A" label="UDS LINKED" />
        <LED color="#F0A83A" label="STREAM DECK" />
        <div className="w-[1px] h-7 bg-[#3A3328]" />
        <span className="font-mono text-[14px] text-[#F05A2A] tracking-[0.08em] min-w-[100px] text-right font-bold">
          {utcTime}
        </span>
        <button
          onClick={onClear}
          title="Clear Feed History"
          className="ml-1 font-mono text-[12px] text-[#B8AD99] hover:text-[#D8CDB7] border border-[#3A3328] hover:border-[#827869] px-2.5 py-1 rounded-sm bg-[#16130F] transition-colors"
        >
          CLEAR
        </button>
      </div>
    </header>
  );
};

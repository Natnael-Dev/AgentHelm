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
    <div className="flex items-center gap-1.5">
      <div
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 6px ${color}, 0 0 12px ${color}44`,
        }}
      />
      <span className="font-mono text-[9px] text-[#8A8578] tracking-[0.07em]">
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

  const wsLedColor = status === 'connected' ? '#8AB661' : status === 'connecting' || status === 'reconnecting' ? '#E8A33D' : '#D64533';
  const wsLedText = status === 'connected' ? 'WS:8765 LINKED' : status === 'reconnecting' ? 'WS:8765 RECONNECTING' : 'WS:8765 OFFLINE';

  return (
    <header className="h-12 bg-[#0C0B09] border-b-2 border-[#2A2721] flex items-center px-6 gap-5 shrink-0 z-20 select-none">
      {/* Wordmark */}
      <div className="flex items-center gap-2.5">
        <div className="w-2 h-2 rounded-full shrink-0 bg-[#E4572E] shadow-[0_0_8px_#E4572E,0_0_16px_rgba(228,87,46,0.4)] animate-[blink_1.4s_step-end_infinite]" />
        <span className="font-mono text-xs font-bold text-[#EDE6D6] tracking-[0.26em]">
          AGENTGUARD LIVE
        </span>
        <span className="font-mono text-[7px] text-[#4A4640] tracking-[0.06em] ml-1">
          v2.4.1
        </span>
      </div>

      <div className="flex-1" />

      {/* Session Chip */}
      <div className="bg-[#EDE6D6] border border-[#2A2721] shadow-[2px_2px_0_#000] px-3 py-1 flex items-center gap-2 rounded-sm">
        <span className="font-mono text-[8px] text-[#14120E] tracking-[0.06em] font-semibold">
          {activeSessionId.toUpperCase()}
        </span>
        <span className="text-[#14120E]/35 text-[8px]">•</span>
        <span className="font-mono text-[8px] text-[#14120E] tracking-[0.06em]">
          WORKTREE sandbox-042
        </span>
        <span className="text-[#14120E]/35 text-[8px]">•</span>
        <span className="font-mono text-[8px] text-[#2A7A1A] tracking-[0.06em] font-bold">
          CLEAN
        </span>
      </div>

      <div className="flex-1" />

      {/* LEDs + Clock */}
      <div className="flex items-center gap-4">
        <LED color={wsLedColor} label={wsLedText} />
        <LED color="#8AB661" label="UDS LINKED" />
        <LED color="#E8A33D" label="STREAM DECK: ARMED" />
        <div className="w-[1px] h-6 bg-[#2A2721]" />
        <span className="font-mono text-[10px] text-[#E4572E] tracking-[0.1em] min-w-[85px] text-right font-medium">
          {utcTime}
        </span>
        <button
          onClick={onClear}
          title="Clear Feed History"
          className="ml-2 font-mono text-[7px] text-[#8A8578] hover:text-[#EDE6D6] border border-[#2A2721] hover:border-[#4A4640] px-2 py-0.5 rounded-sm bg-[#171512] transition-colors"
        >
          CLEAR
        </button>
      </div>
    </header>
  );
};

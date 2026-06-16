import React from 'react';

const SANDBOX_ROWS: [string, string, string][] = [
  ['LEDGER', '42 STEPS', '#EDE6D6'],
  ['MODE', 'APPEND-ONLY', '#8AB661'],
  ['ISOLATION', 'WORKTREE', '#EDE6D6'],
  ['BRANCH', 'agent/jwt-hardening', '#E8A33D'],
];

export const SandboxPanel: React.FC<{ stepCount?: number }> = ({ stepCount = 42 }) => {
  return (
    <div className="bg-[#171512] border border-[#2A2721] shadow-[4px_4px_0_#000] p-3 flex-1 flex flex-col select-none">
      <span className="font-mono text-[7px] text-[#E4572E] tracking-[0.2em] block pb-2 mb-2 border-b border-[#2A2721]">
        SANDBOX
      </span>

      {/* Node diagram */}
      <svg width="100%" height="34" viewBox="0 0 274 34" className="mb-2 shrink-0">
        <rect x="2" y="9" width="58" height="16" rx="2" fill="#0A0906" stroke="#2A2721" strokeWidth="1" />
        <text x="31" y="20.5" fontFamily="Space Mono, monospace" fontSize="7.5" fill="#8A8578" textAnchor="middle">
          master
        </text>
        <line x1="60" y1="17" x2="78" y2="17" stroke="#2A2721" strokeWidth="1" strokeDasharray="3,2" />
        <polygon points="75,14 81,17 75,20" fill="#2A2721" />
        <rect x="82" y="7" width="112" height="20" rx="2" fill="rgba(228,87,46,0.07)" stroke="#E4572E" strokeWidth="1" />
        <text x="138" y="20.5" fontFamily="Space Mono, monospace" fontSize="7.5" fill="#E4572E" textAnchor="middle">
          sandbox-042
        </text>
        <circle cx="200" cy="17" r="3" fill="none" stroke="#8AB661" strokeWidth="1" />
        <circle cx="200" cy="17" r="1" fill="#8AB661" />
      </svg>

      {/* Metadata stats */}
      <div className="flex flex-col gap-1.5 mt-1">
        {SANDBOX_ROWS.map(([lbl, val, clr]) => (
          <div key={lbl} className="flex justify-between items-center text-[7px] font-mono">
            <span className="text-[#4A4640] tracking-[0.1em]">{lbl}</span>
            <span style={{ color: clr }}>{lbl === 'LEDGER' ? `${stepCount} STEPS` : val}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

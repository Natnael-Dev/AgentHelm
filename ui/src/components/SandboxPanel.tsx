import React from 'react';

const SANDBOX_ROWS: [string, string, string][] = [
  ['LEDGER', '42 STEPS', '#D8CDB7'],
  ['MODE', 'APPEND-ONLY', '#9AC36A'],
  ['ISOLATION', 'WORKTREE', '#D8CDB7'],
  ['BRANCH', 'agent/jwt-hardening', '#F0A83A'],
];

export const SandboxPanel: React.FC<{ stepCount?: number }> = ({ stepCount = 42 }) => {
  return (
    <div className="bg-[#16130F] border border-[#3A3328] shadow-[4px_4px_0_#000] p-4 flex-1 flex flex-col select-none">
      <span className="ag-panel-title text-[14px] block pb-2.5 mb-2.5 border-b border-[#3A3328]">
        SANDBOX
      </span>

      {/* Node diagram */}
      <svg width="100%" height="40" viewBox="0 0 274 40" className="mb-3 shrink-0">
        <rect x="2" y="10" width="66" height="20" rx="2" fill="#0A0906" stroke="#3A3328" strokeWidth="1" />
        <text x="35" y="24" fontFamily="Space Mono, monospace" fontSize="10" fill="#B8AD99" textAnchor="middle" fontWeight="bold">
          master
        </text>
        <line x1="68" y1="20" x2="88" y2="20" stroke="#3A3328" strokeWidth="1.5" strokeDasharray="3,2" />
        <polygon points="85,16 93,20 85,24" fill="#3A3328" />
        <rect x="94" y="8" width="120" height="24" rx="2" fill="rgba(240,90,42,0.1)" stroke="#F05A2A" strokeWidth="1" />
        <text x="154" y="24" fontFamily="Space Mono, monospace" fontSize="10" fill="#F05A2A" textAnchor="middle" fontWeight="bold">
          sandbox-042
        </text>
        <circle cx="222" cy="20" r="4" fill="none" stroke="#9AC36A" strokeWidth="1.5" />
        <circle cx="222" cy="20" r="1.5" fill="#9AC36A" />
      </svg>

      {/* Metadata stats */}
      <div className="flex flex-col gap-2 mt-1">
        {SANDBOX_ROWS.map(([lbl, val, clr]) => (
          <div key={lbl} className="flex justify-between items-center text-[14px] font-mono font-bold">
            <span className="text-[#827869] tracking-[0.08em]">{lbl}</span>
            <span style={{ color: clr }}>{lbl === 'LEDGER' ? `${stepCount} STEPS` : val}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

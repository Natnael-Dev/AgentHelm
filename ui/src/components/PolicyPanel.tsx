import React from 'react';

const POLICY_RULES = [
  { pat: 'rm -rf /', blocked: true },
  { pat: 'git push --force', blocked: true },
  { pat: 'curl | sh', blocked: true },
  { pat: 'eval(user_input)', blocked: true },
  { pat: 'DROP TABLE *', blocked: true },
  { pat: 'chmod 777', blocked: false },
  { pat: 'git stash pop', blocked: false },
];

export const PolicyPanel: React.FC<{ violationCount?: number }> = ({ violationCount = 0 }) => {
  return (
    <div className="bg-[#171512] border border-[#2A2721] shadow-[4px_4px_0_#000] p-3 flex-1 flex flex-col select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#2A2721]">
        <span className="font-mono text-[7px] text-[#E4572E] tracking-[0.2em]">
          POLICY ENGINE
        </span>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[7px] text-[#8A8578]">14 RULES ARMED</span>
          <div className="w-1.5 h-1.5 rounded-full bg-[#E4572E] shadow-[0_0_5px_#E4572E]" />
        </div>
      </div>

      {/* Rules list */}
      <div className="flex-1 flex flex-col gap-1 overflow-y-auto pr-1">
        {POLICY_RULES.map((r) => (
          <div key={r.pat} className="flex items-center gap-2 min-h-[18px]">
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                r.blocked ? 'bg-[#D64533]' : 'bg-[#2A2721]'
              }`}
            />
            <span
              className={`font-mono text-[8px] flex-1 truncate ${
                r.blocked
                  ? 'text-[#D64533] line-through decoration-[#D64533]/50'
                  : 'text-[#8A8578]'
              }`}
            >
              {r.pat}
            </span>
            {r.blocked && (
              <span className="font-mono text-[6px] text-[#D64533] border border-[#D64533]/25 px-1 py-[1px] rounded-[1px] tracking-[0.1em]">
                BLK
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-2 pt-2 border-t border-[#2A2721] flex items-center justify-between">
        <span className="font-mono text-[7px] text-[#8AB661] tracking-[0.16em]">
          {violationCount} VIOLATIONS
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#8AB661] shadow-[0_0_6px_#8AB661]" />
          <span className="font-mono text-[7px] text-[#8AB661]">
            {violationCount === 0 ? 'CLEAN' : 'INTERCEPTED'}
          </span>
        </div>
      </div>
    </div>
  );
};

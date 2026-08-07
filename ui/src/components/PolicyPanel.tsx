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
    <div className="bg-[#16130F] border border-[#3A3328] shadow-[4px_4px_0_#000] p-4 flex-1 flex flex-col select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#3A3328]">
        <span className="ag-panel-title text-[14px]">
          POLICY ENGINE
        </span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[13px] text-[#B8AD99] font-bold">14 RULES ARMED</span>
          <div className="w-2 h-2 rounded-full bg-[#F05A2A] shadow-[0_0_6px_#F05A2A]" />
        </div>
      </div>

      {/* Rules list */}
      <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1">
        {POLICY_RULES.map((r) => (
          <div key={r.pat} className="flex items-center gap-2.5 min-h-[24px]">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                r.blocked ? 'bg-[#E14A36]' : 'bg-[#3A3328]'
              }`}
            />
            <span
              className={`font-mono text-[14px] flex-1 truncate ${
                r.blocked
                  ? 'text-[#E14A36] line-through decoration-[#E14A36]/50'
                  : 'text-[#B8AD99]'
              }`}
            >
              {r.pat}
            </span>
            {r.blocked && (
              <span className="font-mono text-[11px] text-[#E14A36] border border-[#E14A36]/30 px-1.5 py-[2px] rounded-[2px] tracking-[0.1em] font-bold">
                BLK
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-2.5 pt-2.5 border-t border-[#3A3328] flex items-center justify-between">
        <span className="font-mono text-[14px] text-[#9AC36A] tracking-[0.12em] font-bold">
          {violationCount} VIOLATIONS
        </span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#9AC36A] shadow-[0_0_6px_#9AC36A]" />
          <span className="font-mono text-[13px] text-[#9AC36A] font-bold">
            {violationCount === 0 ? 'CLEAN' : 'INTERCEPTED'}
          </span>
        </div>
      </div>
    </div>
  );
};

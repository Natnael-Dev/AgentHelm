import React, { useMemo } from 'react';
import { WireEvent } from '../types/telemetry';
import { Zap, DollarSign, ShieldAlert, Cpu, Layers } from 'lucide-react';

interface AnalyticsGaugeProps {
  events: WireEvent[];
}

export const AnalyticsGauge: React.FC<AnalyticsGaugeProps> = ({ events }) => {
  const metrics = useMemo(() => {
    let tokens = 0;
    let violations = 0;
    const sessionSet = new Set<string>();

    for (const ev of events) {
      if (ev.session_id) sessionSet.add(ev.session_id);
      tokens += Math.max(1, Math.floor((ev.command.length + ev.diff_patch.length + 64) / 4));
      violations += ev.security_assessment?.policy_violations?.length || 0;
    }

    const costUsd = tokens * (3.0 / 1_000_000);
    const velocity = events.length > 0 ? Math.min(2400, Math.floor(tokens / Math.max(1, events.length) * 8)) : 0;

    return {
      tokens,
      costUsd,
      violations,
      sessions: sessionSet.size || (events.length > 0 ? 1 : 0),
      velocity,
    };
  }, [events]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Context Tokens */}
      <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 shadow-md">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-mono uppercase">Context Tokens</span>
          <Cpu className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="text-xl font-bold font-mono text-slate-100">
          {metrics.tokens.toLocaleString()}
        </div>
        <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (metrics.tokens / 50000) * 100)}%` }}
          />
        </div>
      </div>

      {/* Token Velocity */}
      <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 shadow-md">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-mono uppercase">Token Velocity</span>
          <Zap className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-xl font-bold font-mono text-slate-100 flex items-baseline gap-1">
          {metrics.velocity} <span className="text-xs font-normal text-slate-400 font-sans">tok/s</span>
        </div>
        <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (metrics.velocity / 2000) * 100)}%` }}
          />
        </div>
      </div>

      {/* Estimated Cost */}
      <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 shadow-md">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-mono uppercase">Estimated Cost</span>
          <DollarSign className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-xl font-bold font-mono text-emerald-400">
          ${metrics.costUsd.toFixed(4)}
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-1">
          Blended $3.00 / 1M tokens
        </div>
      </div>

      {/* Policy Violations */}
      <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 shadow-md">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-mono uppercase">Blocked Threats</span>
          <ShieldAlert className={`w-4 h-4 ${metrics.violations > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
        </div>
        <div className={`text-xl font-bold font-mono ${metrics.violations > 0 ? 'text-rose-400' : 'text-slate-100'}`}>
          {metrics.violations}
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-1">
          {metrics.violations === 0 ? 'Zero active violations' : 'Interceptions logged'}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { WireEvent, RiskLevel } from '../types/telemetry';
import { Terminal, ShieldAlert, CheckCircle2, AlertTriangle, XCircle, Clock, FileCode } from 'lucide-react';

interface StepTimelineProps {
  events: WireEvent[];
  selectedStepId: string | null;
  onSelectStep: (stepId: string) => void;
}

export const StepTimeline: React.FC<StepTimelineProps> = ({
  events,
  selectedStepId,
  onSelectStep,
}) => {
  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-rose-950/80 text-rose-300 border-rose-800 animate-pulse';
      case 'HIGH':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'MEDIUM':
        return 'bg-yellow-950/80 text-yellow-300 border-yellow-800';
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
    }
  };

  const getEventIcon = (type: string, risk: RiskLevel) => {
    if (type === 'AGENT_STEP_BLOCKED' || risk === 'CRITICAL') {
      return <XCircle className="w-4 h-4 text-rose-400 shrink-0" />;
    }
    if (type === 'AGENT_STEP_COMPLETED') {
      return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    if (risk === 'HIGH') {
      return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
    }
    return <Terminal className="w-4 h-4 text-indigo-400 shrink-0" />;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
      {/* Panel Header */}
      <div className="p-3.5 px-4 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Live Execution Feed
          </h2>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
          {events.length} steps
        </span>
      </div>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <Clock className="w-8 h-8 mb-2 opacity-50 animate-spin" />
            <p className="text-sm font-medium">Awaiting agent execution steps...</p>
            <p className="text-xs mt-1">Run commands through <code className="text-indigo-400">agentguard-bar</code> to see live telemetry.</p>
          </div>
        ) : (
          events.map((ev) => {
            const isSelected = selectedStepId === ev.step_id;
            const risk = ev.security_assessment.risk_level || 'LOW';

            return (
              <div
                key={`${ev.step_id}-${ev.event_type}-${ev.timestamp}`}
                onClick={() => onSelectStep(ev.step_id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer select-none text-left ${
                  isSelected
                    ? 'bg-slate-800/90 border-indigo-500/60 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                    : 'bg-slate-950/50 hover:bg-slate-800/50 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Header row */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    {getEventIcon(ev.event_type, risk)}
                    <span className="font-mono text-xs font-semibold text-slate-200 truncate">
                      {ev.step_id}
                    </span>
                    <span className="text-[10px] uppercase font-mono text-slate-500">
                      ({ev.session_id})
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${getRiskBadge(risk)}`}>
                    {risk}
                  </span>
                </div>

                {/* Command row */}
                {ev.command && (
                  <div className="bg-slate-950/80 rounded px-2.5 py-1.5 my-1 font-mono text-xs text-indigo-300 border border-slate-800/60 break-all">
                    $ {ev.command}
                  </div>
                )}

                {/* Violations preview if any */}
                {ev.security_assessment.policy_violations.length > 0 && (
                  <div className="mt-1.5 p-2 rounded bg-rose-950/40 border border-rose-900/50 text-[11px] text-rose-300 flex items-start gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>{ev.security_assessment.policy_violations.join(', ')}</span>
                  </div>
                )}

                {/* Footer metadata */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-mono">
                  <span className="flex items-center gap-1">
                    <FileCode className="w-3 h-3 text-slate-400" />
                    {ev.affected_files.length} file{ev.affected_files.length !== 1 ? 's' : ''}
                  </span>
                  <span>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

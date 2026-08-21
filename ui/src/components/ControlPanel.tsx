import React, { useState } from 'react';
import { WireEvent } from '../types/telemetry';
import { Check, Undo2, OctagonAlert, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface ControlPanelProps {
  selectedStep: WireEvent | null;
  onSendAction: (action: string, payload?: unknown) => boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  selectedStep,
  onSendAction,
}) => {
  const [feedback, setFeedback] = useState<{ msg: string; type: 'success' | 'warn' | 'danger' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'warn' | 'danger') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleApproveMerge = () => {
    if (!selectedStep) return;
    onSendAction('APPROVE_MERGE', { step_id: selectedStep.step_id });
    showToast(`Step ${selectedStep.step_id} approved and merged to workspace.`, 'success');
  };

  const handleStepUndo = () => {
    if (!selectedStep) return;
    onSendAction('ROLLBACK_STEP', { step_id: selectedStep.step_id });
    showToast(`Rollback executed for step ${selectedStep.step_id}.`, 'warn');
  };

  const handlePanicKill = () => {
    onSendAction('PANIC', { reason: 'Operator initiated emergency kill' });
    showToast('🚨 EMERGENCY KILL: Agent runtime halted & worktree locked.', 'danger');
  };

  return (
    <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Step Info / Feedback */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Operator Intervention Deck
          </div>
          {feedback ? (
            <div className={`text-xs font-mono font-medium flex items-center gap-1.5 mt-0.5 ${
              feedback.type === 'success' ? 'text-emerald-400' :
              feedback.type === 'warn' ? 'text-amber-400' : 'text-rose-400 font-bold'
            }`}>
              {feedback.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5" />}
              {feedback.type === 'danger' && <OctagonAlert className="w-3.5 h-3.5" />}
              {feedback.msg}
            </div>
          ) : (
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              Target: <span className="text-slate-200">{selectedStep ? `${selectedStep.step_id} (${selectedStep.session_id})` : 'No step selected'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
        {/* Approve & Merge */}
        <button
          onClick={handleApproveMerge}
          disabled={!selectedStep}
          className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-xs shadow-md shadow-emerald-900/30 transition-all active:scale-95"
        >
          <Check className="w-4 h-4" />
          <span>Approve & Merge</span>
        </button>

        {/* Step Undo */}
        <button
          onClick={handleStepUndo}
          disabled={!selectedStep}
          className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 border border-slate-700 font-medium text-xs shadow-md transition-all active:scale-95"
        >
          <Undo2 className="w-4 h-4" />
          <span>Step Undo</span>
        </button>

        {/* Physical Panic / Kill Process Button */}
        <button
          onClick={handlePanicKill}
          className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-900/40 border border-rose-500 animate-pulse transition-all active:scale-95"
        >
          <OctagonAlert className="w-4 h-4" />
          <span>KILL PROCESS</span>
        </button>
      </div>
    </div>
  );
};

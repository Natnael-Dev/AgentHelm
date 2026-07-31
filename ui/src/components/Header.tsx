import React from 'react';
import { Shield, Radio, Activity, RefreshCw, Trash2, Cpu } from 'lucide-react';
import { ConnectionStatus } from '../types/telemetry';

interface HeaderProps {
  status: ConnectionStatus;
  sessionCount: number;
  totalEvents: number;
  onClear: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  sessionCount,
  totalEvents,
  onClear,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-emerald-500 text-emerald-300 border-emerald-500/30';
      case 'connecting':
      case 'reconnecting':
        return 'bg-amber-500 text-amber-300 border-amber-500/30';
      default:
        return 'bg-rose-500 text-rose-300 border-rose-500/30';
    }
  };

  return (
    <header className="h-16 px-6 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-20">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/5">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg text-slate-100 tracking-tight">AgentGuard Live</h1>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              v1.0.0-rc2
            </span>
          </div>
          <p className="text-xs text-slate-400">Autonomous Coding Agent Runtime & Telemetry Cockpit</p>
        </div>
      </div>

      {/* Center Status Indicators */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono">
          <span className="flex h-2 w-2 relative">
            {status === 'connected' && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${status === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          </span>
          <span className="capitalize text-slate-300">{status}</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">ws://127.0.0.1:8765</span>
        </div>

        <div className="hidden md:flex items-center gap-3 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5 bg-slate-800/50 px-2.5 py-1 rounded border border-slate-800">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>BAR Sandbox: <strong className="text-slate-200">Active</strong></span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800/50 px-2.5 py-1 rounded border border-slate-800">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Events: <strong className="text-slate-200">{totalEvents}</strong></span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onClear}
          title="Clear Event History"
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

import React, { useMemo } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { WireEvent } from '../types/telemetry';
import { GitCompare, FileCode, ShieldCheck, ShieldAlert } from 'lucide-react';

interface MonacoDiffProps {
  step: WireEvent | null;
}

// Utility to parse unified diff patch into Original and Modified buffer text
function parseDiffBuffers(diffPatch: string) {
  if (!diffPatch || !diffPatch.trim()) {
    return {
      original: '// No code modifications in this step',
      modified: '// No code modifications in this step',
    };
  }

  const lines = diffPatch.split('\n');
  const originalLines: string[] = [];
  const modifiedLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('---') || line.startsWith('+++') || line.startsWith('diff --git') || line.startsWith('index ')) {
      continue;
    }
    if (line.startsWith('-')) {
      originalLines.push(line.slice(1));
    } else if (line.startsWith('+')) {
      modifiedLines.push(line.slice(1));
    } else if (line.startsWith('@@')) {
      originalLines.push(`// --- ${line} ---`);
      modifiedLines.push(`// --- ${line} ---`);
    } else {
      // Context line
      originalLines.push(line.startsWith(' ') ? line.slice(1) : line);
      modifiedLines.push(line.startsWith(' ') ? line.slice(1) : line);
    }
  }

  return {
    original: originalLines.join('\n') || '// No deleted lines',
    modified: modifiedLines.join('\n') || '// No added lines',
  };
}

export const MonacoDiff: React.FC<MonacoDiffProps> = ({ step }) => {
  const { original, modified } = useMemo(() => {
    return parseDiffBuffers(step?.diff_patch || '');
  }, [step?.diff_patch]);

  const fileTitle = step?.affected_files?.[0] || 'sandbox-changes.diff';
  const isCritical = step?.security_assessment?.risk_level === 'CRITICAL';

  return (
    <div className="flex flex-col h-full bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
      {/* Diff Header */}
      <div className="p-3 px-4 bg-slate-800/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <GitCompare className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Monaco Diff Inspector
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-xs font-mono text-indigo-300 truncate bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            {fileTitle}
          </span>
        </div>

        {step && (
          <div className="flex items-center gap-2 font-mono text-xs">
            {isCritical ? (
              <span className="flex items-center gap-1 text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">
                <ShieldAlert className="w-3.5 h-3.5" /> Blocked Step
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" /> Sandboxed
              </span>
            )}
          </div>
        )}
      </div>

      {/* Editor Body */}
      <div className="flex-1 w-full bg-[#1e1e1e]">
        <DiffEditor
          height="100%"
          language="typescript"
          theme="vs-dark"
          original={original}
          modified={modified}
          options={{
            readOnly: true,
            renderSideBySide: true,
            minimap: { enabled: false },
            fontSize: 12,
            fontFamily: '"JetBrains Mono", Menlo, monospace',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            diffWordWrap: 'on',
            lineNumbers: 'on',
          }}
        />
      </div>

      {/* Footer Details */}
      <div className="p-2 px-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span>Active Step: <strong className="text-slate-200">{step?.step_id || 'None'}</strong></span>
          <span>Affected Files: <strong className="text-slate-200">{step?.affected_files.length || 0}</strong></span>
        </div>
        <div className="text-[11px] text-slate-500">
          Git Worktree Differential Engine v1.0
        </div>
      </div>
    </div>
  );
};

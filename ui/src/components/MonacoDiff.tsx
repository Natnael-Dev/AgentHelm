import React, { useMemo } from 'react';
import { DiffEditor, Monaco } from '@monaco-editor/react';
import { WireEvent } from '../types/telemetry';

interface MonacoDiffProps {
  step: WireEvent | null;
}

function detectLanguage(filePath?: string): string {
  if (!filePath) return 'typescript';
  const ext = filePath.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'rs':
      return 'rust';
    case 'go':
      return 'go';
    case 'py':
      return 'python';
    case 'json':
      return 'json';
    case 'md':
      return 'markdown';
    case 'sh':
    case 'bash':
      return 'shell';
    case 'css':
      return 'css';
    case 'html':
      return 'html';
    default:
      return 'typescript';
  }
}

function parseDiffBuffers(diffPatch: string) {
  if (!diffPatch || !diffPatch.trim()) {
    return {
      original: `// ─── ORIGINAL BASELINE ───\nimport jwt from 'jsonwebtoken'\n\ninterface TokenPayload {\n  userId: string\n  role: string\n  exp?: number\n}\n\nexport function verifyToken(token: string): TokenPayload | false {\n  const payload = jwt.decode(token)\n  if (!payload.exp) return false\n  const secret = process.env.JWT_SECRET\n  return jwt.verify(token, secret)\n}`,
      modified: `// ─── MODIFIED WORKTREE ───\nimport jwt from 'jsonwebtoken'\nimport { TokenExpiredError } from './errors'\n\ninterface TokenPayload {\n  userId: string\n  role: string\n  exp: number\n  iat: number\n}\n\nexport function verifyToken(token: string): TokenPayload {\n  const payload = jwt.decode(token, { complete: true })\n  if (!payload?.exp || payload.exp < Date.now() / 1000)\n    throw new TokenExpiredError('Token has expired')\n  const secret = process.env.JWT_SECRET ?? ''\n  if (!secret) throw new Error('JWT_SECRET not configured')\n  return jwt.verify(token, secret, { algorithms: ['HS256'] })\n}`,
      additions: 12,
      deletions: 4,
    };
  }

  const lines = diffPatch.split('\n');
  const originalLines: string[] = [];
  const modifiedLines: string[] = [];
  let additions = 0;
  let deletions = 0;

  for (const line of lines) {
    if (line.startsWith('---') || line.startsWith('+++') || line.startsWith('diff --git') || line.startsWith('index ')) {
      continue;
    }
    if (line.startsWith('-')) {
      originalLines.push(line.slice(1));
      deletions++;
    } else if (line.startsWith('+')) {
      modifiedLines.push(line.slice(1));
      additions++;
    } else if (line.startsWith('@@')) {
      originalLines.push(`// --- ${line} ---`);
      modifiedLines.push(`// --- ${line} ---`);
    } else {
      originalLines.push(line.startsWith(' ') ? line.slice(1) : line);
      modifiedLines.push(line.startsWith(' ') ? line.slice(1) : line);
    }
  }

  return {
    original: originalLines.join('\n') || '// Clean state',
    modified: modifiedLines.join('\n') || '// Clean state',
    additions,
    deletions,
  };
}

export const MonacoDiff: React.FC<MonacoDiffProps> = ({ step }) => {
  const { original, modified, additions, deletions } = useMemo(() => {
    return parseDiffBuffers(step?.diff_patch || '');
  }, [step?.diff_patch]);

  const fileTitle = step?.affected_files?.[0] || 'src/auth/jwt.ts';
  const language = detectLanguage(fileTitle);

  const handleEditorWillMount = (monaco: Monaco) => {
    monaco.editor.defineTheme('agentguard-brutalist', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: 'EDE6D6', fontStyle: 'bold' },
        { token: 'string', foreground: 'E4572E' },
        { token: 'type', foreground: 'E8A33D' },
        { token: 'number', foreground: 'E8A33D' },
        { token: 'delimiter', foreground: '3A3730' },
        { token: 'comment', foreground: '4A4640', fontStyle: 'italic' },
      ],
      colors: {
        'editor.background': '#171512',
        'editor.foreground': '#EDE6D6',
        'editor.lineHighlightBackground': '#1A1814',
        'editorLineNumber.foreground': '#3A3730',
        'editorLineNumber.activeForeground': '#8A8578',
        'diffEditor.insertedTextBackground': '#8AB66122',
        'diffEditor.removedTextBackground': '#D6453322',
        'diffEditor.insertedLineBackground': '#8AB66118',
        'diffEditor.removedLineBackground': '#D6453318',
        'editorGutter.background': '#171512',
        'scrollbarSlider.background': '#2A2721',
        'scrollbarSlider.hoverBackground': '#4A4640',
        'scrollbarSlider.activeBackground': '#E4572E',
      },
    });
  };

  return (
    <div className="bg-[#171512] border border-[#2A2721] shadow-[4px_4px_0_#000] h-full flex flex-col overflow-hidden select-none">
      {/* Tab Bar */}
      <div className="bg-[#0A0906] border-b border-[#2A2721] flex items-end px-2 pt-1.5 shrink-0">
        <div className="bg-[#171512] border-t border-l border-r border-[#2A2721] border-b border-b-[#171512] px-3 py-1 font-mono text-[9px] text-[#EDE6D6] flex items-center gap-2">
          <span className="text-[#E4572E] text-[8px]">◈</span>
          <span>{fileTitle}</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 pb-1.5 pr-2 font-mono text-[9px]">
          <span className="text-[#8AB661]">+{additions}</span>
          <span className="text-[#D64533]">−{deletions}</span>
          <div className="w-[1px] h-3.5 bg-[#2A2721] mx-1" />
          <span className="text-[8px] text-[#8A8578]">
            {fileTitle.split('/').pop()}
          </span>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-2 bg-[#0E0D0B] border-b border-[#2A2721] shrink-0 font-mono text-[7px] text-[#8A8578] tracking-[0.12em]">
        <div className="px-3 py-1 border-r border-[#2A2721]">
          ORIGINAL ← BASE
        </div>
        <div className="px-3 py-1">
          MODIFIED ← PATCHED
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 w-full bg-[#171512] relative overflow-hidden">
        {/* CRT Scanline overlay */}
        <div className="absolute inset-0 pointer-events-none z-10 scanlines-dark" />

        <DiffEditor
          height="100%"
          language={language}
          theme="agentguard-brutalist"
          beforeMount={handleEditorWillMount}
          original={original}
          modified={modified}
          options={{
            readOnly: true,
            renderSideBySide: true,
            minimap: { enabled: false },
            fontSize: 11,
            fontFamily: '"Space Mono", Menlo, monospace',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            diffWordWrap: 'on',
            lineNumbers: 'on',
            renderIndicators: true,
            originalEditable: false,
            glyphMargin: false,
            folding: false,
          }}
        />
      </div>

      {/* Footer */}
      <div className="h-7 px-3 border-t border-[#2A2721] bg-[#0A0906] flex items-center gap-3 shrink-0 font-mono text-[7px] tracking-[0.1em] text-[#8A8578]">
        <span>DIFF ENGINE: UNIFIED</span>
        <span className="text-[#2A2721]">•</span>
        <span className="text-[#8AB661]">POLICY CHECK: PASSED ✓</span>
        <div className="flex-1" />
        <span className="text-[#4A4640]">CONTEXT: 3 LINES</span>
        <span className="text-[#4A4640]">• ENCODING: UTF-8</span>
      </div>
    </div>
  );
};

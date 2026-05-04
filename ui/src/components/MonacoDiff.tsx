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
        { token: 'keyword', foreground: 'D8CDB7', fontStyle: 'bold' },
        { token: 'string', foreground: 'F05A2A' },
        { token: 'type', foreground: 'F0A83A' },
        { token: 'number', foreground: 'F0A83A' },
        { token: 'delimiter', foreground: '5A5040' },
        { token: 'comment', foreground: '827869', fontStyle: 'italic' },
      ],
      colors: {
        'editor.background': '#12100D',
        'editor.foreground': '#C8BDA8',
        'editor.lineHighlightBackground': '#1A1712',
        'editorLineNumber.foreground': '#5A5040',
        'editorLineNumber.activeForeground': '#B8AD99',
        'diffEditor.insertedTextBackground': '#9AC36A28',
        'diffEditor.removedTextBackground': '#E14A3628',
        'diffEditor.insertedLineBackground': '#9AC36A1A',
        'diffEditor.removedLineBackground': '#E14A361A',
        'editorGutter.background': '#12100D',
        'scrollbarSlider.background': '#3A3328',
        'scrollbarSlider.hoverBackground': '#827869',
        'scrollbarSlider.activeBackground': '#F05A2A',
      },
    });
  };

  return (
    <div className="bg-[#16130F] border border-[#3A3328] shadow-[4px_4px_0_#000] h-full flex flex-col overflow-hidden select-none">
      {/* Tab Bar */}
      <div className="bg-[#0A0906] border-b border-[#3A3328] flex items-end px-3 pt-2 shrink-0">
        <div className="bg-[#16130F] border-t border-l border-r border-[#3A3328] border-b border-b-[#16130F] px-4 py-1.5 font-mono text-[14px] text-[#D8CDB7] flex items-center gap-2.5">
          <span className="text-[#F05A2A] text-[13px]">◈</span>
          <span>{fileTitle}</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-3 pb-2 pr-3 font-mono text-[13px]">
          <span className="text-[#9AC36A] font-bold">+{additions}</span>
          <span className="text-[#E14A36] font-bold">−{deletions}</span>
          <div className="w-[1px] h-4 bg-[#3A3328] mx-0.5" />
          <span className="text-[13px] text-[#B8AD99]">
            {fileTitle.split('/').pop()}
          </span>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-2 bg-[#0A0908] border-b border-[#3A3328] shrink-0 font-mono text-[12px] text-[#B8AD99] tracking-[0.1em] font-bold">
        <div className="px-4 py-1.5 border-r border-[#3A3328]">
          ORIGINAL ← BASE
        </div>
        <div className="px-4 py-1.5">
          MODIFIED ← PATCHED
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 w-full bg-[#12100D] relative overflow-hidden">
        {/* CRT Scanline overlay (subtle) */}
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
            fontSize: 14,
            lineHeight: 22,
            fontFamily: '"Space Mono", "JetBrains Mono", Menlo, monospace',
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
      <div className="h-9 px-4 border-t border-[#3A3328] bg-[#0A0906] flex items-center gap-4 shrink-0 font-mono text-[12px] tracking-[0.08em] text-[#B8AD99] font-bold">
        <span>DIFF ENGINE: UNIFIED</span>
        <span className="text-[#3A3328]">•</span>
        <span className="text-[#9AC36A]">POLICY CHECK: PASSED ✓</span>
        <div className="flex-1" />
        <span className="text-[#827869]">CONTEXT: 3 LINES</span>
        <span className="text-[#827869]">• ENCODING: UTF-8</span>
      </div>
    </div>
  );
};

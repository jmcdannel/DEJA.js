interface TerminalLine {
  type: 'command' | 'output' | 'comment' | 'success' | 'info';
  text: string;
}

interface TerminalBlockProps {
  title?: string;
  lines: TerminalLine[];
  className?: string;
}

export default function TerminalBlock({ title = 'terminal', lines, className }: TerminalBlockProps) {
  const colorMap: Record<TerminalLine['type'], string> = {
    command: 'text-deja-cyan',
    output: 'text-gray-300',
    comment: 'text-gray-600',
    success: 'text-deja-lime',
    info: 'text-deja-magenta',
  };

  const prefixMap: Record<TerminalLine['type'], string> = {
    command: '$ ',
    output: '  ',
    comment: '# ',
    success: '✓ ',
    info: '→ ',
  };

  return (
    <div className={`bg-gray-950 rounded-xl border border-gray-800 overflow-hidden font-mono text-sm ${className ?? ''}`}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-gray-900">
        <div className="w-3 h-3 rounded-full bg-red-500/70" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <div className="w-3 h-3 rounded-full bg-green-500/70" />
        <span className="ml-2 text-xs text-gray-500">{title}</span>
      </div>
      <div className="p-4 space-y-1">
        {lines.map((line, i) => (
          <div key={i} className={colorMap[line.type]}>
            <span className="opacity-50">{prefixMap[line.type]}</span>
            {line.text}
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

interface TerminalMockupProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function TerminalMockup({ title = 'Terminal', children, className = '' }: TerminalMockupProps) {
  return (
    <div className={`rounded-xl border border-gray-700 bg-gray-900 shadow-2xl overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/80 border-b border-gray-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-gray-500 font-mono ml-2">{title}</span>
      </div>
      <div className="p-4 font-mono text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );
}

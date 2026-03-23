interface SectionLabelProps {
  children: React.ReactNode;
  color?: 'cyan' | 'magenta' | 'lime';
}

const colorMap = {
  cyan: 'text-deja-cyan border-deja-cyan/30 bg-deja-cyan/5',
  magenta: 'text-deja-magenta border-deja-magenta/30 bg-deja-magenta/5',
  lime: 'text-deja-lime border-deja-lime/30 bg-deja-lime/5',
};

export default function SectionLabel({ children, color = 'cyan' }: SectionLabelProps) {
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-widest ${colorMap[color]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {children}
    </span>
  );
}

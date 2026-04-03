import React from 'react';

const colorMap = {
  lime: { border: 'border-deja-lime/30', bg: 'bg-deja-lime/10', text: 'text-deja-lime' },
  cyan: { border: 'border-deja-cyan/30', bg: 'bg-deja-cyan/10', text: 'text-deja-cyan' },
};

export default function Step({
  number,
  title,
  children,
  color = 'lime',
}: {
  number: number;
  title: string;
  children: React.ReactNode;
  color?: 'lime' | 'cyan';
}) {
  const { border, bg, text } = colorMap[color];
  return (
    <div className="relative pl-14">
      <div className={`absolute left-0 top-0 w-10 h-10 rounded-full border ${border} ${bg} flex items-center justify-center shrink-0`}>
        <span className={`${text} font-bold text-sm font-mono`}>0{number}</span>
      </div>
      <h3 className="text-white font-bold text-xl mb-3">{title}</h3>
      <div className="text-gray-300 leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

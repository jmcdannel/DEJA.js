import React from 'react';

const colorMap = {
  lime: { bg: 'bg-deja-lime/5', border: 'border-deja-lime/20' },
  cyan: { bg: 'bg-deja-cyan/5', border: 'border-deja-cyan/20' },
};

export default function Callout({
  emoji,
  children,
  color = 'lime',
}: {
  emoji: string;
  children: React.ReactNode;
  color?: 'lime' | 'cyan';
}) {
  const { bg, border } = colorMap[color];
  return (
    <div className={`flex gap-3 p-4 rounded-lg ${bg} ${border} my-4`}>
      <span className="text-lg shrink-0">{emoji}</span>
      <div className="text-sm text-gray-300 leading-relaxed">{children}</div>
    </div>
  );
}

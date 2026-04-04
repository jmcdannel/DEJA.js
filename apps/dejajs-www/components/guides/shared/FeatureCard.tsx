import React from 'react';

export default function FeatureCard({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-800/60 bg-gray-900/40 hover:border-deja-cyan/20 hover:bg-gray-900/60 transition-all">
      <span className="text-lg shrink-0 mt-0.5">{emoji}</span>
      <span className="text-sm text-gray-300">{text}</span>
    </div>
  );
}

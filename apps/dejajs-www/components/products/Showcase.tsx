// 🖼️ Two-column showcase: text on one side, visual on the other. Reversible.

import type { ReactNode } from 'react';
import type { ProductAccent } from './types';

interface ShowcaseProps {
  eyebrow?: string;
  heading: string;
  body: string | ReactNode;
  visual: ReactNode;
  reversed?: boolean;
  accent: ProductAccent;
  bullets?: string[];
}

export default function Showcase({
  eyebrow,
  heading,
  body,
  visual,
  reversed = false,
  accent,
  bullets,
}: ShowcaseProps) {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-10 items-center ${
            reversed ? 'md:[&>*:first-child]:order-2' : ''
          }`}
        >
          <div className="space-y-4">
            {eyebrow && (
              <span className={`text-xs tracking-[0.2em] uppercase font-mono ${accent.textClass}`}>
                {eyebrow}
              </span>
            )}
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{heading}</h2>
            {typeof body === 'string' ? (
              <p className="text-gray-400 text-lg leading-relaxed">{body}</p>
            ) : (
              body
            )}
            {bullets && (
              <ul className="space-y-2 mt-2 text-gray-400 list-disc list-inside">
                {bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex justify-center">{visual}</div>
        </div>
      </div>
    </section>
  );
}

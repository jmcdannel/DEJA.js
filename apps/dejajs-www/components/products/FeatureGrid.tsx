// 🎛️ Grid of feature cards. Each card has an emoji icon, title, and description.

import SectionHeading from './SectionHeading';
import type { Feature, ProductAccent } from './types';

interface FeatureGridProps {
  eyebrow?: string;
  heading?: string;
  kicker?: string;
  features: Feature[];
  accent: ProductAccent;
  columns?: 2 | 3;
}

export default function FeatureGrid({
  eyebrow = 'Capabilities',
  heading = 'Core capabilities',
  kicker,
  features,
  accent,
  columns = 2,
}: FeatureGridProps) {
  const gridClass = columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2';
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <SectionHeading
          eyebrow={eyebrow}
          heading={heading}
          kicker={kicker}
          accentClass={accent.textClass}
        />
        <div className={`grid grid-cols-1 ${gridClass} gap-8`}>
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 hover:border-slate-700 transition-colors"
            >
              <div className={`text-3xl mb-3 ${accent.textClass}`}>{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

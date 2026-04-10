// 🚂 Three-step EZ Consist walkthrough — the Throttle differentiator block.

import type { ProductAccent } from './types';
import SectionHeading from './SectionHeading';

interface EzConsistStep {
  number: string;
  title: string;
  description: string;
}

interface EzConsistStoryProps {
  accent: ProductAccent;
  steps?: EzConsistStep[];
}

const defaultSteps: EzConsistStep[] = [
  {
    number: '01',
    title: 'Pick your locomotives',
    description:
      'Tap the locomotives you want to run together. Each one lights up in your consist color.',
  },
  {
    number: '02',
    title: 'Choose the lead',
    description:
      'Tap to set the lead loco and flip orientation on any unit with one more tap.',
  },
  {
    number: '03',
    title: 'Drive as one',
    description:
      'Hit go. Every loco in the consist responds in lockstep — no CV programming required.',
  },
];

export default function EzConsistStory({ accent, steps = defaultSteps }: EzConsistStoryProps) {
  return (
    <section className="py-20 bg-slate-950/60 border-y border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <SectionHeading
          eyebrow="EZ Consist"
          heading="Build a consist in three taps."
          kicker="No decoder programming. No address math. Pick, lead, drive."
          accentClass={accent.textClass}
          align="center"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-8 flex flex-col gap-3"
            >
              <span className={`text-5xl font-mono font-bold opacity-30 ${accent.textClass}`}>
                {step.number}
              </span>
              <h3 className="text-xl font-bold text-white">{step.title}</h3>
              <p className="text-gray-400 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

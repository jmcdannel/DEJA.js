// 🚂 Four-step EZ Consist walkthrough — the Throttle differentiator block.

import Image from 'next/image';

import type { ProductAccent } from './types';
import SectionHeading from './SectionHeading';

interface EzConsistStep {
  number: string;
  title: string;
  description: string;
  image?: string;
}

interface EzConsistStoryProps {
  accent: ProductAccent;
  steps?: EzConsistStep[];
}

const defaultSteps: EzConsistStep[] = [
  {
    number: '01',
    title: 'Settings',
    description:
      'Open the consist settings on any throttle. No CV programming, no decoder address math.',
    image: '/screenshots/throttle_desktop_throttle.png',
  },
  {
    number: '02',
    title: 'Add Fwd / Bck',
    description:
      'Pick locos from your roster and drop them into the consist forward or backward — works with any DCC loco.',
    image: '/screenshots/throttle_desktop_roster.png',
  },
  {
    number: '03',
    title: 'Trim',
    description:
      'Nudge each loco a few steps faster or slower so the whole consist pulls together — no decoders to flash.',
    image: '/screenshots/throttle_desktop_throttle-list.png',
  },
  {
    number: '04',
    title: 'Go',
    description:
      'Drive the whole lashup as one. Edit, trim, add, or remove units on the go without stopping the train.',
    image: '/screenshots/throttle_desktop_conductor.png',
  },
];

export default function EzConsistStory({ accent, steps = defaultSteps }: EzConsistStoryProps) {
  return (
    <section className="py-20 bg-slate-950/60 border-y border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <SectionHeading
          eyebrow="EZ Consist"
          heading="Build a consist in four taps."
          kicker="No CV programming. Works with any DCC loco. Edit, trim, add, or remove on the go."
          accentClass={accent.textClass}
          align="center"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-8 flex flex-col gap-4"
            >
              <span className={`text-5xl font-mono font-bold opacity-30 ${accent.textClass}`}>
                {step.number}
              </span>
              <h3 className="text-xl font-bold text-white">{step.title}</h3>
              <p className="text-gray-400 leading-relaxed">{step.description}</p>
              {step.image ? (
                <div className="mt-2 overflow-hidden rounded-lg border border-slate-800/60 shadow-xl">
                  <Image
                    src={step.image}
                    alt={step.title}
                    width={800}
                    height={500}
                    className="w-full h-auto max-h-60 object-cover"
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

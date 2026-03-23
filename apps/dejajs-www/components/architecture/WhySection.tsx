'use client';

import AnimateIn from '../home/AnimateIn';

const techStack = [
  {
    label: 'TypeScript',
    desc: 'End-to-end type safety — from the server to every app.',
    color: 'text-blue-400',
    borderColor: 'border-blue-400/20',
    bgColor: 'bg-blue-400/5',
  },
  {
    label: 'Vue 3',
    desc: 'Reactive, component-driven UI with Composition API.',
    color: 'text-green-400',
    borderColor: 'border-green-400/20',
    bgColor: 'bg-green-400/5',
  },
  {
    label: 'WebSocket',
    desc: 'Real-time bidirectional — every device sees changes instantly.',
    color: 'text-deja-cyan',
    borderColor: 'border-deja-cyan/20',
    bgColor: 'bg-deja-cyan/5',
  },
  {
    label: 'Firebase',
    desc: 'Cloud sync, authentication, and real-time database.',
    color: 'text-yellow-400',
    borderColor: 'border-yellow-400/20',
    bgColor: 'bg-yellow-400/5',
  },
  {
    label: 'MQTT',
    desc: 'Lightweight IoT messaging for wireless device control.',
    color: 'text-purple-400',
    borderColor: 'border-purple-400/20',
    bgColor: 'bg-purple-400/5',
  },
  {
    label: 'Node.js',
    desc: 'Runs anywhere — laptop, Raspberry Pi, dedicated server.',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-400/20',
    bgColor: 'bg-emerald-400/5',
  },
];

const comparisons = [
  {
    label: 'vs. legacy desktop software',
    points: [
      'No Java runtime required — runs in any browser',
      'Multi-device by default, not single-screen',
      'Modern, touch-friendly interface — not desktop-era UI',
      'Cloud sync keeps your layout data safe and accessible',
      'Real-time updates across every connected device simultaneously',
    ],
  },
  {
    label: 'vs. standalone throttle apps',
    points: [
      'Not just a throttle — a complete platform',
      'Layout management, automation, effects, signals, sounds',
      'Works on any device with a browser — iOS, Android, desktop',
      'Arduino and Pico W expansion for physical IO control',
      'Cloud-powered roster, routes, and configuration management',
    ],
  },
];

export default function WhySection() {
  return (
    <section>
      {/* Intro */}
      <AnimateIn>
        <p className="text-xs text-deja-cyan font-mono tracking-[0.2em] uppercase mb-3">Why DEJA.js</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Built for today&apos;s layouts.
        </h2>
        <p className="text-gray-400 leading-relaxed mb-12 max-w-2xl">
          Model railroad control hasn&apos;t kept up with the rest of technology. Legacy tools were
          built for a different era — desktop-only, single-user, limited to throttle control.
          DEJA.js is what happens when you start fresh with a modern stack and an ambitious vision.
        </p>
      </AnimateIn>

      {/* Tech Stack Grid */}
      <AnimateIn delay={0.1}>
        <h3 className="text-xl font-bold text-white mb-6">The stack</h3>
      </AnimateIn>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
        {techStack.map((tech, i) => (
          <AnimateIn key={tech.label} delay={i * 0.08} direction="up">
            <div className={`rounded-xl border ${tech.borderColor} ${tech.bgColor} p-5 h-full`}>
              <p className={`${tech.color} font-bold font-mono text-sm mb-2`}>{tech.label}</p>
              <p className="text-gray-400 text-sm leading-relaxed">{tech.desc}</p>
            </div>
          </AnimateIn>
        ))}
      </div>

      {/* How it connects */}
      <AnimateIn delay={0.1}>
        <h3 className="text-xl font-bold text-white mb-4">How it all connects</h3>
        <p className="text-gray-400 leading-relaxed mb-8 max-w-2xl">
          Every piece of the stack has a purpose. TypeScript catches errors before they reach your
          layout. WebSocket delivers commands in milliseconds. Firebase keeps your roster and routes
          synced across every device. MQTT lets you place wireless IO devices anywhere on the layout
          without running wires. And the server ties it all together — one process that speaks every
          protocol your layout needs.
        </p>
      </AnimateIn>

      {/* Comparison cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {comparisons.map((comp, i) => (
          <AnimateIn key={comp.label} delay={i * 0.15} direction={i === 0 ? 'left' : 'right'}>
            <div className="rounded-xl border border-gray-700/50 bg-gray-800/30 p-6 h-full">
              <p className="text-white font-semibold mb-4">{comp.label}</p>
              <ul className="space-y-3">
                {comp.points.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="text-deja-cyan mt-0.5 shrink-0">→</span>
                    <span className="text-gray-300 text-sm">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimateIn>
        ))}
      </div>
    </section>
  );
}

import AnimateIn from './AnimateIn';
import SectionLabel from './SectionLabel';

interface Step {
  number: string;
  color: 'cyan' | 'magenta' | 'lime';
  label: string;
  description: string;
  icon: React.ReactNode;
  cta?: { label: string; href: string };
  command?: string;
}

const steps: Step[] = [
  {
    number: '01',
    color: 'cyan',
    label: 'Sign Up',
    description:
      'Create your free DEJA Cloud account. Your layout data, roster, and settings live in the cloud — accessible from any device.',
    icon: (
      <svg
        className="w-7 h-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
    cta: { label: 'Create Account', href: 'https://cloud.dejajs.com' },
  },
  {
    number: '02',
    color: 'magenta',
    label: 'Install',
    description:
      'One command installs DEJA Server on your computer. Plug in your DCC-EX CommandStation via USB and run deja init.',
    icon: (
      <svg
        className="w-7 h-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    command: 'curl -fsSL https://install.dejajs.com | bash',
  },
  {
    number: '03',
    color: 'lime',
    label: 'Run',
    description:
      'Open the Throttle app on any device — phone, tablet, or desktop. Your layout is live.',
    icon: (
      <svg
        className="w-7 h-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    cta: { label: 'Open Throttle', href: 'https://throttle.dejajs.com' },
  },
];

const colorTokens = {
  cyan: {
    border: 'border-deja-cyan/20',
    bg: 'bg-deja-cyan/5',
    iconBg: 'bg-deja-cyan/10',
    iconBorder: 'border-deja-cyan/20',
    iconText: 'text-deja-cyan',
    stepText: 'text-deja-cyan',
    ctaText: 'text-deja-cyan hover:text-deja-cyan/80',
    codeBorder: 'border-deja-cyan/20',
    codeBg: 'bg-deja-cyan/5',
    codeText: 'text-deja-cyan',
  },
  magenta: {
    border: 'border-deja-magenta/20',
    bg: 'bg-deja-magenta/5',
    iconBg: 'bg-deja-magenta/10',
    iconBorder: 'border-deja-magenta/20',
    iconText: 'text-deja-magenta',
    stepText: 'text-deja-magenta',
    ctaText: 'text-deja-magenta hover:text-deja-magenta/80',
    codeBorder: 'border-deja-magenta/20',
    codeBg: 'bg-deja-magenta/5',
    codeText: 'text-deja-magenta',
  },
  lime: {
    border: 'border-deja-lime/20',
    bg: 'bg-deja-lime/5',
    iconBg: 'bg-deja-lime/10',
    iconBorder: 'border-deja-lime/20',
    iconText: 'text-deja-lime',
    stepText: 'text-deja-lime',
    ctaText: 'text-deja-lime hover:text-deja-lime/80',
    codeBorder: 'border-deja-lime/20',
    codeBg: 'bg-deja-lime/5',
    codeText: 'text-deja-lime',
  },
} as const;

export default function QuickStartSection() {
  return (
    <section className="bg-slate-900/50 rounded-2xl px-6 py-14 md:px-12">
      <div className="text-center space-y-4 mb-12">
        <AnimateIn>
          <SectionLabel color="cyan">Quick Start</SectionLabel>
        </AnimateIn>
        <AnimateIn delay={0.1}>
          <h2 className="font-display text-3xl md:text-4xl text-white tracking-tight">
            Up and running in 3 steps.
          </h2>
        </AnimateIn>
        <AnimateIn delay={0.15}>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            No config files. No drivers. Just plug in and go.
          </p>
        </AnimateIn>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Desktop connector line */}
        <div
          className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-deja-cyan/30 via-deja-magenta/30 to-deja-lime/30"
          aria-hidden="true"
        />

        {steps.map((step, i) => {
          const tokens = colorTokens[step.color];
          return (
            <AnimateIn key={step.number} delay={i * 0.15}>
              <article
                className={`relative flex flex-col gap-5 rounded-2xl border p-6 h-full ${tokens.border} ${tokens.bg}`}
              >
                {/* Step number + icon row */}
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-xl border flex items-center justify-center shrink-0 ${tokens.iconBg} ${tokens.iconBorder} ${tokens.iconText}`}
                  >
                    {step.icon}
                  </div>
                  <span
                    className={`font-mono text-3xl font-bold leading-none select-none ${tokens.stepText} opacity-40`}
                  >
                    {step.number}
                  </span>
                </div>

                {/* Label */}
                <h3 className="text-white font-bold text-lg leading-snug">
                  {step.label}
                </h3>

                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed flex-1">
                  {step.description}
                </p>

                {/* Install command block */}
                {step.command && (
                  <div
                    className={`rounded-lg border px-4 py-3 font-mono text-xs break-all ${tokens.codeBorder} ${tokens.codeBg} ${tokens.codeText}`}
                  >
                    <span className="opacity-50 select-none mr-1">$</span>
                    {step.command}
                  </div>
                )}

                {/* CTA link */}
                {step.cta && (
                  <a
                    href={step.cta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 text-sm font-semibold transition-colors ${tokens.ctaText}`}
                  >
                    {step.cta.label}
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </a>
                )}
              </article>
            </AnimateIn>
          );
        })}
      </div>
    </section>
  );
}

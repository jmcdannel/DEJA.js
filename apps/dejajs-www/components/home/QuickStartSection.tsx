import AnimateIn from './AnimateIn';
import SectionLabel from './SectionLabel';
import FallingStars from './FallingStars';
import CopyButton from './CopyButton';
import PricingModal from './PricingModal';
import ThrottleLaunchQR from './ThrottleLaunchQR';

interface Step {
  number: string;
  color: 'cyan' | 'magenta' | 'lime';
  label: string;
  description: React.ReactNode;
  icon: React.ReactNode;
  cta?: { label: string; href: string; variant?: 'link' | 'button'; color?: 'cyan' | 'lime' };
  command?: string;
  pricingLink?: boolean;
  showQR?: boolean;
}

const steps: Step[] = [
  {
    number: '01',
    color: 'cyan',
    label: 'Sign Up',
    description:
      'Create your free DEJA Cloud account. Choose a plan that fits your layout. Your roster, settings, and layout data sync instantly across every device.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    cta: { label: 'Sign Up', href: 'https://cloud.dejajs.com', variant: 'button', color: 'cyan' },
    pricingLink: true,
  },
  {
    number: '02',
    color: 'magenta',
    label: 'Install the Server',
    description:
      <>Plug in your DCC-EX CommandStation via USB and install the CLI. Upon successful installation, the installer will automatically run <code className="text-deja-lime font-mono text-xs">deja start</code> for you.</>,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    command: 'curl -fsSL https://install.dejajs.com | bash',
  },
  {
    number: '03',
    color: 'lime',
    label: 'Run',
    description:
      'Open the Throttle app on any device — phone, tablet, or desktop. Scan the QR code to launch it instantly on your phone.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    cta: { label: 'Launch Throttle App', href: 'https://throttle.dejajs.com', variant: 'button' },
    showQR: true,
  },
];

const colorTokens = {
  cyan: {
    number: 'text-deja-cyan',
    iconBg: 'bg-deja-cyan/10 border-deja-cyan/20 text-deja-cyan',
    bar: 'bg-deja-cyan',
    cta: 'text-deja-cyan hover:text-deja-cyan/70',
    terminalBg: 'bg-gray-950 border-deja-magenta/30 text-deja-magenta',
    promptColor: 'text-deja-magenta/60',
  },
  magenta: {
    number: 'text-deja-magenta',
    iconBg: 'bg-deja-magenta/10 border-deja-magenta/20 text-deja-magenta',
    bar: 'bg-deja-magenta',
    cta: 'text-deja-magenta hover:text-deja-magenta/70',
    terminalBg: 'bg-gray-950 border-deja-magenta/30 text-deja-magenta',
    promptColor: 'text-deja-magenta/60',
  },
  lime: {
    number: 'text-deja-lime',
    iconBg: 'bg-deja-lime/10 border-deja-lime/20 text-deja-lime',
    bar: 'bg-deja-lime',
    cta: 'text-deja-lime hover:text-deja-lime/70',
    terminalBg: 'bg-gray-950 border-deja-magenta/30 text-deja-magenta',
    promptColor: 'text-deja-magenta/60',
  },
} as const;

export default function QuickStartSection() {
  return (
    <section className="relative py-20 px-4 sm:px-8 overflow-hidden">
      {/* Falling stars background */}
      <FallingStars />

      {/* Dark overlay to keep content readable over photo */}
      <div className="absolute inset-0 bg-gray-950/50 pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="text-center space-y-4 mb-14">
          <AnimateIn>
            <SectionLabel color="cyan">Quick Start</SectionLabel>
          </AnimateIn>
          <AnimateIn delay={0.1}>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Up and running in 3 steps.
            </h2>
          </AnimateIn>
        </div>

        <div className="flex flex-col gap-6">
          {steps.map((step, i) => {
            const tokens = colorTokens[step.color];
            return (
              <AnimateIn key={step.number} delay={i * 0.12}>
                <article className="flex gap-5 sm:gap-6 items-start bg-gray-950/60 backdrop-blur-sm rounded-2xl px-4 pt-4 border border-gray-800/50">
                  {/* Step icon + vertical bar */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border flex items-center justify-center ${tokens.iconBg}`}>
                      {step.icon}
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`w-px flex-1 min-h-[2rem] opacity-20 ${tokens.bar}`} />
                    )}
                  </div>

                  {/* Content + QR flex row */}
                  <div className="flex flex-1 min-w-0 gap-6 pb-6">
                    <div className="flex flex-col gap-3 flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className={`font-mono text-xs font-bold opacity-50 ${tokens.number}`}>{step.number}</span>
                        <h3 className="text-white font-bold text-lg">{step.label}</h3>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>

                      {step.command && (
                        <div className="rounded-lg border border-gray-700 bg-gray-950 overflow-hidden">
                          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-800 bg-gray-900">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                            <span className="ml-2 text-gray-500 text-xs font-mono">bash</span>
                          </div>
                          <div className="flex items-center gap-2 px-4 py-3">
                            <span className="text-deja-lime/60 font-mono text-xs select-none shrink-0">$</span>
                            <span className="font-mono text-xs text-deja-lime break-all flex-1">{step.command}</span>
                            <CopyButton text={step.command} />
                          </div>
                        </div>
                      )}

                      {step.command && (
                        <a
                          href="/guides/getting-started"
                          className="text-xs text-gray-500 hover:text-deja-cyan transition-colors"
                        >
                          Need help? Read the Getting Started guide →
                        </a>
                      )}

                      <div className="flex flex-wrap items-center gap-4">
                        {step.cta && (
                          step.cta.variant === 'button' ? (
                            <a
                              href={step.cta.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-semibold transition-colors ${
                                step.cta.color === 'cyan'
                                  ? 'border-deja-cyan text-deja-cyan hover:bg-deja-cyan/10'
                                  : 'border-deja-lime text-deja-lime hover:bg-deja-lime/10'
                              }`}
                            >
                              {step.cta.label}
                            </a>
                          ) : (
                            <a
                              href={step.cta.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-sm font-semibold transition-colors ${tokens.cta}`}
                            >
                              {step.cta.label}
                            </a>
                          )
                        )}
                        {step.pricingLink && <PricingModal />}
                      </div>

                      {step.showQR && (
                        <div className="sm:hidden flex justify-center">
                          <ThrottleLaunchQR size={88} label="Scan to open on phone" />
                        </div>
                      )}
                    </div>

                    {step.showQR && (
                      <div className="hidden sm:flex items-center shrink-0 px-2">
                        <ThrottleLaunchQR size={88} label="Scan to open on phone" />
                      </div>
                    )}
                  </div>
                </article>
              </AnimateIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

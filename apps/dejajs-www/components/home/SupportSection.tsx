import AnimateIn from './AnimateIn';
import SectionLabel from './SectionLabel';

const supportOptions = [
  {
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
      </svg>
    ),
    color: 'text-deja-magenta',
    borderColor: 'border-deja-magenta/20',
    bgColor: 'bg-deja-magenta/5',
    title: 'Community (Discord)',
    description: 'Ask questions, share layouts, and connect with other DEJA.js users. Free for all.',
    cta: { label: 'Join Discord →', href: '#' },
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    color: 'text-deja-cyan',
    borderColor: 'border-deja-cyan/20',
    bgColor: 'bg-deja-cyan/5',
    title: 'AI Chat Support',
    description: 'Get instant answers about setup, configuration, and troubleshooting from our AI assistant.',
    badge: 'Coming Soon',
    cta: null,
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    ),
    color: 'text-deja-lime',
    borderColor: 'border-deja-lime/20',
    bgColor: 'bg-deja-lime/5',
    title: 'Support Tickets',
    description: 'Paid plans include support tickets with a guaranteed response time. Priority handling for Engineer and Conductor.',
    cta: { label: 'View Plans →', href: '/pricing' },
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    color: 'text-deja-magenta',
    borderColor: 'border-deja-magenta/20',
    bgColor: 'bg-deja-magenta/5',
    title: 'Consulting Services',
    description: 'Per-incident help, prepaid hours, or direct consultation with Track and Trestle Technology for complex layouts and custom integrations.',
    cta: { label: 'Get in Touch →', href: 'https://trackandtrestletech.com', external: true },
  },
];

export default function SupportSection() {
  return (
    <section className="py-20 px-4 sm:px-8 bg-slate-900/60">
      <div className="max-w-5xl mx-auto">
        <AnimateIn className="text-center space-y-4 mb-12">
          <SectionLabel color="cyan">Support</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Help when you need it.
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From community forums to hands-on consulting — we&apos;ve got you covered.
          </p>
        </AnimateIn>

        <div className="grid sm:grid-cols-2 gap-5">
          {supportOptions.map((option, i) => (
            <AnimateIn key={option.title} delay={i * 0.08}>
              <div className={`h-full rounded-2xl border ${option.borderColor} ${option.bgColor} p-6 flex flex-col gap-4 backdrop-blur-sm`}>
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${option.color} ${option.borderColor} bg-black/20`}>
                    {option.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-white font-bold">{option.title}</h3>
                      {option.badge && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-deja-cyan/30 text-deja-cyan/70">
                          {option.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed mt-1">{option.description}</p>
                  </div>
                </div>
                {option.cta && (
                  <a
                    href={option.cta.href}
                    {...(option.cta.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className={`mt-auto text-sm font-semibold transition-colors ${option.color} hover:opacity-70`}
                  >
                    {option.cta.label}
                  </a>
                )}
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}

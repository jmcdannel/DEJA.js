import Link from 'next/link';
import AnimateIn from './AnimateIn';
import Logo from '../Logo';
import HomepageHeroAnimation from './HomepageHeroAnimation';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen bg-gray-950 bg-grid-dark overflow-hidden flex flex-col">
      {/* Background glow orbs */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(0,229,255,0.12) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(213,0,249,0.1) 0%, transparent 70%)',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-24 pb-16 flex-1 flex flex-col justify-center">
        {/* Two-column layout — animation gets the larger share on lg+ to
            leave room for the step labels flanking the right-column pipeline. */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] items-center gap-12">
          {/* Left: text column */}
          <div className="flex flex-col gap-6">
            <AnimateIn delay={0.1}>
              <Logo size="2xl" />
            </AnimateIn>

            <AnimateIn delay={0.2}>
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl leading-none tracking-tight text-white"
                style={{ fontFamily: 'var(--font-bebas-neue)' }}
              >
                Simple to start. Built to grow.
                <br />
                <span className="text-deja-cyan">The cloud platform for DCC-EX.</span>
              </h1>
            </AnimateIn>

            <AnimateIn delay={0.3}>
              <p className="text-base sm:text-lg text-gray-400 leading-relaxed max-w-md">
                DEJA.js connects your DCC-EX CommandStation to every device on
                your network. Throttle, manage, and automate your layout from
                any browser — no app store required.
              </p>
            </AnimateIn>

            <AnimateIn delay={0.4}>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-deja-lime text-gray-950 font-bold text-sm glow-lime hover:opacity-90 transition-opacity"
                >
                  Get Started
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg border border-gray-700 text-gray-300 font-semibold text-sm hover:border-deja-cyan hover:text-deja-cyan transition-colors"
                >
                  See the Docs
                </Link>
              </div>
              <p className="mt-4 text-xs text-gray-600 tracking-wide">
                Web app · iOS &amp; Android coming soon · No app store required
              </p>
            </AnimateIn>
          </div>

          {/* Right: animated architecture sequence */}
          <AnimateIn delay={0.3} direction="right" className="flex justify-center lg:justify-end">
            <HomepageHeroAnimation />
          </AnimateIn>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="relative z-10 flex flex-col items-center gap-2 pb-10 text-gray-600">
        <div className="w-px h-10 bg-gradient-to-b from-transparent to-gray-600" />
        <span className="text-xs uppercase tracking-widest">Scroll</span>
      </div>
    </section>
  );
}

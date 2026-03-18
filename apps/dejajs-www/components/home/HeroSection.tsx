import Image from 'next/image';
import Link from 'next/link';
import AnimateIn from './AnimateIn';
import SectionLabel from './SectionLabel';
import Logo from '../Logo';

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
        {/* Announcement badge */}
        <AnimateIn delay={0} className="flex justify-center mb-12">
          <SectionLabel color="magenta">Private Beta — Now Available</SectionLabel>
        </AnimateIn>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
          {/* Left: text column */}
          <div className="flex flex-col gap-8">
            <AnimateIn delay={0.1}>
              <Logo size="2xl" />
            </AnimateIn>

            <AnimateIn delay={0.2}>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-none tracking-tight text-white"
                style={{ fontFamily: 'var(--font-bebas-neue)' }}
              >
                Simple to start. Built to grow.
                <br />
                <span className="text-deja-cyan">The cloud platform for DCC-EX.</span>
              </h1>
            </AnimateIn>

            <AnimateIn delay={0.3}>
              <p className="text-lg sm:text-xl text-gray-400 leading-relaxed max-w-lg">
                DEJA.js connects your DCC-EX CommandStation to every device on
                your network. Throttle, manage, and automate your layout from
                any browser — no app store required. Our cloud platform is built
                to grow with your layout and expand your masterpiece into an
                immersive experience.
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

          {/* Right: visual column */}
          <AnimateIn delay={0.3} direction="right" className="flex justify-center lg:justify-end">
            <div className="relative aspect-square w-full max-w-[480px]">
              {/* Architecture SVG background */}
              <Image
                src="/ttt-architecture.svg"
                alt="DEJA.js architecture diagram"
                fill
                className="object-contain opacity-40"
              />

              {/* Phone mockup overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-[160px] sm:w-[200px] glow-cyan rounded-3xl border border-deja-cyan/30 overflow-hidden">
                  <Image
                    src="/screenshots/throttle_mobile_home.png"
                    alt="DEJA.js Throttle app on mobile"
                    width={200}
                    height={430}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
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

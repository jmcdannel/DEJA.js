import Link from 'next/link';
import Logo from '../Logo';
import AnimateIn from './AnimateIn';

export default function FinalCTA() {
  return (
    <section className="relative py-32 px-6 overflow-hidden bg-slate-900/80">
      {/* Ambient cyan glow at bottom */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0, 229, 255, 0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative max-w-3xl mx-auto text-center flex flex-col items-center gap-8">
        <AnimateIn className="flex flex-col items-center gap-6">
          <Logo size="xl" />

          <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
            Your railroad is ready.
          </h2>

          <p className="text-lg text-gray-400 max-w-xl">
            Start running trains from anywhere, today.
          </p>
        </AnimateIn>

        <AnimateIn delay={0.15} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/pricing"
            className="glow-lime inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-deja-lime text-black font-bold text-base hover:brightness-110 transition-all"
          >
            Get Started Free
          </Link>
          <Link
            href="/docs/quick-start"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl border border-gray-700 text-white font-semibold text-base hover:border-gray-500 hover:bg-white/5 transition-all"
          >
            Read the Docs
          </Link>
        </AnimateIn>

        <AnimateIn delay={0.2}>
          <p className="text-xs text-gray-600">
            No credit card required for free tier · Cancel anytime
          </p>
        </AnimateIn>
      </div>
    </section>
  );
}

'use client';

import AnimateIn from '../home/AnimateIn';

export default function VideoSection() {
  return (
    <section>
      <AnimateIn className="text-center mb-8">
        <p className="text-xs text-gray-500 font-mono tracking-[0.2em] uppercase mb-3">Walkthrough</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">See it in action.</h2>
      </AnimateIn>
      <AnimateIn delay={0.2}>
        <div className="max-w-3xl mx-auto">
          <div className="relative aspect-video rounded-2xl border border-gray-700 bg-gray-900 overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full border-2 border-deja-cyan/50 bg-deja-cyan/10 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-deja-cyan ml-1" fill="currentColor">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm font-mono">Coming soon</p>
            </div>
          </div>
        </div>
      </AnimateIn>
    </section>
  );
}

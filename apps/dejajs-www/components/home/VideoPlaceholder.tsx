import AnimateIn from './AnimateIn';
import SectionLabel from './SectionLabel';

export default function VideoPlaceholder() {
  return (
    <section className="relative py-20 px-4 sm:px-8 bg-gray-950">
      {/* Top fade from previous section */}
      <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
      {/* Bottom fade to next section */}
      <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

      <div className="relative max-w-4xl mx-auto">
        <AnimateIn>
          <div className="text-center space-y-3 mb-10">
            <SectionLabel color="cyan">See It In Action</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Watch the 2-minute quickstart
            </h2>
            <p className="text-gray-400 text-lg">From zero to running trains in minutes.</p>
          </div>
        </AnimateIn>

        <AnimateIn delay={0.1}>
          <div className="relative rounded-2xl border border-gray-800 overflow-hidden aspect-video flex items-center justify-center group"
            style={{ background: 'linear-gradient(135deg, #050510 0%, #0a0a1a 40%, #060612 100%)' }}>
            {/* Grid background */}
            <div className="absolute inset-0 bg-grid-dark opacity-60" />

            {/* Radial glow center */}
            <div className="absolute inset-0"
              style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(0,229,255,0.06) 0%, transparent 65%)' }} />

            {/* Mock terminal/screenshot thumbnail */}
            <div className="absolute inset-6 rounded-xl border border-gray-700/60 bg-gray-900/80 overflow-hidden shadow-2xl">
              {/* Fake terminal title bar */}
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-800 bg-gray-900">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                <span className="ml-2 text-gray-500 text-xs font-mono">DEJA.js — Getting Started</span>
              </div>
              {/* Fake terminal content */}
              <div className="p-4 font-mono text-xs space-y-1.5">
                <p><span className="text-deja-lime/60">$</span> <span className="text-deja-lime">curl -fsSL https://install.dejajs.com | bash</span></p>
                <p className="text-gray-500">Downloading DEJA Server v1.2.0...</p>
                <p className="text-gray-500">Installing dependencies...</p>
                <p className="text-deja-lime">✓ DEJA Server v1.2.0 installed</p>
                <p className="text-gray-500"> </p>
                <p className="text-deja-cyan">→ Starting server...</p>
                <p className="text-deja-lime">✓ Server running on ws://localhost:8082</p>
                <p className="text-deja-lime">✓ CommandStation connected on /dev/ttyUSB0</p>
                <p className="text-deja-cyan">ℹ Signed in · Layout: Pittsburg &amp; Shasta 1:87</p>
              </div>
              {/* Gradient fade at bottom */}
              <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-gray-900/80 to-transparent" />
            </div>

            {/* Play button overlay */}
            <div className="relative flex flex-col items-center gap-4 text-center px-6 z-10">
              <div className="w-18 h-18 rounded-full border-2 border-deja-cyan/50 bg-black/70 backdrop-blur-sm flex items-center justify-center group-hover:border-deja-cyan group-hover:bg-black/90 transition-all duration-300 shadow-lg"
                style={{ width: '4.5rem', height: '4.5rem', boxShadow: '0 0 30px rgba(0,229,255,0.2)' }}>
                <svg className="w-7 h-7 text-deja-cyan ml-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-700/50">
                <p className="text-white font-semibold text-sm">Video coming soon</p>
                <p className="text-gray-400 text-xs mt-0.5">Check back shortly</p>
              </div>
            </div>

            {/* Corner badge */}
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-mono text-deja-cyan/70 border border-gray-700/50">
              ~2 min
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}

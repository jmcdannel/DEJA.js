'use client';

// Train emoji with railroad ties scrolling underneath to simulate movement

export default function AnimatedTrack({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {/* Train */}
      <div className="text-4xl sm:text-5xl">🚂</div>

      {/* Animated track ties moving right-to-left under the train */}
      <div className="w-full max-w-[180px] overflow-hidden relative h-6">
        {/* Rails */}
        <div className="absolute top-1 left-0 right-0 h-px bg-orange-400/60" />
        <div className="absolute bottom-1 left-0 right-0 h-px bg-orange-400/60" />

        {/* Scrolling ties */}
        <div className="flex gap-3 animate-[scroll-ties_1.5s_linear_infinite]">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-full bg-orange-400/40 shrink-0 rounded-sm"
              style={{ height: '100%' }}
            />
          ))}
        </div>
      </div>

      <p className="text-orange-400 font-semibold text-sm">Track</p>

      <style>{`
        @keyframes scroll-ties {
          from { transform: translateX(0); }
          to { transform: translateX(-18px); }
        }
      `}</style>
    </div>
  );
}

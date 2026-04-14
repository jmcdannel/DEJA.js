'use client';

import { useState, type ReactNode } from 'react';
import ArchitectureHero from './ArchitectureHero';
import WhySection from './WhySection';
import AppsSection from './AppsSection';
import ServerSection from './ServerSection';
import IoDevicesSection from './IoDevicesSection';
import DiagramSection from './DiagramSection';
import VideoSection from './VideoSection';
import UnderTheHoodSection from './UnderTheHoodSection';

/** Wraps an animation in a remountable container with a replay button. 🔁 */
function ReplayableAnimation({ children }: { children: (key: number) => ReactNode }) {
  const [replayKey, setReplayKey] = useState(0);

  return (
    <div className="relative">
      {children(replayKey)}
      <div className="flex justify-center mt-4 mb-16 sm:mb-24">
        <button
          type="button"
          onClick={() => setReplayKey((k) => k + 1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-700/60 bg-gray-900/60 hover:bg-gray-800/80 hover:border-deja-cyan/50 text-gray-300 hover:text-deja-cyan text-xs font-mono transition-colors backdrop-blur-sm"
          aria-label="Replay animation"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5"
            aria-hidden="true"
          >
            <path d="M3 12a9 9 0 1 0 3-6.7" />
            <path d="M3 4v5h5" />
          </svg>
          Replay
        </button>
      </div>
    </div>
  );
}

export default function ArchitecturePage() {
  return (
    <div>
      <ReplayableAnimation>
        {(key) => <ArchitectureHero key={key} autoStart={key > 0} />}
      </ReplayableAnimation>

      {/* Video — dark bg */}
      <div className="bg-gray-900/50 border-y border-gray-800/50 py-20 -mx-6 px-6">
        <VideoSection />
      </div>

      <div className="py-24">
        <AppsSection />
      </div>

      <div className="py-24">
        <ServerSection />
      </div>

      <div className="py-24">
        <IoDevicesSection />
      </div>

      {/* Configurations — dark bg */}
      <div className="bg-gray-900/50 border-y border-gray-800/50 py-16 -mx-6 px-6">
        <DiagramSection />
      </div>

      <div className="py-24">
        <UnderTheHoodSection />
      </div>

      <div className="py-24">
        <WhySection />
      </div>
    </div>
  );
}

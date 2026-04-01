'use client';

import ArchitectureHero from './ArchitectureHero';
import ArchitectureHeroV2 from './ArchitectureHeroV2';
import ArchitectureHeroV3 from './ArchitectureHeroV3';
import WhySection from './WhySection';
import AppsSection from './AppsSection';
import ServerSection from './ServerSection';
import IoDevicesSection from './IoDevicesSection';
import DiagramSection from './DiagramSection';
import VideoSection from './VideoSection';
import UnderTheHoodSection from './UnderTheHoodSection';

export default function ArchitecturePage() {
  return (
    <div>
      <ArchitectureHero />

      <div className="border-t border-gray-700/50 my-8 -mx-6 px-6 pt-8">
        <p className="text-xs text-gray-500 font-mono text-center mb-4">V2 — Vertical Centered</p>
        <ArchitectureHeroV2 />
      </div>

      <div className="border-t border-gray-700/50 my-8 -mx-6 px-6 pt-8">
        <p className="text-xs text-gray-500 font-mono text-center mb-4">V3 — Horizontal Genie</p>
        <ArchitectureHeroV3 />
      </div>

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

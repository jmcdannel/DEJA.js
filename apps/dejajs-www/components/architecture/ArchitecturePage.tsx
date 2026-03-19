'use client';

import ArchitectureHero from './ArchitectureHero';
import AppsSection from './AppsSection';
import ServerSection from './ServerSection';
import IoDevicesSection from './IoDevicesSection';
import DiagramSection from './DiagramSection';
import VideoSection from './VideoSection';

export default function ArchitecturePage() {
  return (
    <div className="space-y-32">
      <ArchitectureHero />
      <AppsSection />
      <ServerSection />
      <IoDevicesSection />
      <DiagramSection />
      <VideoSection />
    </div>
  );
}

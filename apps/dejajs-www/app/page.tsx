import type { Metadata } from 'next';
import HeroSection from '../components/home/HeroSection';
import QuickStartSection from '../components/home/QuickStartSection';
import VideoPlaceholder from '../components/home/VideoPlaceholder';
import ThrottleSpotlight from '../components/home/ThrottleSpotlight';
import CloudSpotlight from '../components/home/CloudSpotlight';
import ServerCLISection from '../components/home/ServerCLISection';
import DejaIOSection from '../components/home/DejaIOSection';
import GuidesGrid from '../components/home/GuidesGrid';
import PlatformFeatures from '../components/home/PlatformFeatures';
import ComingSoonStrip from '../components/home/ComingSoonStrip';
import FAQSection from '../components/home/FAQSection';
import SupportSection from '../components/home/SupportSection';
import FinalCTA from '../components/home/FinalCTA';

export const metadata: Metadata = {
  title: 'DEJA.js — Run your railroad. From anywhere.',
  description:
    'DEJA.js connects your DCC-EX CommandStation to every device on your network. Throttle, manage, and automate your layout from any browser.',
  openGraph: {
    title: 'DEJA.js — Run your railroad. From anywhere.',
    description:
      'DEJA.js connects your DCC-EX CommandStation to every device on your network. Throttle, manage, and automate your layout from any browser.',
    url: 'https://dejajs.com',
  },
};

export default function Home() {
  return (
    <div>
      <HeroSection />
      <QuickStartSection />
      <VideoPlaceholder />
      <ThrottleSpotlight />
      <ServerCLISection />
      <CloudSpotlight />
      <DejaIOSection />
      <GuidesGrid />
      <PlatformFeatures />
      <ComingSoonStrip />
      <FAQSection />
      <SupportSection />
      <FinalCTA />
    </div>
  );
}

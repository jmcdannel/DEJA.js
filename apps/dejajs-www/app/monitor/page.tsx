import type { Metadata } from 'next';
import {
  ProductHero,
  FeatureGrid,
  Showcase,
  ScreenshotCarousel,
  DeviceMockup,
  PlatformBreadth,
  FreeToTryBanner,
  ProductCTA,
  getAccent,
} from '../../components/products';
import { monitorContent, monitorScreenshots } from './content';

const accent = getAccent('monitor');

export const metadata: Metadata = {
  title: monitorContent.seo.title,
  description: monitorContent.seo.description,
  openGraph: {
    title: monitorContent.seo.title,
    description: monitorContent.seo.description,
    url: 'https://dejajs.com/monitor',
    images: [
      { url: monitorContent.icon, width: 512, height: 512, alt: 'DEJA.js Monitor' },
    ],
  },
};

export default function MonitorPage() {
  return (
    <>
      <ProductHero
        tagline={monitorContent.tagline}
        kicker={monitorContent.heroKicker}
        accent={accent}
        primaryCta={monitorContent.ctas.primary}
        secondaryCta={monitorContent.ctas.secondary}
        heroVisual={
          <DeviceMockup
            variant="laptop"
            src="/screenshots/monitor_desktop_dashboard.png"
            alt="Monitor dashboard"
          />
        }
      />

      <FeatureGrid
        eyebrow="Capabilities"
        heading="Transparency other systems hide"
        features={monitorContent.features}
        accent={accent}
      />

      <ScreenshotCarousel
        heading="One view, every scale."
        screenshots={monitorScreenshots}
        accent={accent}
      />

      <Showcase
        eyebrow="Diagnose fast"
        heading="Every command. Every event. Every device."
        body="When a train stops responding mid-session, Monitor lets you see exactly what the command station heard and what came back. No more guessing at wiring."
        visual={
          <DeviceMockup
            variant="laptop"
            src="/screenshots/monitor_desktop_dashboard.png"
            alt="Monitor dashboard detail"
          />
        }
        accent={accent}
      />

      <PlatformBreadth currentSlug="monitor" />

      <FreeToTryBanner />

      <ProductCTA
        heading="See what your layout is doing."
        subheading="Monitor ships with every DEJA.js install. Open it on any device."
        accent={accent}
        primary={monitorContent.ctas.primary}
        secondary={monitorContent.ctas.secondary}
      />
    </>
  );
}

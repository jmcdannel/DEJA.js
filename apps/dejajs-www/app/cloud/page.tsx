import type { Metadata } from 'next';
import Image from 'next/image';
import {
  ProductHero,
  FeatureGrid,
  Showcase,
  ScreenshotCarousel,
  PlatformBreadth,
  FreeToTryBanner,
  ProductCTA,
  getAccent,
} from '../../components/products';
import { cloudContent, cloudScreenshots } from './content';

const accent = getAccent('cloud');

export const metadata: Metadata = {
  title: cloudContent.seo.title,
  description: cloudContent.seo.description,
  openGraph: {
    title: cloudContent.seo.title,
    description: cloudContent.seo.description,
    url: 'https://dejajs.com/cloud',
    images: [
      { url: cloudContent.icon, width: 512, height: 512, alt: 'DEJA.js Cloud' },
    ],
  },
};

export default function CloudPage() {
  return (
    <>
      <ProductHero
        tagline={cloudContent.tagline}
        kicker={cloudContent.heroKicker}
        accent={accent}
        primaryCta={cloudContent.ctas.primary}
        secondaryCta={cloudContent.ctas.secondary}
        guideCta={cloudContent.ctas.guide}
        heroVisual={
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-2 shadow-2xl max-w-xl">
            <Image
              src="/screenshots/cloud_desktop_dashboard.png"
              alt="Cloud dashboard"
              width={800}
              height={500}
              className="rounded-lg w-full h-auto"
            />
          </div>
        }
      />

      <FeatureGrid
        eyebrow="Capabilities"
        heading="A single source of truth"
        features={cloudContent.features}
        accent={accent}
      />

      <Showcase
        eyebrow="Roster"
        heading="No roster files to import."
        body="Add a loco in Cloud and every throttle in your layout sees it before you can lift your finger. No CSV exports, no file sync, no hunting for the right version."
        visual={
          <Image
            src="/screenshots/cloud_desktop_roster.png"
            alt="Cloud roster"
            width={800}
            height={500}
            className="rounded-xl border border-slate-800 shadow-lg w-full h-auto"
          />
        }
        accent={accent}
      />

      <Showcase
        eyebrow="Effects"
        heading="Visual management for every piece of the layout."
        body="Turnouts, effects, signals, and routes all live in the same clean UI. Color-code what you want. Group what you want. Drive from any device."
        visual={
          <Image
            src="/screenshots/cloud_desktop_effects.png"
            alt="Cloud effects manager"
            width={800}
            height={500}
            className="rounded-xl border border-slate-800 shadow-lg w-full h-auto"
          />
        }
        accent={accent}
        reversed
      />

      <ScreenshotCarousel
        heading="Every piece of your layout, one place."
        screenshots={cloudScreenshots}
        accent={accent}
      />

      <PlatformBreadth currentSlug="cloud" />

      <FreeToTryBanner />

      <ProductCTA
        heading="Your layout. Everywhere."
        subheading="Create an account, add a loco, and every throttle in the room syncs instantly."
        accent={accent}
        primary={cloudContent.ctas.primary}
        secondary={cloudContent.ctas.secondary}
        guide={cloudContent.ctas.guide}
      />
    </>
  );
}

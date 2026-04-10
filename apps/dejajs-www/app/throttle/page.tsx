import type { Metadata } from 'next';
import Image from 'next/image';
import {
  ProductHero,
  FeatureGrid,
  Showcase,
  ScreenshotCarousel,
  EzConsistStory,
  PlatformBreadth,
  FreeToTryBanner,
  ProductCTA,
  getAccent,
} from '../../components/products';
import ThrottleLaunchQR from '../../components/home/ThrottleLaunchQR';
import { throttleContent, throttleScreenshots } from './content';

const accent = getAccent('throttle');

export const metadata: Metadata = {
  title: throttleContent.seo.title,
  description: throttleContent.seo.description,
  openGraph: {
    title: throttleContent.seo.title,
    description: throttleContent.seo.description,
    url: 'https://dejajs.com/throttle',
    images: [
      { url: throttleContent.icon, width: 512, height: 512, alt: 'DEJA.js Throttle' },
    ],
  },
};

export default function ThrottlePage() {
  return (
    <>
      <ProductHero
        tagline={throttleContent.tagline}
        kicker={throttleContent.heroKicker}
        accent={accent}
        primaryCta={throttleContent.ctas.primary}
        secondaryCta={throttleContent.ctas.secondary}
        guideCta={throttleContent.ctas.guide}
        heroVisual={
          <div className="flex flex-col md:flex-row items-center gap-8">
            <Image
              src="/screenshots/throttle_mobile_throttle.png"
              alt="Throttle running on a phone"
              width={320}
              height={640}
              className="w-auto h-auto max-h-[640px] drop-shadow-2xl"
              priority
            />
            <ThrottleLaunchQR size={140} label="Scan to launch on any phone" />
          </div>
        }
      />

      <EzConsistStory accent={accent} />

      <FeatureGrid
        eyebrow="Capabilities"
        heading="Built for operating sessions"
        features={throttleContent.features}
        accent={accent}
      />

      <ScreenshotCarousel
        eyebrow="Screens"
        heading="Every view designed for real operators"
        screenshots={throttleScreenshots}
        accent={accent}
      />

      <Showcase
        eyebrow="Zero install"
        heading="Open a URL. You're driving."
        body="No app store review. No sideloaded APKs. No Java install. Throttle is a web app, so every phone, tablet, and laptop on your network is ready to drive the moment you share the link."
        visual={
          <Image
            src="/screenshots/throttle_mobile_home.png"
            alt="Throttle home screen on a phone"
            width={320}
            height={640}
            className="w-auto h-auto max-h-[640px] drop-shadow-2xl"
          />
        }
        accent={accent}
        bullets={[
          'Runs on iOS, Android, and every modern browser',
          'High-contrast UI built for layout-room lighting',
          'Large touch targets you can hit without looking',
        ]}
      />

      <PlatformBreadth currentSlug="throttle" />

      <FreeToTryBanner />

      <ProductCTA
        heading="Start driving in under a minute."
        subheading="No install. No configuration. Just open the link on your phone."
        accent={accent}
        primary={throttleContent.ctas.primary}
        secondary={throttleContent.ctas.secondary}
        guide={throttleContent.ctas.guide}
      />
    </>
  );
}

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
import { tourContent, tourScreenshots } from './content';

const accent = getAccent('tour');

export const metadata: Metadata = {
  title: tourContent.seo.title,
  description: tourContent.seo.description,
  openGraph: {
    title: tourContent.seo.title,
    description: tourContent.seo.description,
    url: 'https://dejajs.com/tour',
    images: [
      { url: tourContent.icon, width: 512, height: 512, alt: 'DEJA.js Tour' },
    ],
  },
};

export default function TourPage() {
  return (
    <>
      <ProductHero
        tagline={tourContent.tagline}
        kicker={tourContent.heroKicker}
        accent={accent}
        primaryCta={tourContent.ctas.primary}
        secondaryCta={tourContent.ctas.secondary}
        heroVisual={
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-2 shadow-2xl max-w-xl">
            <Image
              src="/screenshots/tour_desktop_welcome.png"
              alt="Tour welcome screen"
              width={800}
              height={500}
              className="rounded-lg w-full h-auto"
            />
          </div>
        }
      />

      <FeatureGrid
        eyebrow="Capabilities"
        heading="Turn running trains into storytelling"
        features={tourContent.features}
        accent={accent}
      />

      <ScreenshotCarousel
        heading="Every moment of your layout, staged."
        screenshots={tourScreenshots}
        accent={accent}
      />

      <Showcase
        eyebrow="For open houses"
        heading="Turn open-house day into a guided experience."
        body="Whether you're running a club show or hosting first-time visitors at home, Tour lets you script the experience so every visitor gets the same polish."
        visual={
          <Image
            src="/screenshots/tour_desktop_area-detail.png"
            alt="Tour area detail"
            width={800}
            height={500}
            className="rounded-xl border border-slate-800 shadow-lg w-full h-auto"
          />
        }
        accent={accent}
      />

      <PlatformBreadth currentSlug="tour" />

      <FreeToTryBanner />

      <ProductCTA
        heading="Give your layout a story."
        subheading="Tour ships with DEJA.js Cloud. Start narrating your layout today."
        accent={accent}
        primary={tourContent.ctas.primary}
        secondary={tourContent.ctas.secondary}
      />
    </>
  );
}

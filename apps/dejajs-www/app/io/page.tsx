import type { Metadata } from 'next';
import {
  ProductHero,
  FeatureGrid,
  Showcase,
  HardwareGallery,
  PlatformBreadth,
  FreeToTryBanner,
  ProductCTA,
  getAccent,
} from '../../components/products';
import { ioContent, ioHardwarePhotos } from './content';

const accent = getAccent('io');

export const metadata: Metadata = {
  title: ioContent.seo.title,
  description: ioContent.seo.description,
  openGraph: {
    title: ioContent.seo.title,
    description: ioContent.seo.description,
    url: 'https://dejajs.com/io',
    images: [
      { url: ioContent.icon, width: 512, height: 512, alt: 'DEJA.js IO' },
    ],
  },
};

export default function IOPage() {
  return (
    <>
      <ProductHero
        productName={ioContent.name}
        icon={ioContent.icon}
        tagline={ioContent.tagline}
        kicker={ioContent.heroKicker}
        accent={accent}
        primaryCta={ioContent.ctas.primary}
        secondaryCta={ioContent.ctas.secondary}
        guideCta={ioContent.ctas.guide}
        heroVisual={
          <div className="w-full max-w-lg aspect-square rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-gray-600 text-sm font-mono">
            📸 hero photo slot
          </div>
        }
      />

      <FeatureGrid
        eyebrow="Capabilities"
        heading="Your layout, your hardware, your rules"
        features={ioContent.features}
        accent={accent}
      />

      <HardwareGallery accent={accent} photos={ioHardwarePhotos} />

      <Showcase
        eyebrow="Architecture"
        heading="MQTT to the server. DCC to the track. Nothing proprietary in between."
        body="Every IO device publishes its state and subscribes to commands over MQTT. The server routes messages to the right Cloud element. You never touch a proprietary module or a locked-down protocol."
        visual={
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-sm font-mono text-gray-400 leading-relaxed w-full max-w-lg">
            <pre>{`IO device ──MQTT──▶ server
                       │
                       ├─WebSocket─▶ throttles
                       └─Firebase──▶ DEJA Cloud`}</pre>
          </div>
        }
        accent={accent}
      />

      <Showcase
        eyebrow="No catalogs"
        heading="LED strips to servo turnouts. No proprietary modules."
        body="If it runs on an Arduino or a Pico W, it can run under DEJA.js. Copy our firmware onto your board, wire it up, and it shows up in Cloud."
        visual={
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-gray-400 w-full max-w-lg">
            <ul className="space-y-2 list-disc list-inside">
              <li>LED scene lighting</li>
              <li>Servo-driven turnouts</li>
              <li>Block occupancy sensors</li>
              <li>Signal heads</li>
              <li>Sound effects</li>
              <li>Anything else you can wire to a GPIO</li>
            </ul>
          </div>
        }
        accent={accent}
        reversed
      />

      <PlatformBreadth currentSlug="io" />

      <FreeToTryBanner />

      <ProductCTA
        heading="Build the layout you want."
        subheading="Open firmware, open hardware, open protocols. Start with an Arduino or a Pico W."
        accent={accent}
        primary={ioContent.ctas.primary}
        secondary={ioContent.ctas.secondary}
        guide={ioContent.ctas.guide}
      />
    </>
  );
}

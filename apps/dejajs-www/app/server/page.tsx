import type { Metadata } from 'next';
import {
  ProductHero,
  FeatureGrid,
  Showcase,
  PlatformBreadth,
  FreeToTryBanner,
  ProductCTA,
  getAccent,
} from '../../components/products';
import TerminalBlock from '../../components/home/TerminalBlock';
import { serverContent } from './content';

const accent = getAccent('server');

export const metadata: Metadata = {
  title: serverContent.seo.title,
  description: serverContent.seo.description,
  openGraph: {
    title: serverContent.seo.title,
    description: serverContent.seo.description,
    url: 'https://dejajs.com/server',
    images: [
      { url: serverContent.icon, width: 512, height: 512, alt: 'DEJA.js Server' },
    ],
  },
};

export default function ServerPage() {
  return (
    <>
      <ProductHero
        productName={serverContent.name}
        icon={serverContent.icon}
        tagline={serverContent.tagline}
        kicker={serverContent.heroKicker}
        accent={accent}
        primaryCta={serverContent.ctas.primary}
        secondaryCta={serverContent.ctas.secondary}
        guideCta={serverContent.ctas.guide}
        heroVisual={
          <div className="w-full max-w-lg">
            <TerminalBlock
              title="install.dejajs.com"
              lines={[
                { type: 'command', text: 'curl -fsSL https://install.dejajs.com | bash' },
                { type: 'output',  text: 'Installing DEJA.js Server...' },
                { type: 'success', text: 'Installed to ~/.deja' },
                { type: 'command', text: 'deja start' },
                { type: 'success', text: 'Server running on ws://localhost:8082' },
              ]}
            />
          </div>
        }
      />

      <FeatureGrid
        eyebrow="Capabilities"
        heading="Small footprint. Big responsibilities."
        features={serverContent.features}
        accent={accent}
      />

      <Showcase
        eyebrow="Install"
        heading="One command. Running in seconds."
        body="DEJA.js Server installs into ~/.deja/ as a self-contained Node.js process. No Docker, no system-level packages, and nothing you need sudo to remove."
        visual={
          <div className="w-full max-w-lg">
            <TerminalBlock
              title="terminal"
              lines={[
                { type: 'command', text: 'curl -fsSL https://install.dejajs.com | bash' },
                { type: 'success', text: 'Installed to ~/.deja' },
                { type: 'command', text: 'deja start' },
                { type: 'output',  text: 'Detected DCC-EX on /dev/ttyUSB0' },
                { type: 'success', text: 'Server running on ws://localhost:8082' },
              ]}
            />
          </div>
        }
        accent={accent}
        bullets={[
          'Installs under ~/.deja/ — no root required',
          'Connects to your DCC-EX serial port',
          'Managed with the `deja` CLI: start, stop, status, update',
        ]}
      />

      <Showcase
        eyebrow="Architecture"
        heading="The thinnest bridge we could build."
        body="Your browser talks WebSockets to the server. The server talks serial to DCC-EX, MQTT to your IO devices, and Firebase to your cloud roster. That's it. No proprietary protocols. No lock-in."
        visual={
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-sm font-mono text-gray-400 leading-relaxed w-full max-w-lg">
            <pre>{`browser ──WebSocket──▶ server
                        │
                        ├─Serial──▶ DCC-EX CommandStation
                        ├─MQTT────▶ IO devices
                        └─Firebase▶ DEJA Cloud`}</pre>
          </div>
        }
        accent={accent}
        reversed
      />

      <PlatformBreadth currentSlug="server" />

      <FreeToTryBanner />

      <ProductCTA
        heading="Bridge your layout to the browser in under a minute."
        subheading="Paste the install command. Plug in USB. You're live."
        accent={accent}
        primary={serverContent.ctas.primary}
        secondary={serverContent.ctas.secondary}
        guide={serverContent.ctas.guide}
      />
    </>
  );
}

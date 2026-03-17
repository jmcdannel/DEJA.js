import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { client } from '../../sanity/lib/client';
import { PRODUCT_PAGE_QUERY } from '../../sanity/lib/queries';

export const metadata: Metadata = {
  title: 'DEJA.js Monitor - Layout Diagnostics',
  description:
    'Deep diagnostic visibility. Built for technical operators who need to trace DCC-EX commands and telemetry in real-time. Command traces, live telemetry, and event filtering.',
  openGraph: {
    title: 'DEJA.js Monitor - Layout Diagnostics',
    description:
      'Deep diagnostic visibility. Trace DCC-EX commands and telemetry in real-time.',
    url: 'https://dejajs.com/monitor',
    images: [
      {
        url: '/monitor/icon-512.png',
        width: 512,
        height: 512,
        alt: 'DEJA.js Monitor Logo',
      },
    ],
  },
};

// Hardcoded fallback features
const defaultFeatures = [
  { icon: '📜', title: 'Command Traces', description: 'View raw and parsed DCC-EX API commands in real-time. Understand exactly what bytes are being transmitted between the server and the CommandStation.' },
  { icon: '📊', title: 'Live Telemetry', description: 'Monitor track power draw, main/prog track statuses, and server uptime metrics from a unified dashboard.' },
  { icon: '📡', title: 'Sensor Activity', description: 'Watch layout events flow in as trains pass sensors. Ideal for verifying automation hardware installations and routing logic.' },
  { icon: '🔍', title: 'Event Filtering', description: 'Cut through the noise. Filter the event stream strictly by turnouts, locos, errors, or custom IO devices to debug specific layout zones.' },
];

export default async function MonitorPage() {
  let product: any = null;
  try {
    if (client) product = await client.fetch(PRODUCT_PAGE_QUERY, { slug: 'monitor' });
  } catch {
    // Fall back to hardcoded content
  }

  const title = product?.title || 'DEJA.js Monitor';
  const tagline = product?.tagline || 'Deep diagnostic visibility. Built for technical operators and layout builders who need to see the data flowing across their network.';
  const features = product?.features?.length ? product.features : defaultFeatures;
  const ctaLabel = product?.cta?.label || 'Launch Monitor Web App';
  const ctaHref = product?.cta?.href || '/docs/monitor';

  return (
    <div className="space-y-16">
      <section className="text-center space-y-6 flex flex-col items-center">
        <div className="flex justify-center mb-4">
          <Image src="/monitor/icon-512.png" alt="DEJA.js Monitor Logo" width={128} height={128} className="h-32 w-32 drop-shadow-lg" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
          <span className="text-red-500">{title}</span>
        </h1>
        <p className="max-w-2xl text-lg md:text-xl text-gray-500 dark:text-gray-400 mx-auto">
          {tagline}
        </p>
      </section>

      <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white border-b border-gray-200 dark:border-slate-800 pb-4">Core Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature: any, idx: number) => (
            <div key={feature._key || idx}>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-red-500">{feature.icon}</span> {feature.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-lg flex justify-center">
          <Image src="/screenshots/monitor_desktop.png" alt="Monitor Desktop Interface" width={800} height={400} className="rounded border border-slate-800 object-cover w-full h-auto max-h-[400px]" />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Clear the fog.</h2>
          <p className="text-gray-500 dark:text-gray-400">
            When hardware doesn&apos;t react as expected, guessing isn&apos;t an option. DEJA.js Monitor replaces cryptic serial logs with a designed, structured view of your layout&apos;s state.
          </p>
          <ul className="space-y-2 mt-4 text-gray-500 dark:text-gray-400 list-disc list-inside">
            <li>Color-coded log severity (Info, Warn, Error)</li>
            <li>Timestamped event history</li>
            <li>Immediate feedback on route execution</li>
          </ul>
        </div>
      </section>

      <div className="flex justify-center pb-8">
        <Link
          href={ctaHref}
          className="px-8 py-4 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition shadow-lg"
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}

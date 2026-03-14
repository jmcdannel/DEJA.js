import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { client } from '../../sanity/lib/client';
import { PRODUCT_PAGE_QUERY } from '../../sanity/lib/queries';

export const metadata: Metadata = {
  title: 'DEJA.js Throttle - Precision Mobile Control',
  description:
    'Tactile, responsive, clear. The modern driver experience designed for touch and mobile controls of DCC-EX layouts. Speed control, consists, function mapping, and CV programming.',
  openGraph: {
    title: 'DEJA.js Throttle - Precision Mobile Control',
    description:
      'The modern driver experience designed for touch and mobile controls of DCC-EX layouts.',
    url: 'https://dejajs.com/throttle',
    images: [
      {
        url: '/throttle/icon-512.png',
        width: 512,
        height: 512,
        alt: 'DEJA.js Throttle Logo',
      },
    ],
  },
};

// Hardcoded fallback features
const defaultFeatures = [
  { icon: '🚂', title: 'Precision Speed Control', description: 'Smooth slider interfaces combined with exact step modifiers (+1 / -1). Visual feedback confirms speed step changes instantly.' },
  { icon: '🔗', title: 'EZ Consist', description: 'Build functional consists in seconds visually. Select lead, adjust orientations, and drive multiple locomotives as a single unit without complex programming.' },
  { icon: '🎛️', title: 'Function Mapping', description: 'Customizable function buttons mapped dynamically from your roster. Color-code lights, horns, and bells for quick visual identification.' },
  { icon: '🔀', title: 'Turnout & Route Access', description: 'Access your designated turnouts directly from the throttle context. Throw switches without switching apps or physical controllers.' },
];

export default async function ThrottlePage() {
  let product: any = null;
  try {
    product = await client.fetch(PRODUCT_PAGE_QUERY, { slug: 'throttle' });
  } catch {
    // Fall back to hardcoded content
  }

  const title = product?.title || 'DEJA.js Throttle';
  const tagline = product?.tagline || 'Tactile, responsive, clear. The modern driver experience designed primarily for touch interfaces and mobile devices.';
  const features = product?.features?.length ? product.features : defaultFeatures;
  const ctaLabel = product?.cta?.label || 'Launch Throttle Web App';
  const ctaHref = product?.cta?.href || '/docs/throttle';

  return (
    <div className="space-y-16">
      <section className="text-center space-y-6 flex flex-col items-center">
        <div className="flex justify-center mb-4">
          <Image src="/throttle/icon-512.png" alt="DEJA.js Throttle Logo" width={128} height={128} className="h-32 w-32 drop-shadow-lg" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
          <span className="text-lime-500">{title}</span>
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
                <span className="text-lime-500">{feature.icon}</span> {feature.title}
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
          <Image src="/screenshots/throttle_mobile_throttle.png" alt="Mobile Throttle UI" width={400} height={500} className="rounded border border-slate-800 max-h-[500px]" />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Mobile First. Engineered for Operations.</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Forget squinting at small LCD screens. DEJA.js Throttle brings your mobile device&apos;s high-resolution display and touch accuracy to your layout. The UI is designed specifically to prevent accidental touches while keeping critical functions under your thumb.
          </p>
          <ul className="space-y-2 mt-4 text-gray-500 dark:text-gray-400 list-disc list-inside">
            <li>High-contrast visual hierarchy</li>
            <li>Large, accessible touch targets</li>
            <li>Instant sync with DEJA Cloud roster data</li>
            <li>Runs on iOS, Android, and modern web browsers</li>
          </ul>
        </div>
      </section>

      <div className="flex justify-center pb-8">
        <Link
          href={ctaHref}
          className="px-8 py-4 bg-lime-500 text-gray-950 rounded-lg font-bold hover:bg-lime-400 transition shadow-lg"
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}

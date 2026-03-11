import type { Metadata } from 'next';
import Image from 'next/image';

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

export default function ThrottlePage() {
  return (
    <div className="space-y-16">
      <section className="text-center space-y-6 flex flex-col items-center">
        <div className="flex justify-center mb-4">
          <Image src="/throttle/icon-512.png" alt="DEJA.js Throttle Logo" width={128} height={128} className="h-32 w-32 drop-shadow-lg" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
          <span className="text-green-500">DEJA.js Throttle</span>
        </h1>
        <p className="max-w-2xl text-lg md:text-xl text-gray-500 dark:text-gray-400 mx-auto">
          Tactile, responsive, clear. The modern driver experience designed primarily for touch interfaces and mobile devices.
        </p>
      </section>

      <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white border-b border-gray-200 dark:border-slate-800 pb-4">Core Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-green-500">🚂</span> Precision Speed Control
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Smooth slider interfaces combined with exact step modifiers (+1 / -1). Visual feedback confirms speed step changes instantly.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-green-500">🔗</span> EZ Consist
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Build functional consists in seconds visually. Select lead, adjust orientations, and drive multiple locomotives as a single unit without complex programming.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-green-500">🎛️</span> Function Mapping
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Customizable function buttons mapped dynamically from your roster. Color-code lights, horns, and bells for quick visual identification.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-green-500">🔀</span> Turnout & Route Access
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Access your designated turnouts directly from the throttle context. Throw switches without switching apps or physical controllers.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
         <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-lg flex justify-center">
          <Image src="/screenshots/throttle_mobile_throttle.png" alt="Mobile Throttle UI" width={400} height={500} className="rounded border border-slate-800 max-h-[500px]" />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Mobile First. Engineered for Operations.</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Forget squinting at small LCD screens. DEJA.js Throttle brings your mobile device's high-resolution display and touch accuracy to your layout. The UI is designed specifically to prevent accidental touches while keeping critical functions under your thumb.
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
        <a
          href="/docs/throttle"
          className="px-8 py-4 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition shadow-lg"
        >
          Launch Throttle Web App
        </a>
      </div>
    </div>
  );
}

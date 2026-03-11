import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'DEJA.js Cloud - Manage Your Railway Roster',
  description:
    'The centralized catalog and configuration hub for your model railroad. Manage devices, locos, turnouts, and effects securely from anywhere.',
  openGraph: {
    title: 'DEJA.js Cloud - Manage Your Railway Roster',
    description:
      'The centralized catalog and configuration hub for your model railroad. Manage devices, locos, and turnouts securely.',
    url: 'https://dejajs.com/cloud',
    images: [
      {
        url: '/cloud/icon-512.png',
        width: 512,
        height: 512,
        alt: 'DEJA.js Cloud Logo',
      },
    ],
  },
};

export default function CloudPage() {
  return (
    <div className="space-y-16">
      <section className="text-center space-y-6 flex flex-col items-center">
        <div className="flex justify-center mb-4">
          <Image src="/cloud/icon-512.png" alt="DEJA.js Cloud Logo" width={128} height={128} className="h-32 w-32 drop-shadow-lg" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
          <span className="text-purple-500">DEJA.js Cloud</span>
        </h1>
        <p className="max-w-2xl text-lg md:text-xl text-gray-500 dark:text-gray-400 mx-auto">
          The centralized catalog and configuration hub for your model railroad. Manage devices, locos, turnouts, and effects securely from anywhere.
        </p>
      </section>

      <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white border-b border-gray-200 dark:border-slate-800 pb-4">Core Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-purple-500">📋</span> Roster Management
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Store your locomotive addresses, descriptions, and custom function definitions in the cloud. Changes sync instantly across all devices accessing the layout.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-purple-500">🎨</span> Global Color Coding
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Assign distinct colors to specific locomotives, turnouts, or sensors within the Cloud App. Those colors follow the element into the Throttle and Monitor tools for instant visual recognition.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-purple-500">🔐</span> Secure Device Identity
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Manage your connected hardware securely. Issue session tokens to throttle clients to prevent unauthorized access to your DCC-EX CommandStation.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-purple-500">🌐</span> Layout Spaces
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Create separate &ldquo;spaces&rdquo; or layouts on a single account. Easily switch between controlling your home setup, a club layout, or a test bench.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
         <div className="space-y-4">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">A Single Source of Truth</h2>
          <p className="text-gray-500 dark:text-gray-400">
            DEJA.js Cloud solves the fragmentation problem of legacy systems. By storing your layout configurations securely in the cloud, you eliminate the need to manually load roster files onto individual throttles or servers.
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            When you add a new route or map a new sound function in the Cloud App, every Throttle App connected to your layout receives the update in real-time.
          </p>
        </div>
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-lg flex justify-center">
          <Image src="/screenshots/cloud_desktop_roster.png" alt="DEJA.js Cloud Roster Desktop" width={800} height={400} className="rounded border border-slate-800 object-cover w-full h-auto max-h-[400px]" />
        </div>
      </section>

      <div className="flex justify-center pb-8">
        <Link
          href="/docs/cloud"
          className="px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition shadow-lg"
        >
          Access DEJA Cloud
        </Link>
      </div>
    </div>
  );
}

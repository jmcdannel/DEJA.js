import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'DEJA.js Tour & IO - Automation & Expansion',
  description:
    'Automate and expand your layout. Leverage structured presets and plug-and-play Arduino and Pico W code for DCC-EX layout automation.',
  openGraph: {
    title: 'DEJA.js Tour & IO - Automation & Expansion',
    description:
      'Automate and expand your layout with structured presets and plug-and-play Arduino code for DCC-EX.',
    url: 'https://dejajs.com/tour',
    images: [
      {
        url: '/tour/icon-512.png',
        width: 512,
        height: 512,
        alt: 'DEJA.js Tour Logo',
      },
    ],
  },
};

export default function TourPage() {
  return (
    <div className="space-y-16">
      <section className="text-center space-y-6 flex flex-col items-center">
        <div className="flex justify-center mb-4">
          <Image src="/tour/icon-512.png" alt="DEJA.js Tour Logo" width={128} height={128} className="h-32 w-32 drop-shadow-lg" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
          <span className="text-indigo-500">DEJA.js Tour & IO</span>
        </h1>
        <p className="max-w-2xl text-lg md:text-xl text-gray-500 dark:text-gray-400 mx-auto">
          Automate and expand. Leverage structured presets and plug-and-play code to push your layout beyond basic throttle control.
        </p>
      </section>

      <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white border-b border-gray-200 dark:border-slate-800 pb-4">Core Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-indigo-500">🗺️</span> Guided Presets
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Create and execute sequential commands (Tours). Showcase routes, execute demonstrations, and automate complex yard movements with a single tap.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-indigo-500">🔌</span> Plug-and-Play IO
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Download provided sketch code for Arduino and Pico W. Expand your layout with hundreds of pins for signals, sensors, and servos without writing backend logic.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-indigo-500">💡</span> Dynamic Effects
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Control physical lighting arrays, addressable LEDs, and relay modules directly from the Throttle interface. DEJA handles the protocol translation.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-indigo-500">🔄</span> Protocol Agnostic
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Communicate over direct serial USB, local WebSocket, or remote MQTT. Connect microcontrollers exactly how your specific layout geometry demands.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
         <div className="space-y-4">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Grows With Your Layout</h2>
          <p className="text-gray-500 dark:text-gray-400">
            A command station is only the beginning. True modern layouts require distributed hardware to handle localized tasks like block detection and signal logic.
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            DEJA.js IO provides a standardized way to pull those localized microcontrollers into a unified software interface, so your layout acts as one cohesive, engineered system.
          </p>
        </div>
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-lg font-mono text-sm text-indigo-400">
           {`// Minimal configuration needed`}<br/>
           {`#define MQTT_SERVER "192.168.1.10"`}<br/>
           {`#define CLIENT_ID "yard_nodes_1"`}<br/>
           <br/>
           {`setup_deja_io();`}<br/>
           <br/>
           <span className="text-gray-500 dark:text-gray-400 mt-4 block">
            {`// The node automatically registers its pins`}<br/>
            {`// with the DEJA.js Server on boot.`}
          </span>
        </div>
      </section>

      <div className="flex justify-center pb-8 gap-4">
        <Link
          href="/docs/tour"
          className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-lg"
        >
          View Tour Docs
        </Link>
         <Link
          href="/docs/tour"
          className="px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-gray-100 rounded-lg font-medium border border-gray-200 dark:border-slate-800 hover:shadow transition"
        >
          Get IO Code
        </Link>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import Image from 'next/image';

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

export default function MonitorPage() {
  return (
    <div className="space-y-16">
      <section className="text-center space-y-6 flex flex-col items-center">
        <div className="flex justify-center mb-4">
          <Image src="/monitor/icon-512.png" alt="DEJA.js Monitor Logo" width={128} height={128} className="h-32 w-32 drop-shadow-lg" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
          <span className="text-red-500">DEJA.js Monitor</span>
        </h1>
        <p className="max-w-2xl text-lg md:text-xl text-gray-500 dark:text-gray-400 mx-auto">
          Deep diagnostic visibility. Built for technical operators and layout builders who need to see the data flowing across their network.
        </p>
      </section>

      <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white border-b border-gray-200 dark:border-slate-800 pb-4">Core Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-red-500">📜</span> Command Traces
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              View raw and parsed DCC-EX API commands in real-time. Understand exactly what bytes are being transmitted between the server and the CommandStation.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-red-500">📊</span> Live Telemetry
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Monitor track power draw, main/prog track statuses, and server uptime metrics from a unified dashboard.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-red-500">📡</span> Sensor Activity
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Watch layout events flow in as trains pass sensors. Ideal for verifying automation hardware installations and routing logic.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-red-500">🔍</span> Event Filtering
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Cut through the noise. Filter the event stream strictly by turnouts, locos, errors, or custom IO devices to debug specific layout zones.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-lg flex justify-center">
          <Image src="/screenshots/monitor_desktop.png" alt="Monitor Desktop Interface" width={800} height={400} className="rounded border border-slate-800 object-cover w-full h-auto max-h-[400px]" />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Clear the fog.</h2>
          <p className="text-gray-500 dark:text-gray-400">
            When hardware doesn't react as expected, guessing isn't an option. DEJA.js Monitor replaces cryptic serial logs with a designed, structured view of your layout's state. 
          </p>
          <ul className="space-y-2 mt-4 text-gray-500 dark:text-gray-400 list-disc list-inside">
            <li>Color-coded log severity (Info, Warn, Error)</li>
            <li>Timestamped event history</li>
            <li>Immediate feedback on route execution</li>
          </ul>
        </div>
      </section>

      <div className="flex justify-center pb-8">
        <a
          href="/docs/monitor"
          className="px-8 py-4 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition shadow-lg"
        >
          Launch Monitor Web App
        </a>
      </div>
    </div>
  );
}

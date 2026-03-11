import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'DEJA.js Server - The DCC-EX Bridge',
  description:
    'Connect your DCC-EX CommandStation to the DEJA software ecosystem securely via USB or Network. Real-time telemetry, WebSocket API, and hardware expansion.',
  openGraph: {
    title: 'DEJA.js Server - The DCC-EX Bridge',
    description:
      'Connect your DCC-EX CommandStation to the DEJA software ecosystem securely via USB or Network.',
    url: 'https://dejajs.com/server',
  },
};

export default function ServerPage() {
  return (
    <div className="space-y-16">
      <section className="text-center space-y-6 flex flex-col items-center">
        <div className="flex justify-center mb-4">
          <Image src="/icon-512.png" alt="DEJA.js Server Logo" width={128} height={128} className="h-32 w-32 drop-shadow-lg" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
          <span className="text-cyan-500">DEJA.js Server</span>
        </h1>
        <p className="max-w-2xl text-lg md:text-xl text-gray-500 dark:text-gray-400 mx-auto">
          The essential bridge. Connect your DCC-EX CommandStation to the DEJA software ecosystem safely and securely.
        </p>
      </section>

      <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white border-b border-gray-200 dark:border-slate-800 pb-4">Core Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-cyan-500">🔌</span> USB Connectivity
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Maintains a stable, high-speed serial connection to your DCC-EX CommandStation. Handles rapid command dispatch without dropping packets.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-cyan-500">🔄</span> Real-time Telemetry
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Parses raw DCC-EX responses instantly. Broadcasts layout state changes (turnouts, sensors, current draw) to connected apps with minimal latency.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-cyan-500">📡</span> Network Gateway
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Exposes a robust WebSocket API. Allows Throttle, Monitor, and Cloud applications to interface securely from any device on your local network.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="text-cyan-500">⚡</span> Hardware Expansion
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Automatically detects and manages secondary Arduino and Pico W devices connected via USB for expanded IO control.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Built for Reliability</h2>
          <p className="text-gray-500 dark:text-gray-400">
            The DEJA.js Server is built on Node.js for cross-platform compatibility. It runs headless on Windows, Mac, Linux, or a dedicated Raspberry Pi placed near your layout. It guarantees command delivery sequence and manages throttle heartbeats automatically.
          </p>
        </div>
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-lg font-mono text-sm text-cyan-500">
          $ npm install -g dejajs-server<br/>
          $ dejajs-server start<br/>
          <span className="text-gray-500 dark:text-gray-400 mt-4 block">
            [INFO] Server listening on port 8080<br/>
            [INFO] DCC-EX detected on /dev/ttyUSB0<br/>
            [INFO] Connection established.
          </span>
        </div>
      </section>

      <div className="flex justify-center pb-8">
        <Link
          href="/docs/server"
          className="px-8 py-4 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition shadow-lg"
        >
          Install Server
        </Link>
      </div>
    </div>
  );
}

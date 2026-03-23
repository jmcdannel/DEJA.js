'use client';

import Link from 'next/link';
import AnimateIn from '../home/AnimateIn';
import DocLink from '../DocLink';
import TerminalMockup from './TerminalMockup';

export default function ServerSection() {
  const lines = [
    { text: '$ deja start', color: 'text-deja-cyan', delay: 0 },
    { text: '', color: '', delay: 0.1 },
    { text: '\u2713 WebSocket server on :8082', color: 'text-green-400', delay: 0.2 },
    { text: '\u2713 Firebase connected (layout: tamarack)', color: 'text-green-400', delay: 0.4 },
    { text: '\u2713 Serial: /dev/ttyUSB0 @ 115200', color: 'text-green-400', delay: 0.6 },
    { text: '\u2713 MQTT broker connected', color: 'text-green-400', delay: 0.8 },
    { text: '', color: '', delay: 0.9 },
    { text: '  Ready \u2014 listening for commands', color: 'text-gray-400', delay: 1.0 },
  ];

  return (
    <section>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <AnimateIn direction="left">
          <TerminalMockup title="deja \u2014 tamarack" className="max-w-md">
            {lines.map((line, i) => (
              <AnimateIn key={i} delay={line.delay} direction="none">
                <p className={line.color}>{line.text || '\u00A0'}</p>
              </AnimateIn>
            ))}
          </TerminalMockup>
        </AnimateIn>
        <AnimateIn direction="right">
          <p className="text-xs text-deja-cyan font-mono tracking-[0.2em] uppercase mb-3">DEJA Server</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">One command. Everything connects.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The DEJA Server bridges your apps to your layout. It speaks WebSocket to your browser, Firebase to the cloud, serial to your DCC-EX command station, and MQTT to your IO devices.</p>
          <p className="text-gray-400 leading-relaxed mb-6">Install it anywhere Node.js runs — your laptop, a Raspberry Pi, or a dedicated server. One command and your entire layout is online.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/server" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-deja-cyan/10 border border-deja-cyan/30 text-deja-cyan font-semibold text-sm hover:bg-deja-cyan/20 transition-colors">
              Explore Server
            </Link>
            <DocLink href="/docs/server">Server</DocLink>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}

'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import DocLink from '../DocLink';
import TerminalMockup from './TerminalMockup';

const terminalLines = [
  { text: '$ curl -fsSL install.dejajs.com | bash', color: 'text-gray-400' },
  { text: '✓ Installed deja to ~/.deja', color: 'text-green-400' },
  { text: '', color: '' },
  { text: '$ deja start', color: 'text-deja-cyan' },
  { text: '✓ WebSocket server on :8082', color: 'text-green-400' },
  { text: '✓ Firebase connected (layout: tamarack)', color: 'text-green-400' },
  { text: '✓ Serial: /dev/ttyUSB0 @ 115200', color: 'text-green-400' },
  { text: '✓ MQTT broker connected', color: 'text-green-400' },
  { text: '', color: '' },
  { text: '  Ready — listening for commands', color: 'text-gray-400' },
];

export default function ServerSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center center'],
  });

  // Terminal container slides in from the left
  const termX = useTransform(scrollYProgress, [0, 0.3], [-60, 0]);
  const termOpacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);

  // Text content slides in from the right
  const textX = useTransform(scrollYProgress, [0.05, 0.35], [60, 0]);
  const textOpacity = useTransform(scrollYProgress, [0.05, 0.3], [0, 1]);

  return (
    <section ref={sectionRef}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div style={{ x: termX, opacity: termOpacity }}>
          <TerminalMockup title="deja — tamarack" className="max-w-md">
            {terminalLines.map((line, i) => {
              // Each line reveals progressively as scroll advances
              const start = 0.15 + i * 0.06;
              const end = start + 0.08;

              return (
                <TerminalLine
                  key={i}
                  text={line.text}
                  color={line.color}
                  scrollProgress={scrollYProgress}
                  revealStart={Math.min(start, 0.85)}
                  revealEnd={Math.min(end, 0.95)}
                  isCommand={i === 0}
                />
              );
            })}
          </TerminalMockup>
        </motion.div>
        <motion.div style={{ x: textX, opacity: textOpacity }}>
          <p className="text-xs text-deja-cyan font-mono tracking-[0.2em] uppercase mb-3">DEJA Server</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">One command. Everything connects.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">The DEJA Server bridges your apps to your layout. It speaks WebSocket to your browser, Firebase to the cloud, serial to your DCC-EX command station, and MQTT to your IO devices.</p>
          <p className="text-gray-400 leading-relaxed mb-6">Install it anywhere Node.js runs — your laptop, a Raspberry Pi, or a dedicated server. One <code className="text-deja-cyan font-mono text-sm">curl</code> to install, one <code className="text-deja-cyan font-mono text-sm">deja start</code> to launch, and your entire layout is online.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/server" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-deja-cyan/10 border border-deja-cyan/30 text-deja-cyan font-semibold text-sm hover:bg-deja-cyan/20 transition-colors">
              Explore Server
            </Link>
            <DocLink href="/docs/server">Server</DocLink>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/** A single terminal line that types out when scroll reaches its reveal range. */
function TerminalLine({
  text,
  color,
  scrollProgress,
  revealStart,
  revealEnd,
  isCommand,
}: {
  text: string;
  color: string;
  scrollProgress: ReturnType<typeof useScroll>['scrollYProgress'];
  revealStart: number;
  revealEnd: number;
  isCommand: boolean;
}) {
  const opacity = useTransform(scrollProgress, [revealStart, revealEnd], [0, 1]);
  const x = useTransform(scrollProgress, [revealStart, revealEnd], [isCommand ? 0 : 8, 0]);

  if (!text) {
    return (
      <motion.p style={{ opacity }} className="h-4">
        &nbsp;
      </motion.p>
    );
  }

  return (
    <motion.p className={color} style={{ opacity, x }}>
      {text}
    </motion.p>
  );
}

'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import DocLink from '../DocLink';

const peripherals = [
  { label: 'LED Strips', icon: '💡', desc: 'Animated lighting effects, building interiors, streetlamps' },
  { label: 'Servos', icon: '🔄', desc: 'Turnout motors, crossing gates, semaphore arms' },
  { label: 'Signals', icon: '🚦', desc: 'Block signals, ABS signaling, approach lighting' },
  { label: 'Relays', icon: '⚡', desc: 'Track power switching, accessory control, automation' },
  { label: 'Sensors', icon: '📡', desc: 'IR detection, block occupancy, automation triggers' },
  { label: 'Sound', icon: '🔊', desc: 'Crossing bells, ambient sounds, announcements' },
  { label: 'Motors', icon: '⚙️', desc: 'Turntable drives, conveyor belts, animated scenes' },
  { label: 'Displays', icon: '📺', desc: 'Station clocks, departure boards, status panels' },
  { label: 'Buttons', icon: '🔘', desc: 'Physical control panels, dispatcher boards' },
];

type DeviceConnection = 'usb' | 'wifi';

const devices: { name: string; desc: string; connection: DeviceConnection; connectionLabel: string }[] = [
  {
    name: 'Arduino',
    desc: 'USB serial — direct pin control. Great for turnout machines, signals, and panel buttons near the command station.',
    connection: 'usb',
    connectionLabel: 'USB serial',
  },
  {
    name: 'Pico W',
    desc: 'WiFi MQTT — wireless placement anywhere on the layout. Perfect for lighting, sound, and sensors in hard-to-reach spots.',
    connection: 'wifi',
    connectionLabel: 'Wi-Fi / MQTT',
  },
];

/** Icon-only indicator showing how a device talks to the DEJA Server. */
function ConnectionIcon({ type, label }: { type: DeviceConnection; label: string }) {
  return type === 'usb' ? (
    // 🔌 USB icon
    <svg
      className="w-5 h-5 text-[rgb(234,179,8)]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={label}
    >
      <title>{label}</title>
      <circle cx="12" cy="20" r="1.5" fill="currentColor" />
      <path d="M12 18.5V7" />
      <path d="M12 7L8 11" />
      <path d="M8 11V13" />
      <path d="M6 13h4" />
      <path d="M12 7L16 10" />
      <rect x="14.5" y="9" width="3" height="3" rx="0.5" />
      <circle cx="12" cy="4" r="2" />
    </svg>
  ) : (
    // 📶 Wi-Fi icon
    <svg
      className="w-5 h-5 text-[rgb(234,179,8)]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={label}
    >
      <title>{label}</title>
      <path d="M5 12.55a11 11 0 0 1 14 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <circle cx="12" cy="20" r="1" fill="currentColor" />
    </svg>
  );
}

export default function IoDevicesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Text content slides in from left
  const textX = useTransform(scrollYProgress, [0, 0.2], [-48, 0]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.18], [0, 1]);

  // Device cards reveal
  const deviceOpacity = useTransform(scrollYProgress, [0.08, 0.22], [0, 1]);
  const deviceY = useTransform(scrollYProgress, [0.08, 0.22], [24, 0]);

  // Peripherals header
  const periphHeaderOpacity = useTransform(scrollYProgress, [0.12, 0.2], [0, 1]);

  return (
    <section ref={sectionRef}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <motion.div style={{ x: textX, opacity: textOpacity }}>
          <p className="text-xs text-[rgb(234,179,8)] font-mono tracking-[0.2em] uppercase mb-3">DEJA IO</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Expand endlessly.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            Anything that connects to a microcontroller becomes part of your layout.
            Wire up LEDs for building lights, servos for turnouts, sensors for block detection,
            speakers for crossing bells — the platform grows as your imagination does.
          </p>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6"
            style={{ opacity: deviceOpacity, y: deviceY }}
          >
            {devices.map((d) => (
              <div key={d.name} className="rounded-lg border border-[rgb(234,179,8)]/20 bg-[rgb(234,179,8)]/5 p-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-[rgb(234,179,8)] font-semibold">{d.name}</p>
                  <ConnectionIcon type={d.connection} label={d.connectionLabel} />
                </div>
                <p className="text-gray-400 text-sm">{d.desc}</p>
              </div>
            ))}
          </motion.div>
          <DocLink href="/docs/io">DEJA IO</DocLink>
        </motion.div>

        <div>
          <motion.p
            className="text-xs text-green-400/70 font-mono tracking-[0.2em] uppercase mb-4"
            style={{ opacity: periphHeaderOpacity }}
          >
            What you can build
          </motion.p>
          <div className="grid grid-cols-3 gap-3">
            {peripherals.map((p, i) => (
              <PeripheralCard
                key={p.label}
                peripheral={p}
                index={i}
                scrollProgress={scrollYProgress}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** A peripheral card that cascades in based on scroll progress. */
function PeripheralCard({
  peripheral,
  index,
  scrollProgress,
}: {
  peripheral: (typeof peripherals)[number];
  index: number;
  scrollProgress: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
  // Stagger each card: 30ms equivalent spacing mapped to scroll progress
  const start = 0.15 + index * 0.025;
  const end = start + 0.08;

  const opacity = useTransform(scrollProgress, [start, end], [0, 1]);
  const y = useTransform(scrollProgress, [start, end], [20, 0]);
  const scale = useTransform(scrollProgress, [start, end], [0.92, 1]);

  return (
    <motion.div style={{ opacity, y, scale }}>
      <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-green-500/20 bg-green-500/5 text-center">
        <span className="text-xl">{peripheral.icon}</span>
        <span className="text-green-400 text-xs font-semibold">{peripheral.label}</span>
        <span className="text-gray-500 text-[10px] leading-snug">{peripheral.desc}</span>
      </div>
    </motion.div>
  );
}

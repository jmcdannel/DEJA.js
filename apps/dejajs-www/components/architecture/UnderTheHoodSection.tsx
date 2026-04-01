'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const explainers = [
  {
    question: 'Why not WiThrottle?',
    answer: 'WiThrottle requires a native mobile app, and native iOS/Android apps are still on our roadmap. DEJA.js runs entirely in the browser — no app store, no installation, instant updates. When native apps arrive, they\'ll connect through the same platform.',
    color: 'border-deja-cyan/20',
  },
  {
    question: 'How does Firebase work?',
    answer: 'Firebase provides real-time sync between your apps and the server. When you change a throttle setting on your phone, Firebase pushes that change to the server instantly — no polling, no refresh. Your roster, routes, turnout states, and effects are all stored in Firebase so they persist across sessions and devices.',
    color: 'border-blue-400/20',
  },
  {
    question: 'What are Cloudflare Tunnels?',
    answer: 'Cloudflare Tunnels let you access your layout from anywhere — not just your home WiFi. The DEJA Server creates a secure tunnel to Cloudflare\'s network, giving you a public URL that reaches your command station without opening router ports or configuring firewalls. Control your layout from work, from a friend\'s house, or from a train show.',
    color: 'border-purple-400/20',
  },
  {
    question: 'How does the DEJA CLI work?',
    answer: 'The DEJA CLI is a single command that starts the entire platform. It launches the Node.js server, connects to your DCC-EX command station via USB serial, establishes the WebSocket server for browser connections, connects to Firebase for cloud sync, and optionally starts the MQTT broker for IO devices. One command: deja start.',
    color: 'border-green-400/20',
  },
  {
    question: 'How does MQTT work?',
    answer: 'MQTT is a lightweight messaging protocol designed for IoT devices. The DEJA Server runs an MQTT broker that Arduino and Pico W devices connect to wirelessly. When you trigger an effect in the app, the server publishes a message to the appropriate MQTT topic, and the device receives it in milliseconds. It\'s the same protocol used in industrial automation — reliable, fast, and designed for constrained hardware.',
    color: 'border-yellow-400/20',
  },
  {
    question: 'How does serial communication work?',
    answer: 'The DEJA Server connects to DCC-EX command stations over USB serial at 115200 baud. Every DCC command — throttle, turnout, function — is wrapped in angle brackets and sent as text: <t 3 50 1> means "set address 3 to speed 50, forward." The command station translates these into DCC signals on the track. Simple, documented, and open-source at the protocol level.',
    color: 'border-orange-400/20',
  },
];

export default function UnderTheHoodSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Header
  const headerOpacity = useTransform(scrollYProgress, [0, 0.12], [0, 1]);
  const headerY = useTransform(scrollYProgress, [0, 0.12], [24, 0]);

  return (
    <section ref={sectionRef}>
      <motion.div className="text-center mb-8" style={{ opacity: headerOpacity, y: headerY }}>
        <p className="text-xs text-gray-500 font-mono tracking-[0.2em] uppercase mb-2">Under the Hood</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          How it actually works.
        </h2>
        <p className="text-gray-400 text-sm max-w-lg mx-auto">
          DEJA.js is closed-source, but we believe in being open about how the platform works.
          Here&apos;s what&apos;s happening behind the scenes.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {explainers.map((item, i) => (
          <ExplainerCard key={item.question} item={item} index={i} scrollProgress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}

function ExplainerCard({
  item,
  index,
  scrollProgress,
}: {
  item: (typeof explainers)[number];
  index: number;
  scrollProgress: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
  const start = 0.1 + index * 0.03;
  const end = start + 0.1;
  const opacity = useTransform(scrollProgress, [start, end], [0, 1]);
  const y = useTransform(scrollProgress, [start, end], [20, 0]);

  return (
    <motion.div style={{ opacity, y }}>
      <div className={`rounded-xl border ${item.color} bg-gray-800/20 p-5 h-full`}>
        <p className="text-white font-semibold text-sm mb-2">{item.question}</p>
        <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
      </div>
    </motion.div>
  );
}

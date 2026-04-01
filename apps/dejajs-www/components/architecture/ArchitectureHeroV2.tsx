'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import TerminalMockup from './TerminalMockup';

/*
 * 🚂 ── V2: VERTICAL CENTERED LAYOUT w/ V1 ANIMATION PATTERN ──
 *
 * Same two-phase animation as V1, but with a centered vertical layout.
 * No zigzag — all elements stacked and centered. Connectors are straight
 * vertical lines instead of S-curves.
 *
 * 🎬 Phase 1 — Stage: elements fade in grayscale + dim (staggered 0.2s)
 * 🎬 Phase 2 — Story: tap → dots travel → elements activate (grayscale → color)
 *
 * ⏱️ 0.0–1.2s  Elements fade in (grayscale, 40% opacity)
 * ⏱️ 2.0s      TAP ripple → phone activates (color)
 * ⏱️ 2.6s      Dot travels conn 1 → arrives 3.4s → terminal activates
 * ⏱️ 3.6s      Terminal: "← throttle" appears
 * ⏱️ 4.2s      Terminal: "→ serial" appears
 * ⏱️ 4.5s      Dot travels conn 2 → arrives 5.3s → DCC-EX activates + glow
 * ⏱️ 5.7s      Dot travels conn 3 → arrives 6.5s → track activates, train orbits
 */

// 🕐 Timeline constants — identical to V1
const T = {
  // Phase 1: Stage setup (everything fades in grayscale)
  headline: 0,
  phone: 0.2,
  conn1Draw: 0.8,
  terminal: 0.4,
  conn2Draw: 1.0,
  dccex: 0.6,
  conn3Draw: 1.2,
  track: 0.8,
  subhead: 1.2,

  // Phase 2: The story 🎭
  tap: 2.0,           // 📱 phone activates
  dot1: 2.6,          // 🔵 dot travels conn 1 (0.8s)
  termActivate: 3.4,  // 💻 terminal activates (dot1 + 0.8)
  termCmd: 3.6,       // ⬅️ terminal receives command
  termSerial: 4.2,    // ➡️ terminal dispatches serial
  dot2: 4.5,          // 🟣 dot travels conn 2 (0.8s)
  dccActivate: 5.3,   // ⚡ DCC-EX activates (dot2 + 0.8)
  dccGlow: 5.3,
  dot3: 5.7,          // 🟠 dot travels conn 3 (0.8s)
  trackActivate: 6.5, // 🚂 track activates (dot3 + 0.8)
  trainStart: 6.6,
} as const;

// 🎨 Smooth ease-out curve for enter animations
const EASE_ENTER = [0.22, 1, 0.36, 1] as [number, number, number, number];

/** 🔗 Vertical connector with faint track line, animated draw, and a traveling command dot. */
function Connector({
  drawDelay,
  dotDelay,
  color1,
  color2,
  id,
}: {
  drawDelay: number;
  dotDelay: number;
  color1: string;
  color2: string;
  id: string;
}) {
  return (
    <div className="flex justify-center py-1">
      <div className="w-[2px] h-8 sm:h-10">
        <svg viewBox="0 0 2 100" className="w-full h-full" fill="none">
          {/* 🛤️ Faint background track */}
          <line x1="1" y1="0" x2="1" y2="100" stroke={color1} strokeOpacity={0.06} strokeWidth={2} />
          {/* ✏️ Animated draw line */}
          <motion.line
            x1="1" y1="0" x2="1" y2="100"
            stroke={`url(#${id})`}
            strokeWidth={2}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.0, delay: drawDelay, ease: EASE_ENTER }}
          />
          {/* 🔵 Traveling command dot */}
          <motion.circle
            r={4} fill={color1}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ delay: dotDelay, duration: 0.8, times: [0, 0.05, 0.9, 1] }}
          >
            <animateMotion dur="0.8s" fill="freeze" begin={`${dotDelay}s`}>
              <mpath href={`#${id}-path`} />
            </animateMotion>
          </motion.circle>
          {/* 💫 Glow halo around traveling dot */}
          <motion.circle
            r={8} fill={color1}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.2, 0.2, 0] }}
            transition={{ delay: dotDelay, duration: 0.8, times: [0, 0.05, 0.9, 1] }}
          >
            <animateMotion dur="0.8s" fill="freeze" begin={`${dotDelay}s`}>
              <mpath href={`#${id}-path`} />
            </animateMotion>
          </motion.circle>
          {/* 🛣️ Hidden path for animateMotion reference */}
          <line id={`${id}-path`} x1="1" y1="0" x2="1" y2="100" stroke="none" />
          <defs>
            <linearGradient id={id} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color1} stopOpacity={0.7} />
              <stop offset="100%" stopColor={color2} stopOpacity={0.5} />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

/** 👆 Tap ripple effect on the phone — identical to V1. */
function TapRipple({ delay }: { delay: number }) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ delay, duration: 0.8 }}
    >
      <motion.div
        className="w-6 h-6 rounded-full bg-white/30 backdrop-blur-sm"
        initial={{ scale: 0.5 }}
        animate={{ scale: [0.5, 1, 0.8] }}
        transition={{ delay, duration: 0.3 }}
      />
      <motion.div
        className="absolute w-12 h-12 rounded-full border-2 border-deja-cyan/40"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: [0.5, 1.8], opacity: [0, 0.6, 0] }}
        transition={{ delay: delay + 0.1, duration: 0.5 }}
      />
    </motion.div>
  );
}

/** 💻 Terminal with startup + command lines — same timing as V1. */
function AnimatedTerminal() {
  const lines = [
    { text: '$ deja start', color: 'text-deja-cyan', delay: T.terminal },
    { text: '✓ Ready', color: 'text-green-400', delay: T.terminal + 0.3 },
    { text: '', color: '', delay: T.terminal + 0.5 },
    { text: '← throttle {addr:3, speed:50}', color: 'text-yellow-400', delay: T.termCmd },
    { text: '→ <t 3 50 1>', color: 'text-deja-magenta', delay: T.termSerial },
  ];

  return (
    <div>
      <TerminalMockup title="deja — tamarack" className="text-[9px] w-[190px] sm:w-[230px]">
        {lines.map((line, i) => (
          <motion.p
            key={i}
            className={line.color}
            initial={{ opacity: 0, x: 4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: line.delay, ease: 'easeOut' }}
          >
            {line.text || '\u00A0'}
          </motion.p>
        ))}
      </TerminalMockup>
    </div>
  );
}

/** 🏟️ Stadium-shaped track with 5-dot train — identical logic to V1. */
function OvalTrack() {
  const outerTrack = 'M 60,10 L 140,10 A 30,30 0 0 1 140,70 L 60,70 A 30,30 0 0 1 60,10 Z';
  const innerTrack = 'M 62,14 L 138,14 A 26,26 0 0 1 138,66 L 62,66 A 26,26 0 0 1 62,14 Z';
  const orbitPath = 'M 61,12 L 139,12 A 28,28 0 0 1 139,68 L 61,68 A 28,28 0 0 1 61,12 Z';

  // 🪵 Railroad ties — Math.round() prevents hydration mismatches
  const ties: { x1: number; y1: number; x2: number; y2: number }[] = [];
  // Top straight ties
  for (let i = 0; i < 8; i++) { const x = 65 + i * 10; ties.push({ x1: x, y1: 7, x2: x, y2: 17 }); }
  // Bottom straight ties
  for (let i = 0; i < 8; i++) { const x = 65 + i * 10; ties.push({ x1: x, y1: 63, x2: x, y2: 73 }); }
  // Right curve ties
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i + 1) * (Math.PI / 6);
    ties.push({ x1: Math.round(140 + 25 * Math.cos(a)), y1: Math.round(40 + 25 * Math.sin(a)), x2: Math.round(140 + 35 * Math.cos(a)), y2: Math.round(40 + 35 * Math.sin(a)) });
  }
  // Left curve ties
  for (let i = 0; i < 5; i++) {
    const a = Math.PI / 2 + (i + 1) * (Math.PI / 6);
    ties.push({ x1: Math.round(60 + 25 * Math.cos(a)), y1: Math.round(40 + 25 * Math.sin(a)), x2: Math.round(60 + 35 * Math.cos(a)), y2: Math.round(40 + 35 * Math.sin(a)) });
  }

  return (
    <div className="w-[140px] sm:w-[170px] h-[56px] sm:h-[68px] relative">
      <svg viewBox="0 0 200 80" className="w-full h-full" fill="none">
        {/* 🪵 Ties fade in one by one */}
        {ties.map((t, i) => (
          <motion.line
            key={i}
            x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke="#F97316" strokeOpacity={0.2} strokeWidth={1.5}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: T.track + 0.1 + i * 0.015 }}
          />
        ))}
        {/* 🛤️ Outer rail draws in */}
        <motion.path d={outerTrack} stroke="#F97316" strokeOpacity={0.35} strokeWidth={1.2} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: T.track, ease: EASE_ENTER }} />
        {/* 🛤️ Inner rail draws in */}
        <motion.path d={innerTrack} stroke="#F97316" strokeOpacity={0.25} strokeWidth={1} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: T.track + 0.08, ease: EASE_ENTER }} />
        {/* 🚂 5-dot train — each dot starts slightly later for a following chain */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.circle key={i} r={i === 0 ? 4.5 : 3} fill="#F97316" fillOpacity={i === 0 ? 1 : 0.7 - i * 0.1}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: T.trainStart + i * 0.1, duration: 0.3 }}>
            <animateMotion dur="3s" repeatCount="indefinite" begin={`${T.trainStart + i * 0.1}s`}>
              <mpath href="#v2-stadium-orbit" />
            </animateMotion>
          </motion.circle>
        ))}
        <path id="v2-stadium-orbit" d={orbitPath} fill="none" stroke="none" />
      </svg>
    </div>
  );
}

export default function ArchitectureHeroV2() {
  return (
    <section className="relative -mx-6 px-6 py-6 sm:py-10">
      <div className="flex items-center justify-center">
        <div className="absolute inset-0 bg-grid-dark opacity-40" />

        <div className="relative w-full max-w-lg sm:max-w-2xl mx-auto flex flex-col items-center">

          {/* ── 📝 Headline — centered above the cascade ── */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl tracking-wide text-white">
              <motion.span className="inline-block mr-3 sm:mr-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: T.headline, ease: EASE_ENTER }}>
                Tap.
              </motion.span>
              <motion.span className="inline-block mr-3 sm:mr-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: T.headline + 0.15, ease: EASE_ENTER }}>
                Command.
              </motion.span>
              <motion.span className="inline-block text-deja-cyan" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: T.headline + 0.3, ease: EASE_ENTER }}>
                Move.
              </motion.span>
            </h1>
            <motion.p
              className="text-gray-400 text-sm sm:text-base mt-4 max-w-md mx-auto"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: T.subhead, ease: EASE_ENTER }}
            >
              From the app in your hand to the track under your trains — every layer connected.
            </motion.p>
          </div>

          {/* ── 🎬 Vertical cascade — all centered ── */}
          <div className="flex flex-col items-center w-full">

            {/* 📱 Row 1: Phone — centered (visible immediately in grayscale, activates on tap) */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: T.phone, ease: EASE_ENTER }}
            >
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: T.tap, duration: 0.5, ease: 'easeOut' }}
                >
                  <Image
                    src="/screenshots/throttle_mobile_throttle.png"
                    alt="Throttle app — slide to control speed"
                    width={260} height={560}
                    className="w-[90px] sm:w-[120px] h-auto max-h-[160px] sm:max-h-[200px] object-cover object-top rounded-lg"
                  />
                  <TapRipple delay={T.tap} />
                  {/* ✨ Pulse glow behind phone on activation */}
                  <motion.div
                    className="absolute -inset-2 rounded-2xl -z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.5, 0], scale: [0.95, 1.05, 1] }}
                    transition={{ delay: T.tap, duration: 0.8 }}
                    style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.3) 0%, transparent 70%)' }}
                  />
                </motion.div>
                {/* 🏷️ Label: gray → cyan on activation */}
                <div className="text-center">
                  <motion.p
                    className="font-mono text-xs sm:text-sm font-semibold"
                    initial={{ color: '#9CA3AF' }}
                    animate={{ color: '#00E5FF' }}
                    transition={{ delay: T.tap, duration: 0.5 }}
                  >You tap</motion.p>
                  <p className="text-gray-500 text-[10px] sm:text-xs mt-0.5">Throttle App</p>
                </div>
              </div>
            </motion.div>

            {/* 🔗 Connector 1: Phone → Terminal */}
            <Connector drawDelay={T.conn1Draw} dotDelay={T.dot1} color1="#00E5FF" color2="#00E5FF" id="v2-conn-1" />

            {/* 💻 Row 2: Terminal — centered (visible in grayscale, activates when dot arrives) */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: T.terminal, ease: EASE_ENTER }}
            >
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: T.termActivate, duration: 0.5, ease: 'easeOut' }}
                >
                  <AnimatedTerminal />
                  {/* ✨ Pulse glow behind terminal on activation */}
                  <motion.div
                    className="absolute -inset-2 rounded-2xl -z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.4, 0], scale: [0.95, 1.05, 1] }}
                    transition={{ delay: T.termActivate, duration: 0.8 }}
                    style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.25) 0%, transparent 70%)' }}
                  />
                </motion.div>
                {/* 🏷️ Label: gray → cyan on activation */}
                <div className="text-center">
                  <motion.p
                    className="font-mono text-xs sm:text-sm font-semibold"
                    initial={{ color: '#9CA3AF' }}
                    animate={{ color: '#00E5FF' }}
                    transition={{ delay: T.termActivate, duration: 0.5 }}
                  >Server routes</motion.p>
                  <p className="text-gray-500 text-[10px] sm:text-xs mt-0.5">DEJA Server</p>
                </div>
              </div>
            </motion.div>

            {/* 🔗 Connector 2: Terminal → DCC-EX */}
            <Connector drawDelay={T.conn2Draw} dotDelay={T.dot2} color1="#00E5FF" color2="#8B5CF6" id="v2-conn-2" />

            {/* ⚡ Row 3: DCC-EX — centered (visible in grayscale, activates when dot arrives) */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: T.dccex, ease: EASE_ENTER }}
            >
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  className="relative w-[100px] sm:w-[130px]"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: T.dccActivate, duration: 0.5, ease: 'easeOut' }}
                >
                  <Image
                    src="/images/dcc-ex-commandstation.png"
                    alt="DCC-EX CommandStation — Arduino Mega with Motor Shield"
                    width={440} height={300}
                    className="w-full h-auto drop-shadow-[0_0_12px_rgba(0,229,255,0.2)]"
                  />
                  {/* 🏷️ DCC-EX logo overlay */}
                  <Image
                    src="/dcc-ex/android-chrome-192x192.png"
                    alt="DCC-EX"
                    width={32} height={32}
                    className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-purple-500/30 shadow-lg"
                  />
                  {/* ✨ Pulse glow behind DCC-EX on activation */}
                  <motion.div
                    className="absolute -inset-2 rounded-2xl -z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.4, 0], scale: [0.95, 1.05, 1] }}
                    transition={{ delay: T.dccActivate, duration: 0.8 }}
                    style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)' }}
                  />
                </motion.div>
                {/* 🏷️ Label: gray → purple on activation */}
                <div className="text-center">
                  <motion.p
                    className="font-mono text-xs sm:text-sm font-semibold"
                    initial={{ color: '#9CA3AF' }}
                    animate={{ color: '#A78BFA' }}
                    transition={{ delay: T.dccActivate, duration: 0.5 }}
                  >Translates &amp; transmits</motion.p>
                  <p className="text-gray-500 text-[10px] sm:text-xs mt-0.5">DCC-EX CommandStation</p>
                </div>
              </div>
            </motion.div>

            {/* 🔗 Connector 3: DCC-EX → Track */}
            <Connector drawDelay={T.conn3Draw} dotDelay={T.dot3} color1="#8B5CF6" color2="#F97316" id="v2-conn-3" />

            {/* 🚂 Row 4: Track — centered (visible in grayscale, activates when dot arrives) */}
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: T.track, ease: EASE_ENTER }}
            >
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: T.trackActivate, duration: 0.5, ease: 'easeOut' }}
                >
                  <OvalTrack />
                  {/* ✨ Pulse glow behind track on activation */}
                  <motion.div
                    className="absolute -inset-2 rounded-2xl -z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.4, 0], scale: [0.95, 1.05, 1] }}
                    transition={{ delay: T.trackActivate, duration: 0.8 }}
                    style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.3) 0%, transparent 70%)' }}
                  />
                </motion.div>
                {/* 🏷️ Label: gray → orange on activation */}
                <div className="text-center">
                  <motion.p
                    className="font-mono text-xs sm:text-sm font-semibold"
                    initial={{ color: '#9CA3AF' }}
                    animate={{ color: '#F97316' }}
                    transition={{ delay: T.trackActivate, duration: 0.5 }}
                  >Train moves</motion.p>
                  <p className="text-gray-500 text-[10px] sm:text-xs mt-0.5">DCC Track</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import TerminalMockup from './TerminalMockup';

/*
 * 🚂 ── ARCHITECTURE HERO V3: "Horizontal Genie" ──
 *
 * All 4 items shown small in a horizontal row, connected by lines.
 * Each item "activates" by zooming up (genie effect), then scales back down.
 * A traveling dot connects each transition along the horizontal connectors.
 *
 * 📐 Layout:
 *   - Headline centered above
 *   - 4 items in a row (flex-col sm:flex-row), connected by horizontal lines
 *   - All start small + grayscale
 *
 * ⏱️ TIMELINE:
 *   0.0–0.6s  All items fade in (small, grayscale)
 *   1.0s      📱 Phone zooms in (scale up + grayscale→color + pulse glow)
 *   1.5s      👆 Tap ripple on phone
 *   2.0s      📱 Phone zooms out (scale back down)
 *   2.2s      🔵 Dot travels horizontal connector 1
 *   2.8s      💻 Terminal zooms in (scale up + grayscale→color)
 *   3.4s      💻 Terminal shows commands
 *   4.0s      💻 Terminal zooms out
 *   4.2s      🔵 Dot travels connector 2
 *   4.8s      🟣 DCC-EX zooms in (scale up + grayscale→color + glow)
 *   5.4s      🟣 DCC-EX zooms out
 *   5.6s      🔵 Dot travels connector 3
 *   6.2s      🟠 Track zooms in (scale up + grayscale→color), train orbits (stays zoomed)
 */

// ⏱️ Timeline constants
const T = {
  // 🎬 Phase 1: Fade in (small, grayscale)
  fadeIn: 0.0,
  fadeInDuration: 0.6,

  // 📱 Phase 2: Phone genie
  phoneZoomIn: 1.0,
  tap: 1.5,
  phoneZoomOut: 2.0,

  // 🔵 Connector 1
  dot1: 2.2,
  dot1Duration: 0.5,

  // 💻 Phase 3: Terminal genie
  termZoomIn: 2.8,
  termCmd: 3.4,
  termZoomOut: 4.0,

  // 🔵 Connector 2
  dot2: 4.2,
  dot2Duration: 0.5,

  // 🟣 Phase 4: DCC-EX genie
  dccZoomIn: 4.8,
  dccZoomOut: 5.4,

  // 🔵 Connector 3
  dot3: 5.6,
  dot3Duration: 0.5,

  // 🟠 Phase 5: Track genie (stays zoomed)
  trackZoomIn: 6.2,
  trainStart: 6.4,
} as const;

const EASE_ENTER = [0.22, 1, 0.36, 1] as [number, number, number, number];
const EASE_GENIE = [0.34, 1.56, 0.64, 1] as [number, number, number, number]; // 🪄 Springy zoom

// 🎨 Accent colors
const COLORS = {
  phone: '#00E5FF',
  terminal: '#00E5FF',
  dccex: '#A78BFA',
  track: '#F97316',
  inactive: '#9CA3AF',
} as const;

/** 👆 Tap ripple effect on the phone */
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

/** 💻 Terminal with animated command lines */
function AnimatedTerminal({ cmdDelay }: { cmdDelay: number }) {
  const lines = [
    { text: '$ deja start', color: 'text-deja-cyan', delay: cmdDelay },
    { text: '✓ Ready', color: 'text-green-400', delay: cmdDelay + 0.15 },
    { text: '', color: '', delay: cmdDelay + 0.25 },
    { text: '← throttle {addr:3, speed:50}', color: 'text-yellow-400', delay: cmdDelay + 0.3 },
    { text: '→ <t 3 50 1>', color: 'text-deja-magenta', delay: cmdDelay + 0.5 },
  ];

  return (
    <TerminalMockup title="deja — tamarack" className="text-[8px] sm:text-[9px] w-[170px] sm:w-[200px]">
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
  );
}

/** 🏟️ Stadium-shaped oval track with 5-dot train */
function OvalTrack({ activateAt }: { activateAt: number }) {
  const outerTrack = 'M 60,10 L 140,10 A 30,30 0 0 1 140,70 L 60,70 A 30,30 0 0 1 60,10 Z';
  const innerTrack = 'M 62,14 L 138,14 A 26,26 0 0 1 138,66 L 62,66 A 26,26 0 0 1 62,14 Z';
  const orbitPath = 'M 61,12 L 139,12 A 28,28 0 0 1 139,68 L 61,68 A 28,28 0 0 1 61,12 Z';

  // 🪵 Railroad ties
  const ties: { x1: number; y1: number; x2: number; y2: number }[] = [];
  // Top straight ties
  for (let i = 0; i < 8; i++) { const x = 65 + i * 10; ties.push({ x1: x, y1: 7, x2: x, y2: 17 }); }
  // Bottom straight ties
  for (let i = 0; i < 8; i++) { const x = 65 + i * 10; ties.push({ x1: x, y1: 63, x2: x, y2: 73 }); }
  // Right curve ties (Math.round for clean coords)
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i + 1) * (Math.PI / 6);
    ties.push({
      x1: Math.round(140 + 25 * Math.cos(a)),
      y1: Math.round(40 + 25 * Math.sin(a)),
      x2: Math.round(140 + 35 * Math.cos(a)),
      y2: Math.round(40 + 35 * Math.sin(a)),
    });
  }
  // Left curve ties
  for (let i = 0; i < 5; i++) {
    const a = Math.PI / 2 + (i + 1) * (Math.PI / 6);
    ties.push({
      x1: Math.round(60 + 25 * Math.cos(a)),
      y1: Math.round(40 + 25 * Math.sin(a)),
      x2: Math.round(60 + 35 * Math.cos(a)),
      y2: Math.round(40 + 35 * Math.sin(a)),
    });
  }

  return (
    <div className="w-[120px] sm:w-[150px] h-[48px] sm:h-[60px] relative">
      <svg viewBox="0 0 200 80" className="w-full h-full" fill="none">
        {ties.map((t, i) => (
          <motion.line
            key={i}
            x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke="#F97316" strokeOpacity={0.2} strokeWidth={1.5}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: activateAt + 0.1 + i * 0.015 }}
          />
        ))}
        <motion.path d={outerTrack} stroke="#F97316" strokeOpacity={0.35} strokeWidth={1.2} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: activateAt, ease: EASE_ENTER }} />
        <motion.path d={innerTrack} stroke="#F97316" strokeOpacity={0.25} strokeWidth={1} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: activateAt + 0.08, ease: EASE_ENTER }} />
        {/* 🚂 5-dot train — each dot starts slightly later for a chain effect */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.circle
            key={i}
            r={i === 0 ? 4.5 : 3}
            fill="#F97316"
            fillOpacity={i === 0 ? 1 : 0.7 - i * 0.1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: T.trainStart + i * 0.1, duration: 0.3 }}
          >
            <animateMotion dur="3s" repeatCount="indefinite" begin={`${T.trainStart + i * 0.1}s`}>
              <mpath href="#v3-stadium-orbit" />
            </animateMotion>
          </motion.circle>
        ))}
        <path id="v3-stadium-orbit" d={orbitPath} fill="none" stroke="none" />
      </svg>
    </div>
  );
}

/** 🔗 Horizontal connector line with a traveling dot between items */
function HorizontalConnector({
  drawDelay,
  dotDelay,
  dotDuration,
  color1,
  color2,
  id,
}: {
  drawDelay: number;
  dotDelay: number;
  dotDuration: number;
  color1: string;
  color2: string;
  id: string;
}) {
  // 📏 Horizontal line path (left to right)
  const d = 'M 5,25 L 95,25';

  return (
    <div className="w-8 sm:w-16 h-[50px] flex items-center shrink-0">
      <svg viewBox="0 0 100 50" className="w-full h-full" fill="none">
        {/* 🔘 Faint track background */}
        <path d={d} stroke={color1} strokeOpacity={0.08} strokeWidth={2} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {/* ✨ Animated draw-in */}
        <motion.path
          d={d}
          stroke={`url(#${id})`}
          strokeWidth={2}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: drawDelay, ease: EASE_ENTER }}
        />
        {/* 🔵 Traveling dot (solid core) */}
        <motion.circle
          r={4} fill={color1}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ delay: dotDelay, duration: dotDuration, times: [0, 0.05, 0.9, 1] }}
        >
          <animateMotion dur={`${dotDuration}s`} fill="freeze" begin={`${dotDelay}s`}>
            <mpath href={`#${id}-path`} />
          </animateMotion>
        </motion.circle>
        {/* 🌟 Traveling dot (glow halo) */}
        <motion.circle
          r={8} fill={color1}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.25, 0.25, 0] }}
          transition={{ delay: dotDelay, duration: dotDuration, times: [0, 0.05, 0.9, 1] }}
        >
          <animateMotion dur={`${dotDuration}s`} fill="freeze" begin={`${dotDelay}s`}>
            <mpath href={`#${id}-path`} />
          </animateMotion>
        </motion.circle>
        {/* 🛤️ Hidden path for animateMotion */}
        <path id={`${id}-path`} d={d} fill="none" stroke="none" />
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color1} stopOpacity={0.7} />
            <stop offset="100%" stopColor={color2} stopOpacity={0.5} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/** 🪄 Genie wrapper — handles zoom in/out + grayscale→color transitions */
function GenieItem({
  children,
  zoomInAt,
  zoomOutAt,
  accentColor,
  stayZoomed = false,
  fadeInDelay,
}: {
  children: React.ReactNode;
  zoomInAt: number;
  zoomOutAt: number;
  accentColor: string;
  stayZoomed?: boolean;
  fadeInDelay: number;
}) {
  // 🎬 Build the scale keyframes: 1 → 1.8 → 1 (or stay at 1.8)
  const scaleKeyframes = stayZoomed ? [1, 1.8] : [1, 1.8, 1];
  const scaleTimes = stayZoomed ? [0, 1] : [0, 0.5, 1];
  const totalScaleDuration = stayZoomed
    ? (zoomInAt - zoomInAt + 0.5) // just zoom in
    : (zoomOutAt - zoomInAt + 0.5); // zoom in + hold + zoom out

  return (
    <motion.div
      className="relative flex flex-col items-center z-10"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: fadeInDelay, ease: EASE_ENTER }}
    >
      {/* 🔍 Scale container (genie zoom) */}
      <motion.div
        className="relative"
        animate={{ scale: scaleKeyframes }}
        transition={{
          delay: zoomInAt,
          duration: totalScaleDuration,
          times: scaleTimes,
          ease: EASE_GENIE,
        }}
        style={{ zIndex: 20 }}
      >
        {/* 🎨 Fade in on activation */}
        <motion.div
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          transition={{ delay: zoomInAt, duration: 0.4, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
        {/* ✨ Pulse glow on activation */}
        <motion.div
          className="absolute -inset-3 rounded-2xl -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0], scale: [0.95, 1.1, 1] }}
          transition={{ delay: zoomInAt, duration: 0.8 }}
          style={{ background: `radial-gradient(circle, ${accentColor}40 0%, transparent 70%)` }}
        />
      </motion.div>
    </motion.div>
  );
}

// 🚀 Main component export
export default function ArchitectureHeroV3() {
  return (
    <section className="relative -mx-6 px-6 py-6 sm:py-10">
      <div className="flex items-center justify-center">
        <div className="absolute inset-0 bg-grid-dark opacity-40" />

        <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center">

          {/* 🏷️ Headline — centered above */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl tracking-wide text-white">
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0, ease: EASE_ENTER }}
              >
                Tap.
              </motion.span>
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease: EASE_ENTER }}
              >
                Command.
              </motion.span>
              <motion.span
                className="block text-deja-cyan"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3, ease: EASE_ENTER }}
              >
                Move.
              </motion.span>
            </h1>
            <motion.p
              className="text-gray-400 text-sm sm:text-base mt-4 max-w-md mx-auto"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5, ease: EASE_ENTER }}
            >
              From the app in your hand to the track under your trains — every layer connected.
            </motion.p>
          </div>

          {/* 🔗 Horizontal row of items + connectors */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-0">

            {/* 📱 Item 1: Phone */}
            <div className="flex flex-col items-center">
              <GenieItem
                zoomInAt={T.phoneZoomIn}
                zoomOutAt={T.phoneZoomOut}
                accentColor={COLORS.phone}
                fadeInDelay={T.fadeIn + 0.05}
              >
                <div className="relative w-[60px] sm:w-[70px]">
                  <Image
                    src="/screenshots/throttle_mobile_throttle.png"
                    alt="Throttle app — slide to control speed"
                    width={260}
                    height={560}
                    className="w-full h-auto max-h-[100px] sm:max-h-[120px] object-cover object-top rounded-lg"
                  />
                  <TapRipple delay={T.tap} />
                </div>
              </GenieItem>
              {/* 🏷️ Label */}
              <motion.p
                className="font-mono text-[10px] sm:text-xs font-semibold mt-2 whitespace-nowrap"
                initial={{ color: COLORS.inactive }}
                animate={{ color: COLORS.phone }}
                transition={{ delay: T.phoneZoomIn, duration: 0.5 }}
              >
                You tap
              </motion.p>
              <p className="text-gray-500 text-[9px] sm:text-[10px]">Throttle App</p>
            </div>

            {/* 🔗 Connector 1: Phone → Terminal */}
            <HorizontalConnector
              drawDelay={T.fadeIn + 0.3}
              dotDelay={T.dot1}
              dotDuration={T.dot1Duration}
              color1={COLORS.phone}
              color2={COLORS.terminal}
              id="v3-conn-1"
            />

            {/* 💻 Item 2: Terminal */}
            <div className="flex flex-col items-center">
              <GenieItem
                zoomInAt={T.termZoomIn}
                zoomOutAt={T.termZoomOut}
                accentColor={COLORS.terminal}
                fadeInDelay={T.fadeIn + 0.15}
              >
                <AnimatedTerminal cmdDelay={T.termCmd} />
              </GenieItem>
              {/* 🏷️ Label */}
              <motion.p
                className="font-mono text-[10px] sm:text-xs font-semibold mt-2 whitespace-nowrap"
                initial={{ color: COLORS.inactive }}
                animate={{ color: COLORS.terminal }}
                transition={{ delay: T.termZoomIn, duration: 0.5 }}
              >
                Server routes
              </motion.p>
              <p className="text-gray-500 text-[9px] sm:text-[10px]">DEJA Server</p>
            </div>

            {/* 🔗 Connector 2: Terminal → DCC-EX */}
            <HorizontalConnector
              drawDelay={T.fadeIn + 0.4}
              dotDelay={T.dot2}
              dotDuration={T.dot2Duration}
              color1={COLORS.terminal}
              color2={COLORS.dccex}
              id="v3-conn-2"
            />

            {/* 🟣 Item 3: DCC-EX */}
            <div className="flex flex-col items-center">
              <GenieItem
                zoomInAt={T.dccZoomIn}
                zoomOutAt={T.dccZoomOut}
                accentColor={COLORS.dccex}
                fadeInDelay={T.fadeIn + 0.3}
              >
                <div className="relative w-[70px] sm:w-[80px]">
                  <Image
                    src="/images/dcc-ex-commandstation.png"
                    alt="DCC-EX CommandStation — Arduino Mega with Motor Shield"
                    width={440}
                    height={300}
                    className="w-full h-auto drop-shadow-[0_0_12px_rgba(139,92,246,0.2)]"
                  />
                  <Image
                    src="/dcc-ex/android-chrome-192x192.png"
                    alt="DCC-EX"
                    width={32}
                    height={32}
                    className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-purple-500/30 shadow-lg"
                  />
                </div>
              </GenieItem>
              {/* 🏷️ Label */}
              <motion.p
                className="font-mono text-[10px] sm:text-xs font-semibold mt-2 whitespace-nowrap"
                initial={{ color: COLORS.inactive }}
                animate={{ color: COLORS.dccex }}
                transition={{ delay: T.dccZoomIn, duration: 0.5 }}
              >
                Translates &amp; transmits
              </motion.p>
              <p className="text-gray-500 text-[9px] sm:text-[10px]">DCC-EX CommandStation</p>
            </div>

            {/* 🔗 Connector 3: DCC-EX → Track */}
            <HorizontalConnector
              drawDelay={T.fadeIn + 0.5}
              dotDelay={T.dot3}
              dotDuration={T.dot3Duration}
              color1={COLORS.dccex}
              color2={COLORS.track}
              id="v3-conn-3"
            />

            {/* 🟠 Item 4: Track (stays zoomed!) */}
            <div className="flex flex-col items-center">
              <GenieItem
                zoomInAt={T.trackZoomIn}
                zoomOutAt={T.trackZoomIn} /* ⬅️ not used since stayZoomed=true */
                accentColor={COLORS.track}
                stayZoomed
                fadeInDelay={T.fadeIn + 0.45}
              >
                <OvalTrack activateAt={T.trackZoomIn} />
              </GenieItem>
              {/* 🏷️ Label */}
              <motion.p
                className="font-mono text-[10px] sm:text-xs font-semibold mt-2 whitespace-nowrap"
                initial={{ color: COLORS.inactive }}
                animate={{ color: COLORS.track }}
                transition={{ delay: T.trackZoomIn, duration: 0.5 }}
              >
                Train moves
              </motion.p>
              <p className="text-gray-500 text-[9px] sm:text-[10px]">DCC Track</p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

// 🎯 Named export
export { ArchitectureHeroV3 };

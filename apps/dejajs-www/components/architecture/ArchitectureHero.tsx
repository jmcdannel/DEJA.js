'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import TerminalMockup from './TerminalMockup';

/*
 * ── ARCHITECTURE HERO — TWO-PHASE ANIMATION ──
 *
 * PHASE 1 — INTRO (on scroll/click):
 *   Phone zooms out → lines draw in → terminal fades in → "deja start" types
 *   → ✓ Ready → connector 2 → DCC-EX → connector 3 → track (train parked)
 *
 * PHASE 2 — STORY (automatic, after phase 1):
 *   Tap ripple → "You tap" label → dot flies conn 1 → "Server routes" label
 *   → throttle command lines roll in → dot flies conn 2 → "Translates" label
 *   → dot flies conn 3 → "Train moves" label → train orbits! 🚂
 */

const SEQ = {
  // ── PHASE 1: intro ────────────────────────────────
  phoneShrinkDur: 0.35,
  conn1Draw: 0.35,
  conn1Dur: 0.35,
  terminalFade: 0.6,
  terminalDur: 0.2,
  typingStart: 0.75,    // "deja start" @ 40ms/char ≈ 0.4s
  readyLine: 1.2,
  conn2Draw: 1.3,
  conn2Dur: 0.35,
  dccFade: 1.55,
  dccDur: 0.2,
  conn3Draw: 1.7,
  conn3Dur: 0.35,
  trackFade: 1.95,
  trackDur: 0.2,

  // ── PHASE 2: story (slower — gives viewer time to read each label) ────────
  tap: 2.25,            // 👆 tap ripple on phone
  label1: 2.35,         // "You tap" / "Throttle App"
  dot1: 2.95,           // pause 0.6s after label1 so the viewer can read it
  dotDur: 0.8,
  label2: 3.85,         // "Server routes" / "DEJA Server" — as dot arrives
  throttleCmd: 4.35,    // ← throttle line
  serialCmd: 4.7,       // → <t 3 50 1> line
  dot2: 5.25,
  label3: 6.15,         // "Translates & transmits" / "DCC-EX CommandStation"
  dot3: 6.65,
  label4: 7.55,         // "Train moves" / "DCC Track"
  trainStart: 7.65,     // 🚂 train begins orbit
} as const;

const EASE_ENTER = [0.22, 1, 0.36, 1] as [number, number, number, number];

interface ArchitectureHeroProps {
  /** Start the sequence immediately on mount (used by the replay button). */
  autoStart?: boolean;
}

/** Smooth cable-drape S-curve connector, optional traveling command dot. */
function Connector({
  direction,
  drawDelay,
  drawDuration = 0.35,
  color1,
  color2,
  id,
  showDot = false,
  dotDelay = 0,
  dotDuration = 0.6,
}: {
  direction: 'left-to-right' | 'right-to-left';
  drawDelay: number;
  drawDuration?: number;
  color1: string;
  color2: string;
  id: string;
  showDot?: boolean;
  dotDelay?: number;
  dotDuration?: number;
}) {
  // Original vertical-tangent S — renders as a letterboxed square in the row
  // center thanks to the default preserveAspectRatio="xMidYMid meet". Graphics
  // are positioned near the row center to sit close to the curve endpoints.
  const d =
    direction === 'left-to-right'
      ? 'M 10,2 C 10,40 90,60 90,98'
      : 'M 90,2 C 90,40 10,60 10,98';

  return (
    <div className="w-full h-10 sm:h-12">
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
      >
        <path
          d={d}
          stroke={color1}
          strokeOpacity={0.06}
          strokeWidth={2}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <motion.path
          d={d}
          stroke={`url(#${id})`}
          strokeWidth={2}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: drawDuration, delay: drawDelay, ease: EASE_ENTER }}
        />
        {showDot && (
          <>
            <motion.circle
              r={4}
              fill={color1}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ delay: dotDelay, duration: dotDuration, times: [0, 0.05, 0.9, 1] }}
            >
              <animateMotion dur={`${dotDuration}s`} fill="freeze" begin={`${dotDelay}s`}>
                <mpath href={`#${id}-path`} />
              </animateMotion>
            </motion.circle>
            <motion.circle
              r={8}
              fill={color1}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.25, 0.25, 0] }}
              transition={{ delay: dotDelay, duration: dotDuration, times: [0, 0.05, 0.9, 1] }}
            >
              <animateMotion dur={`${dotDuration}s`} fill="freeze" begin={`${dotDelay}s`}>
                <mpath href={`#${id}-path`} />
              </animateMotion>
            </motion.circle>
          </>
        )}
        <path id={`${id}-path`} d={d} fill="none" stroke="none" />
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color1} stopOpacity={0.8} />
            <stop offset="100%" stopColor={color2} stopOpacity={0.6} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/** 👆 Tap ripple on the phone. */
function TapRipple({ delay }: { delay: number }) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ delay, duration: 0.7 }}
    >
      <motion.div
        className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm"
        initial={{ scale: 0.5 }}
        animate={{ scale: [0.5, 1, 0.8] }}
        transition={{ delay, duration: 0.3 }}
      />
      <motion.div
        className="absolute w-16 h-16 rounded-full border-2 border-deja-cyan/50"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: [0.5, 2.0], opacity: [0, 0.7, 0] }}
        transition={{ delay: delay + 0.05, duration: 0.5 }}
      />
    </motion.div>
  );
}

/** Types text one character at a time after an absolute delay. */
function TypeWriter({
  text,
  startAt,
  speed = 40,
}: {
  text: string;
  startAt: number;
  speed?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    const startTimer = setTimeout(() => {
      interval = setInterval(() => {
        setCount((c) => {
          if (c >= text.length) {
            if (interval) clearInterval(interval);
            return c;
          }
          return c + 1;
        });
      }, speed);
    }, startAt * 1000);

    return () => {
      clearTimeout(startTimer);
      if (interval) clearInterval(interval);
    };
  }, [text, startAt, speed]);

  return <span>{text.slice(0, count)}</span>;
}

/** Terminal with typewriter prompt + rolling output lines. */
function SequenceTerminal() {
  // Delays are relative to terminal mount, so subtract terminalFade offset.
  const typingStart = SEQ.typingStart - SEQ.terminalFade;
  const readyStart = SEQ.readyLine - SEQ.terminalFade;
  const throttleStart = SEQ.throttleCmd - SEQ.terminalFade;
  const serialStart = SEQ.serialCmd - SEQ.terminalFade;

  return (
    <TerminalMockup title="deja — tamarack" className="text-[10px] w-[210px] sm:w-[240px]">
      <p className="text-deja-cyan">
        $ <TypeWriter text="deja start" startAt={typingStart} />
      </p>
      <motion.p
        className="text-green-400"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: readyStart, duration: 0.18, ease: 'easeOut' }}
      >
        ✓ Ready
      </motion.p>
      {/* 🏗️ reserved space — actual content rolls in during phase 2 */}
      <p aria-hidden className="invisible">{'\u00A0'}</p>
      <motion.p
        className="text-yellow-400"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: throttleStart, duration: 0.25, ease: 'easeOut' }}
      >
        ← throttle {'{addr:3, speed:50}'}
      </motion.p>
      <motion.p
        className="text-deja-magenta"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: serialStart, duration: 0.25, ease: 'easeOut' }}
      >
        → {'<t 3 50 1>'}
      </motion.p>
    </TerminalMockup>
  );
}

/** Stadium track — train parked initially, starts orbiting at `trainStartDelay`. */
function SequenceOvalTrack({ trainStartDelay }: { trainStartDelay: number }) {
  const outerTrack = 'M 60,10 L 140,10 A 30,30 0 0 1 140,70 L 60,70 A 30,30 0 0 1 60,10 Z';
  const innerTrack = 'M 62,14 L 138,14 A 26,26 0 0 1 138,66 L 62,66 A 26,26 0 0 1 62,14 Z';
  const orbitPath = 'M 61,12 L 139,12 A 28,28 0 0 1 139,68 L 61,68 A 28,28 0 0 1 61,12 Z';

  const [moving, setMoving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMoving(true), trainStartDelay * 1000);
    return () => clearTimeout(timer);
  }, [trainStartDelay]);

  const ties: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i < 8; i++) { const x = 65 + i * 10; ties.push({ x1: x, y1: 7, x2: x, y2: 17 }); }
  for (let i = 0; i < 8; i++) { const x = 65 + i * 10; ties.push({ x1: x, y1: 63, x2: x, y2: 73 }); }
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i + 1) * (Math.PI / 6);
    ties.push({
      x1: Math.round(140 + 25 * Math.cos(a)),
      y1: Math.round(40 + 25 * Math.sin(a)),
      x2: Math.round(140 + 35 * Math.cos(a)),
      y2: Math.round(40 + 35 * Math.sin(a)),
    });
  }
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
    <div className="w-[140px] sm:w-[170px] h-[56px] sm:h-[68px] relative">
      <svg viewBox="0 0 200 80" className="w-full h-full" fill="none">
        {ties.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke="#F97316"
            strokeOpacity={0.2}
            strokeWidth={1.5}
          />
        ))}
        <path d={outerTrack} stroke="#F97316" strokeOpacity={0.35} strokeWidth={1.2} />
        <path d={innerTrack} stroke="#F97316" strokeOpacity={0.25} strokeWidth={1} />

        {moving ? (
          // 🚂 train chain orbiting the path
          [0, 1, 2, 3, 4].map((i) => (
            <circle key={i} r={i === 0 ? 4.5 : 3} fill="#F97316" fillOpacity={i === 0 ? 1 : 0.75 - i * 0.1}>
              <animateMotion dur="3s" repeatCount="indefinite" begin={`${i * 0.1}s`}>
                <mpath href="#stadium-orbit" />
              </animateMotion>
            </circle>
          ))
        ) : (
          // 🛑 train parked at the top-left
          <>
            <circle cx={61} cy={12} r={4.5} fill="#F97316" />
            <circle cx={71} cy={12} r={3} fill="#F97316" fillOpacity={0.75} />
            <circle cx={81} cy={12} r={3} fill="#F97316" fillOpacity={0.65} />
            <circle cx={91} cy={12} r={3} fill="#F97316" fillOpacity={0.55} />
            <circle cx={101} cy={12} r={3} fill="#F97316" fillOpacity={0.45} />
          </>
        )}

        <path id="stadium-orbit" d={orbitPath} fill="none" stroke="none" />
      </svg>
    </div>
  );
}

/**
 * Two-line label that fades in with a subtle slide.
 * - Mobile (< sm): stacks above the graphic, centered.
 * - Desktop (≥ sm): sits beside the graphic (left or right).
 */
function StepLabel({
  title,
  subtitle,
  color,
  delay,
  align = 'left',
  className = '',
}: {
  title: string;
  subtitle: string;
  color: string;
  delay: number;
  align?: 'left' | 'right';
  className?: string;
}) {
  // Mobile: absolutely position above the graphic, centered horizontally
  const mobilePos = 'bottom-full left-1/2 -translate-x-1/2 mb-2 text-center';
  // Desktop: to the side of the graphic, vertically centered
  const desktopPos =
    align === 'right'
      ? 'sm:bottom-auto sm:top-1/2 sm:left-auto sm:right-full sm:mb-0 sm:mr-3 sm:translate-x-0 sm:-translate-y-1/2 sm:text-right'
      : 'sm:bottom-auto sm:top-1/2 sm:left-full sm:mb-0 sm:ml-3 sm:translate-x-0 sm:-translate-y-1/2 sm:text-left';

  return (
    <motion.div
      className={`absolute whitespace-nowrap ${mobilePos} ${desktopPos} ${className}`}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: 'easeOut' }}
    >
      <motion.p
        className="font-mono text-xs sm:text-sm font-semibold"
        style={{ color }}
        initial={{ filter: `drop-shadow(0 0 0px ${color}00)` }}
        animate={{
          filter: [
            `drop-shadow(0 0 0px ${color}00)`,
            `drop-shadow(0 0 14px ${color})`,
            `drop-shadow(0 0 5px ${color}99)`,
          ],
        }}
        transition={{
          delay: delay + 0.1,
          duration: 1.2,
          times: [0, 0.3, 1],
          ease: 'easeOut',
        }}
      >
        {title}
      </motion.p>
      <p className="text-gray-500 text-[10px] sm:text-xs mt-0.5">{subtitle}</p>
    </motion.div>
  );
}

export default function ArchitectureHero({ autoStart = false }: ArchitectureHeroProps) {
  const [started, setStarted] = useState(autoStart);
  const [progressVisible, setProgressVisible] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(96);
  const sectionRef = useRef<HTMLElement>(null);

  const handleStart = () => {
    if (!started) setStarted(true);
  };

  // 📏 Measure the global <header> so the progress bar sits exactly below it
  // regardless of promo banners, responsive padding, or future header changes.
  useEffect(() => {
    const measure = () => {
      const header = document.querySelector('header');
      if (header) setHeaderHeight(header.getBoundingClientRect().height);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // 📊 Show the progress bar while the sequence plays, then fade it away.
  useEffect(() => {
    if (!started) return;
    setProgressVisible(true);
    const hide = setTimeout(
      () => setProgressVisible(false),
      (SEQ.trainStart + 1.5) * 1000,
    );
    return () => clearTimeout(hide);
  }, [started]);

  useEffect(() => {
    if (started) return;

    const handleScroll = () => {
      if (window.scrollY > 8) setStarted(true);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [started]);

  // 🔒 Clamp page scroll to stay within the hero's bounds while the sequence
  // plays. The user can still scroll freely within the hero (so they can
  // reach the bottom where the tracks live on mobile), but cannot scroll
  // past the top or bottom of the hero until the animation finishes.
  useEffect(() => {
    if (!started) return;

    const clampScroll = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const scrollY = window.scrollY;
      const sectionTop = scrollY + rect.top;
      const sectionBottom = sectionTop + rect.height;

      const minAllowed = Math.max(0, sectionTop);
      // If the hero is taller than the viewport, allow scrolling down until
      // the hero's bottom reaches the viewport bottom. Otherwise, pin to top.
      const maxAllowed = Math.max(minAllowed, sectionBottom - window.innerHeight);

      if (scrollY < minAllowed) {
        window.scrollTo({ top: minAllowed });
      } else if (scrollY > maxAllowed) {
        window.scrollTo({ top: maxAllowed });
      }
    };

    // Initial clamp, then clamp on every subsequent scroll event.
    clampScroll();
    window.addEventListener('scroll', clampScroll, { passive: true });

    // Release once the sequence has finished (train is orbiting).
    const totalMs = (SEQ.trainStart + 1.2) * 1000;
    const unlockTimer = setTimeout(() => {
      window.removeEventListener('scroll', clampScroll);
    }, totalMs);

    return () => {
      clearTimeout(unlockTimer);
      window.removeEventListener('scroll', clampScroll);
    };
  }, [started]);

  return (
    <section
      ref={sectionRef}
      className="relative -mx-6 px-6 pt-28 pb-12 sm:pt-16 sm:pb-16 lg:py-20 scroll-mt-24"
      onClick={handleStart}
    >
      {/* 📊 Deterministic progress bar — fixed below nav header, full window width.
          Fades in on start, fades out ~0.3s after the sequence completes. */}
      <AnimatePresence>
        {progressVisible && (
          <motion.div
            key="progress-bar"
            className="fixed left-0 right-0 z-40 h-0.5 bg-gray-900/40 overflow-hidden pointer-events-none"
            style={{ top: `${headerHeight}px` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            aria-label="Animation progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <motion.div
              className="h-full bg-cyan-900/70"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: SEQ.trainStart + 1.2, ease: 'linear' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-center">
        <div className="absolute inset-0 bg-grid-dark opacity-40" />

        <div className="relative w-full max-w-4xl mx-auto flex flex-col lg:flex-row lg:items-start lg:gap-12 min-h-[520px] lg:min-h-[600px]">

          {/* ── Left: Headline ── */}
          <div className="lg:w-[280px] shrink-0 text-center lg:text-left mb-6 lg:mb-0 lg:pt-8 overflow-hidden">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl tracking-wide text-white">
              <motion.span
                className="block"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: EASE_ENTER }}
              >
                Tap.
              </motion.span>
              <motion.span
                className="block"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.25, ease: EASE_ENTER }}
              >
                Command.
              </motion.span>
              <motion.span
                className="block text-deja-cyan"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: EASE_ENTER }}
              >
                Move.
              </motion.span>
            </h1>
            <motion.p
              className="text-gray-400 text-sm sm:text-base mt-4 max-w-sm mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9, ease: EASE_ENTER }}
            >
              From the app in your hand to the track under your trains — every layer connected.
            </motion.p>
            {!started && (
              <motion.p
                className="hidden lg:block text-gray-500 text-xs mt-6 font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6, duration: 0.6 }}
              >
                ↓ scroll or click to begin
              </motion.p>
            )}
          </div>

          {/* ── Right: Phone (zooms out) + sequence ── */}
          <div className="flex-1 flex flex-col cursor-pointer">
            {/* Phone — layout animates from centered/big to zig-zag slot/small */}
            <motion.div
              layout
              transition={{ duration: SEQ.phoneShrinkDur, ease: EASE_ENTER }}
              className={
                started
                  ? 'flex justify-center mt-12 sm:mt-0 sm:justify-start sm:pl-[32%]'
                  : 'flex items-center justify-center lg:justify-end min-h-[460px] lg:min-h-[540px]'
              }
            >
              <motion.div
                layout
                transition={{ duration: SEQ.phoneShrinkDur, ease: EASE_ENTER }}
                className={
                  started
                    ? 'relative w-[180px] sm:w-[220px]'
                    : 'relative w-[60%] lg:w-[420px]'
                }
              >
                <Image
                  src="/screenshots/throttle_mobile_throttle.png"
                  alt="Throttle app — slide to control speed"
                  width={520}
                  height={1120}
                  className="w-full h-auto rounded-xl shadow-2xl"
                  priority
                />
                {started && (
                  <>
                    <TapRipple delay={SEQ.tap} />
                    <StepLabel
                      title="You tap"
                      subtitle="Throttle App"
                      color="#00E5FF"
                      delay={SEQ.label1}
                      align="left"
                    />
                  </>
                )}
              </motion.div>
            </motion.div>

            {started && (
              <>
                {/* Connector 1 — phone → terminal, with dot */}
                <div className="-mt-6 sm:-mt-8">
                  <Connector
                    direction="left-to-right"
                    drawDelay={SEQ.conn1Draw}
                    drawDuration={SEQ.conn1Dur}
                    color1="#00E5FF"
                    color2="#00E5FF"
                    id="conn-1"
                    showDot
                    dotDelay={SEQ.dot1}
                    dotDuration={SEQ.dotDur}
                  />
                </div>

                {/* Terminal row — extra top margin on mobile to fit the label above */}
                <motion.div
                  className="flex justify-center mt-10 sm:mt-0 sm:justify-end sm:pr-[28%]"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: SEQ.terminalFade, duration: SEQ.terminalDur, ease: 'easeOut' }}
                >
                  <div className="relative">
                    <SequenceTerminal />
                    <StepLabel
                      title="Server routes"
                      subtitle="DEJA Server"
                      color="#00E5FF"
                      delay={SEQ.label2}
                      align="right"
                    />
                  </div>
                </motion.div>

                {/* Connector 2 — terminal → DCC-EX, with dot */}
                <Connector
                  direction="right-to-left"
                  drawDelay={SEQ.conn2Draw}
                  drawDuration={SEQ.conn2Dur}
                  color1="#00E5FF"
                  color2="#8B5CF6"
                  id="conn-2"
                  showDot
                  dotDelay={SEQ.dot2}
                  dotDuration={SEQ.dotDur}
                />

                {/* DCC-EX row */}
                <motion.div
                  className="flex justify-center mt-10 sm:mt-0 sm:justify-start sm:pl-[36%]"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: SEQ.dccFade, duration: SEQ.dccDur, ease: 'easeOut' }}
                >
                  <div className="relative w-[100px] sm:w-[130px]">
                    <Image
                      src="/images/dcc-ex-commandstation.png"
                      alt="DCC-EX CommandStation — Arduino Mega with Motor Shield"
                      width={440}
                      height={300}
                      className="w-full h-auto drop-shadow-[0_0_12px_rgba(139,92,246,0.25)]"
                    />
                    <Image
                      src="/dcc-ex/android-chrome-192x192.png"
                      alt="DCC-EX"
                      width={32}
                      height={32}
                      className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-purple-500/30 shadow-lg"
                    />
                    <StepLabel
                      title="Translates & transmits"
                      subtitle="DCC-EX CommandStation"
                      color="#A78BFA"
                      delay={SEQ.label3}
                      align="left"
                    />
                  </div>
                </motion.div>

                {/* Connector 3 — DCC-EX → track, with dot */}
                <Connector
                  direction="left-to-right"
                  drawDelay={SEQ.conn3Draw}
                  drawDuration={SEQ.conn3Dur}
                  color1="#8B5CF6"
                  color2="#F97316"
                  id="conn-3"
                  showDot
                  dotDelay={SEQ.dot3}
                  dotDuration={SEQ.dotDur}
                />

                {/* Track row — train parked → orbits after label4 */}
                <motion.div
                  className="flex justify-center mt-10 sm:mt-0 sm:justify-end sm:pr-[34%]"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: SEQ.trackFade, duration: SEQ.trackDur, ease: 'easeOut' }}
                >
                  <div className="relative">
                    <SequenceOvalTrack trainStartDelay={SEQ.trainStart} />
                    <StepLabel
                      title="Train moves"
                      subtitle="DCC Track"
                      color="#F97316"
                      delay={SEQ.label4}
                      align="right"
                    />
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}

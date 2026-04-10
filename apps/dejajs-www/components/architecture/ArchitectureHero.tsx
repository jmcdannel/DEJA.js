'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import {
  Connector,
  EASE_ENTER,
  SEQ,
  SequenceOvalTrack,
  SequenceTerminal,
  StepLabel,
  TapRipple,
} from './animation-primitives';

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

interface ArchitectureHeroProps {
  /** Start the sequence immediately on mount (used by the replay button). */
  autoStart?: boolean;
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

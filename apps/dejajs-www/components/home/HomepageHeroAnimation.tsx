'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import TerminalMockup from '../architecture/TerminalMockup';
import {
  Connector,
  EASE_ENTER,
  SEQ,
  SequenceOvalTrack,
  SequenceTerminal,
  StepLabel,
  TapRipple,
} from '../architecture/animation-primitives';

/*
 * ── HOMEPAGE HERO ANIMATION ──
 *
 * A compact version of the /architecture hero, composed for the homepage
 * right column. Autoplays on mount. Uses a "big phone on the left + vertical
 * pipeline on the right" layout instead of the zig-zag used on /architecture.
 *
 * Flow encoded in the connectors:
 *   phone → DEJA Server (WebSocket / Firebase)           cyan → cyan
 *   DEJA Server → DCC-EX CommandStation (USB serial)     cyan → purple
 *   DCC-EX → DCC track (DCC signal on the rails)         purple → orange
 *
 * Step labels fade in next to each stage to name the architecture piece
 * the viewer is currently looking at. Labels for phone + terminal render
 * inline (stacked above) so they sit tight; DCC-EX + track labels sit
 * beside (right side).
 *
 * A replay button fades in after the train starts orbiting (~8s) and lets
 * the viewer re-run the full sequence. Clicking it increments `runKey`,
 * which remounts `AnimatedSequence` via React's key reconciliation,
 * replaying all framer-motion transitions from scratch.
 */

/**
 * Static (no-animation) version of the hero sequence for visitors who have
 * `prefers-reduced-motion: reduce` enabled. Mirrors the layout of
 * `AnimatedSequence` exactly but replaces every framer-motion element with
 * plain HTML — no transitions, no typing, no traveling dots, no orbiting train.
 */
function StaticSequence() {
  // ── S-curve connector paths (same as Connector in animation-primitives) ──
  const dRightToLeft = 'M 90,2 C 90,40 10,60 10,98';
  const dLeftToRight = 'M 10,2 C 10,40 90,60 90,98';

  // ── Oval track geometry (same as SequenceOvalTrack in animation-primitives) ──
  const outerTrack = 'M 60,10 L 140,10 A 30,30 0 0 1 140,70 L 60,70 A 30,30 0 0 1 60,10 Z';
  const innerTrack = 'M 62,14 L 138,14 A 26,26 0 0 1 138,66 L 62,66 A 26,26 0 0 1 62,14 Z';

  // Cross-ties (same calculation as SequenceOvalTrack)
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
    <div className="flex flex-col sm:flex-row sm:items-center h-full">

      {/* ── Phone column ── */}
      <div className="relative flex flex-col items-center justify-center sm:w-[55%] mb-6 sm:mb-0 gap-0">
        <StepLabel title="You tap" color="#00E5FF" delay={0} inline />
        <div className="relative w-[220px] sm:w-[260px] lg:w-[280px]">
          <Image
            src="/screenshots/throttle_mobile_throttle.png"
            alt="Throttle app — slide to control speed"
            width={520}
            height={1120}
            className="w-full h-auto rounded-xl shadow-2xl"
            priority
          />
          {/* No TapRipple — purely animated, omitted under reduced motion */}
        </div>
      </div>

      {/* ── Right stack: terminal → DCC-EX → track ── */}
      <div className="relative flex flex-col items-center sm:w-[45%] gap-3 sm:gap-1">

        {/* Terminal (server) — fully populated, no typing animation */}
        <div className="relative flex flex-col items-center gap-2">
          <StepLabel title="Server routes" color="#00E5FF" delay={0} inline />
          <TerminalMockup title="deja — tamarack" className="text-[10px] w-[240px] sm:w-[290px]">
            <p className="text-deja-cyan">$ deja start</p>
            <p className="text-green-400">✓ Ready</p>
            <p className="text-yellow-400">← throttle {'{addr:3, speed:50}'}</p>
            <p className="text-deja-magenta">→ {'<t 3 50 1>'}</p>
          </TerminalMockup>
        </div>

        {/* Terminal → DCC-EX connector — static solid S-curve path */}
        <div className="w-20 h-16 -my-1 sm:-my-3">
          <div className="w-full h-10 sm:h-12">
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
              <path
                d={dRightToLeft}
                stroke="#00E5FF"
                strokeOpacity={0.5}
                strokeWidth={2}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>

        {/* DCC-EX CommandStation */}
        <div className="relative flex flex-col items-center gap-2 sm:block sm:w-[130px]">
          <div className="sm:hidden">
            <StepLabel title="DCC-EX Translates" color="#A78BFA" delay={0} inline />
          </div>
          <div className="relative w-[110px] sm:w-full">
            <Image
              src="/images/dcc-ex-commandstation.png"
              alt="DCC-EX CommandStation — Arduino Mega with Motor Shield"
              width={440}
              height={300}
              className="w-full h-auto drop-shadow-[0_0_12px_rgba(139,92,246,0.25)]"
              priority
            />
            <Image
              src="/dcc-ex/android-chrome-192x192.png"
              alt="DCC-EX"
              width={32}
              height={32}
              className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-purple-500/30 shadow-lg"
            />
            <div className="hidden sm:block">
              <StepLabel
                title="DCC-EX Translates"
                color="#A78BFA"
                delay={0}
                align="left"
                className="sm:!ml-1"
              />
            </div>
          </div>
        </div>

        {/* DCC-EX → Track connector — static solid S-curve path */}
        <div className="w-20 h-16 -my-1 sm:-my-3">
          <div className="w-full h-10 sm:h-12">
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
              <path
                d={dLeftToRight}
                stroke="#8B5CF6"
                strokeOpacity={0.5}
                strokeWidth={2}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>

        {/* Oval track with train parked — no orbit animation */}
        <div className="relative flex flex-col items-center gap-2 sm:block">
          <div className="sm:hidden">
            <StepLabel title="Train moves" color="#F97316" delay={0} inline />
          </div>
          <div className="relative">
            {/* Static oval track — train parked at top-left, matching SequenceOvalTrack parked state */}
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
                {/* 🛑 Train parked at top-left */}
                <circle cx={61} cy={12} r={4.5} fill="#F97316" />
                <circle cx={71} cy={12} r={3} fill="#F97316" fillOpacity={0.75} />
                <circle cx={81} cy={12} r={3} fill="#F97316" fillOpacity={0.65} />
                <circle cx={91} cy={12} r={3} fill="#F97316" fillOpacity={0.55} />
                <circle cx={101} cy={12} r={3} fill="#F97316" fillOpacity={0.45} />
              </svg>
            </div>
            <div className="hidden sm:block">
              <StepLabel
                title="Train moves"
                color="#F97316"
                delay={0}
                align="left"
                className="sm:!ml-1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnimatedSequence() {
  return (
    /* Desktop / tablet: big phone on the left, vertical pipeline on the right.
       Mobile: single column — phone on top, then terminal, DCC-EX, track stacked. */
    <div className="flex flex-col sm:flex-row sm:items-center h-full">

      {/* ── Phone column — label stacked above the phone as a flex sibling
          so "You tap" sits tight against the phone image, not floating at the
          top of a centered column. ── */}
      <div className="relative flex flex-col items-center justify-center sm:w-[55%] mb-6 sm:mb-0 gap-0">
        <StepLabel
          title="You tap"
          color="#00E5FF"
          delay={SEQ.label1}
          inline
        />
        <motion.div
          className="relative w-[220px] sm:w-[260px] lg:w-[280px]"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE_ENTER }}
        >
          <Image
            src="/screenshots/throttle_mobile_throttle.png"
            alt="Throttle app — slide to control speed"
            width={520}
            height={1120}
            className="w-full h-auto rounded-xl shadow-2xl"
            priority
          />
          <TapRipple delay={SEQ.tap} />
        </motion.div>
      </div>

      {/* ── Right stack: terminal → DCC-EX → track, with vertical connectors.
          Mobile uses inline labels tight to each element and extra vertical
          room for the connector lines. Desktop keeps tighter spacing and
          uses beside-labels for DCC-EX + track. ── */}
      <div className="relative flex flex-col items-center sm:w-[45%] gap-3 sm:gap-1">

        {/* Terminal (server) — inline label above, stacked tight */}
        <motion.div
          className="relative flex flex-col items-center gap-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: SEQ.terminalFade, duration: SEQ.terminalDur, ease: 'easeOut' }}
        >
          <StepLabel
            title="Server routes"
            color="#00E5FF"
            delay={SEQ.label2}
            inline
          />
          <SequenceTerminal />
        </motion.div>

        {/* Terminal → DCC-EX connector — narrow-tall wrapper so the SVG
            renders as a proper vertical-ish S-curve. Mobile gets less
            negative margin so the line visibly separates from its siblings. */}
        <div className="w-20 h-16 -my-1 sm:-my-3">
          <Connector
            direction="right-to-left"
            drawDelay={SEQ.conn2Draw}
            drawDuration={SEQ.conn2Dur}
            color1="#00E5FF"
            color2="#8B5CF6"
            id="home-conn-2"
            showDot
            dotDelay={SEQ.dot2}
            dotDuration={SEQ.dotDur}
          />
        </div>

        {/* DCC-EX CommandStation — inline label above on mobile, beside
            label (right side) on desktop. */}
        <motion.div
          className="relative flex flex-col items-center gap-2 sm:block sm:w-[130px]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: SEQ.dccFade, duration: SEQ.dccDur, ease: 'easeOut' }}
        >
          <div className="sm:hidden">
            <StepLabel
              title="DCC-EX Translates"
              color="#A78BFA"
              delay={SEQ.label3}
              inline
            />
          </div>
          <div className="relative w-[110px] sm:w-full">
            <Image
              src="/images/dcc-ex-commandstation.png"
              alt="DCC-EX CommandStation — Arduino Mega with Motor Shield"
              width={440}
              height={300}
              className="w-full h-auto drop-shadow-[0_0_12px_rgba(139,92,246,0.25)]"
              priority
            />
            <Image
              src="/dcc-ex/android-chrome-192x192.png"
              alt="DCC-EX"
              width={32}
              height={32}
              className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-purple-500/30 shadow-lg"
            />
            <div className="hidden sm:block">
              <StepLabel
                title="DCC-EX Translates"
                color="#A78BFA"
                delay={SEQ.label3}
                align="left"
                className="sm:!ml-1"
              />
            </div>
          </div>
        </motion.div>

        {/* DCC-EX → Track connector — small bit more room on desktop between
            DCC-EX and the line below it. */}
        <div className="w-20 h-16 -my-1 sm:-my-3">
          <Connector
            direction="left-to-right"
            drawDelay={SEQ.conn3Draw}
            drawDuration={SEQ.conn3Dur}
            color1="#8B5CF6"
            color2="#F97316"
            id="home-conn-3"
            showDot
            dotDelay={SEQ.dot3}
            dotDuration={SEQ.dotDur}
          />
        </div>

        {/* Oval track with train — inline label above on mobile, beside
            label (right side) on desktop. */}
        <motion.div
          className="relative flex flex-col items-center gap-2 sm:block"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: SEQ.trackFade, duration: SEQ.trackDur, ease: 'easeOut' }}
        >
          <div className="sm:hidden">
            <StepLabel
              title="Train moves"
              color="#F97316"
              delay={SEQ.label4}
              inline
            />
          </div>
          <div className="relative">
            <SequenceOvalTrack
              trainStartDelay={SEQ.trainStart}
              orbitId="home-stadium-orbit"
            />
            <div className="hidden sm:block">
              <StepLabel
                title="Train moves"
                color="#F97316"
                delay={SEQ.label4}
                align="left"
                className="sm:!ml-1"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function HomepageHeroAnimation() {
  const prefersReducedMotion = useReducedMotion();
  const [runKey, setRunKey] = useState(0);
  const handleReplay = () => setRunKey((k) => k + 1);

  return (
    <div className="relative w-full max-w-[560px] min-h-[520px] lg:min-h-[560px] mx-auto">
      {prefersReducedMotion ? (
        <StaticSequence />
      ) : (
        <>
          <AnimatedSequence key={runKey} />
          <motion.button
            key={`replay-${runKey}`}
            type="button"
            onClick={handleReplay}
            aria-label="Replay animation"
            className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-deja-cyan/40 text-deja-cyan/80 bg-gray-900/60 backdrop-blur-sm text-xs font-mono hover:border-deja-cyan hover:text-deja-cyan transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: SEQ.trainStart + 0.35, duration: 0.4 }}
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 1 1-3-6.7" />
              <path d="M21 4v5h-5" />
            </svg>
            Replay
          </motion.button>
        </>
      )}
    </div>
  );
}

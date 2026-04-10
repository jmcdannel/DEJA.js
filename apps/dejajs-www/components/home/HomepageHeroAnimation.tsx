'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Connector,
  EASE_ENTER,
  SEQ,
  SequenceOvalTrack,
  SequenceTerminal,
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
 * No step labels — the terminal is the narrative. The train keeps orbiting
 * indefinitely after the first pass (SequenceOvalTrack handles that natively
 * via repeatCount="indefinite").
 */

export default function HomepageHeroAnimation() {
  return (
    <div className="relative w-full max-w-[560px] min-h-[520px] lg:min-h-[560px] mx-auto">
      {/* Desktop / tablet: big phone on the left, vertical pipeline on the right.
          Mobile: single column — phone on top, then terminal, DCC-EX, track stacked. */}
      <div className="flex flex-col sm:flex-row sm:items-stretch sm:gap-4 h-full">

        {/* ── Phone column (big, ~55% of the area on sm+) ── */}
        <div className="relative flex items-center justify-center sm:w-[55%] mb-6 sm:mb-0">
          <motion.div
            className="relative w-[180px] sm:w-[240px] lg:w-[260px]"
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

        {/* ── Right stack: terminal → DCC-EX → track, with vertical connectors ── */}
        <div className="relative flex flex-col items-center justify-between sm:w-[45%] gap-4 sm:gap-2">

          {/* Terminal (server) */}
          <motion.div
            className="relative flex justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: SEQ.terminalFade, duration: SEQ.terminalDur, ease: 'easeOut' }}
          >
            <SequenceTerminal />
          </motion.div>

          {/* Phone → Terminal connector (horizontal S-curve into the top of the stack).
              Rendered as an absolutely-positioned SVG overlaid across both columns on
              sm+ so it can span from the phone's right edge to the terminal's left edge.
              On mobile we render a short vertical connector instead. */}
          <div className="sm:hidden w-full -my-2">
            <Connector
              direction="left-to-right"
              drawDelay={SEQ.conn1Draw}
              drawDuration={SEQ.conn1Dur}
              color1="#00E5FF"
              color2="#00E5FF"
              id="home-conn-1-mobile"
              showDot
              dotDelay={SEQ.dot1}
              dotDuration={SEQ.dotDur}
            />
          </div>

          {/* Terminal → DCC-EX connector (short vertical) */}
          <div className="w-full -my-2">
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

          {/* DCC-EX CommandStation */}
          <motion.div
            className="relative w-[100px] sm:w-[120px]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: SEQ.dccFade, duration: SEQ.dccDur, ease: 'easeOut' }}
          >
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
          </motion.div>

          {/* DCC-EX → Track connector (short vertical) */}
          <div className="w-full -my-2">
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

          {/* Oval track with train */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: SEQ.trackFade, duration: SEQ.trackDur, ease: 'easeOut' }}
          >
            <SequenceOvalTrack trainStartDelay={SEQ.trainStart} />
          </motion.div>
        </div>
      </div>

      {/* Phone → Terminal connector on sm+ — overlaid SVG that spans from the
          phone's right edge to the terminal's left edge. */}
      <div className="hidden sm:block absolute top-0 left-[45%] w-[20%] h-[28%] pointer-events-none">
        <Connector
          direction="left-to-right"
          drawDelay={SEQ.conn1Draw}
          drawDuration={SEQ.conn1Dur}
          color1="#00E5FF"
          color2="#00E5FF"
          id="home-conn-1-desktop"
          showDot
          dotDelay={SEQ.dot1}
          dotDuration={SEQ.dotDur}
        />
      </div>
    </div>
  );
}

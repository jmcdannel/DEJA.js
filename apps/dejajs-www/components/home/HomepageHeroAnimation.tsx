'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
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
 */

export default function HomepageHeroAnimation() {
  return (
    <div className="relative w-full max-w-[560px] min-h-[520px] lg:min-h-[560px] mx-auto">
      {/* Desktop / tablet: big phone on the left, vertical pipeline on the right.
          Mobile: single column — phone on top, then terminal, DCC-EX, track stacked. */}
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
    </div>
  );
}

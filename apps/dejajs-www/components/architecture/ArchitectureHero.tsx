'use client';

import AnimateIn from '../home/AnimateIn';
import PhoneMockup from './PhoneMockup';
import TerminalMockup from './TerminalMockup';
import ArduinoMockup from './ArduinoMockup';

export default function ArchitectureHero() {
  return (
    <section className="relative py-20 overflow-hidden">
      <AnimateIn className="text-center mb-16">
        <p className="text-xs text-gray-500 font-mono tracking-[0.2em] uppercase mb-3">Architecture</p>
        <h1 className="text-5xl sm:text-6xl font-bold text-white">
          Tap. Command. Move.
        </h1>
        <p className="text-gray-400 mt-4 max-w-lg mx-auto">
          From the app in your hand to the track under your trains — every layer connected.
        </p>
      </AnimateIn>

      <div className="flex flex-col gap-8 max-w-3xl mx-auto">
        <AnimateIn direction="left" delay={0.1}>
          <div className="flex items-center gap-6 -translate-x-8 sm:-translate-x-16">
            <PhoneMockup
              src="/screenshots/throttle_mobile_throttle.png"
              alt="DEJA.js Throttle app"
              className="w-[120px] sm:w-[150px]"
            />
            <div>
              <p className="text-deja-cyan font-semibold text-lg">You tap</p>
              <p className="text-gray-500 text-sm">Speed, direction, functions — all from your phone.</p>
            </div>
          </div>
        </AnimateIn>

        <AnimateIn delay={0.2}>
          <p className="text-gray-600 text-2xl text-center">↘</p>
        </AnimateIn>

        <AnimateIn direction="right" delay={0.3}>
          <div className="flex items-center gap-6 translate-x-4 sm:translate-x-12 flex-row-reverse">
            <TerminalMockup title="deja" className="w-[260px] sm:w-[320px]">
              <p><span className="text-gray-500">$</span> <span className="text-deja-cyan">deja start</span></p>
              <p className="text-green-400 mt-1">✓ WebSocket ready</p>
              <p className="text-green-400">✓ Firebase connected</p>
              <p className="text-green-400">✓ Serial: /dev/ttyUSB0</p>
            </TerminalMockup>
            <div className="text-right">
              <p className="text-deja-cyan font-semibold text-lg">Server routes</p>
              <p className="text-gray-500 text-sm">WebSocket, Firebase, serial — all bridged.</p>
            </div>
          </div>
        </AnimateIn>

        <AnimateIn delay={0.4}>
          <p className="text-gray-600 text-2xl text-center">↘</p>
        </AnimateIn>

        <AnimateIn direction="left" delay={0.5}>
          <div className="flex items-center gap-6 translate-x-8 sm:translate-x-20">
            <ArduinoMockup className="w-[180px] sm:w-[220px]" />
            <div>
              <p className="text-[rgb(139,92,246)] font-semibold text-lg">Train moves</p>
              <p className="text-gray-500 text-sm">DCC signal on the rails. Your layout, alive.</p>
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}

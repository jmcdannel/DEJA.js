'use client';

import AnimateIn from '../home/AnimateIn';
import PhoneMockup from './PhoneMockup';
import LaptopMockup from './LaptopMockup';
import TerminalMockup from './TerminalMockup';
import ArduinoMockup from './ArduinoMockup';
import AnimatedTrack from './AnimatedTrack';

export default function ArchitectureHero() {
  return (
    <section className="relative py-12 overflow-hidden">
      {/* Headline */}
      <AnimateIn className="text-center mb-12">
        <p className="text-xs text-gray-500 font-mono tracking-[0.2em] uppercase mb-2">Architecture</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-white">
          Tap. Command. Move.
        </h1>
        <p className="text-gray-400 mt-3 max-w-md mx-auto text-sm">
          From the app in your hand to the track under your trains — every layer connected.
        </p>
      </AnimateIn>

      {/* Horizontal flow: Phone → Laptop → DCC-EX → Track */}
      <div className="max-w-7xl mx-auto">
        {/* Connection flow row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 items-center">

          {/* 1. Phone */}
          <AnimateIn direction="left" delay={0.1}>
            <div className="flex flex-col items-center text-center py-4">
              <PhoneMockup
                src="/screenshots/throttle_mobile_throttle.png"
                alt="DEJA.js Throttle app"
                className="w-[90px] sm:w-[110px] mb-3"
              />
              <p className="text-deja-cyan font-semibold text-sm">Throttle App</p>
              <p className="text-gray-500 text-xs">You tap</p>
            </div>
          </AnimateIn>

          {/* 2. Laptop + Terminal */}
          <AnimateIn delay={0.25}>
            <div className="flex flex-col items-center py-4">
              {/* WiFi connection indicator */}
              <div className="hidden md:flex items-center gap-1 mb-2 self-start pl-2">
                <div className="h-px w-6 bg-gradient-to-r from-transparent to-deja-cyan/40" />
                <span className="text-deja-cyan/40 text-[10px] font-mono">WiFi</span>
                <div className="h-px w-3 bg-deja-cyan/40" />
              </div>
              <LaptopMockup className="w-full max-w-[240px]">
                <TerminalMockup title="deja" className="border-0 rounded-none shadow-none">
                  <div className="text-left">
                    <p className="text-xs"><span className="text-gray-500">$</span> <span className="text-deja-cyan">deja start</span></p>
                    <p className="text-green-400 text-xs mt-0.5">✓ WebSocket</p>
                    <p className="text-green-400 text-xs">✓ Firebase</p>
                    <p className="text-green-400 text-xs">✓ Serial</p>
                  </div>
                </TerminalMockup>
              </LaptopMockup>
              <p className="text-deja-cyan font-semibold text-sm mt-3">DEJA Server</p>
              <p className="text-gray-500 text-xs">Routes commands</p>
            </div>
          </AnimateIn>

          {/* 3. DCC-EX */}
          <AnimateIn delay={0.4}>
            <div className="flex flex-col items-center py-4">
              {/* USB connection indicator */}
              <div className="hidden md:flex items-center gap-1 mb-2 self-start pl-2">
                <div className="h-px w-6 bg-gradient-to-r from-transparent to-purple-400/40" />
                <span className="text-purple-400/40 text-[10px] font-mono">USB</span>
                <div className="h-px w-3 bg-purple-400/40" />
              </div>
              <ArduinoMockup className="w-[140px] sm:w-[170px]" />
              <p className="text-purple-400 font-semibold text-sm mt-1">DCC-EX</p>
              <p className="text-gray-500 text-xs">Sends DCC signal</p>
            </div>
          </AnimateIn>

          {/* 4. Animated Track */}
          <AnimateIn direction="right" delay={0.55}>
            <div className="flex flex-col items-center py-4">
              {/* DCC connection indicator */}
              <div className="hidden md:flex items-center gap-1 mb-2 self-start pl-2">
                <div className="h-px w-6 bg-gradient-to-r from-transparent to-orange-400/40" />
                <span className="text-orange-400/40 text-[10px] font-mono">DCC</span>
                <div className="h-px w-3 bg-orange-400/40" />
              </div>
              <AnimatedTrack className="w-full max-w-[200px]" />
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}

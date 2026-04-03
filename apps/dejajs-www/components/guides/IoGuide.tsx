'use client';

import AnimateIn from '../home/AnimateIn';
import SectionLabel from '../home/SectionLabel';
import DocLink from '../DocLink';
import { FeatureGrid, VideoPlaceholder, Callout } from './shared';

/* ── 🔌 IO Guide — Beyond the Throttle ── */

export default function IoGuide() {
  return (
    <article className="max-w-4xl mx-auto">

      {/* ── 1. Hero ── */}
      <header className="mb-16">
        <AnimateIn>
          <SectionLabel color="magenta">DEJA IO</SectionLabel>
        </AnimateIn>
        <AnimateIn delay={0.1}>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mt-4 mb-4">
            Beyond the Throttle
          </h1>
        </AnimateIn>
        <AnimateIn delay={0.15}>
          <p className="text-gray-400 text-lg leading-relaxed mb-4">
            DEJA.js isn&apos;t just a throttle — it&apos;s a full layout automation platform.
            IO devices let you control turnouts, signals, lighting, sound, and sensors
            from the same apps you already use to run trains.
          </p>
        </AnimateIn>
        <AnimateIn delay={0.2}>
          <p className="text-gray-400 leading-relaxed">
            Connect an <strong className="text-white">Arduino over USB</strong> for wired reliability,
            or a <strong className="text-white">Pico W over WiFi</strong> for wireless flexibility.
            Configure everything in the <strong className="text-white">Cloud app</strong>,
            then control it all from the <strong className="text-white">Throttle</strong> — no code required.
          </p>
        </AnimateIn>
      </header>

      {/* ── Video Walkthrough ── */}
      <section className="mb-20">
        <AnimateIn>
          <VideoPlaceholder />
        </AnimateIn>
      </section>

      {/* ── 2. Architecture Diagram — How It Works ── */}
      <section className="mb-20">
        <AnimateIn>
          <h2 className="text-3xl font-bold text-white mb-3">How It Works</h2>
        </AnimateIn>
        <AnimateIn delay={0.05}>
          <p className="text-gray-400 leading-relaxed mb-8">
            DEJA.js connects your browser to your layout hardware through three
            communication protocols — each optimized for different setups.
          </p>
        </AnimateIn>

        {/* 🏗️ Diagram */}
        <AnimateIn delay={0.1}>
          <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 sm:p-8 overflow-hidden">

            {/* Top — Browser / Apps */}
            <div className="text-center mb-6">
              <p className="text-xs text-gray-500 font-mono tracking-widest uppercase mb-3">
                Your Phone / Browser
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Throttle', 'Cloud', 'Monitor'].map((app) => (
                  <span
                    key={app}
                    className="px-3 py-1 rounded-full border border-deja-cyan/30 bg-deja-cyan/5 text-deja-cyan text-xs font-semibold"
                  >
                    {app}
                  </span>
                ))}
              </div>
            </div>

            {/* Arrow down */}
            <div className="flex justify-center my-4">
              <div className="w-px h-8 bg-gradient-to-b from-deja-cyan/40 to-gray-700" />
            </div>

            {/* Middle — DEJA Server */}
            <div className="text-center mb-4">
              <div className="inline-block px-6 py-3 rounded-xl border-2 border-deja-lime/40 bg-deja-lime/5">
                <p className="text-deja-lime font-bold text-sm">🖥️ DEJA Server</p>
                <p className="text-gray-500 text-xs mt-1">Node.js on your computer or Raspberry Pi</p>
              </div>
            </div>

            {/* Three protocol branches */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
              {[
                { label: 'Serial USB', color: 'amber', icon: '🔌', desc: 'Direct wired connection' },
                { label: 'MQTT WiFi', color: 'purple', icon: '📡', desc: 'Wireless via broker' },
                { label: 'WebSocket', color: 'cyan', icon: '🌐', desc: 'Real-time bidirectional' },
              ].map((proto) => {
                const colorMap: Record<string, string> = {
                  amber: 'border-amber-400/30 bg-amber-400/5 text-amber-400',
                  purple: 'border-purple-400/30 bg-purple-400/5 text-purple-400',
                  cyan: 'border-deja-cyan/30 bg-deja-cyan/5 text-deja-cyan',
                };
                return (
                  <div
                    key={proto.label}
                    className={`rounded-lg border p-3 text-center ${colorMap[proto.color]}`}
                  >
                    <p className="text-lg mb-1">{proto.icon}</p>
                    <p className="text-xs font-bold">{proto.label}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{proto.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Arrow down */}
            <div className="flex justify-center my-4">
              <div className="w-px h-8 bg-gradient-to-b from-gray-700 to-deja-lime/40" />
            </div>

            {/* Bottom — Your Layout */}
            <div className="text-center">
              <p className="text-xs text-gray-500 font-mono tracking-widest uppercase mb-3">
                Your Layout
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Turnouts', 'Lights', 'Signals', 'Sensors', 'Sounds'].map((hw) => (
                  <span
                    key={hw}
                    className="px-3 py-1 rounded-full border border-deja-lime/30 bg-deja-lime/5 text-deja-lime text-xs font-semibold"
                  >
                    {hw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </AnimateIn>
      </section>

      {/* ── 3. Protocol Comparison Cards ── */}
      <section className="mb-20">
        <AnimateIn>
          <h2 className="text-3xl font-bold text-white mb-8">Choose Your Protocol</h2>
        </AnimateIn>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              title: 'Serial USB',
              color: 'amber',
              icon: '🔌',
              tagline: 'Direct & reliable',
              device: 'Arduino',
              connection: 'USB cable to server',
              latency: 'Lowest latency',
              border: 'border-amber-400/30 hover:border-amber-400/50',
              accent: 'text-amber-400',
              bg: 'bg-amber-400/5',
            },
            {
              title: 'MQTT over WiFi',
              color: 'purple',
              icon: '📡',
              tagline: 'Wireless & scalable',
              device: 'Pico W',
              connection: 'WiFi to MQTT broker',
              latency: 'Low latency',
              border: 'border-purple-400/30 hover:border-purple-400/50',
              accent: 'text-purple-400',
              bg: 'bg-purple-400/5',
            },
            {
              title: 'WebSocket',
              color: 'cyan',
              icon: '🌐',
              tagline: 'Real-time & flexible',
              device: 'Any networked device',
              connection: 'TCP port 8082',
              latency: 'Persistent connection',
              border: 'border-deja-cyan/30 hover:border-deja-cyan/50',
              accent: 'text-deja-cyan',
              bg: 'bg-deja-cyan/5',
            },
          ].map((proto, i) => (
            <AnimateIn key={proto.title} delay={i * 0.08}>
              <div className={`rounded-xl border ${proto.border} ${proto.bg} p-5 h-full transition-colors`}>
                <p className="text-2xl mb-2">{proto.icon}</p>
                <h3 className={`font-bold text-lg ${proto.accent} mb-1`}>{proto.title}</h3>
                <p className="text-white text-sm font-medium mb-3">{proto.tagline}</p>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Device</span>
                    <span className="text-gray-300">{proto.device}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Link</span>
                    <span className="text-gray-300">{proto.connection}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Speed</span>
                    <span className="text-gray-300">{proto.latency}</span>
                  </div>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>
      </section>

      {/* ── 4. Supported Devices ── */}
      <section className="mb-20">
        <AnimateIn>
          <SectionLabel color="lime">Supported Hardware</SectionLabel>
          <h2 className="text-3xl font-bold text-white mt-4 mb-8">Ready-Made Devices</h2>
        </AnimateIn>

        {/* Arduino + Pico W cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* 🟠 Arduino */}
          <AnimateIn delay={0.05}>
            <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🔌</span>
                <div>
                  <h3 className="text-amber-400 font-bold text-lg">Arduino</h3>
                  <p className="text-gray-500 text-xs">Serial USB &middot; Wired</p>
                </div>
              </div>
              <FeatureGrid
                items={[
                  { emoji: '🔧', text: 'PCA9685 servo control for turnouts & signals' },
                  { emoji: '💡', text: 'Digital outputs for LEDs & accessories' },
                  { emoji: '🚦', text: 'Multi-aspect signal heads' },
                  { emoji: '📟', text: 'Sensor inputs for block detection' },
                ]}
              />
              <div className="mt-4">
                <DocLink href="/docs/io/arduino-setup">Arduino Setup Guide</DocLink>
              </div>
            </div>
          </AnimateIn>

          {/* 🟣 Pico W */}
          <AnimateIn delay={0.1}>
            <div className="rounded-xl border border-purple-400/30 bg-purple-400/5 p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">📡</span>
                <div>
                  <h3 className="text-purple-400 font-bold text-lg">Pico W</h3>
                  <p className="text-gray-500 text-xs">MQTT WiFi &middot; Wireless</p>
                </div>
              </div>
              <FeatureGrid
                items={[
                  { emoji: '📶', text: 'WiFi connectivity — no wires to the server' },
                  { emoji: '🔧', text: 'PCA9685 servo control over I2C' },
                  { emoji: '💡', text: 'Digital pin outputs for LEDs & relays' },
                  { emoji: '⚙️', text: 'Runtime configuration via MQTT commands' },
                ]}
              />
              <div className="mt-4">
                <DocLink href="/docs/io/pico-w-setup">Pico W Setup Guide</DocLink>
              </div>
            </div>
          </AnimateIn>
        </div>

        {/* 🔵 Build Your Own teaser */}
        <AnimateIn delay={0.15}>
          <div className="rounded-xl border border-dashed border-deja-cyan/30 bg-deja-cyan/5 p-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">🛠️</span>
              <div>
                <h3 className="text-deja-cyan font-bold text-lg mb-1">Build Your Own</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-3">
                  DEJA.js uses open protocols — any device that speaks Serial, MQTT, or WebSocket
                  can join your layout. Send JSON commands and you&apos;re in.
                </p>
                <DocLink href="/docs/io/custom-devices">Custom Device Guide</DocLink>
              </div>
            </div>
          </div>
        </AnimateIn>
      </section>

      {/* ── 5. Deploy Flow Video ── */}
      <section className="mb-20">
        <AnimateIn>
          <SectionLabel color="cyan">Deploy Flow</SectionLabel>
          <h2 className="text-3xl font-bold text-white mt-4 mb-6">
            Configure Once, Deploy Anywhere
          </h2>
        </AnimateIn>
        <AnimateIn delay={0.1}>
          <VideoPlaceholder />
        </AnimateIn>
        <AnimateIn delay={0.15}>
          <Callout emoji="🚀" color="cyan">
            <p>
              Plug in a new device and it&apos;s auto-detected by the server.
              Configure pins, servos, and outputs in the Cloud app, then deploy
              with a single command — no re-flashing, no code changes.
            </p>
          </Callout>
        </AnimateIn>
      </section>

      {/* ── 6. Docs Links ── */}
      <section className="pt-8 border-t border-gray-800">
        <AnimateIn>
          <h2 className="text-2xl font-bold text-white mb-6">Dive Into the Docs</h2>
        </AnimateIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Get Started column */}
          <AnimateIn delay={0.05}>
            <div>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
                Get Started
              </h3>
              <div className="flex flex-col items-start gap-2">
                <DocLink href="/docs/io">IO Overview</DocLink>
                <DocLink href="/docs/io/arduino-setup">Arduino Setup</DocLink>
                <DocLink href="/docs/io/pico-w-setup">Pico W Setup</DocLink>
                <DocLink href="/docs/io/deploy">Deploy & Flash</DocLink>
              </div>
            </div>
          </AnimateIn>

          {/* Go Deeper column */}
          <AnimateIn delay={0.1}>
            <div>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
                Go Deeper
              </h3>
              <div className="flex flex-col items-start gap-2">
                <DocLink href="/docs/io/command-reference">Command Reference</DocLink>
                <DocLink href="/docs/io/protocols">Protocols</DocLink>
                <DocLink href="/docs/io/configuration">Configuration</DocLink>
                <DocLink href="/docs/io/custom-devices">Custom Devices</DocLink>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>
    </article>
  );
}

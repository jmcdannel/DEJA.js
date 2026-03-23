'use client';

import AnimateIn from '../home/AnimateIn';
import DocLink from '../DocLink';

const peripherals = [
  { label: 'IALED Strips', icon: '💡', desc: 'Animated lighting effects, building interiors, streetlamps' },
  { label: 'Servos', icon: '🔄', desc: 'Turnout motors, crossing gates, semaphore arms' },
  { label: 'Signals', icon: '🚦', desc: 'Block signals, ABS signaling, approach lighting' },
  { label: 'Relays', icon: '⚡', desc: 'Track power switching, accessory control, automation' },
  { label: 'Sensors', icon: '📡', desc: 'IR detection, block occupancy, automation triggers' },
  { label: 'Sound', icon: '🔊', desc: 'Crossing bells, ambient sounds, announcements' },
  { label: 'Motors', icon: '⚙️', desc: 'Turntable drives, conveyor belts, animated scenes' },
  { label: 'Displays', icon: '📺', desc: 'Station clocks, departure boards, status panels' },
  { label: 'Buttons', icon: '🔘', desc: 'Physical control panels, dispatcher boards' },
];

const devices = [
  { name: 'Arduino', desc: 'USB serial — direct pin control. Great for turnout machines, signals, and panel buttons near the command station.' },
  { name: 'Pico W', desc: 'WiFi MQTT — wireless placement anywhere on the layout. Perfect for lighting, sound, and sensors in hard-to-reach spots.' },
];

export default function IoDevicesSection() {
  return (
    <section>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <AnimateIn direction="left">
          <p className="text-xs text-[rgb(234,179,8)] font-mono tracking-[0.2em] uppercase mb-3">DEJA IO</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Expand endlessly.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            Anything that connects to a microcontroller becomes part of your layout.
            Wire up LEDs for building lights, servos for turnouts, sensors for block detection,
            speakers for crossing bells — the platform grows as your imagination does.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {devices.map((d) => (
              <div key={d.name} className="rounded-lg border border-[rgb(234,179,8)]/20 bg-[rgb(234,179,8)]/5 p-4">
                <p className="text-[rgb(234,179,8)] font-semibold mb-1">{d.name}</p>
                <p className="text-gray-400 text-sm">{d.desc}</p>
              </div>
            ))}
          </div>
          <DocLink href="/docs/io">IO</DocLink>
        </AnimateIn>
        <div>
          <AnimateIn delay={0.1}>
            <p className="text-xs text-green-400/70 font-mono tracking-[0.2em] uppercase mb-4">What you can build</p>
          </AnimateIn>
          <div className="grid grid-cols-3 gap-3">
            {peripherals.map((p, i) => (
              <AnimateIn key={p.label} delay={i * 0.07} direction="up">
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-green-500/20 bg-green-500/5 text-center">
                  <span className="text-xl">{p.icon}</span>
                  <span className="text-green-400 text-xs font-semibold">{p.label}</span>
                  <span className="text-gray-500 text-[10px] leading-snug">{p.desc}</span>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

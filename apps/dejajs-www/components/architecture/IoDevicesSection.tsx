'use client';

import AnimateIn from '../home/AnimateIn';

const peripherals = [
  { label: 'IALED Strips', icon: '\uD83D\uDCA1' },
  { label: 'Servos', icon: '\uD83D\uDD04' },
  { label: 'Signals', icon: '\uD83D\uDEA6' },
  { label: 'Relays', icon: '\u26A1' },
  { label: 'Sensors', icon: '\uD83D\uDCE1' },
  { label: 'Sound', icon: '\uD83D\uDD0A' },
];

const devices = [
  { name: 'Arduino', desc: 'USB serial \u2014 direct pin control for LEDs, servos, relays, and more.' },
  { name: 'Pico W', desc: 'WiFi MQTT \u2014 wireless IO for signals, sensors, and effects anywhere on the layout.' },
];

export default function IoDevicesSection() {
  return (
    <section>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <AnimateIn direction="left">
          <p className="text-xs text-[rgb(234,179,8)] font-mono tracking-[0.2em] uppercase mb-3">DEJA IO</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Expand endlessly.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Arduino and Pico W devices bring your layout to life. Connect LEDs, servos, signals, relays, sensors, and speakers — anything that plugs into a microcontroller becomes part of your DEJA.js platform.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {devices.map((d) => (
              <div key={d.name} className="rounded-lg border border-[rgb(234,179,8)]/20 bg-[rgb(234,179,8)]/5 p-4">
                <p className="text-[rgb(234,179,8)] font-semibold mb-1">{d.name}</p>
                <p className="text-gray-400 text-sm">{d.desc}</p>
              </div>
            ))}
          </div>
        </AnimateIn>
        <div className="grid grid-cols-3 gap-4">
          {peripherals.map((p, i) => (
            <AnimateIn key={p.label} delay={i * 0.1} direction="up">
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-green-500/20 bg-green-500/5">
                <span className="text-2xl">{p.icon}</span>
                <span className="text-green-400 text-sm font-semibold">{p.label}</span>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}

import AnimateIn from './AnimateIn';
import SectionLabel from './SectionLabel';

interface TrackMode {
  name: string;
  description: string;
  color: string;
  icon: string;
}

interface HardwareDevice {
  name: string;
  protocol: string;
  description: string;
  color: string;
  icon: string;
}

const trackModes: TrackMode[] = [
  {
    name: 'DCC Main',
    description: 'Standard DCC operations. Run locos with speed, direction, and function control.',
    color: '#00E5FF',
    icon: '🚂',
  },
  {
    name: 'Programming',
    description: 'Dedicated track for reading/writing CV values to decoder chips.',
    color: '#D500F9',
    icon: '⚙️',
  },
  {
    name: 'DC / PWM',
    description: 'Power older DC locos without decoders using pulse-width modulation via DCC-EX.',
    color: '#C6FF00',
    icon: '⚡',
  },
  {
    name: 'Booster',
    description: 'Boost DCC signal power to additional track segments for large layouts.',
    color: '#f59e0b',
    icon: '📡',
  },
];

const hardwareDevices: HardwareDevice[] = [
  {
    name: 'Arduino Mega',
    protocol: 'MQTT protocol',
    description: 'Connect via USB to DEJA Server. Pin-level control for outputs, sensors, and signal heads.',
    color: '#00E5FF',
    icon: '🔌',
  },
  {
    name: 'Raspberry Pi Pico W',
    protocol: 'WiFi protocol',
    description: 'WiFi-native CircuitPython device. Connects over your network — no USB cable required.',
    color: '#C6FF00',
    icon: '📶',
  },
];

const expansionCapabilities = [
  'Lights',
  'Sounds',
  'Servos',
  'Sensors',
  'Relays',
  'Signals',
  'Turnouts',
  'Outputs',
];

export default function DejaIOSection() {
  return (
    <section className="bg-gray-950 py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <AnimateIn className="mb-16 text-center">
          <SectionLabel color="lime">DEJA IO</SectionLabel>
          <h2 className="mt-6 text-4xl md:text-5xl font-bold text-white leading-tight">
            Expand your layout.{' '}
            <span className="block text-deja-lime">Expand your world.</span>
          </h2>
          <p className="mt-6 text-gray-400 text-lg max-w-2xl mx-auto">
            DEJA.js supports a growing range of DCC-EX track modes and hardware devices, giving you precise control over every inch of your layout — from decoder programming to physical expansion boards.
          </p>
        </AnimateIn>

        {/* Part 1: DCC-EX Track Modes */}
        <AnimateIn delay={0.1} className="mb-20">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">
            DCC-EX Track Modes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trackModes.map((mode) => (
              <div
                key={mode.name}
                className="p-5 rounded-xl border bg-gray-900/60"
                style={{ borderColor: `${mode.color}4D` }}
              >
                <div className="text-3xl mb-3">{mode.icon}</div>
                <h4 className="font-bold text-white mb-2" style={{ color: mode.color }}>
                  {mode.name}
                </h4>
                <p className="text-sm text-gray-400 leading-relaxed">{mode.description}</p>
              </div>
            ))}
          </div>
        </AnimateIn>

        {/* Part 2: Multi-CommandStation Callout */}
        <AnimateIn delay={0.2} className="mb-20">
          <div className="p-6 rounded-xl border border-deja-lime/30 bg-deja-lime/5">
            <div className="flex items-start gap-4">
              <span className="text-3xl flex-shrink-0">🔗</span>
              <div>
                <h3 className="text-lg font-bold text-deja-lime mb-2">
                  Multiple DCC-EX CommandStations
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Connect multiple DCC-EX CommandStations to a single DEJA layout — each with independent track mode assignments. Run Main, Programming, DC/PWM, and Booster modes on separate hardware.
                </p>
              </div>
            </div>
          </div>
        </AnimateIn>

        {/* Part 3: Hardware Devices */}
        <AnimateIn delay={0.3} className="mb-20">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">
            Hardware Devices
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {hardwareDevices.map((device) => (
              <div
                key={device.name}
                className="p-5 rounded-xl border bg-gray-900/60"
                style={{ borderColor: `${device.color}4D` }}
              >
                <div className="text-3xl mb-3">{device.icon}</div>
                <h4 className="font-bold mb-1" style={{ color: device.color }}>
                  {device.name}
                </h4>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                  {device.protocol}
                </p>
                <p className="text-sm text-gray-400 leading-relaxed">{device.description}</p>
              </div>
            ))}
          </div>
        </AnimateIn>

        {/* Part 4: Expansion Capabilities */}
        <AnimateIn delay={0.4}>
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">
            Expansion Capabilities
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {expansionCapabilities.map((capability) => (
              <div
                key={capability}
                className="p-3 rounded-xl border border-deja-lime/20 bg-deja-lime/5 text-deja-lime text-xs font-bold tracking-wider text-center"
              >
                {capability}
              </div>
            ))}
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}

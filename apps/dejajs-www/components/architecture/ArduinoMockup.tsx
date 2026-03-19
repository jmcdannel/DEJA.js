'use client';

interface ArduinoMockupProps {
  className?: string;
}

// Isometric line-art DCC-EX CommandStation:
// Arduino Mega 2560 (bottom) + Motor Shield (top, stacked)
// Real hardware: Mega is a long rectangular blue PCB with USB-B on one end,
// barrel jack, ATmega2560 chip, rows of pin headers along both long edges.
// Motor Shield sits on top with screw terminals for MAIN/PROG track outputs,
// barrel jack for motor power, H-bridge driver chips, and status LEDs.
const C = 'rgb(6,182,212)';

export default function ArduinoMockup({ className = '' }: ArduinoMockupProps) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 280 200" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g filter="url(#glow)">
          {/* ── Arduino Mega 2560 (bottom board) ── */}
          {/* Isometric top face */}
          <polygon
            points="140,155 260,90 140,25 20,90"
            fill={C} fillOpacity={0.03}
            stroke={C} strokeWidth={1.2} strokeOpacity={0.5}
          />
          {/* Left side face */}
          <polygon
            points="20,90 20,97 140,162 140,155"
            fill={C} fillOpacity={0.06}
            stroke={C} strokeWidth={0.8} strokeOpacity={0.35}
          />
          {/* Right side face */}
          <polygon
            points="140,155 140,162 260,97 260,90"
            fill={C} fillOpacity={0.03}
            stroke={C} strokeWidth={0.8} strokeOpacity={0.35}
          />

          {/* USB-B port (left end of Mega — rectangular block) */}
          <polygon
            points="32,96 32,86 50,76 50,86"
            fill={C} fillOpacity={0.12}
            stroke={C} strokeWidth={1.2} strokeOpacity={0.6}
          />
          {/* USB port top */}
          <polygon
            points="32,86 50,76 50,73 32,83"
            fill={C} fillOpacity={0.08}
            stroke={C} strokeWidth={0.8} strokeOpacity={0.5}
          />
          {/* USB inner cavity */}
          <polygon
            points="36,93 36,86 46,80 46,87"
            fill="none"
            stroke={C} strokeWidth={0.6} strokeOpacity={0.3}
          />

          {/* Barrel jack (power input, next to USB) */}
          <circle cx={65} cy={80} r={5}
            fill={C} fillOpacity={0.06}
            stroke={C} strokeWidth={0.8} strokeOpacity={0.4}
          />
          <circle cx={65} cy={80} r={2}
            fill="none"
            stroke={C} strokeWidth={0.6} strokeOpacity={0.3}
          />

          {/* ATmega2560 chip (large rectangular IC, center of Mega) */}
          <polygon
            points="120,110 175,80 155,70 100,100"
            fill={C} fillOpacity={0.07}
            stroke={C} strokeWidth={1} strokeOpacity={0.5}
          />
          {/* Chip pins — left side */}
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={`mcl-${i}`}
              x1={103 + i * 6.5} y1={99 - i * 3.5}
              x2={98 + i * 6.5} y2={102 - i * 3.5}
              stroke={C} strokeWidth={0.5} strokeOpacity={0.35}
            />
          ))}
          {/* Chip pins — right side */}
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={`mcr-${i}`}
              x1={123 + i * 6.5} y1={109 - i * 3.5}
              x2={178 + i * 6.5 - 55} y2={79 - i * 3.5 + 3}
              stroke={C} strokeWidth={0.5} strokeOpacity={0.35}
            />
          ))}

          {/* Pin headers — front edge (long row of pins) */}
          {Array.from({ length: 20 }).map((_, i) => (
            <rect key={`pf-${i}`}
              x={40 + i * 10} y={132 - i * 5.2 + 12}
              width={3} height={3} rx={0.5}
              fill={C} fillOpacity={0.25}
              stroke={C} strokeWidth={0.4} strokeOpacity={0.4}
            />
          ))}

          {/* Pin headers — back edge */}
          {Array.from({ length: 18 }).map((_, i) => (
            <rect key={`pb-${i}`}
              x={55 + i * 9.5} y={55 - i * 1.2 + i * 1.8}
              width={2.5} height={2.5} rx={0.5}
              fill={C} fillOpacity={0.2}
              stroke={C} strokeWidth={0.4} strokeOpacity={0.3}
            />
          ))}

          {/* Crystal oscillator */}
          <ellipse cx={195} cy={82} rx={4} ry={2.5}
            fill="none" stroke={C} strokeWidth={0.7} strokeOpacity={0.35}
          />

          {/* Reset button */}
          <circle cx={80} cy={88} r={3}
            fill={C} fillOpacity={0.05}
            stroke={C} strokeWidth={0.7} strokeOpacity={0.4}
          />

          {/* ── Motor Shield (top board, stacked) ── */}
          {/* Top face */}
          <polygon
            points="140,120 240,65 140,10 40,65"
            fill={C} fillOpacity={0.025}
            stroke={C} strokeWidth={1} strokeOpacity={0.35}
            strokeDasharray="6 3"
          />
          {/* Left side */}
          <polygon
            points="40,65 40,69 140,124 140,120"
            fill={C} fillOpacity={0.04}
            stroke={C} strokeWidth={0.6} strokeOpacity={0.2}
          />
          {/* Right side */}
          <polygon
            points="140,120 140,124 240,69 240,65"
            fill={C} fillOpacity={0.02}
            stroke={C} strokeWidth={0.6} strokeOpacity={0.2}
          />

          {/* H-bridge driver chips (2 rectangular ICs) */}
          <polygon
            points="100,85 130,68 120,63 90,80"
            fill={C} fillOpacity={0.06}
            stroke={C} strokeWidth={0.7} strokeOpacity={0.4}
          />
          <polygon
            points="135,75 165,58 155,53 125,70"
            fill={C} fillOpacity={0.06}
            stroke={C} strokeWidth={0.7} strokeOpacity={0.4}
          />

          {/* Screw terminals — MAIN track output (top right) */}
          {Array.from({ length: 2 }).map((_, i) => (
            <g key={`tm-${i}`}>
              <rect
                x={185 + i * 15} y={48 - i * 7}
                width={10} height={7} rx={1}
                fill={C} fillOpacity={0.1}
                stroke={C} strokeWidth={0.8} strokeOpacity={0.5}
              />
              {/* Screw circle */}
              <circle cx={190 + i * 15} cy={51.5 - i * 7} r={2}
                fill="none" stroke={C} strokeWidth={0.5} strokeOpacity={0.3}
              />
            </g>
          ))}

          {/* Screw terminals — PROG track output */}
          {Array.from({ length: 2 }).map((_, i) => (
            <g key={`tp-${i}`}>
              <rect
                x={155 + i * 15} y={60 - i * 7}
                width={10} height={7} rx={1}
                fill={C} fillOpacity={0.1}
                stroke={C} strokeWidth={0.8} strokeOpacity={0.5}
              />
              <circle cx={160 + i * 15} cy={63.5 - i * 7} r={2}
                fill="none" stroke={C} strokeWidth={0.5} strokeOpacity={0.3}
              />
            </g>
          ))}

          {/* Motor power barrel jack */}
          <circle cx={75} cy={72} r={5}
            fill={C} fillOpacity={0.06}
            stroke={C} strokeWidth={0.8} strokeOpacity={0.4}
          />
          <circle cx={75} cy={72} r={2}
            fill="none" stroke={C} strokeWidth={0.5} strokeOpacity={0.3}
          />

          {/* Status LEDs — red for A channel, green for power */}
          <circle cx={210} cy={72} r={2.5}
            fill="rgb(239,68,68)" fillOpacity={0.6}
          />
          <circle cx={220} cy={67} r={2.5}
            fill="rgb(239,68,68)" fillOpacity={0.6}
          />
          <circle cx={60} cy={68} r={2.5}
            fill="rgb(34,197,94)" fillOpacity={0.6}
          />

          {/* Track labels near terminals */}
          <text x={205} y={42} textAnchor="middle"
            fontSize={6} fontFamily="monospace"
            fill={C} fillOpacity={0.45}
          >MAIN</text>
          <text x={175} y={50} textAnchor="middle"
            fontSize={6} fontFamily="monospace"
            fill={C} fillOpacity={0.45}
          >PROG</text>
        </g>

        {/* Ambient glow */}
        <ellipse cx={140} cy={100} rx={100} ry={55}
          fill={C} fillOpacity={0.03}
          filter="url(#glow)"
        />

        {/* Label */}
        <text x={140} y={185} textAnchor="middle"
          fontSize={11} fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="bold" fill={C} fillOpacity={0.85}
        >DCC-EX CommandStation</text>
      </svg>
    </div>
  );
}

'use client';

interface ArduinoMockupProps {
  className?: string;
}

export default function ArduinoMockup({ className = '' }: ArduinoMockupProps) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 200 140" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="20" width="180" height="110" rx="4" fill="#0f172a" stroke="rgb(139,92,246)" strokeWidth="2" />
        <rect x="20" y="10" width="28" height="16" rx="2" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
        <rect x="60" y="12" width="20" height="12" rx="2" fill="#334155" stroke="#64748b" strokeWidth="1" />
        <rect x="70" y="55" width="50" height="40" rx="2" fill="#1e1e3e" stroke="rgb(139,92,246)" strokeWidth="1.5" />
        <text x="95" y="78" textAnchor="middle" fontSize="7" fill="rgb(139,92,246)" fontFamily="monospace">ATmega</text>
        <text x="95" y="88" textAnchor="middle" fontSize="7" fill="rgb(139,92,246)" fontFamily="monospace">2560</text>
        {Array.from({ length: 16 }).map((_, i) => (
          <rect key={`top-${i}`} x={30 + i * 9} y="22" width="5" height="8" rx="1" fill="rgb(234,179,8)" fillOpacity="0.6" />
        ))}
        {Array.from({ length: 16 }).map((_, i) => (
          <rect key={`bot-${i}`} x={30 + i * 9} y="108" width="5" height="8" rx="1" fill="rgb(234,179,8)" fillOpacity="0.6" />
        ))}
        <rect x="25" y="35" width="150" height="60" rx="3" fill="rgb(139,92,246)" fillOpacity="0.08" stroke="rgb(139,92,246)" strokeWidth="1" strokeDasharray="4 2" />
        <text x="100" y="50" textAnchor="middle" fontSize="8" fill="rgb(139,92,246)" fillOpacity="0.7" fontFamily="monospace">Motor Shield</text>
        <circle cx="160" cy="100" r="3" fill="rgb(34,197,94)" fillOpacity="0.8" />
        <circle cx="170" cy="100" r="3" fill="rgb(6,182,212)" fillOpacity="0.8" />
        <text x="100" y="138" textAnchor="middle" fontSize="10" fill="rgb(139,92,246)" fontWeight="bold" fontFamily="system-ui">DCC-EX CommandStation</text>
      </svg>
    </div>
  );
}

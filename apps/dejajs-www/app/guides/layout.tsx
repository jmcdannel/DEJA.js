import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s — DEJA.js Guides',
    default: 'Guides — DEJA.js',
  },
};

const guides = [
  { label: 'Getting Started', href: '/guides/getting-started', desc: 'From zero to driving trains' },
  { label: 'Throttle', href: '/guides/throttle', desc: 'Train control & functions' },
  { label: 'Cloud', href: '/guides/cloud', desc: 'Roster, turnouts & effects', comingSoon: true },
  { label: 'Monitor', href: '/guides/monitor', desc: 'Diagnostics & logging', comingSoon: true },
  { label: 'Server', href: '/guides/server', desc: 'Installation & CLI reference', comingSoon: true },
  { label: 'IO', href: '/guides/io', desc: 'Hardware expansion & MQTT', comingSoon: true },
];

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex flex-col lg:flex-row gap-10">
        {/* Sidebar */}
        <aside className="lg:w-56 shrink-0">
          <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
          <p className="text-xs text-gray-500 font-mono tracking-widest uppercase mb-4">Guides</p>
          <nav className="flex flex-col gap-1">
            {guides.map((g) => (
              g.comingSoon ? (
                <span
                  key={g.href}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-gray-600 text-sm cursor-default"
                >
                  {g.label}
                  <span className="text-[10px] text-gray-700 uppercase font-semibold tracking-wide">Soon</span>
                </span>
              ) : (
                <Link
                  key={g.href}
                  href={g.href}
                  className="flex items-center px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 text-sm transition-colors"
                >
                  {g.label}
                </Link>
              )
            ))}
          </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

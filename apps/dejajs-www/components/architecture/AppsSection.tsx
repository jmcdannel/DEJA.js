'use client';

import Image from 'next/image';
import AnimateIn from '../home/AnimateIn';
import PhoneMockup from './PhoneMockup';

export default function AppsSection() {
  return (
    <section>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <AnimateIn direction="left">
          <p className="text-xs text-deja-cyan font-mono tracking-[0.2em] uppercase mb-3">DEJA.js Apps</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Control from any device.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Throttle, Cloud, Monitor — every app connected to the same layout in real time. Open Throttle on your phone, Cloud on your tablet, Monitor on your laptop. Changes sync instantly across all of them.</p>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Throttle', desc: 'Drive trains, throw turnouts, trigger effects' },
              { label: 'Cloud', desc: 'Manage your roster, routes, and automation' },
              { label: 'Monitor', desc: 'See everything happening on your layout' },
            ].map((app) => (
              <div key={app.label} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-deja-cyan mt-2 shrink-0" />
                <span className="text-gray-300"><span className="font-semibold text-white">{app.label}</span> — {app.desc}</span>
              </div>
            ))}
          </div>
        </AnimateIn>
        <AnimateIn direction="right" className="flex items-end justify-center gap-4">
          <PhoneMockup src="/screenshots/throttle_mobile_throttle.png" alt="Throttle app on mobile" className="w-[140px]" />
          <div className="rounded-2xl border-2 border-gray-700 bg-gray-900 p-2 shadow-2xl w-[280px]">
            <div className="mx-auto w-8 h-1 bg-gray-800 rounded-full mb-1" />
            <div className="rounded-xl overflow-hidden">
              <Image src="/screenshots/cloud_desktop_roster.png" alt="Cloud dashboard" width={560} height={350} className="w-full h-auto" />
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}

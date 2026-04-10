'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import DocLink from '../DocLink';

const apps = [
  { label: 'Throttle', desc: 'Drive trains, throw turnouts, trigger effects', href: '/throttle', docsHref: '/docs/apps/throttle' },
  { label: 'Cloud', desc: 'Manage your roster, routes, and automation', href: '/cloud', docsHref: '/docs/apps/cloud' },
  { label: 'Monitor', desc: 'See everything happening on your layout', href: '/monitor', docsHref: '/docs/apps/monitor' },
];

export default function AppsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Text slides in from left
  const textX = useTransform(scrollYProgress, [0, 0.25], [-48, 0]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

  // Phone moves faster (parallax depth — closer to viewer)
  const phoneY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const phoneOpacity = useTransform(scrollYProgress, [0.05, 0.2, 0.85, 1], [0, 1, 1, 0]);

  // Tablet moves slower (parallax depth — farther from viewer)
  const tabletY = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const tabletOpacity = useTransform(scrollYProgress, [0.08, 0.25, 0.85, 1], [0, 1, 1, 0]);

  // App list items stagger in
  const listOpacity = useTransform(scrollYProgress, [0.1, 0.25], [0, 1]);
  const listY = useTransform(scrollYProgress, [0.1, 0.25], [24, 0]);

  return (
    <section ref={sectionRef}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div style={{ x: textX, opacity: textOpacity }}>
          <p className="text-xs text-deja-cyan font-mono tracking-[0.2em] uppercase mb-3">DEJA.js Apps</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Control from any device.</h2>
          <p className="text-gray-400 leading-relaxed mb-6">Throttle, Cloud, Monitor — every app connected to the same layout in real time. Open Throttle on your phone, Cloud on your tablet, Monitor on your laptop. Changes sync instantly across all of them.</p>
          <motion.div className="flex flex-col gap-3 mb-6" style={{ opacity: listOpacity, y: listY }}>
            {apps.map((app) => (
              <div key={app.label} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-deja-cyan mt-2 shrink-0" />
                <span className="text-gray-300">
                  <Link href={app.href} className="font-semibold text-white hover:text-deja-cyan transition-colors">{app.label}</Link>
                  {' — '}
                  {app.desc}
                  {' '}
                  <DocLink href={app.docsHref}>{app.label}</DocLink>
                </span>
              </div>
            ))}
          </motion.div>
          <p className="text-gray-500 text-sm">
            Explore each app to see what it can do for your layout.
          </p>
        </motion.div>

        {/* Device screenshots with parallax depth — no frames */}
        <div className="flex items-end justify-center gap-4">
          <motion.div style={{ y: phoneY, opacity: phoneOpacity }}>
            <Image
              src="/screenshots/throttle_mobile_throttle.png"
              alt="Throttle app on mobile"
              width={260}
              height={560}
              className="w-[140px] h-auto rounded-xl shadow-2xl"
            />
          </motion.div>
          <motion.div style={{ y: tabletY, opacity: tabletOpacity }}>
            <Image
              src="/screenshots/cloud_desktop_roster.png"
              alt="Cloud dashboard"
              width={560}
              height={350}
              className="w-[280px] h-auto rounded-xl shadow-2xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

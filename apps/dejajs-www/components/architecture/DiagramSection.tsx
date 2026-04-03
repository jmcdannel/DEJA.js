'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import DiagramSwitcher from './DiagramSwitcher';

const configs = [
  { name: 'Starter', desc: 'A loop of track, one phone, one command station. Running in minutes.' },
  { name: 'Shelf', desc: 'Add Cloud management and an Arduino for turnouts and signals.' },
  { name: 'Bedroom', desc: 'Monitoring, wireless Pico W effects, and full cloud sync.' },
  { name: 'Basement', desc: 'Two power districts, multiple operators running trains together.' },
  { name: 'Club', desc: 'Multiple command stations, throttles, monitoring, and tour mode.' },
];

export default function DiagramSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center center'],
  });

  const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const headerY = useTransform(scrollYProgress, [0, 0.2], [24, 0]);
  const configsOpacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);
  const configsY = useTransform(scrollYProgress, [0.1, 0.3], [16, 0]);
  const diagramOpacity = useTransform(scrollYProgress, [0.2, 0.4], [0, 1]);

  return (
    <section ref={sectionRef}>
      <motion.div className="text-center mb-4" style={{ opacity: headerOpacity, y: headerY }}>
        <p className="text-xs text-gray-500 font-mono tracking-[0.2em] uppercase mb-2">Configurations</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          Start simple. Scale up.
        </h2>
        <p className="text-gray-400 text-sm max-w-lg mx-auto">
          DEJA.js grows with your layout — no rewiring, no reinstalling.
        </p>
      </motion.div>

      <motion.div style={{ opacity: configsOpacity, y: configsY }}>
        <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto mb-6">
          {configs.map((c) => (
            <div key={c.name} className="rounded-lg border border-gray-700/40 bg-gray-800/15 px-3 py-2 text-center w-[140px]">
              <p className="text-white font-semibold text-xs mb-0.5">{c.name}</p>
              <p className="text-gray-500 text-[10px] leading-snug">{c.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div style={{ opacity: diagramOpacity }}>
        <DiagramSwitcher />
      </motion.div>
    </section>
  );
}

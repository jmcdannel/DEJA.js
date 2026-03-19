'use client';

import AnimateIn from '../home/AnimateIn';
import DiagramSwitcher from './DiagramSwitcher';

export default function DiagramSection() {
  return (
    <section>
      <AnimateIn className="text-center mb-10">
        <p className="text-xs text-gray-500 font-mono tracking-[0.2em] uppercase mb-3">Full Picture</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">See the full picture.</h2>
        <p className="text-gray-400 max-w-lg mx-auto">Choose your configuration — from a single throttle to a complete platform with IO devices, multiple command stations, and cloud sync.</p>
      </AnimateIn>
      <AnimateIn delay={0.2}>
        <DiagramSwitcher />
      </AnimateIn>
    </section>
  );
}

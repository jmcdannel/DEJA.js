'use client';

import Image from 'next/image';
import AnimateIn from '../home/AnimateIn';

export default function ArchitectureHero() {
  return (
    <section className="relative py-8 overflow-hidden -mx-6 px-6">
      <AnimateIn>
        <Image
          src="/images/architecture-hero.png"
          alt="DEJA DCC System Architecture — Throttle App connects via WiFi to DEJA Server, which connects via USB to DCC-EX CommandStation, which sends DCC signal to the track"
          width={1456}
          height={816}
          className="w-full h-auto rounded-xl"
          priority
        />
      </AnimateIn>
    </section>
  );
}

// 🚀 Hero section for a product page: icon, name, tagline, CTAs, and a hero visual slot.

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { CTAAction, ProductAccent } from './types';

interface ProductHeroProps {
  productName: string;
  icon: string;
  tagline: string;
  kicker?: string;
  accent: ProductAccent;
  primaryCta: CTAAction;
  secondaryCta?: CTAAction;
  guideCta?: CTAAction;
  heroVisual?: ReactNode;
}

export default function ProductHero({
  productName,
  icon,
  tagline,
  kicker,
  accent,
  primaryCta,
  secondaryCta,
  guideCta,
  heroVisual,
}: ProductHeroProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <Image
              src={icon}
              alt={`${productName} logo`}
              width={80}
              height={80}
              className="h-16 w-16 md:h-20 md:w-20 drop-shadow-lg"
            />
            <div className="flex flex-col">
              <span className="text-xs tracking-[0.2em] uppercase font-mono text-gray-500">
                DEJA.js
              </span>
              <h1 className={`text-4xl md:text-5xl font-bold tracking-tight ${accent.textClass}`}>
                {productName}
              </h1>
            </div>
          </div>
          {kicker && (
            <p className="text-sm font-mono tracking-widest text-gray-500 uppercase">
              {kicker}
            </p>
          )}
          <p className="text-xl md:text-2xl text-gray-300 max-w-xl leading-relaxed">
            {tagline}
          </p>
          <div className="flex flex-wrap gap-3 mt-2">
            <CtaLink cta={primaryCta} accent={accent} variant="primary" />
            {secondaryCta && <CtaLink cta={secondaryCta} accent={accent} variant="secondary" />}
            {guideCta && <CtaLink cta={guideCta} accent={accent} variant="ghost" />}
          </div>
        </div>
        {heroVisual && <div className="flex justify-center">{heroVisual}</div>}
      </div>
    </section>
  );
}

function CtaLink({
  cta,
  accent,
  variant,
}: {
  cta: CTAAction;
  accent: ProductAccent;
  variant: 'primary' | 'secondary' | 'ghost';
}) {
  const base =
    'inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold tracking-wide font-mono text-sm transition-colors';
  const classes =
    variant === 'primary'
      ? `${base} ${accent.bgClass} text-gray-950 hover:opacity-90 ${accent.glowClass}`
      : variant === 'secondary'
        ? `${base} border ${accent.borderClass} ${accent.textClass} hover:bg-white/5`
        : `${base} ${accent.textClass} hover:opacity-80`;

  if (cta.external) {
    return (
      <a href={cta.href} target="_blank" rel="noopener noreferrer" className={classes}>
        {cta.label}
      </a>
    );
  }
  return (
    <Link href={cta.href} className={classes}>
      {cta.label}
    </Link>
  );
}

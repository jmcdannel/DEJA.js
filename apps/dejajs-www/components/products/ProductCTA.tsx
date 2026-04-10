// 🎯 Final call-to-action strip with primary, secondary, and optional guide buttons.

import Link from 'next/link';
import type { CTAAction, ProductAccent } from './types';

interface ProductCTAProps {
  heading: string;
  subheading?: string;
  accent: ProductAccent;
  primary: CTAAction;
  secondary?: CTAAction;
  guide?: CTAAction;
}

export default function ProductCTA({
  heading,
  subheading,
  accent,
  primary,
  secondary,
  guide,
}: ProductCTAProps) {
  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center gap-6">
        <h2 className={`text-4xl md:text-5xl font-bold tracking-tight ${accent.textClass}`}>
          {heading}
        </h2>
        {subheading && <p className="text-xl text-gray-400 max-w-2xl">{subheading}</p>}
        <div className="flex flex-wrap justify-center gap-3">
          <CtaButton cta={primary} accent={accent} variant="primary" />
          {secondary && <CtaButton cta={secondary} accent={accent} variant="secondary" />}
          {guide && <CtaButton cta={guide} accent={accent} variant="ghost" />}
        </div>
      </div>
    </section>
  );
}

function CtaButton({
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

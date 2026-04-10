// 🚀 Hero section for a product page: icon, name, tagline, CTAs, and a hero visual slot.

import type { ReactNode } from 'react';
import Logo from '../Logo';
import DocLink from '../DocLink';
import CtaLink, { GuideIcon } from './CtaLink';
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
          <Logo
            variant={accent.slug}
            layout="product"
            appTitle={productName}
            size="xl"
          />
          {kicker && (
            <p className="text-sm font-mono tracking-widest text-gray-500 uppercase">
              {kicker}
            </p>
          )}
          <p className="text-xl md:text-2xl text-gray-300 max-w-xl leading-relaxed">
            {tagline}
          </p>
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex flex-wrap items-center gap-3">
              <CtaLink cta={primaryCta} accent={accent} variant="primary" />
              {guideCta && (
                <CtaLink cta={guideCta} accent={accent} variant="secondary" icon={<GuideIcon />} />
              )}
            </div>
            {secondaryCta && (
              <div>
                <DocLink href={secondaryCta.href}>{productName}</DocLink>
              </div>
            )}
          </div>
        </div>
        {heroVisual && <div className="flex justify-center">{heroVisual}</div>}
      </div>
    </section>
  );
}

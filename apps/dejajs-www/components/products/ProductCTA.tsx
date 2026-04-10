// 🎯 Final call-to-action strip with primary, secondary, and optional guide buttons.

import DocLink from '../DocLink';
import CtaLink, { GuideIcon } from './CtaLink';
import type { CTAAction, ProductAccent } from './types';

interface ProductCTAProps {
  heading: string;
  subheading?: string;
  accent: ProductAccent;
  productName: string;
  primary: CTAAction;
  secondary?: CTAAction;
  guide?: CTAAction;
}

export default function ProductCTA({
  heading,
  subheading,
  accent,
  productName,
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
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <CtaLink cta={primary} accent={accent} variant="primary" />
            {guide && (
              <CtaLink cta={guide} accent={accent} variant="secondary" icon={<GuideIcon />} />
            )}
          </div>
          {secondary && (
            <div>
              <DocLink href={secondary.href}>{productName}</DocLink>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

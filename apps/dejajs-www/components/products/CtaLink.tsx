// Shared CTA button for product pages. Primary (solid fill) and secondary
// (outlined) variants — secondary uses the magenta brand regardless of product.

import Link from 'next/link';
import type { ReactNode } from 'react';
import type { CTAAction, ProductAccent } from './types';

export { default as GuideIcon } from '../icons/GuideIcon';

type Variant = 'primary' | 'secondary';

interface CtaLinkProps {
  cta: CTAAction;
  accent: ProductAccent;
  variant?: Variant;
  icon?: ReactNode;
}

const BASE =
  'inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold tracking-wide text-base transition-colors';

function resolveVariant(cta: CTAAction, fallback: Variant): Variant {
  if (cta.style === 'primary') return 'primary';
  if (cta.style === 'secondary' || cta.style === 'ghost') return 'secondary';
  return fallback;
}

export default function CtaLink({ cta, accent, variant, icon }: CtaLinkProps) {
  const resolved = variant ?? resolveVariant(cta, 'secondary');
  const classes =
    resolved === 'primary'
      ? `${BASE} ${accent.bgClass} text-gray-950 hover:opacity-90 ${accent.glowClass}`
      : `${BASE} border border-deja-magenta text-deja-magenta hover:bg-deja-magenta/10`;

  const content = (
    <>
      {icon}
      {cta.label}
    </>
  );

  if (cta.external) {
    return (
      <a
        href={cta.href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {content}
      </a>
    );
  }
  return (
    <Link href={cta.href} className={classes}>
      {content}
    </Link>
  );
}

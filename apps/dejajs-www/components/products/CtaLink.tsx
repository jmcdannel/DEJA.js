// 🔗 Shared CTA button for product pages. Handles primary (solid fill) and
// secondary (outlined) variants using the product's accent color.

import Link from 'next/link';
import type { ReactNode } from 'react';
import type { CTAAction, ProductAccent } from './types';

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
  // 🎨 'ghost' is treated as 'secondary' — both render as outlined accent buttons.
  if (cta.style === 'primary') return 'primary';
  if (cta.style === 'secondary' || cta.style === 'ghost') return 'secondary';
  return fallback;
}

export default function CtaLink({ cta, accent, variant, icon }: CtaLinkProps) {
  const resolved = variant ?? resolveVariant(cta, 'secondary');
  // 💜 Secondary buttons (docs, guide) use the magenta brand color regardless of the product accent.
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

// 📚 Shared icon used by the "Read the Guide" CTA — matches the Guides nav icon.
export const GuideIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
    />
  </svg>
);

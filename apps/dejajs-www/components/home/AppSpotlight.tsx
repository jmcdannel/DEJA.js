'use client';

import Image from 'next/image';
import AnimateIn from './AnimateIn';
import SectionLabel from './SectionLabel';
import DocLink from '../DocLink';
import Logo, { type LogoVariant } from '../Logo';

export interface SpotlightFeature {
  icon: string;
  label: string;
  description: string;
}

export interface SpotlightCallout {
  icon: string;
  title: string;
  body: string;
}

export interface AppSpotlightProps {
  label: string;
  labelColor?: 'cyan' | 'magenta' | 'lime';
  appName: string;
  tagline: string;
  description: string;
  features: SpotlightFeature[];
  callout: SpotlightCallout;
  mainScreenshot: { src: string; alt: string };
  pipScreenshot: { src: string; alt: string };
  logoVariant: LogoVariant;
  ctaHref: string;
  ctaLabel?: string;
  docsHref: string;
  docsLabel?: string;
  flip?: boolean;
  bgClass?: string;
  children?: React.ReactNode;
  visualSlot?: React.ReactNode;
}

export default function AppSpotlight({
  label,
  labelColor = 'cyan',
  appName,
  tagline,
  description,
  features,
  callout,
  mainScreenshot,
  pipScreenshot,
  logoVariant,
  ctaHref,
  ctaLabel = 'Learn More',
  docsHref,
  docsLabel = 'View Docs',
  flip = false,
  bgClass = '',
  children,
  visualSlot,
}: AppSpotlightProps) {
  const textCol = (
    <AnimateIn direction={flip ? 'right' : 'left'} className="flex flex-col gap-6">
      {/* Logo + label row */}
      <div className="flex items-center gap-3">
        <Logo variant={logoVariant} size="2xl" iconShape="circle" showWordmark={false} />
        <SectionLabel color={labelColor}>{label}</SectionLabel>
      </div>

      {/* App name */}
      <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">{appName}</h2>

      {/* Tagline */}
      <p className="text-deja-cyan font-semibold text-lg">{tagline}</p>

      {/* Description */}
      <p className="text-gray-400 leading-relaxed">{description}</p>

      {/* Feature list */}
      <ul className="flex flex-col gap-4">
        {features.map((feature) => (
          <li key={feature.label} className="flex items-start gap-3">
            <span className="text-xl mt-0.5 shrink-0">{feature.icon}</span>
            <span className="text-gray-300">
              <span className="font-bold text-white">{feature.label}</span>
              {' '}
              {feature.description}
            </span>
          </li>
        ))}
      </ul>

      {/* Callout card */}
      <div className="rounded-xl border border-deja-cyan/20 bg-deja-cyan/5 p-5 flex gap-4 items-start">
        <span className="text-2xl shrink-0">{callout.icon}</span>
        <div>
          <p className="text-deja-cyan font-semibold mb-1">{callout.title}</p>
          <p className="text-gray-400 text-sm leading-relaxed">{callout.body}</p>
        </div>
      </div>

      {/* Children slot for unique extras */}
      {children}

      {/* CTA buttons */}
      <div className="flex flex-wrap gap-3 pt-2">
        <a
          href={ctaHref}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-deja-cyan/10 border border-deja-cyan/40 text-deja-cyan font-bold text-sm hover:bg-deja-cyan/20 transition-colors"
        >
          {ctaLabel}
        </a>
        <DocLink href={docsHref}>{docsLabel === 'View Docs' ? appName : docsLabel}</DocLink>
      </div>
    </AnimateIn>
  );

  const defaultVisual = (
    <AnimateIn direction={flip ? 'left' : 'right'} className="relative pb-8">
      {/* Main screenshot */}
      <div className="rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
        <Image
          src={mainScreenshot.src}
          alt={mainScreenshot.alt}
          width={800}
          height={500}
          className="w-full h-auto"
        />
      </div>

      {/* PiP screenshot */}
      <div
        className="absolute -bottom-2 w-2/5 rounded-xl overflow-hidden shadow-xl border border-gray-700"
        style={{
          ...(flip ? { right: '-1rem' } : { left: '-1rem' }),
        } as React.CSSProperties}
      >
        <Image
          src={pipScreenshot.src}
          alt={pipScreenshot.alt}
          width={320}
          height={200}
          className="w-full h-auto"
        />
      </div>
    </AnimateIn>
  );

  return (
    <section className={`py-28 px-6 ${bgClass}`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Mobile: text first, visual below. Desktop: respect flip */}
          <div className={flip ? 'lg:order-2' : 'lg:order-1'}>
            {textCol}
          </div>
          <div className={flip ? 'lg:order-1' : 'lg:order-2'}>
            {visualSlot ?? defaultVisual}
          </div>
        </div>
      </div>
    </section>
  );
}

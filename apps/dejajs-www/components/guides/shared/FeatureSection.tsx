import React from 'react';
import Image from 'next/image';
import AnimateIn from '../../home/AnimateIn';
import DocLink from '../../DocLink';
import FeatureGrid from './FeatureGrid';

export default function FeatureSection({
  title,
  desc,
  features,
  screenshot,
  screenshotAlt,
  screenshotDevice = 'desktop',
  flip = false,
  cloudNote,
  docLink,
  docLabel,
  children,
  renderScreenshot,
}: {
  title: string;
  desc: string;
  features: { emoji: string; text: string }[];
  screenshot: string;
  screenshotAlt: string;
  screenshotDevice?: 'mobile' | 'desktop';
  flip?: boolean;
  cloudNote?: React.ReactNode;
  docLink?: string;
  docLabel?: string;
  children?: React.ReactNode;
  renderScreenshot?: () => React.ReactNode;
}) {
  const screenshotContent = renderScreenshot ? (
    renderScreenshot()
  ) : screenshotDevice === 'mobile' ? (
    <div className="flex justify-center">
      <div className="rounded-2xl overflow-hidden shadow-2xl w-full max-w-lg">
        <Image src={screenshot} alt={screenshotAlt} width={400} height={800} className="w-full h-auto" />
      </div>
    </div>
  ) : (
    <div className="rounded-2xl overflow-hidden shadow-2xl w-full max-w-lg">
      <Image src={screenshot} alt={screenshotAlt} width={1200} height={675} className="w-full h-auto" />
    </div>
  );

  return (
    <section className="py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <AnimateIn direction={flip ? 'right' : 'left'} className={flip ? 'lg:order-2' : ''}>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">{title}</h2>
          <p className="text-gray-400 leading-relaxed mb-6">{desc}</p>
          <FeatureGrid items={features} />
          {cloudNote && <div className="mt-4">{cloudNote}</div>}
          {children}
          {docLink && docLabel && (
            <div className="mt-4">
              <DocLink href={docLink}>{docLabel}</DocLink>
            </div>
          )}
        </AnimateIn>
        <AnimateIn direction={flip ? 'left' : 'right'} className={`flex justify-center ${flip ? 'lg:order-1' : ''}`}>
          {screenshotContent}
        </AnimateIn>
      </div>
    </section>
  );
}

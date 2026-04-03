'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import AnimateIn from '../../home/AnimateIn';
import SectionLabel from '../../home/SectionLabel';
import DocLink from '../../DocLink';
import FeatureGrid from './FeatureGrid';

export interface CarouselSlide {
  id: string;
  emoji: string;
  title: string;
  tagline: string;
  desc: string;
  desktopScreenshot: string;
  mobileScreenshot?: string;
  features: { emoji: string; text: string }[];
  docHref: string;
  docLabel: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
}

function defaultScreenshot(slide: CarouselSlide) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl">
      <Image
        src={slide.desktopScreenshot}
        alt={`${slide.title} desktop view`}
        width={1200}
        height={675}
        className="w-full h-auto"
      />
    </div>
  );
}

export default function FeatureCarousel({
  slides,
  sectionLabel,
  sectionColor = 'lime',
  title,
  description,
  tabColumns = 'sm:grid-cols-4',
  renderScreenshot,
}: {
  slides: CarouselSlide[];
  sectionLabel: string;
  sectionColor?: 'cyan' | 'magenta' | 'lime';
  title: string;
  description: React.ReactNode;
  tabColumns?: string;
  renderScreenshot?: (slide: CarouselSlide) => React.ReactNode;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = slides[activeIdx];
  const screenshotRenderer = renderScreenshot ?? defaultScreenshot;

  return (
    <section className="py-20">
      <div className="max-w-5xl mx-auto">
        <AnimateIn>
          <SectionLabel color={sectionColor}>{sectionLabel}</SectionLabel>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-4 mb-3">{title}</h2>
          <div className="text-gray-400 leading-relaxed mb-10">{description}</div>
        </AnimateIn>

        {/* Tab buttons */}
        <div className={`grid grid-cols-2 ${tabColumns} gap-3 mb-12`}>
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              onClick={() => setActiveIdx(i)}
              className={`flex flex-col items-center gap-2 px-4 py-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                i === activeIdx
                  ? `${slide.accentBg} border-2 ${slide.accentBorder} ${slide.accentColor} shadow-lg`
                  : 'border-2 border-gray-800/60 text-gray-500 hover:border-gray-600 hover:text-gray-300 hover:bg-gray-900/50'
              }`}
            >
              <span className="text-2xl">{slide.emoji}</span>
              <span>{slide.title}</span>
            </button>
          ))}
        </div>

        {/* Active slide */}
        <div key={active.id}>
          <div className="mb-8">
            <h3 className={`text-3xl font-bold ${active.accentColor} mb-2`}>{active.title}</h3>
            <p className="text-xl text-white font-semibold">{active.tagline}</p>
            <p className="text-gray-400 leading-relaxed mt-3 max-w-2xl">{active.desc}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {screenshotRenderer(active)}

            <div>
              <FeatureGrid items={active.features} />
              <div className="mt-6 flex flex-wrap gap-3">
                <DocLink href={active.docHref}>{active.docLabel}</DocLink>
              </div>

              <div className={`mt-6 p-6 rounded-xl border-2 border-dashed ${active.accentBorder} ${active.accentBg} flex flex-col items-center gap-2`}>
                <span className="text-4xl">{active.emoji}</span>
                <p className={`text-sm font-medium ${active.accentColor}`}>Illustration coming soon</p>
                <p className="text-xs text-gray-500 text-center">Custom graphic for {active.title.toLowerCase()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// 📸 Horizontal scrolling carousel of annotated screenshots.

import Image from 'next/image';
import type { ProductAccent, Screenshot } from './types';
import SectionHeading from './SectionHeading';

interface ScreenshotCarouselProps {
  eyebrow?: string;
  heading: string;
  kicker?: string;
  screenshots: Screenshot[];
  accent: ProductAccent;
  aspectRatio?: 'desktop' | 'mobile';
}

export default function ScreenshotCarousel({
  eyebrow = 'Screens',
  heading,
  kicker,
  screenshots,
  accent,
  aspectRatio = 'desktop',
}: ScreenshotCarouselProps) {
  const dimensions = aspectRatio === 'mobile' ? { w: 320, h: 640 } : { w: 800, h: 500 };
  const frameClass =
    aspectRatio === 'mobile'
      ? 'w-[260px] md:w-[300px] h-auto'
      : 'w-[640px] md:w-[760px] h-auto';

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <SectionHeading
          eyebrow={eyebrow}
          heading={heading}
          kicker={kicker}
          accentClass={accent.textClass}
        />
        <div className="overflow-x-auto pb-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 min-w-min">
            {screenshots.map((shot, i) => (
              <figure key={i} className="flex-shrink-0 flex flex-col gap-3">
                <div
                  className={`rounded-xl bg-slate-900 border border-slate-800 p-2 shadow-lg ${frameClass}`}
                >
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    width={dimensions.w}
                    height={dimensions.h}
                    className="rounded-lg w-full h-auto"
                  />
                </div>
                {shot.caption && (
                  <figcaption className="text-sm text-gray-500 text-center max-w-[300px] mx-auto">
                    {shot.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

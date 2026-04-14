// 📸 Hardware photo grid for the IO page. Renders a placeholder slot when src is missing.

import Image from 'next/image';
import type { ProductAccent } from './types';
import SectionHeading from './SectionHeading';

interface HardwarePhoto {
  src?: string;
  alt: string;
  caption?: string;
}

interface HardwareGalleryProps {
  accent: ProductAccent;
  photos: HardwarePhoto[];
  heading?: string;
  kicker?: string;
}

export default function HardwareGallery({
  accent,
  photos,
  heading = 'Open hardware, end to end',
  kicker = 'Wire it yourself or drop in one of these. Every device speaks MQTT directly to your server.',
}: HardwareGalleryProps) {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <SectionHeading
          eyebrow="Hardware"
          heading={heading}
          kicker={kicker}
          accentClass={accent.textClass}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo, i) => (
            <figure
              key={i}
              className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden flex flex-col"
            >
              {photo.src ? (
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={600}
                  height={400}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-gray-600 text-sm font-mono px-4 text-center">
                  📸 photo slot:<br />{photo.alt}
                </div>
              )}
              {photo.caption && (
                <figcaption className="p-4 text-sm text-gray-400">{photo.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

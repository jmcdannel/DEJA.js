// 🌐 5-tile ecosystem grid showing every product except the current one.
// Reinforces the "one platform, every app" story on every product page.

import Image from 'next/image';
import Link from 'next/link';
import type { ProductSlug } from './types';
import SectionHeading from './SectionHeading';

interface PlatformProduct {
  slug: ProductSlug;
  name: string;
  tagline: string;
  icon: string;
  href: string;
}

const ALL_PRODUCTS: PlatformProduct[] = [
  { slug: 'throttle', name: 'Throttle', tagline: 'Drive from any phone',  icon: '/throttle/icon-512.png', href: '/throttle' },
  { slug: 'server',   name: 'Server',   tagline: 'Bridge to DCC-EX',      icon: '/server/icon-512.png',   href: '/server' },
  { slug: 'cloud',    name: 'Cloud',    tagline: 'Roster & layouts',      icon: '/cloud/icon-512.png',    href: '/cloud' },
  { slug: 'io',       name: 'IO',       tagline: 'Expand with hardware',  icon: '/io/icon-512.png',       href: '/io' },
  { slug: 'monitor',  name: 'Monitor',  tagline: 'Live diagnostics',      icon: '/monitor/icon-512.png',  href: '/monitor' },
  { slug: 'tour',     name: 'Tour',     tagline: 'Guided showcases',      icon: '/tour/icon-512.png',     href: '/tour' },
];

interface PlatformBreadthProps {
  currentSlug: ProductSlug;
}

export default function PlatformBreadth({ currentSlug }: PlatformBreadthProps) {
  const products = ALL_PRODUCTS.filter((p) => p.slug !== currentSlug);
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <SectionHeading
          eyebrow="One platform"
          heading="One account. Every app."
          kicker="DEJA.js isn't a single tool — it's an open platform for driving, managing, and expanding your layout."
          align="center"
        />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {products.map((product) => (
            <Link
              key={product.slug}
              href={product.href}
              className="group flex flex-col items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-5 hover:border-slate-700 hover:bg-slate-900/80 transition-colors"
            >
              <Image
                src={product.icon}
                alt={`${product.name} icon`}
                width={48}
                height={48}
                className="h-12 w-12"
              />
              <div className="text-center">
                <div className="font-bold text-white text-sm">{product.name}</div>
                <div className="text-xs text-gray-500 mt-1">{product.tagline}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

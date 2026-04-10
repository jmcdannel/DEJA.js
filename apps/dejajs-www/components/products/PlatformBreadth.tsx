// 🌐 5-tile ecosystem grid showing every product except the current one.
// Reinforces the "one platform, every app" story on every product page.

import Link from 'next/link';
import type { ProductSlug } from './types';
import SectionHeading from './SectionHeading';
import Logo from '../Logo';

interface PlatformProduct {
  slug: ProductSlug;
  name: string;
  tagline: string;
  href: string;
}

const ALL_PRODUCTS: PlatformProduct[] = [
  { slug: 'throttle', name: 'Throttle', tagline: 'Drive from any phone',  href: '/throttle' },
  { slug: 'server',   name: 'Server',   tagline: 'Bridge to DCC-EX',      href: '/server' },
  { slug: 'cloud',    name: 'Cloud',    tagline: 'Roster & layouts',      href: '/cloud' },
  { slug: 'io',       name: 'IO',       tagline: 'Expand with hardware',  href: '/io' },
  { slug: 'monitor',  name: 'Monitor',  tagline: 'Live diagnostics',      href: '/monitor' },
  { slug: 'tour',     name: 'Tour',     tagline: 'Guided showcases',      href: '/tour' },
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
              <Logo variant={product.slug} iconShape="circle" showWordmark={false} size="lg" />
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

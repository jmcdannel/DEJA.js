'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { DocNavItem } from '../lib/generate-docs-nav';

function flattenNav(items: DocNavItem[]): DocNavItem[] {
  const flat: DocNavItem[] = [];
  for (const item of items) {
    if (!item.comingSoon && item.href !== '#') {
      flat.push(item);
    }
    if (item.children) {
      flat.push(...flattenNav(item.children));
    }
  }
  // Deduplicate by href (section parents may duplicate their overview child)
  const seen = new Set<string>();
  return flat.filter((item) => {
    if (seen.has(item.href)) return false;
    seen.add(item.href);
    return true;
  });
}

export default function DocsPrevNext({ nav }: { nav: DocNavItem[] }) {
  const pathname = usePathname();
  const pages = flattenNav(nav);
  const currentIdx = pages.findIndex((p) => p.href === pathname);

  if (currentIdx === -1) return null;

  const prev = currentIdx > 0 ? pages[currentIdx - 1] : null;
  const next = currentIdx < pages.length - 1 ? pages[currentIdx + 1] : null;

  if (!prev && !next) return null;

  return (
    <nav aria-label="Previous and next pages" className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700/50 flex justify-between gap-4">
      {prev ? (
        <Link
          href={prev.href}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="min-w-0">
            <span className="block text-[10px] uppercase tracking-wider font-semibold opacity-50">Prev</span>
            <span className="block text-sm font-medium truncate">{prev.title}</span>
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={next.href}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors text-right"
        >
          <span className="min-w-0">
            <span className="block text-[10px] uppercase tracking-wider font-semibold opacity-50">Next</span>
            <span className="block text-sm font-medium truncate">{next.title}</span>
          </span>
          <svg className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

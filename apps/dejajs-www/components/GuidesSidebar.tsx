'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Logo from './Logo';
import { guides } from './guides-list';

export default function GuidesSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentGuide = guides.find((g) => g.href === pathname);
  const currentTitle = currentGuide?.title ?? 'Guides';

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden flex items-center justify-between w-full gap-3 px-4 py-3 mb-4 rounded-lg text-left bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
        aria-expanded={mobileOpen}
        aria-controls="guides-sidebar-nav"
        aria-label={`Current guide: ${currentTitle}. Toggle guides navigation`}
      >
        <span className="flex flex-col min-w-0">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">
            Guide
          </span>
          <span className="text-base font-semibold text-gray-900 dark:text-white truncate">
            {currentTitle}
          </span>
        </span>
        <span className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
          {mobileOpen ? 'Close' : 'Menu'}
        </span>
      </button>

      <nav
        id="guides-sidebar-nav"
        aria-label="Guides navigation"
        className={`${mobileOpen ? 'block' : 'hidden'} lg:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto`}
      >
        <div className="mb-4">
          <Link href="/guides" className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <Logo variant="default" size="xs" showWordmark={false} />
            <span>Guides</span>
          </Link>
        </div>
        <ul className="space-y-1">
          {guides.map((g) => {
            const isActive = pathname === g.href;
            return (
              <li key={g.href}>
                {g.comingSoon ? (
                  <span className="flex items-center justify-between px-3 py-1.5 rounded-md text-sm font-medium text-gray-400 dark:text-gray-500 cursor-default">
                    {g.title}
                    <span className="text-[10px] uppercase tracking-wider font-semibold">Soon</span>
                  </span>
                ) : (
                  <Link
                    href={g.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`block px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {g.title}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
        <hr className="my-4 border-gray-200 dark:border-gray-700" />
        <div className="space-y-1">
          <Link
            href="/docs"
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Documentation
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </nav>
    </>
  );
}

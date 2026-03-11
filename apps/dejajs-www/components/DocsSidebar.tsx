'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { DocNavItem } from '../lib/generate-docs-nav';

function NavItem({ item, pathname, depth = 0 }: { item: DocNavItem; pathname: string; depth?: number }) {
  const isActive = pathname === item.href;
  const hasChildren = item.children && item.children.length > 0;
  const isParentActive = hasChildren && pathname.startsWith(item.href);
  const [open, setOpen] = useState(isParentActive || isActive);

  return (
    <li>
      <div className="flex items-center">
        {item.comingSoon ? (
          <span
            className="flex-1 block px-3 py-1.5 rounded-md text-sm font-medium text-gray-400 dark:text-gray-500 cursor-default flex items-center gap-2"
            style={{ paddingLeft: `${depth * 12 + 12}px` }}
          >
            {item.title}
            <span className="text-[10px] uppercase tracking-wider font-semibold">Soon</span>
          </span>
        ) : (
          <Link
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={`flex-1 block px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isActive
                ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            style={{ paddingLeft: `${depth * 12 + 12}px` }}
          >
            {item.title}
          </Link>
        )}
        {hasChildren && !!item.children && (
          <button
            onClick={() => setOpen(!open)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-expanded={open}
            aria-label={`${open ? 'Collapse' : 'Expand'} ${item.title} section`}
          >
            <svg
              className={`w-4 h-4 transition-transform ${open ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
      {hasChildren && open && !!item.children && (
        <ul className="mt-0.5 space-y-0.5">
          {item.children.map((child) => (
            <NavItem key={child.href} item={child} pathname={pathname} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function DocsSidebar({ nav }: { nav: DocNavItem[] }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden flex items-center gap-2 px-3 py-2 mb-4 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
        aria-expanded={mobileOpen}
        aria-controls="docs-sidebar-nav"
        aria-label="Toggle documentation navigation"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
        </svg>
        Menu
      </button>

      <nav
        aria-label="Documentation navigation"
        className={`${
          mobileOpen ? 'block' : 'hidden'
        } lg:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto`}
      >
        <div className="mb-4">
          <Link href="/docs" className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <Image src="/icon-192.png" alt="DEJA.js" width={24} height={24} className="h-6 w-6" />
            <span>Documentation</span>
          </Link>
        </div>
        <ul className="space-y-1">
          {nav.map((item) => (
            <NavItem key={item.href + item.title} item={item} pathname={pathname} />
          ))}
        </ul>
        <hr className="my-4 border-gray-200 dark:border-gray-700" />
        <div className="space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </Link>
          <a
            href="https://github.com/jmcdannel/DEJA.js"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            GitHub
          </a>
        </div>
      </nav>
    </>
  );
}

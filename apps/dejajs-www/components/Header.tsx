'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const products = [
  {
    name: 'Server',
    desc: 'Connect to your DCC-EX CommandStation via USB.',
    logo: '/icon-512.png',
    href: '/server',
  },
  {
    name: 'Throttle',
    desc: 'Precise speed control, consists, and function mapping.',
    logo: '/throttle/icon-512.png',
    href: '/throttle',
  },
  {
    name: 'Cloud',
    desc: 'Manage roster, devices, turnouts, and effects.',
    logo: '/cloud/icon-512.png',
    href: '/cloud',
  },
  {
    name: 'IO',
    desc: 'Arduino and Pico W code for layout expansion.',
    logo: '/icon-512.png',
    href: '/tour',
  },
  {
    name: 'Monitor',
    desc: 'Live telemetry, events, and command traces.',
    logo: '/monitor/icon-512.png',
    href: '/monitor',
  },
  {
    name: 'Tour',
    desc: 'Guided presets to automate layout sequences.',
    logo: '/tour/icon-512.png',
    href: '/tour',
  },
];

const docsLinks = [
  { name: 'Getting Started', href: '/docs' },
  { name: 'Server', href: '/docs/server' },
  { name: 'Throttle', href: '/docs/throttle' },
  { name: 'Cloud', href: '/docs/cloud' },
  { name: 'IO', href: '/docs/io' },
  { name: 'Monitor', href: '/docs/monitor' },
  { name: 'Tour', href: '/docs/tour' },
  { name: 'Program', href: '#', comingSoon: true },
  { name: 'AI Ops', href: '#', comingSoon: true },
  { name: 'Dispatcher', href: '#', comingSoon: true },
];

function useDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        close();
        triggerRef.current?.focus();
      }
    }
    function handleClickOutside(e: MouseEvent) {
      if (isOpen && ref.current && !ref.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, close]);

  return { isOpen, open, close, toggle, ref, triggerRef };
}

export default function Header() {
  const pathname = usePathname();
  const productsDropdown = useDropdown();
  const docsDropdown = useDropdown();

  const handleMenuKeyDown = (
    e: React.KeyboardEvent,
    menuItems: { href: string; comingSoon?: boolean }[],
    containerRef: React.RefObject<HTMLDivElement | null>,
    close: () => void,
    triggerRef: React.RefObject<HTMLButtonElement | null>
  ) => {
    const focusableItems = containerRef.current?.querySelectorAll<HTMLElement>(
      'a[role="menuitem"]:not([aria-disabled="true"])'
    );
    if (!focusableItems || focusableItems.length === 0) return;

    const currentIdx = Array.from(focusableItems).indexOf(
      document.activeElement as HTMLElement
    );

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = currentIdx < focusableItems.length - 1 ? currentIdx + 1 : 0;
      focusableItems[nextIdx].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx = currentIdx > 0 ? currentIdx - 1 : focusableItems.length - 1;
      focusableItems[prevIdx].focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusableItems[0].focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      focusableItems[focusableItems.length - 1].focus();
    } else if (e.key === 'Tab') {
      close();
    }
  };

  return (
    <header className="w-full border-b bg-white dark:border-gray-800 dark:bg-gray-950 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
        <Link href="/" className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center">
          <Image src="/icon-192.png" alt="" width={32} height={32} className="inline-block h-8 w-8 mr-2" />
          <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">DEJA</span>
          <span className="text-purple-500 text-sm">.js</span>
          <span className="sr-only">DEJA.js Home</span>
        </Link>
        <nav className="hidden md:flex flex-1 items-center gap-6 ml-6 text-sm font-medium text-gray-700 dark:text-gray-200" aria-label="Main navigation">
          {/* Products Mega Menu */}
          <div className="relative group py-2" ref={productsDropdown.ref}>
            <button
              ref={productsDropdown.triggerRef}
              onClick={productsDropdown.toggle}
              onMouseEnter={productsDropdown.open}
              aria-expanded={productsDropdown.isOpen}
              aria-haspopup="true"
              className="cursor-pointer hover:text-indigo-500 transition-colors flex items-center gap-1 bg-transparent border-none text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Products
              <svg className={`w-4 h-4 opacity-70 transition-transform ${productsDropdown.isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {productsDropdown.isOpen && (
              <div
                className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-[540px] bg-transparent"
                onMouseLeave={productsDropdown.close}
              >
                <div
                  className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden p-4"
                  role="menu"
                  aria-label="Products"
                  onKeyDown={(e) =>
                    handleMenuKeyDown(
                      e,
                      products,
                      productsDropdown.ref,
                      productsDropdown.close,
                      productsDropdown.triggerRef
                    )
                  }
                >
                  <div className="grid grid-cols-2 gap-2">
                    {products.map((product) => (
                      <Link
                        key={product.name}
                        href={product.href}
                        role="menuitem"
                        aria-current={pathname === product.href ? 'page' : undefined}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group/item"
                      >
                        <Image src={product.logo} alt="" width={40} height={40} className="h-10 w-10 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-white group-hover/item:text-indigo-500 transition-colors">
                            {product.name}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Docs Mega Menu */}
          <div className="relative group py-2" ref={docsDropdown.ref}>
            <button
              ref={docsDropdown.triggerRef}
              onClick={docsDropdown.toggle}
              onMouseEnter={docsDropdown.open}
              aria-expanded={docsDropdown.isOpen}
              aria-haspopup="true"
              className="cursor-pointer hover:text-indigo-500 transition-colors flex items-center gap-1 bg-transparent border-none text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Docs
              <svg className={`w-4 h-4 opacity-70 transition-transform ${docsDropdown.isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {docsDropdown.isOpen && (
              <div
                className="absolute left-0 top-full pt-2 w-48 bg-transparent"
                onMouseLeave={docsDropdown.close}
              >
                <div
                  className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden p-2 flex flex-col gap-1"
                  role="menu"
                  aria-label="Documentation"
                  onKeyDown={(e) =>
                    handleMenuKeyDown(
                      e,
                      docsLinks,
                      docsDropdown.ref,
                      docsDropdown.close,
                      docsDropdown.triggerRef
                    )
                  }
                >
                  {docsLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      role="menuitem"
                      tabIndex={link.comingSoon ? -1 : 0}
                      aria-disabled={link.comingSoon ? true : undefined}
                      aria-current={!link.comingSoon && pathname === link.href ? 'page' : undefined}
                      className={`px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-between ${link.comingSoon ? 'text-gray-400 dark:text-gray-500' : ''}`}
                    >
                      {link.name}
                      {link.comingSoon && <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500" aria-label="Coming soon">Soon</span>}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-4 text-sm font-medium">
          <a href="https://cloud.dejajs.com/" className="text-gray-700 dark:text-gray-200 hover:text-indigo-500 transition-colors hidden sm:block">Log in</a>
          <a href="https://cloud.dejajs.com/signup" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors text-center whitespace-nowrap">Sign up</a>
        </div>
      </div>
    </header>
  );
}

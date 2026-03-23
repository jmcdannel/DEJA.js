'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

interface SiteSettings {
  siteName?: string;
  productNavItems?: Array<{
    _key: string;
    label: string;
    href: string;
    description?: string;
    icon?: string;
    comingSoon?: boolean;
  }>;
  docsNavItems?: Array<{
    _key: string;
    label: string;
    href: string;
    description?: string;
    comingSoon?: boolean;
  }>;
  loginUrl?: string;
  signupUrl?: string;
}

interface ProductItem {
  name: string;
  desc: string;
  logo: string;
  href: string;
}

interface DocItem {
  name: string;
  href: string;
  icon?: string;
  comingSoon?: boolean;
}

const defaultProducts: ProductItem[] = [
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

const defaultGuidesLinks: DocItem[] = [
  { name: 'Getting Started', href: '/guides/getting-started', icon: '🚀' },
  { name: 'Architecture', href: '/guides/architecture', icon: '🏗️' },
  { name: 'Throttle', href: '/guides/throttle', icon: '🚂' },
  { name: 'Cloud', href: '/guides/cloud', icon: '☁️', comingSoon: true },
  { name: 'Monitor', href: '/guides/monitor', icon: '📊', comingSoon: true },
  { name: 'Server', href: '/guides/server', icon: '🖥️', comingSoon: true },
  { name: 'IO', href: '/guides/io', icon: '🔌', comingSoon: true },
];

const defaultDocsLinks: DocItem[] = [
  { name: 'Server', href: '/docs/server', icon: '🖥️' },
  { name: 'Throttle', href: '/docs/throttle', icon: '🚂' },
  { name: 'Cloud', href: '/docs/cloud', icon: '☁️' },
  { name: 'Monitor', href: '/docs/monitor', icon: '📊' },
  { name: 'Tour', href: '/docs/tour', icon: '🗺️' },
  { name: 'IO', href: '/docs/io', icon: '🔌' },
  { name: 'Program', href: '#', icon: '⚙️', comingSoon: true },
  { name: 'AI Ops', href: '#', icon: '🤖', comingSoon: true },
  { name: 'Dispatcher', href: '#', icon: '🚦', comingSoon: true },
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

export default function Header({ settings }: { settings?: SiteSettings | null }) {
  const pathname = usePathname();
  const guidesDropdown = useDropdown();
  const productsDropdown = useDropdown();
  const docsDropdown = useDropdown();

  const products: ProductItem[] = settings?.productNavItems
    ? settings.productNavItems.map((item) => ({
        name: item.label,
        desc: item.description ?? '',
        logo: item.icon ?? '/icon-512.png',
        href: item.href,
      }))
    : defaultProducts;

  const docsLinks: DocItem[] = settings?.docsNavItems
    ? settings.docsNavItems.map((item) => ({
        name: item.label,
        href: item.href,
        comingSoon: item.comingSoon,
      }))
    : defaultDocsLinks;

  const loginUrl = settings?.loginUrl ?? 'https://cloud.dejajs.com/';
  const signupUrl = settings?.signupUrl ?? 'https://cloud.dejajs.com/signup';

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
    <header className="w-full border-b border-gray-800/60 bg-gray-950/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 pt-7 pb-4 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/icon-512.png" alt="DEJA.js" width={40} height={40} className="rounded-xl w-10 h-10 flex-shrink-0" />
          <span className="sr-only">DEJA.js Home</span>
        </Link>
        <nav className="hidden md:flex flex-1 items-center gap-8 ml-6" aria-label="Main navigation">
          {/* Guides Dropdown */}
          <div className="relative group py-2" ref={guidesDropdown.ref}>
            <button
              ref={guidesDropdown.triggerRef}
              onClick={guidesDropdown.toggle}
              onMouseEnter={guidesDropdown.open}
              aria-expanded={guidesDropdown.isOpen}
              aria-haspopup="true"
              className={`cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1 bg-transparent border-none text-[0.8rem] tracking-[0.06em] font-mono ${pathname?.startsWith('/guides') ? 'text-gray-900 dark:text-white' : ''}`}
            >
              <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
              Guides
              <svg className={`w-4 h-4 opacity-70 transition-transform ${guidesDropdown.isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {guidesDropdown.isOpen && (
              <div
                className="absolute left-0 top-full pt-2 w-48 bg-transparent"
                onMouseLeave={guidesDropdown.close}
              >
                <div
                  className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden p-2 flex flex-col gap-1"
                  role="menu"
                  aria-label="Guides"
                  onKeyDown={(e) =>
                    handleMenuKeyDown(
                      e,
                      defaultGuidesLinks,
                      guidesDropdown.ref,
                      guidesDropdown.close,
                      guidesDropdown.triggerRef
                    )
                  }
                >
                  {defaultGuidesLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      role="menuitem"
                      tabIndex={link.comingSoon ? -1 : 0}
                      aria-disabled={link.comingSoon ? true : undefined}
                      aria-current={!link.comingSoon && pathname === link.href ? 'page' : undefined}
                      className={`px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-between ${link.comingSoon ? 'text-gray-400 dark:text-gray-500' : ''}`}
                    >
                      <span className="flex items-center gap-2">
                        {link.icon && <span className="text-sm">{link.icon}</span>}
                        {link.name}
                      </span>
                      {link.comingSoon && <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500" aria-label="Coming soon">Soon</span>}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Products Mega Menu */}
          <div className="relative group py-2" ref={productsDropdown.ref}>
            <button
              ref={productsDropdown.triggerRef}
              onClick={productsDropdown.toggle}
              onMouseEnter={productsDropdown.open}
              aria-expanded={productsDropdown.isOpen}
              aria-haspopup="true"
              className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1 bg-transparent border-none text-[0.8rem] tracking-[0.06em] font-mono"
            >
              <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
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
                          <div className="font-medium text-slate-900 dark:text-white group-hover/item:text-cyan-400 transition-colors">
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
              className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1 bg-transparent border-none text-[0.8rem] tracking-[0.06em] font-mono"
            >
              <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
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
                      <span className="flex items-center gap-2">
                        {link.icon && <span className="text-sm">{link.icon}</span>}
                        {link.name}
                      </span>
                      {link.comingSoon && <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500" aria-label="Coming soon">Soon</span>}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pricing Link */}
          <Link
            href="/pricing"
            className={`text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-[0.8rem] tracking-[0.06em] font-mono flex items-center gap-1 ${pathname === '/pricing' ? 'text-gray-900 dark:text-white' : ''}`}
          >
            <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
            Pricing
          </Link>

          {/* FAQ Link */}
          <Link
            href="/faq"
            className={`text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-[0.8rem] tracking-[0.06em] font-mono flex items-center gap-1 ${pathname === '/faq' ? 'text-gray-900 dark:text-white' : ''}`}
          >
            <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-4 text-[0.875rem]">
          <a href={loginUrl} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors hidden sm:block tracking-[0.06em] font-mono text-[0.8rem]">Log in</a>
          <a href={signupUrl} className="px-5 py-2 border border-deja-lime text-deja-lime hover:bg-deja-lime/10 rounded-lg transition-colors text-center whitespace-nowrap font-bold tracking-[0.06em] font-mono text-[0.8rem]">Sign up</a>
        </div>
      </div>
    </header>
  );
}

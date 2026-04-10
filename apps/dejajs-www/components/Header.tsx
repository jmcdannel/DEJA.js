'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import GuideIcon from './icons/GuideIcon';
import type { ProductSlug } from './products/types';

interface ProductItem {
  name: string;
  desc: string;
  slug: ProductSlug;
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
    name: 'Throttle',
    desc: 'Precise speed control, consists, and function mapping.',
    slug: 'throttle',
    href: '/throttle',
  },
  {
    name: 'Server',
    desc: 'Connect to your DCC-EX CommandStation via USB.',
    slug: 'server',
    href: '/server',
  },
  {
    name: 'Cloud',
    desc: 'Manage roster, devices, turnouts, and effects.',
    slug: 'cloud',
    href: '/cloud',
  },
  {
    name: 'IO',
    desc: 'Arduino and Pico W code for layout expansion.',
    slug: 'io',
    href: '/io',
  },
  {
    name: 'Monitor',
    desc: 'Live telemetry, events, and command traces.',
    slug: 'monitor',
    href: '/monitor',
  },
  {
    name: 'Tour',
    desc: 'Guided presets to automate layout sequences.',
    slug: 'tour',
    href: '/tour',
  },
];

const defaultGuidesLinks: DocItem[] = [
  { name: 'Getting Started', href: '/guides/getting-started' },
  { name: 'Architecture', href: '/guides/architecture' },
  { name: 'Throttle', href: '/guides/throttle' },
  { name: 'Cloud', href: '/guides/cloud' },
  { name: 'Server', href: '/guides/server' },
  { name: 'IO', href: '/guides/io' },
  { name: 'Monitor', href: '/guides/monitor', comingSoon: true },
];

const defaultDocsLinks: DocItem[] = [
  { name: 'Server', href: '/docs/server' },
  { name: 'Throttle', href: '/docs/throttle' },
  { name: 'Cloud', href: '/docs/cloud' },
  { name: 'Monitor', href: '/docs/monitor' },
  { name: 'Tour', href: '/docs/tour' },
  { name: 'IO', href: '/docs/io' },
  { name: 'Program', href: '#', comingSoon: true },
  { name: 'AI Ops', href: '#', comingSoon: true },
  { name: 'Dispatcher', href: '#', comingSoon: true },
];

function useDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);

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
  const guidesDropdown = useDropdown();
  const productsDropdown = useDropdown();
  const docsDropdown = useDropdown();
  const [mobileOpen, setMobileOpen] = useState(false);

  const products: ProductItem[] = defaultProducts;
  const docsLinks: DocItem[] = defaultDocsLinks;
  const loginUrl = 'https://cloud.dejajs.com/';
  const signupUrl = 'https://cloud.dejajs.com/signup';

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [mobileOpen]);

  const handleMenuKeyDown = (
    e: React.KeyboardEvent,
    menuItems: { href: string; comingSoon?: boolean }[],
    containerRef: React.RefObject<HTMLDivElement | null>,
    close: () => void,
    triggerRef: React.RefObject<HTMLButtonElement | HTMLAnchorElement | null>
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
        <Link href="/" className="flex items-center gap-2" aria-label="DEJA.js Home">
          <Logo variant="default" size="lg" />
        </Link>
        <nav className="hidden md:flex flex-1 items-center gap-8 ml-6" aria-label="Main navigation">
          {/* Guides Dropdown */}
          <div className="relative group py-2" ref={guidesDropdown.ref}>
            <Link
              href="/guides"
              ref={guidesDropdown.triggerRef as React.RefObject<HTMLAnchorElement | null>}
              onMouseEnter={guidesDropdown.open}
              aria-expanded={guidesDropdown.isOpen}
              aria-haspopup="true"
              className={`cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1 bg-transparent border-none text-[0.8rem] tracking-[0.06em] font-mono ${pathname?.startsWith('/guides') ? 'text-gray-900 dark:text-white' : ''}`}
            >
              <GuideIcon className="w-3.5 h-3.5 opacity-70" />
              Guides
              <svg className={`w-4 h-4 opacity-70 transition-transform ${guidesDropdown.isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </Link>
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
            <Link
              href="/#products"
              ref={productsDropdown.triggerRef as React.RefObject<HTMLAnchorElement | null>}
              onMouseEnter={productsDropdown.open}
              aria-expanded={productsDropdown.isOpen}
              aria-haspopup="true"
              className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1 bg-transparent border-none text-[0.8rem] tracking-[0.06em] font-mono"
            >
              <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              Products
              <svg className={`w-4 h-4 opacity-70 transition-transform ${productsDropdown.isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </Link>
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
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group/item"
                      >
                        <Logo variant={product.slug} iconShape="circle" showWordmark={false} size="lg" />
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

        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 text-[0.875rem]">
          <a href={loginUrl} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors hidden sm:block tracking-[0.06em] font-mono text-[0.8rem]">Log in</a>
          <a href={signupUrl} className="inline-flex px-5 py-2 border border-deja-lime text-deja-lime hover:bg-deja-lime/10 rounded-lg transition-colors text-center whitespace-nowrap font-bold tracking-[0.06em] font-mono text-[0.8rem]">Sign up</a>

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 -mr-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          id="mobile-nav"
          className="md:hidden border-t border-gray-800/60 bg-gray-950/95 backdrop-blur-md max-h-[calc(100vh-4rem)] overflow-y-auto"
        >
          <nav
            aria-label="Mobile navigation"
            className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-8"
          >
            <MobileSection title="Guides">
              {defaultGuidesLinks.map((link) => (
                <MobileLink key={link.name} link={link} pathname={pathname} />
              ))}
            </MobileSection>

            <MobileSection title="Products">
              {products.map((p) => (
                <MobileLink
                  key={p.name}
                  link={{ name: p.name, href: p.href }}
                  pathname={pathname}
                />
              ))}
            </MobileSection>

            <MobileSection title="Docs">
              {docsLinks.map((link) => (
                <MobileLink key={link.name} link={link} pathname={pathname} />
              ))}
            </MobileSection>

            <div className="flex flex-col">
              <Link
                href="/pricing"
                className={`py-3 border-t border-gray-800/60 font-mono text-sm tracking-[0.06em] text-gray-300 hover:text-white transition-colors ${pathname === '/pricing' ? 'text-white' : ''}`}
              >
                Pricing
              </Link>
              <Link
                href="/faq"
                className={`py-3 border-t border-gray-800/60 font-mono text-sm tracking-[0.06em] text-gray-300 hover:text-white transition-colors ${pathname === '/faq' ? 'text-white' : ''}`}
              >
                FAQ
              </Link>
            </div>

          </nav>
        </div>
      )}
    </header>
  );
}

function MobileSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-[0.7rem] font-mono uppercase tracking-[0.2em] text-gray-500">
        {title}
      </div>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

function MobileLink({
  link,
  pathname,
}: {
  link: DocItem;
  pathname: string | null;
}) {
  const active = !link.comingSoon && pathname === link.href;
  if (link.comingSoon) {
    return (
      <span
        aria-disabled="true"
        className="py-3 flex items-center justify-between text-gray-500 font-mono text-sm"
      >
        <span>{link.name}</span>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">
          Soon
        </span>
      </span>
    );
  }
  return (
    <Link
      href={link.href}
      aria-current={active ? 'page' : undefined}
      className={`py-3 font-mono text-sm tracking-[0.02em] transition-colors ${active ? 'text-white' : 'text-gray-300 hover:text-white'}`}
    >
      {link.name}
    </Link>
  );
}

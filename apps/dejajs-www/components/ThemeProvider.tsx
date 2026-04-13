'use client';

// 🌙 DEJA.js is a dark-first brand. This provider used to support light/dark/
// system modes via localStorage + matchMedia, but the site was never tested
// against the light theme (which has bugs) and the brand voice is dark-only.
// We now hardcode dark mode regardless of OS preference — the `dark` class is
// already baked into <html> in app/layout.tsx, so this provider is just a thin
// HeroUIProvider wrapper plus a no-op useTheme() hook for any caller that might
// still reach for it.

import { HeroUIProvider } from '@heroui/react';

const THEME_VALUE = {
  theme: 'dark' as const,
  resolvedTheme: 'dark' as const,
  setTheme: () => {
    /* no-op — DEJA.js is dark-only */
  },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <HeroUIProvider>{children}</HeroUIProvider>;
}

/**
 * 🪝 Legacy hook preserved so any straggling consumer compiles — always
 * returns `'dark'`. If you need a theme toggle, design it as a standalone
 * preview feature; don't re-introduce light mode to the main site.
 */
export function useTheme() {
  return THEME_VALUE;
}

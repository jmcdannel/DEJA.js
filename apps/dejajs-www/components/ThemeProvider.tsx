'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { HeroUIProvider } from '@heroui/react';

type ThemeValue = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

type ThemeContextValue = {
  theme: ThemeValue;
  resolvedTheme: ResolvedTheme;
  setTheme: (value: ThemeValue) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const getStoredTheme = (): ThemeValue | null => {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem('theme');

  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }

  return null;
};

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeValue>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark');

  useEffect(() => {
    const storedTheme = getStoredTheme();
    setTheme(storedTheme ?? 'dark');
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const nextResolved = theme === 'system' ? getSystemTheme() : theme;
    setResolvedTheme(nextResolved);
    document.documentElement.classList.toggle('dark', nextResolved === 'dark');
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined' || theme !== 'system') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const systemTheme = media.matches ? 'dark' : 'light';
      setResolvedTheme(systemTheme);
      document.documentElement.classList.toggle('dark', systemTheme === 'dark');
    };

    handleChange();
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [theme]);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      <HeroUIProvider>
        {children}
      </HeroUIProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

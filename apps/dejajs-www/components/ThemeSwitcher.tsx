'use client';

import { useTheme } from './ThemeProvider';

type ThemeOption = {
  value: 'light' | 'dark' | 'system';
  label: string;
};

const options: ThemeOption[] = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' },
];

export default function ThemeSwitcher() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="theme" className="sr-only">
        Theme
      </label>
      <select
        id="theme"
        aria-label="Select color theme"
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-gray-500"
        value={theme}
        onChange={(event) => setTheme(event.target.value as ThemeOption['value'])}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="text-xs text-gray-500 dark:text-gray-400" aria-live="polite">
        Active: {resolvedTheme}
      </span>
    </div>
  );
}

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { guides } from './guides-list';

/**
 * Footer for each guide page. Renders a "Next: [title]" button if there's a
 * next guide in the list, or "Back to top" on the final guide. 🎯
 */
export default function GuideFooterNav() {
  const pathname = usePathname();
  // Only consider publishable guides (skip comingSoon for "next")
  const available = guides.filter((g) => !g.comingSoon);
  const currentIdx = available.findIndex((g) => g.href === pathname);

  // Not on a guide page at all — render nothing
  if (currentIdx === -1) return null;

  const next = available[currentIdx + 1];

  return (
    <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
      {next ? (
        <Link
          href={next.href}
          className="group flex items-center justify-between gap-4 p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-slate-900/60 hover:border-cyan-400/60 dark:hover:border-cyan-400/60 hover:bg-cyan-50/40 dark:hover:bg-cyan-950/20 transition-colors"
        >
          <span className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">
              Next guide
            </span>
            <span className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {next.title}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {next.desc}
            </span>
          </span>
          <span className="shrink-0 flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-medium">
            <span className="hidden sm:inline">Read</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </span>
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="group flex items-center justify-center gap-2 w-full p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-slate-900/60 hover:border-cyan-400/60 dark:hover:border-cyan-400/60 hover:bg-cyan-50/40 dark:hover:bg-cyan-950/20 text-gray-900 dark:text-white font-semibold transition-colors"
          aria-label="Back to top"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 transition-transform group-hover:-translate-y-1"
            aria-hidden="true"
          >
            <path d="m5 12 7-7 7 7" />
            <path d="M12 19V5" />
          </svg>
          Back to top
        </button>
      )}
    </div>
  );
}

import GuidesSidebar from '../../components/GuidesSidebar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s — DEJA.js Guides',
    default: 'Guides — DEJA.js',
  },
};

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-8 min-h-[60vh]">
      <aside className="lg:w-64 flex-shrink-0">
        <div className="p-4 bg-white/60 dark:bg-slate-900/60 rounded-xl border border-gray-200 dark:border-gray-700">
          <GuidesSidebar />
        </div>
      </aside>
      <article className="flex-1 min-w-0 max-w-4xl">
        {children}
      </article>
    </div>
  );
}

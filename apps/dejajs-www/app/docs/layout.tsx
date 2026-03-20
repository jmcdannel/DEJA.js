import DocsSidebar from '../../components/DocsSidebar';
import { generateDocsNav } from '../../lib/generate-docs-nav';

export const metadata = {
  title: 'Documentation - DEJA.js',
  description: 'Documentation for the DEJA.js ecosystem — Server, Cloud App, and Throttle App.',
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const nav = generateDocsNav();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-8 min-h-[60vh]">
      <aside className="lg:w-64 flex-shrink-0">
        <div className="p-4 bg-white/60 dark:bg-slate-900/60 rounded-xl border border-gray-200 dark:border-gray-700">
          <DocsSidebar nav={nav} />
        </div>
      </aside>
      <article className="flex-1 min-w-0 max-w-3xl">
        {children}
      </article>
    </div>
  );
}

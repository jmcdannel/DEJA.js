import type { Metadata } from 'next';
import faqs from './faqs.json';

export const metadata: Metadata = {
  title: 'FAQ - DEJA.js',
  description:
    'Frequently asked questions about DEJA.js, the modern DCC-EX throttle and layout management ecosystem.',
  openGraph: {
    title: 'FAQ - DEJA.js',
    description:
      'Frequently asked questions about DEJA.js, the modern DCC-EX throttle and layout management ecosystem.',
    url: 'https://dejajs.com/faq',
  },
};

export default function FAQPage() {
  return (
    <div className="space-y-16 max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <section className="text-center space-y-6 flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
          {faqs.title}
        </h1>
        <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400">
          Everything you need to know about setting up and running DEJA.js.
        </p>
      </section>

      <div className="space-y-12">
        {faqs.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 border-b border-gray-200 dark:border-slate-800 pb-2">
              {section.heading}
            </h2>
            <div className="space-y-6">
              {section.entries.map((entry) => (
                <div
                  key={entry.question}
                  className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm"
                >
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {entry.question}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                    {entry.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

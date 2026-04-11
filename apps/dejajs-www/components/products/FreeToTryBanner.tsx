// 🎁 Shared "free to try" banner. Appears on every product page.
// Copy may be softened in the claims audit if pricing changes.

import Link from 'next/link';

export default function FreeToTryBanner() {
  return (
    <section className="py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="rounded-2xl border border-deja-lime/30 bg-gradient-to-r from-deja-lime/5 to-deja-cyan/5 p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="flex-1">
            <h3 className="text-2xl md:text-3xl font-bold text-white">
              Free to try. No trial timer.
            </h3>
            <p className="text-gray-400 mt-2">
              Spin up DEJA.js on your layout today — no credit card, no download for the web apps.
            </p>
          </div>
          <Link
            href="https://cloud.dejajs.com/signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-deja-lime text-gray-950 font-bold font-mono text-sm tracking-wide glow-lime hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Create an account
          </Link>
        </div>
      </div>
    </section>
  );
}

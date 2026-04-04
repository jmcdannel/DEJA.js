import React from 'react';
import Link from 'next/link';
import AnimateIn from '../../home/AnimateIn';

export default function BeforeYouStart({ children }: { children?: React.ReactNode }) {
  return (
    <AnimateIn>
      <div className="max-w-2xl mx-auto mb-8 p-5 rounded-xl border border-gray-800 bg-gray-900/50 text-center">
        <p className="text-gray-300 text-sm leading-relaxed">
          Make sure you&apos;ve completed the{' '}
          <Link href="/guides/getting-started" className="text-deja-cyan hover:underline">Getting Started</Link>{' '}
          guide — your server should be running and your command station connected.
        </p>
        {children}
      </div>
    </AnimateIn>
  );
}

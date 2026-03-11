import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-20 py-8 flex flex-col items-center gap-4 text-center text-gray-500 text-sm dark:border-gray-800 dark:text-gray-400">
      <nav aria-label="Footer navigation" className="flex gap-6 font-medium">
        <Link href="/docs" className="hover:text-indigo-500 transition-colors">Docs</Link>
        <Link href="/faq" className="hover:text-indigo-500 transition-colors">FAQ</Link>
        <a href="https://github.com/jmcdannel/DEJA.js" className="hover:text-indigo-500 transition-colors">GitHub</a>
      </nav>
      <div>© {new Date().getFullYear()} DEJA.js — All rights reserved.</div>
    </footer>
  );
}
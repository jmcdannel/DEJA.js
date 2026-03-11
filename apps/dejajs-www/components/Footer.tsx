import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-20 pt-12 pb-8 flex flex-col items-center gap-4 text-center text-gray-500 text-[0.8rem] font-mono tracking-[0.05em] dark:border-gray-800 dark:text-gray-400">
      <nav aria-label="Footer navigation" className="flex gap-8">
        <Link href="/docs" className="hover:text-cyan-400 transition-colors">Docs</Link>
        <Link href="/faq" className="hover:text-cyan-400 transition-colors">FAQ</Link>
        <Link href="/pricing" className="hover:text-cyan-400 transition-colors">Pricing</Link>
        <a href="https://github.com/jmcdannel/DEJA.js" className="hover:text-cyan-400 transition-colors">GitHub</a>
      </nav>
      <div>
        Questions? <Link href="/faq" className="text-cyan-400 hover:text-cyan-300 transition-colors">check the FAQ</Link> — or read the <Link href="/docs" className="text-cyan-400 hover:text-cyan-300 transition-colors">docs</Link>. &nbsp;&middot;&nbsp; DEJA.js © {new Date().getFullYear()}
      </div>
    </footer>
  );
}

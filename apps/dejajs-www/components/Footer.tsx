import Link from 'next/link';

interface FooterSettings {
  footerLinks?: Array<{
    _key: string;
    label: string;
    href: string;
  }>;
}

const defaultFooterLinks = [
  { label: 'Docs', href: '/docs' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'GitHub', href: 'https://github.com/jmcdannel/DEJA.js' },
];

export default function Footer({ settings }: { settings?: FooterSettings | null }) {
  const footerLinks = settings?.footerLinks ?? defaultFooterLinks;

  return (
    <footer className="border-t border-gray-200 mt-20 pt-12 pb-8 flex flex-col items-center gap-4 text-center text-gray-500 text-[0.8rem] font-mono tracking-[0.05em] dark:border-gray-800 dark:text-gray-400">
      <nav aria-label="Footer navigation" className="flex gap-8">
        {footerLinks.map((link) => {
          const isExternal = link.href.startsWith('http');
          return isExternal ? (
            <a key={link.label} href={link.href} className="hover:text-cyan-400 transition-colors">{link.label}</a>
          ) : (
            <Link key={link.label} href={link.href} className="hover:text-cyan-400 transition-colors">{link.label}</Link>
          );
        })}
      </nav>
      <div>
        Questions? <Link href="/faq" className="text-cyan-400 hover:text-cyan-300 transition-colors">check the FAQ</Link> — or read the <Link href="/docs" className="text-cyan-400 hover:text-cyan-300 transition-colors">docs</Link>. &nbsp;&middot;&nbsp; DEJA.js © {new Date().getFullYear()}
      </div>
    </footer>
  );
}

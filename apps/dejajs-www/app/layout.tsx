import type { Metadata } from 'next'
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ThemeProvider } from '../components/ThemeProvider';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://dejajs.com'),
  title: {
    default: 'DEJA.js - The Modern Throttle for DCC-EX',
    template: '%s | DEJA.js',
  },
  description:
    'DEJA.js delivers a precise, organized control experience for your DCC-EX model railroad. Server, Throttle, Cloud, Monitor, and IO apps for complete layout management.',
  keywords: [
    'DCC-EX',
    'model railroad',
    'throttle',
    'DCC',
    'model trains',
    'command station',
    'DEJA.js',
    'Node.js',
    'Arduino',
    'Pico W',
    'roster management',
    'layout automation',
  ],
  authors: [{ name: 'DEJA.js' }],
  creator: 'DEJA.js',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://dejajs.com',
    siteName: 'DEJA.js',
    title: 'DEJA.js - The Modern Throttle for DCC-EX',
    description:
      'DEJA.js delivers a precise, organized control experience for your DCC-EX model railroad. Server, Throttle, Cloud, Monitor, and IO apps for complete layout management.',
    images: [
      {
        url: '/icon-512.png',
        width: 512,
        height: 512,
        alt: 'DEJA.js Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'DEJA.js - The Modern Throttle for DCC-EX',
    description:
      'DEJA.js delivers a precise, organized control experience for your DCC-EX model railroad.',
    images: ['/icon-512.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-50 text-gray-800 transition-colors duration-200 dark:bg-gray-950 dark:text-gray-50 relative antialiased`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="fixed w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[100px] -top-[100px] left-[50%] translate-x-[-50%]"></div>
          <div className="fixed w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[80px] -bottom-[-10%] -right-[200px]"></div>
          <div className="fixed w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[90px] top-[50%] left-[20%]"></div>
        </div>
        <ThemeProvider>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded">
            Skip to main content
          </a>
          <Header />
          <main id="main-content" className="max-w-5xl mx-auto px-6 py-10">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
import Image from 'next/image';
import Carousel, { CarouselItem } from '../components/Carousel';

const desktopScreenshots: CarouselItem[] = [
  { id: 1, content: <div className="relative w-full h-full"><Image src="/screenshots/throttle_desktop_routes.png" alt="DEJA.js Throttle Desktop Routes" fill className="object-cover" /></div> },
  { id: 2, content: <div className="relative w-full h-full"><Image src="/screenshots/throttle_desktop_home.png" alt="DEJA.js Throttle Desktop Home" fill className="object-cover" /></div> },
  { id: 3, content: <div className="relative w-full h-full"><Image src="/screenshots/cloud_desktop_roster.png" alt="DEJA.js Cloud Desktop Roster" fill className="object-cover" /></div> },
  { id: 4, content: <div className="relative w-full h-full"><Image src="/screenshots/throttle_desktop_throttle.png" alt="DEJA.js Throttle Desktop" fill className="object-cover" /></div> },
  { id: 5, content: <div className="relative w-full h-full"><Image src="/screenshots/monitor_desktop.png" alt="DEJA.js Monitor Desktop" fill className="object-cover" /></div> },
];

const mobileScreenshots: CarouselItem[] = [
  { id: 1, content: <div className="relative w-full h-full"><Image src="/screenshots/throttle_mobile_throttle.png" alt="DEJA.js Throttle Mobile Throttle" fill className="object-cover" /></div> },
  { id: 2, content: <div className="relative w-full h-full"><Image src="/screenshots/throttle_mobile_conductor.png" alt="DEJA.js Throttle Mobile Conductor" fill className="object-cover" /></div> },
  { id: 3, content: <div className="relative w-full h-full"><Image src="/screenshots/throttle_mobile_home.png" alt="DEJA.js Throttle Mobile Home" fill className="object-cover" /></div> },
];

interface Product {
  name: string;
  desc: string;
  color: string;
  logo: string;
  href: string;
};

const products: Product[] = [
  {
    name: 'Server',
    desc: 'Connects DEJA Apps to your DCC-EX CommandStation via USB.',
    color: 'cyan',
    logo: '/icon-512.png',
    href: '/server',
  },
  {
    name: 'Throttle',
    desc: 'Precise speed control. Easy consists. Function mapping. CV Programming.',
    color: 'green',
    logo: '/throttle/icon-512.png',
    href: '/throttle',
  },
  {
    name: 'Cloud',
    desc: 'Manage your roster, devices, turnouts, and effects securely.',
    color: 'purple-500',
    logo: '/cloud/icon-512.png',
    href: '/cloud',
  },
  {
    name: 'IO',
    desc: 'Plug-and-play Arduino and Pico W code for layout expansion.',
    color: 'yellow',
    logo: '/icon-512.png',
    href: '/tour',
  },
  {
    name: 'Monitor',
    desc: 'Live telemetry, events, and command traces.',
    color: 'red',
    logo: '/monitor/icon-512.png',
    href: '/monitor',
  },
  {
    name: 'Tour',
    desc: 'Guided presets to automate sequences on your layout.',
    color: 'indigo-500',
    logo: '/tour/icon-512.png',
    href: '/tour',
  },
];

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DEJA.js - The Modern Throttle for DCC-EX',
  description:
    'DEJA.js delivers a precise, organized control experience for your layout. Replace cluttered legacy interfaces with smooth interactions and an expandable hardware platform.',
  openGraph: {
    title: 'DEJA.js - The Modern Throttle for DCC-EX',
    description:
      'Replace cluttered legacy interfaces with smooth interactions and an expandable hardware platform for DCC-EX model railroads.',
    url: 'https://dejajs.com',
  },
};

export default function Home() {
  return (
    <div className="space-y-16">
      {/* 1. Hero & Visual Hook */}
      <section className="text-center space-y-6 flex flex-col items-center">
        <div className="flex justify-center mb-4">
          <Image src="/icon-512.png" alt="DEJA.js Logo" width={192} height={192} className="h-48 w-48 drop-shadow-lg" />
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
          The modern throttle for DCC-EX <br className="hidden md:block" />
          <span className="text-indigo-500">— and much more.</span>
        </h1>
        <p className="max-w-2xl text-lg md:text-xl text-gray-500 dark:text-gray-400 mx-auto">
          DEJA.js delivers a precise, organized control experience. Replace cluttered legacy interfaces with smooth interactions and an expandable hardware platform.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <a
            href="/docs/quick-start"
            className="px-6 py-3 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-400 transition"
          >
            Get Started
          </a>
          <a
            href="/docs"
            className="px-6 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-gray-100 rounded-lg font-medium border border-gray-200 dark:border-slate-800 hover:shadow transition"
          >
            Read Docs
          </a>
        </div>
      </section>

      <section className="w-full max-w-6xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-slate-800">
        <Carousel items={desktopScreenshots} autoPlay={true} />
      </section>

      {/* 2. Quick Start / How It Works */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-slate-800">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Quick Start</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Ditch the manual. Get running in minutes.</p>
        </div>
        
        {/* Getting Started Video - Coming Soon */}
        <div className="max-w-4xl mx-auto mb-12 aspect-video bg-indigo-50 dark:bg-slate-800/50 rounded-xl border border-indigo-100 dark:border-slate-700 flex flex-col items-center justify-center text-center shadow-inner overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-purple-500/10"></div>
          <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-6 z-10 shadow-sm border border-indigo-200 dark:border-indigo-800">
            <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 z-10">Quick Start Video</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm z-10">
            We are putting the final polish on our getting started guide. Check back soon!
          </p>
          <div className="mt-8 px-4 py-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-full text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-slate-700 z-10 inline-flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Coming Soon
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center space-y-4 relative group text-center">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center z-10 shadow-sm border border-indigo-100 dark:border-indigo-900/50 group-hover:scale-105 transition-transform">
              <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Step 1</span>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Sign Up</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">Create your free DEJA Cloud account. Set up your layout and start building your roster.</p>
            <div className="hidden md:block absolute top-8 left-[65%] w-[70%] h-px bg-gradient-to-r from-indigo-300 to-transparent dark:from-indigo-700 z-0"></div>
          </div>
          <div className="flex flex-col items-center space-y-4 relative group text-center">
            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center z-10 shadow-sm border border-purple-100 dark:border-purple-900/50 group-hover:scale-105 transition-transform">
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <span className="text-xs font-bold text-purple-500 uppercase tracking-widest">Step 2</span>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Install</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">Download DEJA.js Server. Plug in your DCC-EX CommandStation via USB. You're connected.</p>
            <div className="hidden md:block absolute top-8 left-[65%] w-[70%] h-px bg-gradient-to-r from-purple-300 to-transparent dark:from-purple-700 z-0"></div>
          </div>
          <div className="flex flex-col items-center space-y-4 relative group text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center z-10 shadow-sm border border-green-100 dark:border-green-900/50 group-hover:scale-105 transition-transform">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Step 3</span>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Run Trains</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">Open the Throttle app on any device. Take full control of your layout.</p>
          </div>
        </div>
      </section>

      {/* 3. The DEJA.js Ecosystem */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">The DEJA.js Ecosystem</h2>
          <p className="text-gray-500 dark:text-gray-400">A growing suite of applications for complete layout management.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <a href={product.href} key={product.name} className="block group">
              <article className="flex flex-col p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition h-full">
                <div className="flex items-center gap-4 mb-4">
                  <Image src={product.logo} alt={`DEJA.js ${product.name}`} width={48} height={48} className="h-12 w-12" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">DEJA.js </span>
                    <span className={`text-${product.color}`}>{product.name}</span>
                  </h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400 flex-1 text-sm font-medium">
                  {product.desc}
                </p>
                <div className="mt-4 text-indigo-500 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                  Learn more →
                </div>
              </article>
            </a>
          ))}
        </div>
      </section>

      {/* 4. Deep Dive Features */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Engineered & Designed</h2>
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <span className="text-indigo-500">1</span> Cleaner Control
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Clear visual layout. Organized function maps. Fast CV programming access. Simple route triggers.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <span className="text-indigo-500">2</span> Built for DCC-EX
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Designed specifically for DCC-EX. Modern hardware support. Direct targeting.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <span className="text-indigo-500">3</span> Grows With Your Layout
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Arduino and Pico W integration. Expanding capabilities. Control beyond throttle.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <span className="text-indigo-500">4</span> Multi-Device First
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Primary mobile experience with touch-first controls. Syncs everywhere via DEJA Cloud.</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-4 text-center">Mobile Throttle</h3>
          <Carousel items={mobileScreenshots} autoPlay={true} />
        </div>
      </section>

      {/* 5. Architecture Diagram */}
      <section className="bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-lg text-center">
         <h2 className="text-2xl font-bold text-white mb-2">Modern Architecture</h2>
         <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Seamless integration from physical hardware to cloud services.</p>
         <div className="flex justify-center bg-white/5 rounded-xl p-4">
           <Image src="/ttt-architecture.svg" alt="DEJA.js Architecture" width={768} height={432} className="w-full max-w-3xl object-contain opacity-90 hover:opacity-100 transition" unoptimized />
         </div>
      </section>

      {/* 6. Extensibility and Colors */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Visual Organization
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Functional clarity through color. Assign distinctive markers to locomotives, sensors, and turnouts in DEJA Cloud. These assignments sync globally. Colors identify layout elements instantly across the Throttle and Monitor apps.
          </p>
          <div className="flex flex-wrap gap-1">
            <div className="w-10 h-10 bg-pink-500 rounded-sm shadow-sm cursor-default"></div>
            <div className="w-10 h-10 bg-rose-500 rounded-sm shadow-sm cursor-default"></div>
            <div className="w-10 h-10 bg-red-500 rounded-sm shadow-sm cursor-default"></div>
            <div className="w-10 h-10 bg-orange-500 rounded-sm shadow-sm cursor-default"></div>
            <div className="w-10 h-10 bg-amber-500 rounded-sm shadow-sm cursor-default"></div>
            <div className="w-10 h-10 bg-yellow-500 rounded-sm shadow-sm cursor-default"></div>
            <div className="w-10 h-10 bg-lime-500 rounded-sm shadow-sm cursor-default"></div>
            <div className="w-10 h-10 bg-green-500 rounded-sm shadow-sm cursor-default"></div>
            <div className="w-10 h-10 bg-emerald-500 rounded-sm shadow-sm cursor-default"></div>
            <div className="w-10 h-10 bg-teal-500 rounded-sm shadow-sm cursor-default"></div>
            <div className="w-10 h-10 bg-cyan-500 rounded-sm shadow-sm cursor-default"></div>
            <div className="w-10 h-10 bg-blue-500 rounded-sm shadow-sm cursor-default"></div>
            <div className="w-10 h-10 bg-indigo-500 rounded-sm shadow-sm cursor-default"></div>
            <div className="w-10 h-10 bg-purple-500 rounded-sm shadow-sm cursor-default"></div>
            <div className="w-10 h-10 bg-fuchsia-500 rounded-sm shadow-sm cursor-default"></div>
            <div className="w-10 h-10 bg-violet-500 rounded-sm shadow-sm cursor-default"></div>
            <div className="w-10 h-10 bg-gray-500 rounded-sm shadow-sm cursor-default"></div>
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Hardware Expansion</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Expand control beyond the throttle. Connect Arduino Mega and Pico W devices. Designate pins as inputs or outputs. Control lights, servos, and relays. DEJA.js Server detects and configures devices automatically.
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
              <span className="text-2xl leading-none grayscale opacity-80">💡</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 font-medium uppercase tracking-wider">Lights</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
              <span className="text-2xl leading-none grayscale opacity-80">🔊</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 font-medium uppercase tracking-wider">Sounds</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
              <span className="text-2xl leading-none grayscale opacity-80">⚡</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 font-medium uppercase tracking-wider">Relays</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
              <span className="text-2xl leading-none grayscale opacity-80">📡</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 font-medium uppercase tracking-wider">Sensors</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
              <span className="text-2xl leading-none grayscale opacity-80">🔧</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 font-medium uppercase tracking-wider">Servos</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
              <span className="text-2xl leading-none grayscale opacity-80">🚦</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 font-medium uppercase tracking-wider">Signals</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
              <span className="text-2xl leading-none grayscale opacity-80">🛤️</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 font-medium uppercase tracking-wider">Tracks</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
              <span className="text-2xl leading-none grayscale opacity-80">🔀</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 font-medium uppercase tracking-wider">Turnouts</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
              <span className="text-2xl leading-none grayscale opacity-80">⚙️</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 font-medium uppercase tracking-wider">Motors</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
              <span className="text-2xl leading-none grayscale opacity-80">🔌</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 font-medium uppercase tracking-wider">Arduino</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
              <span className="text-2xl leading-none grayscale opacity-80">📶</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 font-medium uppercase tracking-wider">Network</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
              <span className="text-2xl leading-none grayscale opacity-80">🔋</span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 font-medium uppercase tracking-wider">Power</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
'use client';

import { useState } from 'react';
import type { Metadata } from 'next';

function Check({ type }: { type: 'yes' | 'no' | 'partial' }) {
  const styles = {
    yes: 'bg-lime-500/10 text-lime-400',
    no: 'bg-red-500/10 text-red-500',
    partial: 'bg-cyan-500/12 text-cyan-400',
  };
  const icons = { yes: '\u2713', no: '\u2715', partial: '~' };
  return (
    <span className={`w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] ${styles[type]}`}>
      {icons[type]}
    </span>
  );
}

function LimitTag({ children, featured }: { children: React.ReactNode; featured?: boolean }) {
  return (
    <span className={`font-mono text-[0.65rem] border rounded px-1.5 py-px whitespace-nowrap ${
      featured
        ? 'bg-cyan-500/12 border-cyan-500/20 text-cyan-400'
        : 'bg-gray-800 border-white/7 text-gray-500'
    }`}>
      {children}
    </span>
  );
}

function TableCheck({ type, text }: { type: 'y' | 'n' | 'p'; text?: string }) {
  if (type === 'y') return <span className="text-lime-400 text-base">{'\u2713'}</span>;
  if (type === 'n') return <span className="text-red-500/50 text-base">{'\u2715'}</span>;
  return <span className="text-cyan-400 text-xs font-mono">{text}</span>;
}

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  return (
    <div className="space-y-16 max-w-5xl mx-auto px-4 sm:px-6 py-12 -mt-4">
      {/* Hero */}
      <div className="text-center space-y-5">
        <div className="font-mono text-xs tracking-[0.2em] text-cyan-400 uppercase animate-fade-up">
          {'// Pricing & Plans'}
        </div>
        <h1 className="font-display text-[clamp(3.5rem,8vw,6.5rem)] tracking-[0.03em] leading-[0.95]">
          Run your <em className="not-italic text-cyan-400">railroad.</em><br />On your terms.
        </h1>
        <p className="text-gray-500 text-[1.05rem] max-w-[480px] mx-auto leading-relaxed">
          From hobbyist throttle control to full layout automation — pick the plan that fits your layout.
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center gap-3 bg-gray-900 border border-white/7 rounded-full px-2 py-1.5">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-5 py-2 rounded-full border-none text-[0.875rem] cursor-pointer transition-all ${
              billing === 'monthly'
                ? 'bg-cyan-500 text-gray-950 font-bold'
                : 'bg-transparent text-gray-500'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('annual')}
            className={`px-5 py-2 rounded-full border-none text-[0.875rem] cursor-pointer transition-all ${
              billing === 'annual'
                ? 'bg-cyan-500 text-gray-950 font-bold'
                : 'bg-transparent text-gray-500'
            }`}
          >
            Annual{' '}
            <span className="font-mono text-[0.65rem] bg-lime-500/10 text-lime-400 border border-lime-500/20 rounded-full px-2 py-0.5 tracking-[0.05em]">
              SAVE 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {/* FREE - Hobbyist */}
        <div className="bg-gray-900 border border-white/7 rounded-2xl px-7 py-8 relative transition-all duration-300 hover:border-white/15 hover:-translate-y-1">
          <div className="font-mono text-[0.7rem] tracking-[0.18em] uppercase text-gray-500 mb-1.5">{'// Free'}</div>
          <div className="font-display text-[2.4rem] tracking-[0.05em] leading-none mb-4">Hobbyist</div>
          <div className="flex items-baseline gap-1 mb-1.5">
            <span className="text-[1.1rem] text-gray-500 font-light">$</span>
            <span className="font-display text-[3.5rem] leading-none tracking-tight">0</span>
            <span className="text-[0.875rem] text-gray-500 ml-0.5">/mo</span>
          </div>
          <div className="text-[0.8rem] text-gray-500 mb-7 min-h-[1.2em]">Free forever. No credit card required.</div>
          <div className="h-px bg-white/7 mb-6"></div>
          <ul className="flex flex-col gap-3 mb-8 list-none">
            <li className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed"><Check type="yes" /> WiThrottle + DCC-EX throttle</li>
            <li className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed"><Check type="yes" /> Limited cloud account <LimitTag>5 locos</LimitTag></li>
            <li className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed"><Check type="yes" /> Firebase onboarding flow</li>
            <li className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed"><Check type="yes" /> Docs & AI support chatbot</li>
            <li className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed text-gray-500"><Check type="no" /> Turnouts & signals</li>
            <li className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed text-gray-500"><Check type="no" /> Effects & sounds</li>
            <li className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed text-gray-500"><Check type="no" /> Remote monitoring</li>
            <li className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed text-gray-500"><Check type="no" /> Tour App</li>
            <li className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed text-gray-500"><Check type="no" /> Direct support</li>
          </ul>
          <a
            href="https://cloud.dejajs.com/onboarding?plan=hobbyist"
            className="block w-full py-3.5 rounded-[10px] border border-white/15 bg-transparent text-white font-bold text-[0.9rem] tracking-[0.04em] cursor-pointer transition-all hover:bg-gray-800 text-center no-underline"
          >
            Get Started Free →
          </a>
        </div>

        {/* ENGINEER - Featured */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-cyan-500 rounded-2xl px-7 py-8 relative transition-all duration-300 hover:-translate-y-1 shadow-[0_0_40px_rgba(6,182,212,0.25),0_20px_60px_rgba(0,0,0,0.5)] -translate-y-2">
          <div className="absolute -top-px left-1/2 -translate-x-1/2 bg-cyan-500 text-gray-950 font-mono text-[0.65rem] font-medium tracking-[0.15em] uppercase px-4 py-1 rounded-b-[10px]">
            Most Popular
          </div>
          <div className="font-mono text-[0.7rem] tracking-[0.18em] uppercase text-gray-500 mb-1.5">{'// Recommended'}</div>
          <div className="font-display text-[2.4rem] tracking-[0.05em] leading-none mb-4 text-cyan-400">Engineer</div>
          <div className="flex items-baseline gap-1 mb-1.5">
            {billing === 'monthly' ? (
              <>
                <span className="text-[1.1rem] text-gray-500 font-light">$</span>
                <span className="font-display text-[3.5rem] leading-none tracking-tight">7</span>
                <span className="text-[0.875rem] text-gray-500 ml-0.5">/mo</span>
              </>
            ) : (
              <>
                <span className="font-display text-[3.5rem] leading-none tracking-tight text-cyan-400">$67</span>
                <span className="text-[0.875rem] text-gray-500 ml-0.5">/yr</span>
              </>
            )}
          </div>
          <div className="text-[0.8rem] text-gray-500 mb-7 min-h-[1.2em]">
            {billing === 'monthly' ? 'Billed monthly. Cancel anytime.' : 'Billed annually. Save 20%.'}
          </div>
          <div className="h-px bg-white/7 mb-6"></div>
          <ul className="flex flex-col gap-3 mb-8 list-none">
            <li className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed"><Check type="yes" /> Everything in Hobbyist</li>
            <li className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed"><Check type="yes" /> Full cloud access <LimitTag featured>25 locos</LimitTag></li>
            <li className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed"><Check type="yes" /> Turnouts & Signals <LimitTag featured>15 each</LimitTag></li>
            <li className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed"><Check type="yes" /> Effects & Sounds <LimitTag featured>15 each</LimitTag></li>
            <li className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed"><Check type="yes" /> 2 layout configurations</li>
            <li className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed"><Check type="yes" /> Remote monitoring via secure tunnel</li>
            <li className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed"><Check type="partial" /> Basic macros & scheduling</li>
            <li className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed"><Check type="yes" /> Community forum access</li>
            <li className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed"><Check type="yes" /> Support tickets <LimitTag featured>72hr SLA</LimitTag></li>
            <li className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed text-gray-500"><Check type="no" /> Tour App</li>
            <li className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed text-gray-500"><Check type="no" /> Early feature access</li>
          </ul>
          <a
            href={`https://cloud.dejajs.com/onboarding?plan=engineer&billing=${billing}`}
            className="block w-full py-3.5 rounded-[10px] border-none bg-cyan-500 text-gray-950 font-bold text-[0.9rem] tracking-[0.04em] cursor-pointer transition-all hover:bg-cyan-400 hover:shadow-[0_4px_24px_rgba(6,182,212,0.25)] text-center no-underline"
          >
            Start Free Trial →
          </a>
        </div>

        {/* CONDUCTOR */}
        <div className="bg-gray-900 border border-white/7 rounded-2xl px-7 py-8 relative transition-all duration-300 hover:border-white/15 hover:-translate-y-1">
          <div className="font-mono text-[0.7rem] tracking-[0.18em] uppercase text-gray-500 mb-1.5">{'// Pro'}</div>
          <div className="font-display text-[2.4rem] tracking-[0.05em] leading-none mb-4">Conductor</div>
          <div className="flex items-baseline gap-1 mb-1.5">
            {billing === 'monthly' ? (
              <>
                <span className="text-[1.1rem] text-gray-500 font-light">$</span>
                <span className="font-display text-[3.5rem] leading-none tracking-tight">18</span>
                <span className="text-[0.875rem] text-gray-500 ml-0.5">/mo</span>
              </>
            ) : (
              <>
                <span className="font-display text-[3.5rem] leading-none tracking-tight">$173</span>
                <span className="text-[0.875rem] text-gray-500 ml-0.5">/yr</span>
              </>
            )}
          </div>
          <div className="text-[0.8rem] text-gray-500 mb-7 min-h-[1.2em]">
            {billing === 'monthly'
              ? 'Includes 1 setup session (~$40 value).'
              : 'Includes 1 setup session + 2 months free.'}
          </div>
          <div className="h-px bg-white/7 mb-6"></div>
          <ul className="flex flex-col gap-3 mb-8 list-none">
            <li className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed"><Check type="yes" /> Everything in Engineer</li>
            <li className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed"><Check type="yes" /> <strong>Unlimited</strong> locos, turnouts, signals</li>
            <li className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed"><Check type="yes" /> <strong>Unlimited</strong> effects & sounds</li>
            <li className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed"><Check type="yes" /> Unlimited layouts</li>
            <li className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed"><Check type="yes" /> Remote monitoring via secure tunnel</li>
            <li className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed"><Check type="yes" /> Tour App included</li>
            <li className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed"><Check type="yes" /> Advanced macros & automations</li>
            <li className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed"><Check type="yes" /> Priority support <LimitTag>24hr SLA</LimitTag></li>
            <li className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed"><Check type="yes" /> 1 setup session / month</li>
            <li className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed"><Check type="yes" /> Early access to new features</li>
            <li className="flex items-start gap-2.5 text-[0.875rem] leading-relaxed"><Check type="yes" /> Beta testing & feedback program</li>
          </ul>
          <a
            href={`https://cloud.dejajs.com/onboarding?plan=conductor&billing=${billing}`}
            className="block w-full py-3.5 rounded-[10px] border border-white/15 bg-transparent text-white font-bold text-[0.9rem] tracking-[0.04em] cursor-pointer transition-all hover:border-cyan-500 hover:text-cyan-400 text-center no-underline"
          >
            Become a Conductor →
          </a>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-gray-900 border border-white/7 rounded-2xl p-10">
        <h2 className="font-display text-[2rem] tracking-[0.05em] mb-2">Full Feature Breakdown</h2>
        <p className="text-gray-500 text-[0.875rem] mb-8">Everything you get, spelled out clearly.</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[0.875rem]">
            <thead>
              <tr>
                <th className="font-mono text-[0.7rem] tracking-[0.15em] uppercase text-gray-500 pb-4 text-left border-b border-white/7" style={{ width: '40%' }}>Feature</th>
                <th className="font-mono text-[0.7rem] tracking-[0.15em] uppercase text-gray-500 pb-4 text-center border-b border-white/7">Hobbyist</th>
                <th className="font-mono text-[0.7rem] tracking-[0.15em] uppercase text-cyan-400 pb-4 text-center border-b border-white/7 font-medium">Engineer</th>
                <th className="font-mono text-[0.7rem] tracking-[0.15em] uppercase text-gray-500 pb-4 text-center border-b border-white/7">Conductor</th>
              </tr>
            </thead>
            <tbody>
              {/* Throttle & Control */}
              <tr><td colSpan={4} className="font-mono text-[0.65rem] tracking-[0.12em] uppercase text-cyan-400 pt-6 border-b-0">{'// Throttle & Control'}</td></tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 border-b border-white/7">WiThrottle Protocol</td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="y" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="y" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="y" /></td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 border-b border-white/7">DCC-EX Command Station</td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="y" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="y" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="y" /></td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 border-b border-white/7">Multi-throttle sessions</td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="n" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="y" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="y" /></td>
              </tr>

              {/* Layout Management */}
              <tr><td colSpan={4} className="font-mono text-[0.65rem] tracking-[0.12em] uppercase text-cyan-400 pt-6 border-b-0">{'// Layout Management'}</td></tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 border-b border-white/7">Locos</td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="p" text="5 max" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="p" text="25 max" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="p" text="Unlimited" /></td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 border-b border-white/7">Turnouts & Signals</td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="n" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="p" text="15 each" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="p" text="Unlimited" /></td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 border-b border-white/7">Effects & Sounds</td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="n" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="p" text="15 each" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="p" text="Unlimited" /></td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 border-b border-white/7">Layout configurations</td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="p" text="1" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="p" text="2" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="p" text="Unlimited" /></td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 border-b border-white/7">Macros & Scheduling</td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="n" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="p" text="Basic" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="p" text="Advanced" /></td>
              </tr>

              {/* Cloud & Data */}
              <tr><td colSpan={4} className="font-mono text-[0.65rem] tracking-[0.12em] uppercase text-cyan-400 pt-6 border-b-0">{'// Cloud & Data'}</td></tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 border-b border-white/7">Firebase cloud sync</td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="p" text="Limited" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="y" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="y" /></td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 border-b border-white/7">Multi-device access</td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="n" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="y" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="y" /></td>
              </tr>

              {/* Apps & Features */}
              <tr><td colSpan={4} className="font-mono text-[0.65rem] tracking-[0.12em] uppercase text-cyan-400 pt-6 border-b-0">{'// Apps & Features'}</td></tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 border-b border-white/7">
                  Remote Monitoring
                  <div className="text-[0.75rem] text-gray-500 mt-0.5">Access your layout monitor from anywhere via secure Cloudflare tunnel</div>
                </td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="n" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="y" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="y" /></td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 border-b border-white/7">Tour App</td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="n" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="n" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="y" /></td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 border-b border-white/7">Early feature access</td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="n" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="n" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="y" /></td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 border-b border-white/7">Beta testing program</td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="n" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="n" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="y" /></td>
              </tr>

              {/* Support */}
              <tr><td colSpan={4} className="font-mono text-[0.65rem] tracking-[0.12em] uppercase text-cyan-400 pt-6 border-b-0">{'// Support'}</td></tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 border-b border-white/7">AI chatbot & docs</td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="y" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="y" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="y" /></td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 border-b border-white/7">Community forum</td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="y" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="y" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="y" /></td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 border-b border-white/7">Support tickets</td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="n" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="p" text="72hr SLA" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="p" text="24hr SLA" /></td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5 border-b border-white/7">Setup sessions</td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="n" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="n" /></td>
                <td className="py-3.5 border-b border-white/7 text-center"><TableCheck type="p" text="1/mo included" /></td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3.5">Additional support</td>
                <td className="py-3.5 text-center"><TableCheck type="n" /></td>
                <td className="py-3.5 text-center"><TableCheck type="p" text="$20/incident" /></td>
                <td className="py-3.5 text-center"><TableCheck type="p" text="$20/incident" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

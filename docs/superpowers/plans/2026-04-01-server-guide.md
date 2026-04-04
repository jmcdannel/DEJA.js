# Server Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a complete, approachable server guide (TSX guide page + MDX docs sub-nav) for the DEJA Server and `deja` CLI.

**Architecture:** Two complementary documentation surfaces — a rich visual walkthrough at `/guides/server` (TSX component, same pattern as `GettingStartedGuide.tsx`) and six MDX reference pages under `/docs/server/*` for the docs sidebar. The guide page is the "friendly tour," the MDX pages are the "reference manual."

**Tech Stack:** Next.js (App Router), React TSX components, MDX with gray-matter frontmatter, Tailwind CSS, `@mdi/js` icons, `CopyButton` component.

**Tone:** Warm, encouraging, confidence-building. Frame CLI commands as simple recipes. No jargon. Reassure at friction points. Never condescend.

**Spec:** `docs/superpowers/specs/2026-04-01-server-guide-design.md`

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `apps/dejajs-www/components/guides/ServerGuide.tsx` | Main guide component with all sections |
| Create | `apps/dejajs-www/app/guides/server/page.tsx` | Route page that renders ServerGuide |
| Modify | `apps/dejajs-www/app/guides/page.tsx` | Remove `comingSoon` from Server card |
| Update | `docs/server/overview.mdx` | Refresh intro, add links to sub-pages |
| Create | `docs/server/installation.mdx` | Detailed installation walkthrough |
| Create | `docs/server/cli.mdx` | Complete CLI command reference |
| Create | `docs/server/configuration.mdx` | ~/.deja/ directory, env vars, config.json |
| Create | `docs/server/remote-access.mdx` | Tunnel feature, cloudflared, plans |
| Create | `docs/server/troubleshooting.mdx` | Expanded troubleshooting guide |

---

## Task 1: Create the ServerGuide TSX Component

**Files:**
- Create: `apps/dejajs-www/components/guides/ServerGuide.tsx`

- [ ] **Step 1: Create ServerGuide.tsx with helper components and hero section**

```tsx
import Link from 'next/link';
import CopyButton from '../home/CopyButton';
import { mdiLaptop, mdiUsb } from '@mdi/js';

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="relative pl-14">
      <div className="absolute left-0 top-0 w-10 h-10 rounded-full border border-deja-lime/30 bg-deja-lime/10 flex items-center justify-center shrink-0">
        <span className="text-deja-lime font-bold text-sm font-mono">0{number}</span>
      </div>
      <h3 className="text-white font-bold text-xl mb-3">{title}</h3>
      <div className="text-gray-300 leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

function CommandBlock({ command, label }: { command: string; label?: string }) {
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-950 overflow-hidden my-4">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-800 bg-gray-900">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        <span className="ml-2 text-gray-500 text-xs font-mono">{label || 'bash'}</span>
      </div>
      <div className="flex items-center gap-2 px-4 py-3">
        <span className="text-deja-lime/60 font-mono text-sm select-none shrink-0">$</span>
        <span className="font-mono text-sm text-deja-lime flex-1 break-all">{command}</span>
        <CopyButton text={command} />
      </div>
    </div>
  );
}

function TerminalOutput({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-950 overflow-hidden my-4">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-800 bg-gray-900">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        <span className="ml-2 text-gray-500 text-xs font-mono">output</span>
      </div>
      <div className="px-4 py-3 font-mono text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{children}</div>
    </div>
  );
}

function Callout({ emoji, children }: { emoji: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 p-4 rounded-lg bg-deja-lime/5 border border-deja-lime/20 my-4">
      <span className="text-lg shrink-0">{emoji}</span>
      <div className="text-sm text-gray-300 leading-relaxed">{children}</div>
    </div>
  );
}

function MdiIcon({ path, className = '' }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d={path} fill="currentColor" />
    </svg>
  );
}

export default function ServerGuide() {
  return (
    <article className="max-w-3xl mx-auto">
      <header className="mb-12">
        <p className="text-deja-lime text-xs font-mono tracking-widest uppercase mb-3">Server Guide</p>
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
          Your bridge to the track
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed">
          The DEJA Server is a small program that runs on the computer connected to your
          CommandStation. It takes the commands you send from the Throttle, Cloud, and Monitor apps
          and passes them to your DCC-EX hardware over USB. You set it up once, and it runs
          quietly in the background while you focus on running trains.
        </p>
      </header>

      {/* TODO: Add remaining sections in subsequent steps */}
    </article>
  );
}
```

- [ ] **Step 2: Add the "What You'll Need" requirements section**

Add this section inside the `<article>` element, after the `</header>` and before the TODO comment:

```tsx
      {/* Requirements */}
      <section className="mb-12 p-5 rounded-xl border border-gray-800 bg-gray-900/50">
        <h2 className="text-white font-semibold mb-3">What You&apos;ll Need</h2>
        <ul className="space-y-3 text-sm text-gray-300">
          <li className="flex items-center gap-3">
            <MdiIcon path={mdiLaptop} className="w-5 h-5 shrink-0 text-deja-lime" />
            <span>A <strong className="text-white">computer</strong> connected to your CommandStation — Raspberry Pi, Mac, or Linux PC</span>
          </li>
          <li className="flex items-center gap-3">
            <MdiIcon path={mdiUsb} className="w-5 h-5 shrink-0 text-amber-400" />
            <span>A <strong className="text-white">USB cable</strong> connecting the CommandStation to that computer</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="w-5 h-5 shrink-0 text-center text-deja-cyan">⬡</span>
            <span><strong className="text-white">Node.js 20</strong> or later — the installer will tell you if you need it</span>
          </li>
        </ul>
        <div className="mt-4 pt-3 border-t border-gray-800">
          <h3 className="text-white font-semibold text-sm mb-2">Supported Platforms</h3>
          <div className="flex flex-wrap gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700">
              🍎 macOS
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700">
              🐧 Linux
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700">
              🍓 Raspberry Pi
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700">
              🪟 Windows (via WSL)
            </span>
          </div>
        </div>
      </section>
```

- [ ] **Step 3: Add Steps 1–3 (Install, Check Status, View Logs)**

Replace the TODO comment with the steps section. Add Steps 1–3:

```tsx
      {/* Steps */}
      <div className="space-y-12">
        <Step number={1} title="Install the Server">
          <p>
            Open a terminal on the computer connected to your CommandStation and run this one command:
          </p>
          <CommandBlock command="curl -fsSL https://install.dejajs.com | bash" />
          <p>
            That&apos;s it — one command. The installer handles everything: it downloads the server,
            finds your CommandStation&apos;s USB port, and starts it up automatically.
          </p>
          <Callout emoji="🍓">
            <p>
              <strong className="text-white">Raspberry Pi?</strong> The DEJA Server runs great on a Pi 4 or 5.
              Just plug your CommandStation in via USB and run the command above — same as any other platform.
            </p>
          </Callout>
          <Callout emoji="💡">
            <p>
              <strong className="text-white">Personalized install link:</strong> You can also find a ready-to-go
              install command in the{' '}
              <a href="https://cloud.dejajs.com" target="_blank" rel="noopener noreferrer" className="text-deja-cyan hover:underline">Cloud app</a>
              {' '}under <strong className="text-white">Settings → Install</strong>. That link has your account info
              baked in, so you won&apos;t need to enter it manually.
            </p>
          </Callout>
          <p className="text-xs text-gray-500 mt-3">
            Windows users: install via{' '}
            <a href="https://learn.microsoft.com/en-us/windows/wsl/install" target="_blank" rel="noopener noreferrer" className="text-deja-cyan hover:underline">WSL</a>,
            then run the command from a WSL terminal. Everything else works the same.
          </p>
        </Step>

        <Step number={2} title="Check That It's Working">
          <p>
            Once the installer finishes, your server is already running. To make sure everything
            looks right, type:
          </p>
          <CommandBlock command="deja status" />
          <p>
            You&apos;ll see a summary showing your server is running, your account is connected,
            and which USB port your CommandStation is on. Look for the green <strong className="text-white">● running</strong> indicator — that means you&apos;re all set.
          </p>
          {/* TODO: screenshot — server_terminal_status.png */}
          <Callout emoji="✅">
            <p>
              If you see <strong className="text-white">● running</strong> and a serial port listed under
              Connections, your server is talking to your CommandStation. You&apos;re ready to drive trains.
            </p>
          </Callout>
        </Step>

        <Step number={3} title="View Your Logs">
          <p>
            If you ever want to see what the server is doing behind the scenes, check the logs:
          </p>
          <CommandBlock command="deja logs" />
          <p>
            This shows the most recent server activity — commands being processed, connections
            coming and going. It&apos;s helpful if something doesn&apos;t seem right and you want
            to see what happened.
          </p>
          <p>
            To watch the logs update in real time (like a live feed), add the <code className="text-deja-lime font-mono text-xs">-f</code> flag:
          </p>
          <CommandBlock command="deja logs -f" />
          <p className="text-sm text-gray-500">Press Ctrl+C to stop watching.</p>
        </Step>
```

- [ ] **Step 4: Add Steps 4–6 (Stop & Start, Updates, Remote Access)**

Continue inside the `<div className="space-y-12">` block, after Step 3:

```tsx
        <Step number={4} title="Stop, Start & Restart">
          <p>
            You can stop the server any time and start it again later. It remembers your
            settings — just start it back up whenever you&apos;re ready to run trains.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 my-4">
            {[
              ['deja stop', 'Shut down the server'],
              ['deja start', 'Start it back up'],
              ['deja restart', 'Stop and start in one step'],
            ].map(([cmd, desc]) => (
              <div key={cmd} className="p-3 rounded-lg bg-gray-900 border border-gray-800">
                <p className="text-deja-lime font-mono text-xs">{cmd}</p>
                <p className="text-gray-500 text-xs mt-1">{desc}</p>
              </div>
            ))}
          </div>
          <Callout emoji="💡">
            <p>
              <strong className="text-white">Background mode:</strong> If you want the server to run
              in the background (no terminal window needed), add <code className="text-deja-lime font-mono text-xs">-b</code>:
            </p>
            <div className="mt-2">
              <code className="text-deja-lime font-mono text-xs">deja start -b</code>
            </div>
          </Callout>
        </Step>

        <Step number={5} title="Keep It Updated">
          <p>
            When a new version of the DEJA Server is available, updating is one command:
          </p>
          <CommandBlock command="deja update" />
          <p>
            This downloads the latest version, installs it, and restarts the server automatically.
            Your settings and configuration are preserved — nothing to reconfigure.
          </p>
        </Step>

        <Step number={6} title="Monitor from Anywhere">
          <p>
            With an Engineer or Conductor plan, you can access your{' '}
            <a href="https://monitor.dejajs.com" target="_blank" rel="noopener noreferrer" className="text-deja-cyan hover:underline">Monitor dashboard</a>
            {' '}from outside your home network using a secure Cloudflare tunnel.
          </p>
          <CommandBlock command="deja tunnel start" />
          <p>
            The command prints a URL you can open from anywhere — your phone on the go,
            a laptop at a train show, another room in the house.
          </p>
          <Callout emoji="🔒">
            <p>
              Remote access requires the{' '}
              <code className="text-deja-lime font-mono text-xs">cloudflared</code> tool to be installed.
              The server will tell you how if it&apos;s not already there. See the{' '}
              <Link href="/docs/server/remote-access" className="text-deja-cyan hover:underline">Remote Access docs</Link>
              {' '}for the full setup.
            </p>
          </Callout>
          <p className="text-xs text-gray-500">
            Remote access is available on{' '}
            <Link href="/pricing" className="text-deja-cyan hover:underline">Engineer and Conductor plans</Link>.
          </p>
        </Step>
      </div>
```

- [ ] **Step 5: Add CLI Quick Reference, Troubleshooting, and What's Next sections**

After the closing `</div>` of the steps section, add:

```tsx
      {/* CLI Quick Reference */}
      <section className="mt-12 p-5 rounded-xl border border-gray-800 bg-gray-900/50">
        <h2 className="text-white font-semibold mb-2">CLI Quick Reference</h2>
        <p className="text-gray-400 text-sm mb-4">
          Every command you&apos;ll need, all in one place. Type any of these in your terminal.
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm font-mono">
          {[
            ['deja start', 'Start the server'],
            ['deja start -b', 'Start in background'],
            ['deja stop', 'Stop the server'],
            ['deja restart', 'Restart the server'],
            ['deja status', 'Check server status'],
            ['deja logs', 'View recent logs'],
            ['deja logs -f', 'Follow logs live'],
            ['deja update', 'Update to latest version'],
            ['deja tunnel start', 'Start remote access'],
            ['deja tunnel stop', 'Stop remote access'],
            ['deja tunnel status', 'Check tunnel status'],
            ['deja --version', 'Show installed version'],
          ].map(([cmd, desc]) => (
            <div key={cmd} className="p-3 rounded-lg bg-gray-900 border border-gray-800">
              <p className="text-deja-lime text-xs">{cmd}</p>
              <p className="text-gray-500 text-xs mt-1">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          For the full reference with flags and examples, see the{' '}
          <Link href="/docs/server/cli" className="text-deja-cyan hover:underline">CLI Reference docs</Link>.
        </p>
      </section>

      {/* Troubleshooting */}
      <section className="mt-12">
        <h2 className="text-white font-bold text-xl mb-4">Troubleshooting</h2>
        <p className="text-gray-400 text-sm mb-6">
          Most issues have a quick fix. Here are the ones people run into most often.
        </p>
        <div className="space-y-6">
          <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/50">
            <h3 className="text-white font-semibold mb-2">Server not connecting to CommandStation</h3>
            <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
              <li>Make sure the USB cable is plugged in to both the CommandStation and the computer.</li>
              <li>Run <code className="text-deja-lime font-mono text-xs">deja status</code> — check if a serial port is listed under Connections.</li>
              <li>Try <code className="text-deja-lime font-mono text-xs">deja restart</code> — this re-detects serial ports and reconnects.</li>
            </ol>
          </div>

          <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/50">
            <h3 className="text-white font-semibold mb-2">Permission denied on serial port (Linux / Raspberry Pi)</h3>
            <p className="text-sm text-gray-300 mb-2">
              On Linux, your user account may need permission to access USB devices. Run this once:
            </p>
            <CommandBlock command="sudo usermod -a -G dialout $USER" />
            <p className="text-sm text-gray-500">Then log out and log back in for the change to take effect.</p>
          </div>

          <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/50">
            <h3 className="text-white font-semibold mb-2">Server won&apos;t start</h3>
            <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
              <li>Check your Node.js version: <code className="text-deja-lime font-mono text-xs">node --version</code> — you need v20 or later.</li>
              <li>Check the logs: <code className="text-deja-lime font-mono text-xs">deja logs</code> — look for error messages.</li>
              <li>Re-run the installer: <code className="text-deja-lime font-mono text-xs">curl -fsSL https://install.dejajs.com | bash</code> — this downloads a fresh copy.</li>
            </ol>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          For more solutions, see the full{' '}
          <Link href="/docs/server/troubleshooting" className="text-deja-cyan hover:underline">Troubleshooting guide</Link>.
        </p>
      </section>

      {/* What's Next */}
      <section className="mt-16 pt-8 border-t border-gray-800">
        <h2 className="text-white font-bold text-xl mb-2">What&apos;s Next?</h2>
        <p className="text-gray-400 text-sm mb-5">
          Your server is running — nice. Here&apos;s where to go from here.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: 'Open the Throttle', desc: 'Start driving trains from your phone, tablet, or laptop', href: '/guides/getting-started' },
            { label: 'Manage Your Layout', desc: 'Add locomotives, configure turnouts, and set up effects', href: '/guides/cloud' },
            { label: 'Monitor Your Railroad', desc: 'Watch live DCC commands and device status', href: '/docs/monitor' },
            { label: 'CLI Reference', desc: 'Full command reference with flags and examples', href: '/docs/server/cli' },
          ].map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="p-4 rounded-xl border border-gray-800 bg-gray-900/50 hover:border-deja-lime/40 hover:bg-gray-900 transition-all group"
            >
              <p className="text-white font-semibold group-hover:text-deja-lime transition-colors">{item.label} →</p>
              <p className="text-gray-500 text-sm mt-1">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
```

- [ ] **Step 6: Verify the component compiles**

Open the file and visually confirm all JSX is properly nested and closed. The structure should be:
```
<article>
  <header>...</header>
  <section> (requirements) </section>
  <div> (steps 1-6) </div>
  <section> (CLI quick reference) </section>
  <section> (troubleshooting) </section>
  <section> (what's next) </section>
</article>
```

---

## Task 2: Create the Route Page and Activate the Guide

**Files:**
- Create: `apps/dejajs-www/app/guides/server/page.tsx`
- Modify: `apps/dejajs-www/app/guides/page.tsx`

- [ ] **Step 1: Create the route page**

```tsx
// apps/dejajs-www/app/guides/server/page.tsx
import type { Metadata } from 'next';
import ServerGuide from '../../../components/guides/ServerGuide';

export const metadata: Metadata = {
  title: 'Server Guide',
  description: 'Install, manage, and configure the DEJA Server — the bridge between your browser and your DCC-EX CommandStation.',
};

export default function ServerGuidePage() {
  return <ServerGuide />;
}
```

- [ ] **Step 2: Activate the Server card on the guides index**

In `apps/dejajs-www/app/guides/page.tsx`, find the Server entry (around line 54-61) and update it:

**Replace:**
```tsx
  {
    label: 'Server',
    href: '/guides/server',
    desc: 'Installation, CLI reference, configuration, and running the DEJA Server on any platform.',
    icon: '💻',
    comingSoon: true,
    color: 'border-gray-700/30',
    iconBg: 'bg-gray-800',
  },
```

**With:**
```tsx
  {
    label: 'Server',
    href: '/guides/server',
    desc: 'Installation, CLI reference, configuration, and running the DEJA Server on any platform.',
    icon: '💻',
    color: 'border-deja-lime/30 hover:border-deja-lime/60',
    iconBg: 'bg-deja-lime/10',
  },
```

- [ ] **Step 3: Commit**

```bash
git add apps/dejajs-www/components/guides/ServerGuide.tsx apps/dejajs-www/app/guides/server/page.tsx apps/dejajs-www/app/guides/page.tsx
git commit -m "feat(www): add server guide page at /guides/server"
```

---

## Task 3: Update the Server Overview MDX

**Files:**
- Modify: `docs/server/overview.mdx`

- [ ] **Step 1: Rewrite overview.mdx**

Replace the full contents of `docs/server/overview.mdx` with:

```mdx
---
title: DEJA Server
description: The background service that connects your browser to your DCC-EX CommandStation over USB — install it, manage it with the deja CLI, and troubleshoot common issues.
section: apps
order: 1
---

# DEJA Server

The DEJA Server is the bridge between your browser and your DCC-EX CommandStation hardware. It runs in the background on the computer connected to your CommandStation via USB, translating commands from the Throttle, Cloud, and Monitor apps into DCC-EX serial commands on the track.

{/* TODO: screenshot — server_terminal_start.png */}

## How It Works

You control your trains from a web browser — your phone, a tablet, your laptop. Those commands travel through the cloud to the DEJA Server, which talks to your CommandStation over USB. The server handles everything in between so you can focus on running your railroad.

The server manages:

- **WebSocket connections** — real-time communication with your browser apps
- **Firebase sync** — cloud-based layout data (throttles, turnouts, effects, signals)
- **Serial communication** — USB connection to your DCC-EX CommandStation at 115200 baud
- **MQTT messaging** — optional communication with IoT devices (Arduino, Pico W)
- **Sound playback** — layout sound effects played through the server's speakers

## Getting Started

The fastest way to get up and running is the [Server Guide](/guides/server) — a step-by-step walkthrough from installation to your first train.

If you're already set up and looking for reference material, use the pages in this section:

| Page | What it covers |
|------|---------------|
| [Installation](/docs/server/installation) | Platform requirements, one-command install, what the installer does |
| [CLI Reference](/docs/server/cli) | Every `deja` command with flags and examples |
| [Configuration](/docs/server/configuration) | Environment variables, config files, directory layout |
| [Remote Access](/docs/server/remote-access) | Secure tunnel for monitoring from anywhere |
| [Troubleshooting](/docs/server/troubleshooting) | Common issues and how to fix them |

## Quick Install

**macOS / Linux / Raspberry Pi:**

```bash
curl -fsSL https://install.dejajs.com | bash
```

The installer downloads the server, detects your CommandStation's serial port, and starts the server automatically. See [Installation](/docs/server/installation) for the full details.

## Managing with the `deja` CLI

| Command | What it does |
|---------|-------------|
| `deja status` | Check if the server is running, your subscription, and serial connection |
| `deja logs` | View recent server logs |
| `deja logs -f` | Follow server logs in real time |
| `deja start` | Start the server |
| `deja stop` | Stop the server |
| `deja restart` | Restart the server |
| `deja update` | Download and install the latest version |

See the [CLI Reference](/docs/server/cli) for the complete command list with flags and examples.
```

- [ ] **Step 2: Commit**

```bash
git add docs/server/overview.mdx
git commit -m "docs(server): refresh overview with sub-page navigation"
```

---

## Task 4: Create the Installation MDX Page

**Files:**
- Create: `docs/server/installation.mdx`

- [ ] **Step 1: Write installation.mdx**

```mdx
---
title: Installation
description: Install the DEJA Server on macOS, Linux, or Raspberry Pi with a single command — platform requirements, what the installer does, and serial port setup.
order: 2
---

# Installation

Getting the DEJA Server running takes about two minutes. One command does everything — downloads the server, detects your CommandStation, and starts it up.

## Requirements

- **Node.js 20 or later** — check with `node --version`. If you need to install it, visit [nodejs.org](https://nodejs.org/).
- **A USB cable** connecting your DCC-EX CommandStation to the computer running the server.
- **A supported platform:**

| Platform | Notes |
|----------|-------|
| macOS (Intel or Apple Silicon) | Works out of the box |
| Linux (x86_64 or ARM64) | May need serial port permissions (see below) |
| Raspberry Pi (Pi 4 or 5) | Runs great — plug in your CommandStation via USB |
| Windows | Supported through [WSL](https://learn.microsoft.com/en-us/windows/wsl/install) — run the installer from a WSL terminal |

## Install

Open a terminal on the computer connected to your CommandStation and run:

```bash
curl -fsSL https://install.dejajs.com | bash
```

You can also find a personalized install link in the [Cloud app](https://cloud.dejajs.com) under **Settings → Install**. That link includes your account info so you won't need to enter it manually.

## What the Installer Does

The installer runs through these steps automatically:

1. **Detects your platform** — confirms macOS, Linux, or Raspberry Pi and the correct architecture.
2. **Checks Node.js** — verifies you have Node.js 20 or later. If not, it tells you how to install it.
3. **Links your account** — connects the server to your DEJA Cloud account using your User ID and Layout ID. If you used the personalized install link, this is automatic.
4. **Sets up configuration** — creates the `~/.deja/` directory with your environment file and credentials.
5. **Detects serial ports** — scans for USB devices that look like a DCC-EX CommandStation.
6. **Downloads the server** — pulls the latest release and installs dependencies.
7. **Installs the `deja` CLI** — adds the `deja` command to your terminal so you can manage the server.
8. **Starts the server** — launches the server and connects to your CommandStation.

## Serial Port Permissions (Linux / Raspberry Pi)

On Linux, your user account may need permission to access USB serial ports. If the installer warns you about this, run:

```bash
sudo usermod -a -G dialout $USER
```

Then log out and log back in for the change to take effect. This only needs to be done once.

## Reinstalling

If something goes wrong or you want a fresh start, just run the install command again:

```bash
curl -fsSL https://install.dejajs.com | bash
```

This downloads a clean copy of the server and reconfigures everything. Your account and layout stay the same.

## What Gets Installed

Everything lives in `~/.deja/` inside your home directory:

| Path | What it is |
|------|-----------|
| `~/.deja/bin/deja` | The `deja` CLI command |
| `~/.deja/server/` | The server runtime |
| `~/.deja/config.json` | Your account and layout configuration |
| `~/.deja/.env` | Environment variables (Firebase credentials, feature flags) |
| `~/.deja/logs/` | Server log files |

## Next Steps

- Run `deja status` to verify everything is connected — see [CLI Reference](/docs/server/cli)
- Open [throttle.dejajs.com](https://throttle.dejajs.com) on any device and start driving
- Check the [Troubleshooting](/docs/server/troubleshooting) page if anything isn't working
```

- [ ] **Step 2: Commit**

```bash
git add docs/server/installation.mdx
git commit -m "docs(server): add installation reference page"
```

---

## Task 5: Create the CLI Reference MDX Page

**Files:**
- Create: `docs/server/cli.mdx`

- [ ] **Step 1: Write cli.mdx**

```mdx
---
title: CLI Reference
description: Complete reference for the deja command-line tool — every command, flag, and option for managing your DEJA Server.
navTitle: CLI
order: 3
---

# CLI Reference

The `deja` CLI is how you manage your DEJA Server from the terminal. It's installed automatically when you run the [installer](/docs/server/installation).

## Server Commands

### `deja start`

Start the server. By default, the server runs in the foreground with an interactive display.

| Flag | Description |
|------|-------------|
| `-b`, `--background`, `--bg` | Start in the background (no terminal window needed) |

**Interactive mode** (default) shows the DEJA.js banner and keeps the terminal attached. Type `exit` or press Ctrl+C to stop.

**Background mode** (`deja start -b`) runs the server silently. Use `deja status` to check on it and `deja stop` to shut it down.

### `deja stop`

Stop a running server. The server shuts down gracefully — it closes connections, disconnects from Firebase, and releases the serial port before exiting.

### `deja restart`

Stop the server and start it again. Accepts the same flags as `deja start` (e.g., `deja restart -b` to restart in background mode).

### `deja status`

Show the current state of your server, connections, and subscription. The output includes:

- **Server state** — running or stopped, version number, process ID
- **Account** — your User ID and Layout ID
- **Connections** — WebSocket port, MQTT status, Firebase Cloud status, detected serial ports
- **Remote monitoring** — tunnel status and URL (if applicable)
- **Apps** — links to Throttle, Cloud, and Monitor
- **Log file** — path and size of the current log file

### `deja logs`

View recent server log output.

| Flag | Description |
|------|-------------|
| `-f`, `--follow` | Follow logs in real time (like a live feed). Press Ctrl+C to stop. |
| `-n LINES`, `--lines LINES` | Number of lines to show (default: 50) |

**Examples:**

```bash
deja logs           # Show last 50 lines
deja logs -f        # Follow logs in real time
deja logs -n 100    # Show last 100 lines
deja logs -f -n 20  # Follow, starting from last 20 lines
```

### `deja update`

Check for and install the latest version of the DEJA Server. If the server is running, it will be stopped during the update and restarted automatically afterward.

The update preserves your configuration — your account, layout, and environment settings stay exactly as they were.

### `deja --version`

Print the installed server version.

### `deja help`

Show the full list of available commands.

## Tunnel Commands

Remote access lets you reach your [Monitor dashboard](https://monitor.dejajs.com) from outside your home network. It requires an Engineer or Conductor plan and the `cloudflared` tool. See [Remote Access](/docs/server/remote-access) for setup details.

### `deja tunnel start`

Start a secure Cloudflare tunnel. Once connected, the command prints a URL you can open from anywhere.

### `deja tunnel stop`

Stop a running tunnel.

### `deja tunnel status`

Check whether the tunnel is running and show the current URL.

### `deja tunnel logs`

View recent tunnel log output. Optionally pass a number to show more lines (e.g., `deja tunnel logs 100`).
```

- [ ] **Step 2: Commit**

```bash
git add docs/server/cli.mdx
git commit -m "docs(server): add CLI reference page"
```

---

## Task 6: Create the Configuration MDX Page

**Files:**
- Create: `docs/server/configuration.mdx`

- [ ] **Step 1: Write configuration.mdx**

```mdx
---
title: Configuration
description: DEJA Server configuration files, environment variables, and the ~/.deja/ directory structure.
order: 4
---

# Configuration

The DEJA Server stores all of its configuration in the `~/.deja/` directory inside your home folder. The installer sets this up automatically — you generally won't need to edit these files by hand unless you're troubleshooting or changing advanced settings.

## Directory Structure

```
~/.deja/
├── bin/
│   └── deja              # The deja CLI command
├── server/               # Server runtime files
│   ├── index.js          # Server entry point
│   └── version.txt       # Installed version
├── config.json           # Account and layout configuration
├── .env                  # Environment variables
├── server.pid            # Process ID of running server
├── logs/
│   ├── server.log        # Current server log
│   └── server.log.1      # Previous log (rotated at 10 MB)
└── tunnel.pid            # Process ID of running tunnel (if active)
```

## config.json

Your account and layout information, created during installation.

```json
{
  "uid": "your-user-id",
  "layoutId": "your-layout-id"
}
```

| Field | Description |
|-------|-------------|
| `uid` | Your DEJA Cloud user ID |
| `layoutId` | The layout this server is connected to |

The server also caches your subscription status here after each check. You don't need to edit this — it's managed automatically.

## Environment Variables (.env)

The `~/.deja/.env` file controls which features are enabled and how the server connects to external services. The installer creates this file with sensible defaults.

### Core Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `LAYOUT_ID` | *(from install)* | Your layout identifier — matches `config.json` |
| `ENABLE_DEJACLOUD` | `true` | Connect to Firebase for real-time cloud sync |
| `ENABLE_WS` | `true` | Start the WebSocket server for browser communication |
| `ENABLE_MQTT` | `false` | Connect to an MQTT broker for IoT devices |
| `ENABLE_SOUND` | `false` | Enable sound effect playback on the server |
| `VITE_WS_PORT` | `8082` | Port for the WebSocket server |
| `VITE_WS_ID` | `DEJA.js` | Server identifier string |

### Firebase Credentials

These are set automatically during installation. They connect the server to your DEJA Cloud account.

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase API key (public) |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_DATABASE_URL` | Firebase Realtime Database URL |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `FIREBASE_CLIENT_EMAIL` | Service account email (private) |
| `FIREBASE_PRIVATE_KEY` | Service account private key (private) |

### Optional Settings

| Variable | Description |
|----------|-------------|
| `CLOUDFLARE_TUNNEL_TOKEN` | Token for a named Cloudflare tunnel (see [Remote Access](/docs/server/remote-access)) |
| `VITE_MQTT_BROKER` | MQTT broker URL (default: `mqtt://localhost`) |
| `VITE_MQTT_PORT` | MQTT broker port (default: `1883`) |

## Editing Configuration

If you need to change a setting, open the `.env` file in any text editor:

```bash
nano ~/.deja/.env
```

After making changes, restart the server for them to take effect:

```bash
deja restart
```

## Log Rotation

Server logs are stored at `~/.deja/logs/server.log`. When the log file reaches 10 MB, it's automatically rotated — the current log is saved as `server.log.1` and a new log file is started.
```

- [ ] **Step 2: Commit**

```bash
git add docs/server/configuration.mdx
git commit -m "docs(server): add configuration reference page"
```

---

## Task 7: Create the Remote Access MDX Page

**Files:**
- Create: `docs/server/remote-access.mdx`

- [ ] **Step 1: Write remote-access.mdx**

```mdx
---
title: Remote Access
description: Access your DEJA Monitor dashboard from anywhere using a secure Cloudflare tunnel — setup, requirements, and tunnel management.
order: 5
---

# Remote Access

Remote access lets you reach your [Monitor dashboard](https://monitor.dejajs.com) from outside your home network — check on your railroad from your phone at a train show, from another room, or from anywhere with internet access.

This feature uses a secure [Cloudflare tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) to create a safe connection between the internet and your DEJA Server. No ports to open, no router configuration needed.

## Requirements

- **Engineer or Conductor plan** — remote access is a paid feature. See [Pricing](/pricing) for details.
- **`cloudflared` installed** on the computer running your DEJA Server.

## Installing cloudflared

### macOS

```bash
brew install cloudflare/cloudflare/cloudflared
```

### Linux / Raspberry Pi

```bash
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared focal main' | sudo tee /etc/apt/sources.list.d/cloudflared.list
sudo apt-get update && sudo apt-get install cloudflared
```

For other platforms, see the [cloudflared downloads page](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/).

## Starting a Tunnel

Once `cloudflared` is installed, start a tunnel with:

```bash
deja tunnel start
```

The command prints a URL you can open from any browser — no login or setup needed on the remote device. The URL looks something like `https://abc-xyz.trycloudflare.com`.

When you start the server in background mode (`deja start -b`), the tunnel starts automatically if you're on a paid plan.

## Managing the Tunnel

| Command | What it does |
|---------|-------------|
| `deja tunnel start` | Start the tunnel and print the URL |
| `deja tunnel stop` | Stop the tunnel |
| `deja tunnel status` | Check if the tunnel is running and show the URL |
| `deja tunnel logs` | View tunnel log output |

## Tunnel Types

### Quick Tunnel (Default)

The default mode creates a temporary URL that works as long as the tunnel is running. No Cloudflare account needed. The URL changes each time you restart the tunnel.

This is the easiest option and works great for most users.

### Named Tunnel (Advanced)

If you want a stable URL that doesn't change, you can set up a named tunnel with a Cloudflare account. Set the `CLOUDFLARE_TUNNEL_TOKEN` in your environment file:

```bash
nano ~/.deja/.env
```

Add your token:

```
CLOUDFLARE_TUNNEL_TOKEN=your-token-here
```

Then restart the server. The tunnel will use your named tunnel configuration automatically.

## Troubleshooting

### "cloudflared is not installed"

Install `cloudflared` using the instructions above for your platform.

### "Remote monitoring requires an Engineer or Conductor plan"

Remote access is available on paid plans. Visit [dejajs.com/pricing](/pricing) to upgrade.

### Tunnel starts but URL doesn't work

Check the tunnel logs for errors:

```bash
deja tunnel logs
```

If the tunnel is having trouble connecting, try stopping and starting it again:

```bash
deja tunnel stop
deja tunnel start
```
```

- [ ] **Step 2: Commit**

```bash
git add docs/server/remote-access.mdx
git commit -m "docs(server): add remote access reference page"
```

---

## Task 8: Create the Troubleshooting MDX Page

**Files:**
- Create: `docs/server/troubleshooting.mdx`

- [ ] **Step 1: Write troubleshooting.mdx**

```mdx
---
title: Troubleshooting
description: Solutions to common DEJA Server issues — serial port problems, startup errors, Firebase connection failures, and subscription questions.
order: 6
---

# Troubleshooting

If something isn't working right, start here. These are the most common issues and their fixes. For all of these, running `deja logs` is a great first step — it shows you exactly what the server is doing (or what went wrong).

## Server Not Connecting to CommandStation

**Symptoms:** `deja status` shows no serial port, or the Throttle app says "Disconnected."

1. **Check the USB cable** — make sure it's plugged in at both ends. Try a different USB port on the computer.
2. **Run `deja status`** — look under Connections for a serial port like `/dev/ttyUSB0` or `/dev/tty.usbmodem*`. If none is listed, the server can't see the CommandStation.
3. **Restart the server** — `deja restart` will re-scan for serial ports and try to connect again.
4. **Try unplugging and replugging the USB cable**, then restart the server.

## Serial Port Permission Denied (Linux / Raspberry Pi)

**Symptoms:** The server starts but can't open the serial port. Logs show a "permission denied" error.

Run this command once to add your user to the `dialout` group:

```bash
sudo usermod -a -G dialout $USER
```

Then **log out and log back in** (or reboot). This only needs to be done once — after that, the server will always have access.

## Server Won't Start

**Symptoms:** `deja start` shows an error or the server exits immediately.

1. **Check Node.js version:** Run `node --version` — you need v20 or later. If you need to upgrade, visit [nodejs.org](https://nodejs.org/).
2. **Check the logs:** Run `deja logs` to see what error the server reported.
3. **Reinstall:** Run the installer again — it downloads a fresh copy and reconfigures:
   ```bash
   curl -fsSL https://install.dejajs.com | bash
   ```

## Firebase Connection Errors

**Symptoms:** Logs show Firebase or Firestore errors. The Throttle and Cloud apps can't see the server.

Your Firebase credentials may be missing or incorrect. They live in `~/.deja/.env`.

1. Open the [Cloud app](https://cloud.dejajs.com) and go to **Settings → View Local Environment Configuration**.
2. Compare those values with what's in your `~/.deja/.env` file.
3. If they don't match, update the `.env` file and restart: `deja restart`.

Or re-run the installer to reconfigure automatically.

## Subscription Issues

### "Subscription inactive"

Your subscription may have expired or been canceled. Visit [dejajs.com](https://dejajs.com) to check your account status and renew.

The server allows a 48-hour grace period when it can't reach the internet — if your subscription was active within the last 48 hours, the server will continue running using its cached status.

### "Cannot verify subscription"

The server needs to verify your subscription online periodically. If it can't reach Firebase and the cached verification is older than 48 hours, it will stop.

Connect the computer to the internet and restart the server: `deja restart`.

## `deja` Command Not Found

If the terminal says `deja: command not found` after installation:

1. **Open a new terminal window** — the installer added `deja` to your PATH, but the current terminal may not have picked it up yet.
2. **Or reload your shell config:**
   ```bash
   source ~/.zshrc    # if using zsh
   source ~/.bashrc   # if using bash
   ```
3. **Or run it directly:**
   ```bash
   ~/.deja/bin/deja status
   ```

## Still Stuck?

If none of the above fixes your issue:

1. Run `deja logs -n 100` and look for error messages near the bottom.
2. Run `deja status` and note any warnings.
3. Check the [DEJA.js community](https://dejajs.com) for help from other users.
```

- [ ] **Step 2: Commit**

```bash
git add docs/server/troubleshooting.mdx
git commit -m "docs(server): add troubleshooting reference page"
```

---

## Task 9: Final Verification

**Files:** All files from Tasks 1–8

- [ ] **Step 1: Verify docs are picked up by the nav system**

The docs nav is generated automatically from MDX files in `docs/` by `apps/dejajs-www/lib/generate-docs-nav.ts`. Files in `docs/server/` are mapped to the "Server" section. Confirm the new files will be found:

```bash
ls -la docs/server/
```

Expected output — 6 files:
```
overview.mdx
installation.mdx
cli.mdx
configuration.mdx
remote-access.mdx
troubleshooting.mdx
```

- [ ] **Step 2: Verify the guide page route exists**

```bash
ls -la apps/dejajs-www/app/guides/server/
```

Expected: `page.tsx`

- [ ] **Step 3: Build the www app to check for errors**

```bash
cd /Users/jmcdannel/TTT/worktrees/server-guide && pnpm --filter=dejajs-www build
```

Expected: Build completes without errors. If there are import errors (e.g., missing `@mdi/js` icons), fix them — check available icons with:

```bash
grep -r "mdiConsole\|mdiMicrosoftWindows\|mdiApple\|mdiLinux" node_modules/@mdi/js/mdi.js 2>/dev/null | head -5
```

If any icon is not available, substitute with a similar one from `@mdi/js` or remove the icon and use an emoji instead.

- [ ] **Step 4: Verify cross-links resolve**

Check that all internal links in the MDX files point to files that exist:

- `/docs/server/installation` → `docs/server/installation.mdx` ✓
- `/docs/server/cli` → `docs/server/cli.mdx` ✓
- `/docs/server/configuration` → `docs/server/configuration.mdx` ✓
- `/docs/server/remote-access` → `docs/server/remote-access.mdx` ✓
- `/docs/server/troubleshooting` → `docs/server/troubleshooting.mdx` ✓
- `/guides/server` → `app/guides/server/page.tsx` ✓

- [ ] **Step 5: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix(www): resolve server guide build issues"
```

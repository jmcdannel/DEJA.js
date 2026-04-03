# Server Guide — Design Spec

**Date:** 2026-04-01
**Branch:** `feature/server-guide`
**Scope:** Create the `/guides/server` TSX guide page + expand `/docs/server/*` MDX sub-nav pages

---

## 🎯 Goal

Create a complete, self-contained guide for the DEJA Server and `deja` CLI that serves both as a standalone entry point and a deep reference. The guide must be approachable for non-technical model railroad hobbyists — many of whom have never used a terminal before.

---

## 👤 Audience

Model railroad enthusiasts, skewing older, who are comfortable with browsers but may be apprehensive about command-line tools. The tone should be warm, encouraging, and confidence-building — "you've got this" energy. Every CLI interaction should feel like following a simple recipe, not programming.

**Tone guidelines:**
- Frame CLI commands as "just type this one line" — never assume terminal fluency
- Use phrases like "That's it — one command" or "Nothing else to remember"
- Avoid jargon: say "the computer connected to your CommandStation" not "the host machine"
- When showing terminal output, explain what the user should see and what it means
- Reassure at friction points: serial port permissions, Node.js version, etc.
- Never condescend — these are smart people who are new to *this specific tool*

---

## 📦 Deliverables

### 1. TSX Guide Page: `/guides/server`

**Files:**
- `apps/dejajs-www/app/guides/server/page.tsx` — route page
- `apps/dejajs-www/components/guides/ServerGuide.tsx` — guide component

**Reuse shared components** from `GettingStartedGuide.tsx`:
- `Step` — numbered step cards (extract to shared if not already)
- `CommandBlock` — terminal-styled command with copy button
- `Callout` — tip/note callouts with emoji

**Sections (in order):**

| # | Section | Content |
|---|---------|---------|
| — | **Hero** | "Your bridge to the track" — the server is the piece that connects your browser to your railroad. Runs quietly in the background. Short architecture diagram (reuse from Getting Started). |
| — | **What You'll Need** | Requirements box: Node.js 20+, USB cable, supported platform (Raspberry Pi, Mac, Linux). Friendly note about Windows/WSL. |
| 01 | **Install** | One-liner `curl` command with `CommandBlock`. Explain what happens: downloads, detects CommandStation, connects automatically. Callout for Raspberry Pi users. Note about the personalized install link from Cloud Settings. |
| 02 | **Check That It's Working** | Run `deja status` — explain each section of the output. "You should see something like this:" with a screenshot placeholder. Green dot = running. Serial port detected. |
| 03 | **View Your Logs** | `deja logs` and `deja logs -f`. What the output looks like. "These are helpful if something doesn't seem right." |
| 04 | **Stop & Start** | `deja stop`, `deja start`, `deja restart`. When you'd use each. "The server remembers your settings — just start it back up." |
| 05 | **Keep It Updated** | `deja update` — one command to get the latest version. What happens during an update. |
| 06 | **Remote Access** | Tunnel feature for monitoring from anywhere. Plan requirement note. `deja tunnel start`. How to install cloudflared. |
| — | **CLI Quick Reference** | Grid of all commands (like Getting Started's server management section). Styled cards with command + description. |
| — | **Troubleshooting** | Common issues: serial port permissions, Node.js version, Firebase connection, server won't start. Each with clear fix steps. |
| — | **What's Next** | Links to Throttle guide, Cloud guide, Monitor guide, docs reference. |

### 2. MDX Docs Sub-Nav: `/docs/server/*`

**Files to create/update:**

| File | URL | Title | Order | Content |
|------|-----|-------|-------|---------|
| `docs/server/overview.mdx` | `/docs/server` | DEJA Server | 1 | **Update existing** — refresh intro, add screenshot, link to sub-pages |
| `docs/server/installation.mdx` | `/docs/server/installation` | Installation | 2 | Platform requirements, one-liner install, what the installer does step by step, WSL note, serial port permissions |
| `docs/server/cli.mdx` | `/docs/server/cli` | CLI Reference | 3 | Complete command reference: `start`, `stop`, `restart`, `status`, `logs`, `update`, `tunnel *`. Flags, examples, output |
| `docs/server/configuration.mdx` | `/docs/server/configuration` | Configuration | 4 | `~/.deja/` directory layout, `.env` variables, `config.json`, how to edit |
| `docs/server/remote-access.mdx` | `/docs/server/remote-access` | Remote Access | 5 | Tunnel feature, cloudflared setup, ephemeral vs named tunnels, plan requirements |
| `docs/server/troubleshooting.mdx` | `/docs/server/troubleshooting` | Troubleshooting | 6 | Expanded troubleshooting: serial port, Node.js, Firebase, subscription, logs interpretation |

### 3. Guides Index Update

**File:** `apps/dejajs-www/app/guides/page.tsx`

Remove `comingSoon: true` from the Server guide entry and activate its styling:
```tsx
{
  label: 'Server',
  href: '/guides/server',
  desc: 'Installation, CLI reference, configuration, and running the DEJA Server on any platform.',
  icon: '💻',
  color: 'border-deja-lime/30 hover:border-deja-lime/60',
  iconBg: 'bg-deja-lime/10',
}
```

Use `deja-lime` to match the server's green terminal aesthetic from the Getting Started guide.

---

## 🖼️ Screenshots

Terminal screenshots will be provided by the user. Placeholder references to use in the guide:

| Filename | Content |
|----------|---------|
| `server_terminal_status.png` | `deja status` output showing running server, connections, apps |
| `server_terminal_start.png` | ASCII art banner on `deja start` |
| `server_terminal_logs.png` | `deja logs` output with DCC commands flowing |
| `server_terminal_tunnel.png` | `deja tunnel start` output with URL |

Use `{/* TODO: screenshot — filename.png */}` comment syntax for placeholders until images are provided.

---

## 🧩 Component Strategy

The `GettingStartedGuide.tsx` already has `Step`, `CommandBlock`, `Callout`, and `MdiIcon` components defined inline. For `ServerGuide.tsx`:

**Option chosen: Copy and adapt locally.** Define `Step`, `CommandBlock`, `Callout` inside `ServerGuide.tsx` (same as `GettingStartedGuide.tsx` pattern). This avoids a refactor of GettingStartedGuide and keeps guides self-contained.

If the components diverge, a future PR can extract shared guide primitives — but that's out of scope here.

---

## 🔗 Cross-References

The server guide should link to:
- `/guides/getting-started` — "Already followed Getting Started? You're all set."
- `/docs/server/cli` — "See the full CLI reference"
- `/docs/server/configuration` — "See configuration details"
- `/docs/server/troubleshooting` — "Having trouble? Check troubleshooting"
- `/pricing` — for tunnel plan requirements

The MDX docs should cross-link between sub-pages and back to the guide.

---

## ✅ Acceptance Criteria

1. `/guides/server` renders a complete, styled guide page matching the visual quality of `/guides/getting-started`
2. Docs sidebar shows "Server" section with 6 sub-pages (overview + 5 new)
3. Server card on `/guides` index is active (not "coming soon")
4. All CLI commands are documented with flags, examples, and expected output
5. Tone is warm, approachable, and confidence-building throughout
6. Screenshot placeholders are marked with TODO comments for user to fill in
7. No broken links, all cross-references resolve
8. Builds successfully (`pnpm build` passes for dejajs-www)

---
name: capture-screenshots
description: Capture screenshots of DEJA.js app views using Playwright MCP. Use when you need to take screenshots of app UI for documentation, changelogs, or PR descriptions. Trigger on "/capture-screenshots" or when asked to "take screenshots", "capture screenshots", or "update screenshots".
user_invocable: true
---

# Capture Screenshots

Capture screenshots of DEJA.js app views using Playwright MCP (headless browser).

> 🌙 **Dark mode is mandatory.** Every screenshot must render in the dark theme regardless of the OS `prefers-color-scheme` setting — DEJA.js is a dark-first brand and mixed-theme screenshots look broken in docs and marketing. Step 3 of the Procedure below seeds `localStorage`, overrides `matchMedia`, and forces the Tailwind `.dark` class before any capture runs. Do not skip it.

## Prerequisites

- `.claude/launch.json` must exist (dev server configs)
- `.env` must be available in the working directory (symlink if in worktree)
- `VITE_DEMO_MODE=true` should be set in `.env` for auth bypass, OR `VITE_DEMO_EMAIL` and `VITE_DEMO_PASSWORD` for real login
- Playwright MCP server must be configured (`claude mcp add playwright -- npx @playwright/mcp@latest --headless`)

## Usage

```
/capture-screenshots [app] [--views view1,view2] [--viewport desktop|mobile|both] [--layout layoutId]
```

- `app`: throttle, cloud, monitor, or "all" (default: all)
- `--views`: comma-separated list of view names to capture (default: all views for the app)
- `--viewport`: desktop, mobile, or both (default: both)
- `--layout`: Override layout ID (default: betatrack). If omitted, reads `LAYOUT_ID` from `.env`.

## Procedure

### 1. Environment Setup

If in a git worktree (check if `.git` is a file, not a directory):
```bash
# Symlink .env from staging worktree if not present
if [ ! -f .env ] && [ -f /Users/jmcdannel/TTT/DEJA.js.git/staging/.env ]; then
  ln -sf /Users/jmcdannel/TTT/DEJA.js.git/staging/.env .env
fi
```

### 2. Start Dev Server

Start the dev server using Bash:
```bash
pnpm --filter=<app-package-name> dev &
```

App package names and ports (from `.claude/launch.json`):
- `deja-throttle` → port 3041
- `deja-cloud` → port 3011
- `deja-monitor` → port 3021

Wait a few seconds for the server to be ready, then navigate to the app URL using `mcp__playwright__browser_navigate`.

### 3. Set Up App State

If `--layout` flag is provided, use that value. Otherwise read `LAYOUT_ID` from `.env`. Default layout for docs/marketing: `betatrack`.

Navigate to the app's root URL first:
```
mcp__playwright__browser_navigate({ url: "http://localhost:<port>" })
```

Then set localStorage values using `mcp__playwright__browser_evaluate`. **Seed the theme to `dark` in the same call as the layout — dark mode is mandatory for every screenshot, regardless of the OS `prefers-color-scheme`:**

```javascript
mcp__playwright__browser_evaluate({ function: `() => {
  // 🗺️ Layout ID — used by every DEJA app
  localStorage.setItem('@DEJA/layoutId', '<layout-id>');

  // 🌙 Force dark mode across every DEJA app, regardless of OS preference.
  // Different apps read from different keys — seed them all:
  localStorage.setItem('@DEJA/theme', 'dark');           // Vuetify apps (throttle/cloud/monitor/tour) via useStorage
  localStorage.setItem('theme', 'dark');                 // dejajs-www (Next.js)
  localStorage.setItem('vuetify:theme', 'dark');         // Vuetify default persistence key
  localStorage.setItem('darkMode', 'true');              // legacy fallback

  // 🎨 Tailwind dark variant: add the class to <html> so utilities like
  // dark:bg-gray-950 render correctly before Vue/React hydrates.
  document.documentElement.classList.add('dark');
  document.documentElement.classList.remove('light');

  // 🖥️ Override window.matchMedia so any '(prefers-color-scheme: dark)'
  // query resolves to true and '(prefers-color-scheme: light)' to false.
  // This wins over the OS setting for the rest of the session.
  const origMatchMedia = window.matchMedia.bind(window);
  window.matchMedia = (query) => {
    if (query.includes('prefers-color-scheme: dark')) {
      return { matches: true, media: query, onchange: null, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false };
    }
    if (query.includes('prefers-color-scheme: light')) {
      return { matches: false, media: query, onchange: null, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false };
    }
    return origMatchMedia(query);
  };
}` })
```

After seeding, **reload the page once** so the app reads the fresh localStorage on boot (some stores only read on init, not on the fly):

```
mcp__playwright__browser_navigate({ url: "http://localhost:<port>" })
```

> 🌙 **Why this matters:** the DEJA brand is dark-first. Marketing screenshots and docs must always show the dark theme so the site renders consistently no matter who runs the skill. The four localStorage keys + `matchMedia` override + `.dark` class cover every theme mechanism used across the monorepo (Vuetify, Next.js, and direct Tailwind variants).

If using email/password login (not DEMO_MODE):
1. Navigate to `/login`
2. Use `mcp__playwright__browser_snapshot` to get form field refs
3. Use `mcp__playwright__browser_fill_form` to enter credentials
4. Use `mcp__playwright__browser_click` to submit
5. Wait for redirect

### 3.5. Monitor Mock Data Seeding (monitor app only)

After auth and before capturing:
1. Navigate to the dashboard and wait for mount:
   ```
   mcp__playwright__browser_navigate({ url: "http://localhost:3021" })
   mcp__playwright__browser_evaluate({ function: "() => new Promise(r => setTimeout(r, 3000))" })
   ```
2. Seed all panes:
   ```
   mcp__playwright__browser_evaluate({ function: "() => window.__DEJA_MOCK__?.seedAll()" })
   ```
3. Wait for reactivity:
   ```
   mcp__playwright__browser_evaluate({ function: "() => new Promise(r => setTimeout(r, 1000))" })
   ```

### 3.6. Dynamic ID Resolution — Throttle Detail View

For `/throttle/:address`:
1. Navigate to `/throttles` first
2. Use `mcp__playwright__browser_evaluate` to scrape available loco links:
   ```
   mcp__playwright__browser_evaluate({ function: "() => Array.from(document.querySelectorAll('a[href^=\"/throttle/\"]')).map(a => parseInt(a.getAttribute('href').split('/').pop())).filter(n => !isNaN(n))" })
   ```
3. Pick the first address that is not `3`, fallback to `3` if it is the only option
4. If no addresses are found, skip this screenshot and log a warning

### 3.7. Dynamic ID Resolution — Cloud Edit Views

For each cloud edit view (`/locos/:address`, `/turnouts/:turnoutId`, `/routes/:routeId`, `/effects/:effectId`, `/signals/:signalId`):
1. Navigate to the corresponding list view first (e.g., `/locos`, `/turnouts`, etc.)
2. Use `mcp__playwright__browser_evaluate` to scrape the first item link:
   ```
   mcp__playwright__browser_evaluate({ function: "() => document.querySelector('a[href^=\"/<entity>/\"]')?.getAttribute('href')" })
   ```
   Replace `<entity>` with the actual entity path segment (e.g., `locos`, `turnouts`, `routes`, `effects`, `signals`).
3. Navigate to that href
4. If no items exist, skip the edit screenshot and log a warning

### 4. Capture Screenshots

For each view, navigate and capture:

1. Navigate: `mcp__playwright__browser_navigate({ url: "http://localhost:<port><route>" })`
2. Wait for the page to settle:
   ```
   mcp__playwright__browser_evaluate({ function: "() => new Promise(r => setTimeout(r, 2000))" })
   ```
3. For desktop viewport:
   ```
   mcp__playwright__browser_resize({ width: 1280, height: 800 })
   mcp__playwright__browser_take_screenshot({ type: "png", filename: "apps/dejajs-www/public/screenshots/<name>_desktop_<view>.png" })
   ```
4. For mobile viewport:
   ```
   mcp__playwright__browser_resize({ width: 375, height: 812 })
   mcp__playwright__browser_take_screenshot({ type: "png", filename: "apps/dejajs-www/public/screenshots/<name>_mobile_<view>.png" })
   ```

### 5. Save Screenshots

Screenshots are saved directly by `mcp__playwright__browser_take_screenshot` using the `filename` parameter to `apps/dejajs-www/public/screenshots/` with the naming convention:
```
{app}_{desktop|mobile}_{view-name}.png
```

## View Registry

### Throttle App (12 views, port 3041)

| Route | Screenshot Name | Description |
|-------|----------------|-------------|
| `/` | `throttle_{vp}_home` | Home / landing page |
| `/throttles` | `throttle_{vp}_throttle-list` | Throttle list view |
| `/throttle/:address` | `throttle_{vp}_throttle` | Individual loco control (dynamic, see step 3.6) |
| `/turnouts` | `throttle_{vp}_turnouts` | Turnout control view |
| `/routes` | `throttle_{vp}_routes` | Route management |
| `/effects` | `throttle_{vp}_effects` | Effects control |
| `/signals` | `throttle_{vp}_signals` | Signal management |
| `/conductor` | `throttle_{vp}_conductor` | Conductor layout view |
| `/locos` | `throttle_{vp}_roster` | Locomotive roster |
| `/connect` | `throttle_{vp}_connect` | Connection setup |
| `/settings` | `throttle_{vp}_settings` | App settings |
| `/programming` | `throttle_{vp}_programming` | DCC programming |

### Cloud App (22 views, port 3011)

**List views (11):**

| Route | Screenshot Name | Description |
|-------|----------------|-------------|
| `/` | `cloud_{vp}_dashboard` | Dashboard overview |
| `/locos` | `cloud_{vp}_roster` | Locomotive roster |
| `/turnouts` | `cloud_{vp}_turnouts` | Turnout configuration |
| `/routes` | `cloud_{vp}_routes` | Route configuration |
| `/effects` | `cloud_{vp}_effects` | Effects configuration |
| `/signals` | `cloud_{vp}_signals` | Signal wiring |
| `/sensors` | `cloud_{vp}_sensors` | Sensor management |
| `/sounds` | `cloud_{vp}_sounds` | Sound management |
| `/dccex` | `cloud_{vp}_dccex` | DCC-EX console |
| `/devices` | `cloud_{vp}_devices` | Device management |
| `/settings` | `cloud_{vp}_settings` | Settings |

**Add views (6):**

| Route | Screenshot Name | Description |
|-------|----------------|-------------|
| `/locos/new` | `cloud_{vp}_roster-add` | Add locomotive form |
| `/turnouts/new` | `cloud_{vp}_turnouts-add` | Add turnout form |
| `/routes/new` | `cloud_{vp}_routes-add` | Add route form |
| `/effects/new` | `cloud_{vp}_effects-add` | Add effect form |
| `/signals/new` | `cloud_{vp}_signals-add` | Add signal form |
| `/sensors/new` | `cloud_{vp}_sensors-add` | Add sensor form |

**Edit views (5 -- dynamic, see step 3.7):**

| Route | Screenshot Name | Description |
|-------|----------------|-------------|
| `/locos/:address` | `cloud_{vp}_roster-edit` | Edit locomotive |
| `/turnouts/:turnoutId` | `cloud_{vp}_turnouts-edit` | Edit turnout |
| `/routes/:routeId` | `cloud_{vp}_routes-edit` | Edit route |
| `/effects/:effectId` | `cloud_{vp}_effects-edit` | Edit effect |
| `/signals/:signalId` | `cloud_{vp}_signals-edit` | Edit signal |

### Monitor App (1 view, port 3021)

| Route | Screenshot Name | Description |
|-------|----------------|-------------|
| `/` | `monitor_{vp}_dashboard` | Monitor dashboard (mock data seeded, see step 3.5) |

Where `{vp}` = `desktop` or `mobile`.

## Output

After capturing, report:
- Number of screenshots captured
- List of files created/updated
- Any views that failed to render (with error details)

## Notes

- Screenshots replace existing files with the same name
- PNG format via Playwright MCP `browser_take_screenshot`
- Desktop viewport: 1280x800, Mobile viewport: 375x812
- Allow 2-3 seconds after navigation for Vue components to render
- Some views require `requireDccEx` or `requireLayout` guards -- DEMO_MODE bypasses all guards
- Monitor dashboard requires `window.__DEJA_MOCK__.seedAll()` call before capture (dev mode only)
- Dev server must be started via Bash before using Playwright tools (Playwright navigates to the running server)

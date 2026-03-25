---
name: capture-screenshots
description: Capture screenshots of DEJA.js app views using agent-browser CLI. Use when you need to take screenshots of app UI for documentation, changelogs, or PR descriptions. Trigger on "/capture-screenshots" or when asked to "take screenshots", "capture screenshots", or "update screenshots".
user_invocable: true
metadata:
  bashPattern: "agent-browser|screenshot"
---

# 📸 Capture Screenshots

Capture screenshots of DEJA.js app views using `agent-browser` CLI (headless Chrome via CDP).

## Prerequisites

- `.claude/launch.json` must exist (dev server configs)
- `.env` must be available in the working directory (copy if in worktree)
- `VITE_DEV_AUTO_LOGIN=true` should be set in `.env` for auth bypass, OR `CLAUDE_TEST_EMAIL` and `CLAUDE_TEST_PASSWORD` for real login
- `agent-browser` must be installed globally (`npm i -g agent-browser`)
- Chrome must be installed for agent-browser (`agent-browser install`)

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

Verify `agent-browser` is installed:
```bash
agent-browser --version || (echo "Installing agent-browser..." && npm i -g agent-browser && agent-browser install)
```

If in a git worktree (check if `.git` is a file, not a directory):
```bash
# Copy .env from preview worktree if not present (symlinks don't work reliably with Vite)
if [ ! -f .env ] && [ -f /Users/jmcdannel/TTT/worktrees/preview/.env ]; then
  cp /Users/jmcdannel/TTT/worktrees/preview/.env .env
fi
```

Ensure the screenshot output directory exists:
```bash
mkdir -p apps/dejajs-www/public/screenshots
```

### 2. Clear Vite Cache & Start Dev Server

Clear the Vite dependency optimization cache first to avoid stale module errors:
```bash
rm -rf apps/<app>/node_modules/.vite 2>/dev/null
```

Start the dev server using Bash:
```bash
pnpm --filter=<app-package-name> dev &
```

App package names and ports (from `.claude/launch.json`):
- `deja-throttle` → port 3041
- `deja-cloud` → port 3011
- `deja-monitor` → port 3021

Wait for the server to be ready (check with `curl -s -o /dev/null -w "%{http_code}" http://localhost:<port>`), then verify with agent-browser.

### 3. Open Browser & Verify Dev Server

Use a named session and dark mode (DEJA.js uses dark theme):
```bash
agent-browser --session deja-screenshots --color-scheme dark open http://localhost:<port>
agent-browser --session deja-screenshots wait --load networkidle
```

**Verify the page loads** before proceeding (do NOT skip this):
```bash
# Check Vue mounted (child elements in #app)
agent-browser --session deja-screenshots eval 'document.querySelector("#app")?.childElementCount > 0 ? "VUE_MOUNTED" : "NO_VUE"'

# Check for Vite error overlay
agent-browser --session deja-screenshots eval 'document.querySelector(".vite-error-overlay") ? "ERROR_OVERLAY" : "OK"'

# Take a quick verification screenshot
agent-browser --session deja-screenshots screenshot --annotate
```

If Vue fails to mount (`NO_VUE`), diagnose with:
```bash
# Check for module import errors
agent-browser --session deja-screenshots eval --stdin <<'EVALEOF'
new Promise((resolve) => {
  const s = document.createElement('script');
  s.type = 'module';
  s.textContent = `try { await import('/src/main.ts'); document.title = 'OK'; } catch(e) { document.title = 'ERR: ' + e.message; }`;
  document.head.appendChild(s);
  setTimeout(() => resolve(document.title), 3000);
})
EVALEOF
```

If the error mentions stale module paths (`.vite/deps/...`):
1. Close the browser: `agent-browser --session deja-screenshots close`
2. Clear Vite cache: `rm -rf apps/<app>/node_modules/.vite`
3. Restart dev server and retry (max 2 attempts)

### 4. Set Up App State

If `--layout` flag is provided, use that value. Otherwise read `LAYOUT_ID` from `.env`. Default layout for docs/marketing: `betatrack`.

Set localStorage values:
```bash
agent-browser --session deja-screenshots eval 'localStorage.setItem("@DEJA/layoutId", "<layout-id>")'
```

Reload to pick up the layout:
```bash
agent-browser --session deja-screenshots open http://localhost:<port>
agent-browser --session deja-screenshots wait --load networkidle
```

If using email/password login (not DEV_AUTO_LOGIN):
1. Navigate to `/login`:
   ```bash
   agent-browser --session deja-screenshots open http://localhost:<port>/login
   agent-browser --session deja-screenshots wait --load networkidle
   ```
2. Take a snapshot to discover form fields:
   ```bash
   agent-browser --session deja-screenshots snapshot -i
   ```
3. Fill and submit using refs from snapshot:
   ```bash
   agent-browser --session deja-screenshots fill @e<email_ref> "$CLAUDE_TEST_EMAIL"
   agent-browser --session deja-screenshots fill @e<password_ref> "$CLAUDE_TEST_PASSWORD"
   agent-browser --session deja-screenshots click @e<submit_ref>
   agent-browser --session deja-screenshots wait --load networkidle
   ```

### 4.5. Monitor Mock Data Seeding (monitor app only)

After auth and before capturing:
```bash
# Navigate and wait for mount
agent-browser --session deja-screenshots open http://localhost:3021
agent-browser --session deja-screenshots wait --load networkidle
agent-browser --session deja-screenshots wait 3000

# Seed all panes with mock data
agent-browser --session deja-screenshots eval 'window.__DEJA_MOCK__?.seedAll()'

# Wait for Vue reactivity to settle
agent-browser --session deja-screenshots wait 1000
```

### 4.6. Dynamic ID Resolution — Throttle Detail View

For `/throttle/:address`:
1. Navigate to `/throttles` first:
   ```bash
   agent-browser --session deja-screenshots open http://localhost:3041/throttles
   agent-browser --session deja-screenshots wait --load networkidle
   ```
2. Scrape available loco addresses:
   ```bash
   agent-browser --session deja-screenshots eval --stdin <<'EVALEOF'
   JSON.stringify(
     Array.from(document.querySelectorAll('a[href^="/throttle/"]'))
       .map(a => parseInt(a.getAttribute('href').split('/').pop()))
       .filter(n => !isNaN(n))
   )
   EVALEOF
   ```
3. Pick the first address that is not `3`, fallback to `3` if it is the only option
4. If no addresses are found, skip this screenshot and log a warning

### 4.7. Dynamic ID Resolution — Cloud Edit Views

For each cloud edit view (`/locos/:address`, `/turnouts/:turnoutId`, `/routes/:routeId`, `/effects/:effectId`, `/signals/:signalId`):
1. Navigate to the corresponding list view first
2. Scrape the first item link:
   ```bash
   agent-browser --session deja-screenshots eval 'document.querySelector("a[href^=\"/<entity>/\"]")?.getAttribute("href")'
   ```
   Replace `<entity>` with the actual entity path segment (e.g., `locos`, `turnouts`, `routes`, `effects`, `signals`).
3. Navigate to that href
4. If no items exist, skip the edit screenshot and log a warning

### 5. Capture Screenshots

For each view in the registry, capture at each requested viewport:

**Navigate and wait:**
```bash
agent-browser --session deja-screenshots open http://localhost:<port><route>
agent-browser --session deja-screenshots wait --load networkidle
agent-browser --session deja-screenshots wait 2000
```

**Verify page rendered** (skip to next view if blank):
```bash
agent-browser --session deja-screenshots eval 'document.querySelector("#app")?.childElementCount > 0 ? "OK" : "BLANK"'
```

**Desktop viewport (1280×800):**
```bash
agent-browser --session deja-screenshots set viewport 1280 800
agent-browser --session deja-screenshots screenshot apps/dejajs-www/public/screenshots/<name>_desktop_<view>.png
```

**Mobile viewport (375×812):**
```bash
agent-browser --session deja-screenshots set viewport 375 812
agent-browser --session deja-screenshots screenshot apps/dejajs-www/public/screenshots/<name>_mobile_<view>.png
```

### 6. Cleanup

Always close the browser session when done:
```bash
agent-browser --session deja-screenshots close
```

Kill the dev server background process:
```bash
# Find and kill the dev server process
kill %1 2>/dev/null || true
```

## View Registry

### Throttle App (12 views, port 3041)

| Route | Screenshot Name | Description |
|-------|----------------|-------------|
| `/` | `throttle_{vp}_home` | Home / landing page |
| `/throttles` | `throttle_{vp}_throttle-list` | Throttle list view |
| `/throttle/:address` | `throttle_{vp}_throttle` | Individual loco control (dynamic, see step 4.6) |
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

**Edit views (5 — dynamic, see step 4.7):**

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
| `/` | `monitor_{vp}_dashboard` | Monitor dashboard (mock data seeded, see step 4.5) |

Where `{vp}` = `desktop` or `mobile`.

## Output

After capturing, report:
- ✅ Number of screenshots captured
- 📁 List of files created/updated
- ⚠️ Any views that failed to render (with error details)
- 🧹 Confirmation that browser session was closed

## Notes

- Screenshots replace existing files with the same name
- PNG format via `agent-browser screenshot`
- Desktop viewport: 1280×800, Mobile viewport: 375×812
- Use `wait --load networkidle` after every navigation — this is more reliable than fixed timeouts
- Add `wait 2000` after networkidle for Vue reactivity to settle
- Some views require `requireDccEx` or `requireLayout` guards — `DEV_AUTO_LOGIN` bypasses all guards
- Monitor dashboard requires `window.__DEJA_MOCK__.seedAll()` call before capture (dev mode only)
- Dev server must be started via Bash before using agent-browser (it navigates to the running server)
- Always use `--session deja-screenshots` to avoid conflicts with other browser sessions
- Always use `--color-scheme dark` — DEJA.js apps use dark theme
- Always close the session when done to avoid leaked Chrome processes

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Vue never mounts (`#app` has 0 children) | Stale Vite dependency cache | `rm -rf apps/<app>/node_modules/.vite` and restart |
| `innerText` is empty but app renders | Vuetify uses shadow-like rendering | Check `#app.childElementCount` instead of `innerText` |
| Blank page, no error overlay | Module import failure (silent) | Use the diagnostic script in step 3 to catch the error |
| `agent-browser` command hangs | Browser session leaked from previous run | `agent-browser --session deja-screenshots close` then retry |
| Auth redirect to `/login` | `VITE_DEV_AUTO_LOGIN` not in `.env` | Verify `.env` has `VITE_DEV_AUTO_LOGIN=true` |
| Screenshots are white/light | Missing `--color-scheme dark` | Always pass `--color-scheme dark` on first `open` |
| Port already in use | Previous dev server still running | `kill $(lsof -ti :<port>)` then restart |

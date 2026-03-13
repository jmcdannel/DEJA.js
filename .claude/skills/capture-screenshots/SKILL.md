---
name: capture-screenshots
description: Capture screenshots of DEJA.js app views using Claude Preview MCP. Use when you need to take screenshots of app UI for documentation, changelogs, or PR descriptions. Trigger on "/capture-screenshots" or when asked to "take screenshots", "capture screenshots", or "update screenshots".
user_invocable: true
---

# Capture Screenshots

Capture screenshots of DEJA.js app views using Claude Preview MCP (headless Playwright).

## Prerequisites

- `.claude/launch.json` must exist (dev server configs)
- `.env` must be available in the working directory (symlink if in worktree)
- `VITE_DEV_AUTO_LOGIN=true` should be set in `.env` for auth bypass, OR `CLAUDE_TEST_EMAIL` and `CLAUDE_TEST_PASSWORD` for real login

## Usage

```
/capture-screenshots [app] [--views view1,view2] [--viewport desktop|mobile|both]
```

- `app`: throttle, cloud, monitor, or "all" (default: all)
- `--views`: comma-separated list of view names to capture (default: all views for the app)
- `--viewport`: desktop, mobile, or both (default: both)

## Procedure

### 1. Environment Setup

If in a git worktree (check if `.git` is a file, not a directory):
```bash
# Symlink .env from main repo if not present
if [ ! -f .env ] && [ -f /Users/jmcdannel/repos/DEJA.js/.env ]; then
  ln -sf /Users/jmcdannel/repos/DEJA.js/.env .env
fi
```

### 2. Start Dev Server

Use `preview_start` with the app name from `.claude/launch.json`:
- `preview_start({ name: "throttle" })` → port 3041
- `preview_start({ name: "cloud" })` → port 3011
- `preview_start({ name: "monitor" })` → port 3021

Wait for the server to be ready by checking `preview_logs`.

### 3. Set Up App State

Use `preview_eval` to set required localStorage values:
```javascript
localStorage.setItem('@DEJA/layoutId', '<LAYOUT_ID from .env>')
```

If using email/password login (not DEV_AUTO_LOGIN):
1. Navigate to `/login`
2. Use `preview_fill` to enter credentials
3. Use `preview_click` to submit
4. Wait for redirect

### 4. Capture Screenshots

For each view, navigate and capture:

1. Use `preview_eval` to navigate: `window.location.href = '<route>'`
2. Wait for the page to settle: `preview_eval({ expression: "await new Promise(r => setTimeout(r, 2000))" })`
3. For desktop viewport: `preview_resize({ preset: "desktop" })` then `preview_screenshot`
4. For mobile viewport: `preview_resize({ preset: "mobile" })` then `preview_screenshot`

### 5. Save Screenshots

Screenshots are saved to `apps/dejajs-www/public/screenshots/` using the naming convention:
```
{app}_{desktop|mobile}_{view-name}.png
```

## View Registry

### Throttle App (port 3041)

| Route | Screenshot Name | Description |
|-------|----------------|-------------|
| `/` | `throttle_{vp}_home` | Home / landing page |
| `/throttles` | `throttle_{vp}_throttle-list` | Throttle list view |
| `/turnouts` | `throttle_{vp}_turnouts` | Turnout control view |
| `/routes` | `throttle_{vp}_routes` | Route management |
| `/effects` | `throttle_{vp}_effects` | Effects control |
| `/signals` | `throttle_{vp}_signals` | Signal management |
| `/conductor` | `throttle_{vp}_conductor` | Conductor layout view |
| `/locos` | `throttle_{vp}_roster` | Locomotive roster |
| `/connect` | `throttle_{vp}_connect` | Connection setup |
| `/settings` | `throttle_{vp}_settings` | App settings |

### Cloud App (port 3011)

| Route | Screenshot Name | Description |
|-------|----------------|-------------|
| `/` | `cloud_{vp}_dashboard` | Dashboard overview |
| `/locos` | `cloud_{vp}_roster` | Locomotive roster management |
| `/turnouts` | `cloud_{vp}_turnouts` | Turnout configuration |
| `/routes` | `cloud_{vp}_routes` | Route configuration |
| `/effects` | `cloud_{vp}_effects` | Effects configuration |
| `/signals` | `cloud_{vp}_signals` | Signal wiring |
| `/sensors` | `cloud_{vp}_sensors` | Sensor management |
| `/dccex` | `cloud_{vp}_dccex` | DCC-EX console |
| `/devices` | `cloud_{vp}_devices` | Device management |
| `/settings` | `cloud_{vp}_settings` | Settings |

### Monitor App (port 3021)

| Route | Screenshot Name | Description |
|-------|----------------|-------------|
| `/` | `monitor_{vp}_dashboard` | Monitor dashboard |
| `/settings` | `monitor_{vp}_settings` | Monitor settings |

Where `{vp}` = `desktop` or `mobile`.

## Output

After capturing, report:
- Number of screenshots captured
- List of files created/updated
- Any views that failed to render (with error details)

## Notes

- Screenshots replace existing files with the same name
- JPEG format (Claude Preview default) — compressed for web
- Desktop viewport: 1280x800, Mobile viewport: 375x812
- Allow 2-3 seconds after navigation for Vue components to render
- Some views require `requireDccEx` or `requireLayout` guards — DEV_AUTO_LOGIN bypasses all guards

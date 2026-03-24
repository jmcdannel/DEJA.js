---
name: worktree-dev-setup
description: Launch a dev server inside a Claude git worktree. Handles copying .env and installing node_modules before starting the server. Use this whenever starting any dev server while working in a Claude worktree (path contains .claude/worktrees/ or worktrees/). Trigger on "/worktree-dev-setup" or when asked to "start dev server", "run dev", "launch app" in a worktree context.
user_invocable: true
---

# Worktree Dev Setup

Sets up a git worktree for development by **copying** `.env` and running `pnpm install`, then starts the requested dev server.

## Why This Is Needed

Git worktrees are isolated checkouts. They share the same `package.json`, `pnpm-workspace.yaml`, and `pnpm-lock.yaml` (all tracked in git), but **do not inherit**:

- `.env` — must be **copied** (not symlinked) from the preview worktree
- `node_modules/` — must be installed via `pnpm install` (symlinks don't work with pnpm's per-package virtual store)

## Usage

```
/worktree-dev-setup [app]
```

- `app` (optional): throttle, cloud, monitor, server, www, tour — starts only that app
- No `app` argument: starts all apps via `pnpm dev`

## Procedure

### Step 1 — Detect Preview Worktree

The canonical `.env` lives in the `preview` worktree:

```bash
PREVIEW=/Users/jmcdannel/TTT/worktrees/preview
```

Verify it exists: `ls "$PREVIEW/.env"`

### Step 2 — Copy `.env` (NOT symlink)

**IMPORTANT:** Symlinks to `.env` don't load reliably in worktrees. Always **copy** the file.

Copy `.env` to the worktree root AND into each app directory you plan to run:

```bash
# Root copy (for Turborepo cache hashing)
cp "$PREVIEW/.env" .env

# App-level copies (Vite reads .env from the app directory, not monorepo root)
cp "$PREVIEW/.env" apps/throttle/.env
cp "$PREVIEW/.env" apps/cloud/.env
cp "$PREVIEW/.env" apps/monitor/.env
# Add more as needed for other apps
```

### Step 3 — Install `node_modules/`

**IMPORTANT:** Symlinks to `node_modules/` don't work with pnpm's per-package virtual store. Always run `pnpm install`.

```bash
if [ ! -d node_modules ]; then
  pnpm install --frozen-lockfile
  echo "✅ Installed node_modules"
else
  echo "✅ node_modules already present"
fi
```

This takes ~20 seconds with a warm pnpm store.

### Step 4 — Start Dev Server

Start the app (or all apps if no app specified):

```bash
# Single app (use --port to avoid collisions with other worktrees)
pnpm --filter=<pnpm-filter-name> dev --port <unique-port>

# All apps
pnpm dev
```

## App Reference

| App name | pnpm filter | Default port | Notes |
|----------|------------|------|-------|
| throttle | `deja-throttle` | 3041 | Primary train control UI |
| cloud | `deja-cloud` | 5174 | Layout management UI |
| monitor | `deja-monitor` | 3021 | System monitoring dashboard |
| tour | — | 3031 | Interactive tour/effects |
| server | `deja-serverts` | 8082 | WebSocket + serial bridge |
| www | `dejajs-www` | 3051 | Documentation site |

## Verification

After setup, confirm `.env` files exist (as regular files, not symlinks):

```bash
ls -la .env apps/throttle/.env
# Should show regular files, NOT symlinks
```

The dev server should start without "Cannot find module" or "invalid-api-key" errors.

---
name: worktree-dev-setup
description: Launch a dev server inside a Claude git worktree. Handles symlinking .env and node_modules from the main repo before starting the server. Use this whenever starting any dev server while working in a Claude worktree (path contains .claude/worktrees/). Trigger on "/worktree-dev-setup" or when asked to "start dev server", "run dev", "launch app" in a worktree context.
user_invocable: true
---

# Worktree Dev Setup

Sets up a Claude git worktree for development by symlinking `.env` and `node_modules/` from the main repo, then starts the requested dev server.

## Why This Is Needed

Claude worktrees live at `.claude/worktrees/<name>/` and are isolated git checkouts. They share the same `package.json`, `pnpm-workspace.yaml`, and `pnpm-lock.yaml` (all tracked in git), but **do not inherit**:

- `.env` — must be symlinked from the main repo
- `node_modules/` — must be symlinked from the main repo (2.2 GB, takes 2+ min to reinstall)

## Usage

```
/worktree-dev-setup [app]
```

- `app` (optional): throttle, cloud, monitor, server, www, tour — starts only that app
- No `app` argument: starts all apps via `pnpm dev`

## Procedure

### Step 1 — Detect Main Repo

Run this to get the main repo root dynamically (works in any worktree):

```bash
MAIN_REPO=$(dirname "$(git rev-parse --git-common-dir)")
```

Verify it resolves to the main DEJA.js directory (not the worktree itself). If `git rev-parse --git-common-dir` returns a path ending in `.git` rather than `.git/worktrees/...`, you may not be in a worktree — that's fine, skip to Step 4.

### Step 2 — Symlink `.env`

```bash
if [ ! -f .env ] && [ ! -L .env ]; then
  if [ -f "$MAIN_REPO/.env" ]; then
    ln -sf "$MAIN_REPO/.env" .env
    echo "✓ Symlinked .env from $MAIN_REPO"
  else
    echo "⚠ No .env found in $MAIN_REPO — create it from .env.example and configure"
    exit 1
  fi
else
  echo "✓ .env already present"
fi
```

### Step 3 — Symlink `node_modules/`

```bash
if [ ! -d node_modules ] && [ ! -L node_modules ]; then
  if [ -d "$MAIN_REPO/node_modules" ]; then
    ln -sf "$MAIN_REPO/node_modules" node_modules
    echo "✓ Symlinked node_modules from $MAIN_REPO"
  else
    echo "⚠ No node_modules in $MAIN_REPO — running pnpm install (this will take a few minutes)"
    pnpm install
  fi
else
  echo "✓ node_modules already present"
fi
```

### Step 4 — Start Dev Server

Start the app (or all apps if no app specified):

```bash
# Single app
pnpm --filter=<pnpm-filter-name> dev

# All apps
pnpm dev
```

## App Reference

| App name | pnpm filter | Port | Notes |
|----------|------------|------|-------|
| throttle | `deja-throttle` | 3041 | Primary train control UI |
| cloud | `deja-cloud` | 5174 | Layout management UI |
| monitor | `deja-monitor` | 3021 | System monitoring dashboard |
| tour | — | 3031 | Interactive tour/effects |
| server | `deja-serverts` | 8082 | WebSocket + serial bridge |
| www | `dejajs-www` | 3051 | Documentation site |

## Verification

After setup, confirm symlinks exist:

```bash
ls -la .env node_modules
# .env -> /Users/.../DEJA.js/.env
# node_modules -> /Users/.../DEJA.js/node_modules
```

The dev server should start without "Cannot find module" errors.

# /worktree-dev-setup

Set up a git worktree for development by copying `.env` files and symlinking `node_modules/` from the `preview` worktree, then optionally starting the dev server.

## Arguments

`$ARGUMENTS` — optional app name to start after setup (e.g. `cloud`, `throttle`, `storybook`). If omitted, just sets up env and deps without starting a server.

## Context

Git worktrees don't inherit `.env` or `node_modules/`. The canonical `.env` files live in the **preview** worktree at `/Users/jmcdannel/TTT/DEJA.js.git/preview/`. This command copies them (not symlinks — Vite can't reliably read symlinked env files) and symlinks `node_modules/` to avoid re-installing.

> **Repo layout:** This is a bare-repo + sibling-worktrees setup. Bare repo: `/Users/jmcdannel/TTT/DEJA.js.git/.bare`. Each worktree is a sibling directory (e.g. `/Users/jmcdannel/TTT/DEJA.js.git/main`, `/preview`, `/io-build-fix`).

## Steps

### 1. Detect worktree root and preview path

- Current worktree root: run `git rev-parse --show-toplevel`
- Preview worktree: `/Users/jmcdannel/TTT/DEJA.js.git/preview`
- If the current directory IS the preview worktree, abort with: "You're already in the preview worktree — no setup needed."

### 2. Copy `.env` files from preview

Copy `.env` and `.env.local` (if they exist) from preview into the **current worktree**, at both:
- The monorepo root (for Turborepo)
- Each `apps/*/` directory that has a corresponding env file in preview

**Important rules:**
- **Copy** files, do NOT symlink — symlinks fail to load reliably with Vite
- Only copy if the file exists in preview — don't create empty env files
- Don't overwrite if the worktree already has the file (ask first)
- Copy `.env`, `.env.local` — but NOT `.env.example` (that's already in git)

### 3. Symlink `node_modules/`

For the **root** `node_modules/` and each `apps/*/node_modules/` and `packages/*/node_modules/`:
- If `node_modules/` already exists in the worktree, skip it
- If the corresponding `node_modules/` exists in preview, create a symlink: `ln -s <preview_path>/node_modules <worktree_path>/node_modules`

This avoids a full `pnpm install` which can take minutes.

### 4. Verify setup

Run a quick check:
- Confirm root `node_modules/` exists (or is symlinked)
- Confirm at least one `.env` file was copied
- Report what was done

### 5. Start dev server (if app argument provided)

If `$ARGUMENTS` is provided:
- `storybook` → `cd packages/ui && pnpm storybook`
- `cloud` → `pnpm --filter=deja-cloud dev`
- `throttle` → `pnpm --filter=deja-throttle dev`
- `monitor` → `pnpm --filter=deja-monitor dev`
- `server` → `pnpm --filter=deja-serverts dev`
- `tour` → `pnpm --filter=deja-tour dev`
- `all` → `pnpm dev`

If no argument, just report: "✅ Worktree ready! Run `pnpm dev` or `pnpm --filter=<app> dev` to start."

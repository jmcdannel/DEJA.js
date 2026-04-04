# 🚂 Move CLI + TUI to `apps/cli`

**Date:** 2026-04-03
**Status:** Proposed

---

## Problem

The `scripts/` directory contains two unrelated concerns: the user-facing CLI + TUI (distributed via GitHub Releases) and internal dev scripts (screenshots, migrations, layout switching). This makes the directory confusing and couples unrelated dependencies.

## Solution

Move the CLI + TUI into `apps/cli/` as a proper monorepo app. Keep dev scripts in `scripts/` without a package.json.

## What Moves

| From | To |
|---|---|
| `scripts/deja` | `apps/cli/deja` |
| `scripts/deja-ui-ink.mjs` | `apps/cli/deja-ui-ink.mjs` |
| `scripts/tui/` (34 files) | `apps/cli/tui/` |

## What Stays in `scripts/`

- `switch-layout.sh` — dev layout switcher
- `capture-screenshots.mjs` — Playwright screenshot capture
- `push-promo.ts` — promotional content management
- `migrate-users-to-plans.ts` — one-time migration
- `demo/` — demo Firestore seeding

## New File: `apps/cli/package.json`

```json
{
  "name": "deja-cli",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "dependencies": {
    "figlet": "^1.7.0",
    "firebase-admin": "^13.4.0",
    "ink": "^5.1.0",
    "react": "^18.3.1"
  }
}
```

## Removed: `scripts/package.json`

- Delete `scripts/package.json` and `scripts/node_modules/`
- Move `playwright` dep to root `devDependencies`
- Remove `"scripts"` from `pnpm-workspace.yaml`

## References to Update

| File | Change |
|---|---|
| `package.json` (root) | `"deja"` script: `bash scripts/deja.sh` → `bash apps/cli/deja` |
| `package.json` (root) | Add `playwright` to `devDependencies` |
| `pnpm-workspace.yaml` | Remove `"scripts"` entry |
| `install.sh` | Dev-mode paths: `scripts/deja` → `apps/cli/deja`, `scripts/tui` → `apps/cli/tui`, `scripts/deja-ui-ink.mjs` → `apps/cli/deja-ui-ink.mjs` |
| `.github/workflows/release-server.yml` | Upload path: `scripts/deja` → `apps/cli/deja` |
| `CLAUDE.md` | No change needed (references `pnpm deja` command, not file paths) |
| `README.md` / `CONTRIBUTING.md` | No change needed (same reason) |

## No Internal Changes Needed

- `scripts/deja` uses `script_dir` to resolve paths — since `deja-ui-ink.mjs` and `tui/` move alongside it, the relative references continue to work
- `deja-ui-ink.mjs` imports `./tui/App.mjs` — still works after move
- TUI internal imports are all relative — unaffected

## Out of Scope

- Renaming the `deja-cli` package
- Converting CLI from bash to TypeScript
- Any functional changes to the CLI or TUI

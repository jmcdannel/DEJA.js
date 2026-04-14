# Move CLI + TUI to `apps/cli` — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the user-facing CLI + TUI from `scripts/` into `apps/cli/` as a proper monorepo app, keeping dev scripts in `scripts/`.

**Architecture:** Git-move the CLI bash script, TUI entry point, and full TUI directory into `apps/cli/`. Create a new `package.json` for the CLI app. Remove `scripts/` as a workspace package, move its playwright dep to root devDeps. Update all external references (root package.json, install.sh, CI workflow, pnpm-workspace.yaml).

**Tech Stack:** bash, pnpm workspaces, git

---

### Task 1: Move CLI + TUI files to `apps/cli/`

**Files:**
- Move: `scripts/deja` → `apps/cli/deja`
- Move: `scripts/deja-ui-ink.mjs` → `apps/cli/deja-ui-ink.mjs`
- Move: `scripts/tui/` → `apps/cli/tui/`

- [ ] **Step 1: Create `apps/cli/` directory**

```bash
mkdir -p apps/cli
```

- [ ] **Step 2: Git-move CLI files**

```bash
git mv scripts/deja apps/cli/deja
git mv scripts/deja-ui-ink.mjs apps/cli/deja-ui-ink.mjs
git mv scripts/tui apps/cli/tui
```

- [ ] **Step 3: Verify files moved correctly**

```bash
ls apps/cli/
```

Expected: `deja`, `deja-ui-ink.mjs`, `tui/`

```bash
ls apps/cli/tui/
```

Expected: `App.mjs`, `commands/`, `components/`, `hooks/`, `lib/`

---

### Task 2: Create `apps/cli/package.json`

**Files:**
- Create: `apps/cli/package.json`

- [ ] **Step 1: Create package.json**

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

---

### Task 3: Remove `scripts/` as a workspace package

**Files:**
- Delete: `scripts/package.json`
- Delete: `scripts/node_modules/` (entire directory)
- Modify: `pnpm-workspace.yaml`
- Modify: `package.json` (root) — add playwright to devDependencies

- [ ] **Step 1: Check playwright version from scripts/package.json**

`scripts/package.json` has `"playwright": "^1.44.0"`.

- [ ] **Step 2: Delete `scripts/package.json`**

```bash
git rm scripts/package.json
```

- [ ] **Step 3: Delete `scripts/node_modules/`**

```bash
rm -rf scripts/node_modules
```

- [ ] **Step 4: Remove `"scripts"` from `pnpm-workspace.yaml`**

Before:
```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "scripts"
  - "io"
```

After:
```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "io"
```

- [ ] **Step 5: Add playwright to root devDependencies**

In root `package.json`, add to `devDependencies`:
```json
"playwright": "^1.44.0"
```

---

### Task 4: Update root `package.json` script

**Files:**
- Modify: `package.json` (root)

- [ ] **Step 1: Update `"deja"` script path**

Before:
```json
"deja": "bash scripts/deja.sh",
```

After:
```json
"deja": "bash apps/cli/deja",
```

---

### Task 5: Update `install.sh` dev-mode paths

**Files:**
- Modify: `install.sh` (lines 392–399)

- [ ] **Step 1: Update CLI copy path**

Before (line 392):
```bash
cp "${repo_dir}/scripts/deja" "${DEJA_BIN}/deja"
```

After:
```bash
cp "${repo_dir}/apps/cli/deja" "${DEJA_BIN}/deja"
```

- [ ] **Step 2: Update TUI copy paths**

Before (lines 396–398):
```bash
if [ -d "${repo_dir}/scripts/tui" ]; then
  cp -r "${repo_dir}/scripts/tui" "${DEJA_BIN}/"
  [ -f "${repo_dir}/scripts/deja-ui-ink.mjs" ] && cp "${repo_dir}/scripts/deja-ui-ink.mjs" "${DEJA_BIN}/"
fi
```

After:
```bash
if [ -d "${repo_dir}/apps/cli/tui" ]; then
  cp -r "${repo_dir}/apps/cli/tui" "${DEJA_BIN}/"
  [ -f "${repo_dir}/apps/cli/deja-ui-ink.mjs" ] && cp "${repo_dir}/apps/cli/deja-ui-ink.mjs" "${DEJA_BIN}/"
fi
```

---

### Task 6: Update CI workflow

**Files:**
- Modify: `.github/workflows/release-server.yml` (line 74)

- [ ] **Step 1: Update CLI upload path**

Before (line 74):
```yaml
--data-binary "@scripts/deja" \
```

After:
```yaml
--data-binary "@apps/cli/deja" \
```

Note: Line 82 (`@scripts/install.sh`) is a pre-existing bug — `install.sh` lives at the repo root, not in `scripts/`. Out of scope for this change.

---

### Task 7: Run `pnpm install` and verify

- [ ] **Step 1: Run pnpm install to update lockfile**

```bash
pnpm install
```

Expected: resolves `deja-cli` as a new workspace package, removes `deja-scripts`.

- [ ] **Step 2: Verify `pnpm deja --help` still works**

```bash
pnpm deja -- --help
```

Expected: CLI help output renders correctly.

- [ ] **Step 3: Verify `scripts/` dev commands still work**

```bash
pnpm layout
```

Expected: Shows current LAYOUT_ID.

---

### Task 8: Commit

- [ ] **Step 1: Stage all changes**

```bash
git add apps/cli/ pnpm-workspace.yaml package.json install.sh .github/workflows/release-server.yml
git status
```

- [ ] **Step 2: Commit**

```bash
git commit -m "refactor: move CLI + TUI from scripts/ to apps/cli/

Separates user-facing CLI (distributed via GitHub Releases) from
internal dev scripts. Creates apps/cli as a proper monorepo app
with its own package.json. Removes scripts/ as a workspace package
and moves playwright dep to root devDependencies."
```

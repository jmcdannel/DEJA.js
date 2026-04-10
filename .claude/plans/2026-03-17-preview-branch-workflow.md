# Preview Branch Workflow Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `preview` branch as a persistent staging environment so feature PRs merge to `preview` first, staging domains auto-update via CI, and only `preview → main` PRs trigger release gates.

**Architecture:** One new GitHub Actions workflow (`staging.yml`) auto-aliases staging domains on push to `preview`. Three existing files updated: `CLAUDE.md` (workflow docs), `commit-push-pr.md` (base branch logic), `stage-pr.md` (fix comment + auto-staging note). No application code changes.

**Tech Stack:** GitHub Actions, Vercel CLI, Vercel REST API, bash, GitHub CLI (`gh`)

**Spec:** `docs/superpowers/specs/2026-03-17-preview-branch-workflow-design.md`

---

## File Map

| Action | File | What changes |
|---|---|---|
| Create | `.github/workflows/staging.yml` | New CI job: poll Vercel + alias staging domains on push to `preview` |
| Modify | `CLAUDE.md` | Development Workflow section (~lines 123–161): reflect new feature→preview→main flow |
| Modify | `.claude/commands/commit-push-pr.md` | Add context-aware `--base` logic (3 cases) |
| Modify | `.claude/commands/stage-pr.md` | Fix comment on line 39; add auto-staging note |

---

## Task 1: Create `staging.yml` GitHub Actions workflow

**Files:**
- Create: `.github/workflows/staging.yml`

- [ ] **Step 1: Create the workflow file**

```yaml
# .github/workflows/staging.yml
name: Update Staging Domains

on:
  push:
    branches: [preview]

jobs:
  stage:
    runs-on: ubuntu-latest
    steps:
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Vercel CLI
        run: npm install -g vercel@latest

      - name: Poll for ready deployments and alias staging domains
        # Vercel builds for a Turborepo monorepo typically take 2–4 minutes.
        # We poll per-project (each with its own timeout) and capture the deployment URL
        # in the same step to avoid a second API call in the alias step.
        shell: bash
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: |
          TEAM="jmcdannels-projects"
          BRANCH="preview"
          MAX_WAIT=300   # 5 minutes per project
          INTERVAL=15

          # NOTE: If staging.dejajs.com fails to alias, verify the website project name.
          # The /stage-pr skill is the source of truth. It may be `dejajs-website` or `deja-js-www`.
          declare -A DOMAINS=(
            ["deja-js-throttle"]="staging-throttle.dejajs.com"
            ["deja-js-cloud"]="staging-cloud.dejajs.com"
            ["deja-js-monitor"]="staging-monitor.dejajs.com"
            ["dejajs-website"]="staging.dejajs.com"
          )

          for PROJECT in "${!DOMAINS[@]}"; do
            DOMAIN="${DOMAINS[$PROJECT]}"
            ELAPSED=0   # reset per project so each gets its own full timeout window
            DEPLOYMENT_URL=""

            echo "Waiting for $PROJECT to be ready..."
            while [ $ELAPSED -lt $MAX_WAIT ]; do
              DEPLOYMENT_URL=$(curl -s \
                "https://api.vercel.com/v6/deployments?projectId=${PROJECT}&meta-gitBranch=${BRANCH}&limit=1&target=preview&teamId=${TEAM}" \
                -H "Authorization: Bearer $VERCEL_TOKEN" \
                | jq -r '.deployments[0] | select(.readyState == "READY") | .url // empty')

              if [ -n "$DEPLOYMENT_URL" ]; then
                echo "$PROJECT is ready at $DEPLOYMENT_URL"
                break
              fi

              sleep $INTERVAL
              ELAPSED=$((ELAPSED + INTERVAL))
            done

            if [ -z "$DEPLOYMENT_URL" ]; then
              echo "Timed out waiting for $PROJECT — skipping alias"
              continue
            fi

            # Use the URL from polling directly — avoids a second API call and race conditions
            echo "Aliasing $DOMAIN -> $DEPLOYMENT_URL"
            vercel alias "$DEPLOYMENT_URL" "$DOMAIN" --scope "$TEAM" --token "$VERCEL_TOKEN"
          done

          echo ""
          echo "Staging domains updated:"
          echo "  https://staging-throttle.dejajs.com"
          echo "  https://staging-cloud.dejajs.com"
          echo "  https://staging-monitor.dejajs.com"
          echo "  https://staging.dejajs.com"

          # Note: merging main back into preview (sync step) also triggers this workflow.
          # That re-aliasing is harmless — staging domains will correctly reflect preview.
```

- [ ] **Step 2: Verify the file is valid YAML**

```bash
cat .github/workflows/staging.yml
```

Confirm: no tab characters in indentation, all `${{ }}` expressions properly quoted.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/staging.yml
git commit -m "ci: add staging.yml to auto-alias staging domains on push to preview"
```

---

## Task 2: Update `/commit-push-pr` skill — context-aware base branch

**Files:**
- Modify: `.claude/commands/commit-push-pr.md`

The current file has no `--base` flag on `gh pr create`. We need to add three-case logic before step 7.

- [ ] **Step 1: Add base branch detection to the skill**

Replace step 7 in `.claude/commands/commit-push-pr.md` with:

```markdown
7. Determine the PR base branch before creating the pull request:
   - Check the current branch name: `git rev-parse --abbrev-ref HEAD`
   - **Case 1 — current branch is `preview`:** use `--base main` (this is a release PR)
   - **Case 2 — current branch is a feature branch** (anything except `preview`, `main`, or `claude/*`): use `--base preview` (this is a feature PR targeting staging)
   - **Case 3 — current branch is a worktree branch** (matches `claude/*` or similar auto-generated patterns): ask the user: "This branch looks like a worktree branch. Should this PR target `preview` (feature) or `main` (release)?" and use their answer.

8. Create a pull request using `gh`:
   ```bash
   gh pr create --title "<commit message>" --body "<summary of changes>" --base <determined above>
   ```
   - The PR body should include: what changed, why, and any testing notes.
   - If a PR already exists for this branch, output the existing PR URL instead.
```

Full updated file content:

```markdown
# /commit-push-pr

Stage all changes, create a descriptive commit, push to the current branch, and open a pull request.

## Arguments

`$ARGUMENTS` — optional short hint about what changed (e.g. "fix throttle slider", "add tour effects"). If not provided, infer the message from the diff.

## Steps

1. Run `git status` to see what has changed.
2. Run `git diff --stat HEAD` to understand the scope of the changes.
3. Stage all tracked and untracked files relevant to the current work:
   ```bash
   git add -A
   ```
4. Write a clear commit message:
   - First line: imperative mood, ≤72 chars (e.g. "Fix throttle slider regression in mobile view")
   - If `$ARGUMENTS` was provided, use it as the starting point
   - Reference the affected app or package if helpful (e.g. `[throttle]`, `[server]`, `[cloud]`)
5. Commit:
   ```bash
   git commit -m "<message>"
   ```
6. Push to the current branch:
   ```bash
   git push -u origin HEAD
   ```
7. Determine the PR base branch:
   - Check the current branch name: `git rev-parse --abbrev-ref HEAD`
   - **Case 1 — current branch is `preview`:** use `--base main` (release PR promoting staging to production)
   - **Case 2 — current branch is a feature branch** (anything except `preview`, `main`, or `claude/*`): use `--base preview` (feature PR targeting staging)
   - **Case 3 — current branch matches `claude/*`** (worktree branch): ask the user: "This looks like a worktree branch. Should this PR target `preview` (feature) or `main` (release)?" — use their answer.

8. Create a pull request using `gh`:
   ```bash
   gh pr create --title "<commit message>" --body "<summary of changes>" --base <determined above>
   ```
   - The PR body should include: what changed, why, and any testing notes.
   - If a PR already exists for this branch, output the existing PR URL instead.

## Notes

- Run `pnpm lint && pnpm check-types` first if you haven't already — use `/verify-changes` for a full check.
- Never force-push to `main` or `master`.
- If the push fails due to a network error, retry up to 3 times with a short wait between attempts.
- **For feature work:** PRs target `preview` (staging). Only `preview → main` PRs are release PRs.
- **For releases:** Run `/update-docs` and `/changelog` on the `preview` branch before creating the `preview → main` PR.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/commands/commit-push-pr.md
git commit -m "feat: update commit-push-pr skill with context-aware base branch detection"
```

---

## Task 3: Update `/stage-pr` skill — fix comment + auto-staging note

**Files:**
- Modify: `.claude/commands/stage-pr.md`

Two changes:
1. Fix the misleading comment at lines 35–39 (`deja-js-www` → `dejajs-website`). Note: the loop body at lines 44 and 67–72 already uses `dejajs-website` correctly — only the comment header needs fixing, not the loop.
2. Add a note at the top about auto-staging on push to `preview`

- [ ] **Step 1: Fix the comment and add auto-staging note**

In `.claude/commands/stage-pr.md`, change only the comment line (NOT the loop):

```bash
# deja-js-www       → staging.dejajs.com
```

to:

```bash
# dejajs-website    → staging.dejajs.com
```

Also add at the top of the file, after the first paragraph, the following note block:

```markdown
> **Auto-staging:** Staging domains now automatically update on every push to the `preview` branch via the `staging.yml` GitHub Actions workflow. Use this command when you need to point staging to a **specific feature branch** for early review before it merges to `preview`.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/commands/stage-pr.md
git commit -m "docs: fix stage-pr project name comment; add auto-staging note"
```

---

## Task 4: Update `CLAUDE.md` — Development Workflow section

**Files:**
- Modify: `CLAUDE.md` (lines ~123–161, Development Workflow section)

Replace the current Development Workflow section with the new two-phase flow.

- [ ] **Step 1: Locate the section boundaries**

The section starts at: `## Development Workflow` (~line 123)
The section ends at the `---` before `## Distribution & Build (Private)` (~line 163)

- [ ] **Step 2: Replace the Development Workflow section**

Replace from `## Development Workflow` through the `---` separator with:

```markdown
## Development Workflow

### Feature branch → preview (day-to-day development)

1. **Plan before coding** — Use Plan Mode (Shift+Tab twice) for non-trivial changes
2. **Lint and type-check before committing** — run `pnpm lint && pnpm check-types`
3. **Use the `/verify-changes` slash command** to confirm nothing is broken
4. **Use the `/commit-push-pr` slash command** — PR targets `preview` automatically (not `main`)
5. CI runs `claude-code-review` only — no changeset or docs required for feature PRs
6. Staging domains auto-update 3–6 minutes after merge (via `staging.yml` CI job)

### preview → main (releasing to production)

When the `preview` branch has been tested on staging and is ready to ship:

1. **Update docs if UI changed** — run `/update-docs` to capture screenshots and update MDX docs
2. **Create a changeset entry** — run `/changelog` on the `preview` branch (see below)
3. **Use the `/commit-push-pr` slash command** — detects `preview` branch and targets `main`
4. CI runs `changeset-check` + `docs-check` + `claude-code-review` — all must pass
5. Merge → production Vercel deploy + changelog bot processes all accumulated changesets

### After merging preview → main — sync back

After each merge to `main` (including the changelog bot's automated commit), sync `main` back into `preview`:

```bash
git checkout preview
git merge main
git push
```

This keeps `preview` in sync with the changelog bot's cleanup commits. Use `/resolve-conflicts` if merge conflicts arise.

### Staging Domains

After merging to `preview`, the following staging URLs automatically reflect the latest build:

| App | Staging URL |
|---|---|
| Throttle | https://staging-throttle.dejajs.com |
| Cloud | https://staging-cloud.dejajs.com |
| Monitor | https://staging-monitor.dejajs.com |
| Website | https://staging.dejajs.com |

Use `/stage-pr <branch>` to manually point staging to a specific feature branch for early review.

### Changeset Requirement

**Changesets are required on `preview → main` PRs only.** Feature PRs to `preview` do not need changesets.

Changesets accumulate on the `preview` branch across multiple feature merges. When you run `/changelog` before the release PR, it captures all unreleased changes at once.

To create a changeset:
- Run `/changelog` in Claude Code — it analyzes the branch diff and creates the file automatically
- Or run `pnpm changeset` interactively
- Or create a file manually in `.changeset/` (see `.changeset/README.md` for format)

**What if there are no user-facing changes?** Still create a changeset — use `patch` bump and describe the internal change (e.g., `changed: **[docs]** Update README`, `improved: **[ci]** Add caching to build workflow`).

### Screenshot & Documentation Updates

When UI changes are made, update screenshots and MDX docs **before the `preview → main` PR**:

- Run `/capture-screenshots [app]` to capture fresh screenshots of app views
- Run `/update-docs` to auto-detect changed apps, capture screenshots, and update MDX docs
- The CI `docs-check` workflow will block the `preview → main` PR if UI files changed without updated docs

**Screenshots** are saved to `apps/dejajs-www/public/screenshots/` using the naming convention `{app}_{desktop|mobile}_{view-name}.png`.

**MDX docs** live in `docs/apps/{app}/overview.mdx` and are synced to the `dejajs-www` docs site at build time.

**Dev auto-login:** Set `VITE_DEMO_MODE=true` in `.env` to enable demo mode, which bypasses auth guards during screenshot capture. Only works in dev mode.

**Test user login:** Alternatively, set `VITE_DEMO_EMAIL` and `VITE_DEMO_PASSWORD` in `.env` for realistic email/password login during automated testing and demo mode.

**Worktree env setup:** Git worktrees don't inherit `.env`. Symlink it: `ln -sf /path/to/DEJA.js/.env .env`

---
```

- [ ] **Step 3: Verify the section looks correct**

```bash
grep -n "Development Workflow\|preview\|changeset\|staging" CLAUDE.md | head -40
```

Confirm: new two-phase workflow is present; old "Every PR must include a changeset" blanket rule is gone; staging domain table is visible.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md development workflow for preview branch process"
```

---

## Task 5: Add `VERCEL_TOKEN` to GitHub Secrets (manual — cannot be automated)

This step requires browser access to GitHub. It cannot be done via CLI.

- [ ] **Step 1: Generate a Vercel Personal Access Token**

1. Go to https://vercel.com/account/tokens
2. Click **Create Token**
3. Name: `github-actions-staging`
4. Scope: `jmcdannels-projects` team
5. Expiration: No expiration (or 1 year)
6. Copy the token immediately — it won't be shown again

- [ ] **Step 2: Add to GitHub repository secrets**

1. Go to the DEJA.js GitHub repo → **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Name: `VERCEL_TOKEN`
4. Value: paste the token from Step 1
5. Save

- [ ] **Step 3: Note in plan (no commit needed)**

Record: `VERCEL_TOKEN` is now set. The `staging.yml` workflow will use it.

---

## Task 5b: Configure Branch Protection (manual — requires GitHub browser access)

- [ ] **Step 1: Configure `preview` branch protection**

1. Go to GitHub repo → **Settings → Branches → Add branch ruleset** (or classic rule)
2. Branch name pattern: `preview`
3. Enable: **Require a pull request before merging**
4. Enable: **Require status checks to pass** → add `claude-code-review` as required
5. Enable: **Do not allow bypassing the above settings** — unchecked (allow admins to bypass)
6. Save

- [ ] **Step 2: Configure `main` branch protection**

1. Add ruleset for `main`
2. Enable: **Require a pull request before merging**
3. Enable: **Require status checks to pass** → add `changeset-check` and `docs-check`
4. Enable: **Restrict who can push directly** — but add a bypass for the `github-actions[bot]` actor
   - This allows the changelog bot (`changelog.yml`) to push `CHANGELOG.md` commits directly
   - Without this bypass, the changelog automation will break after each release merge
5. Save

---

## Task 6: Verify the full workflow end-to-end

- [ ] **Step 1: Verify feature PR CI gates**

Create a test branch with a real file change inside the repo:
```bash
git checkout -b test/verify-preview-workflow
echo "" >> README.md
git add README.md
git commit -m "test: verify preview CI gates"
git push -u origin HEAD
```
Open the PR targeting `preview`:
```bash
gh pr create --base preview --title "test: verify preview CI gates" --body "Verify only claude-code-review runs"
```
Confirm in GitHub Actions: only `claude-code-review` runs. `changeset-check` and `docs-check` should NOT run.
Close and delete the test PR and branch when done.

- [ ] **Step 2: Verify auto-staging triggers**

Push any commit to the `preview` branch and watch `staging.yml` run:
```bash
git checkout preview
git push
```
In GitHub Actions → `staging.yml` should poll Vercel (takes 3–6 minutes) and alias all 4 staging domains. Check that the staging URLs load the updated content.

- [ ] **Step 3: Verify website project name**

If `staging.dejajs.com` did not update in Step 2, check the `staging.yml` run logs for `"Timed out waiting for dejajs-website"`. If seen, update the project name in `staging.yml` to `deja-js-www` and commit:
```bash
# In .github/workflows/staging.yml, change:
# ["dejajs-website"]="staging.dejajs.com"
# to:
# ["deja-js-www"]="staging.dejajs.com"
git add .github/workflows/staging.yml
git commit -m "ci: fix website Vercel project name in staging.yml"
git push
```

- [ ] **Step 4: Verify release PR CI gates**

Open a PR from `preview` → `main` (without a changeset):
```bash
gh pr create --base main --title "test: verify release CI gates" --body "Should be blocked by changeset-check"
```
Confirm `changeset-check` fails. Run `/changelog` on `preview`, push the changeset, and confirm `changeset-check` passes. Close without merging.

- [ ] **Step 5: End-to-end production deploy test (do this on the real release PR)**

When you're ready for the actual first release via this workflow:
1. Merge a real `preview → main` PR
2. Confirm Vercel deploys to production (check Vercel dashboard)
3. Confirm `changelog.yml` bot runs and commits `CHANGELOG.md` cleanup
4. Run the sync:
   ```bash
   git checkout preview
   git merge main
   git push
   ```
5. Confirm `staging.yml` re-runs on the sync push (harmless — re-aliases staging to same `preview` content)

---

## Task 7: Final commit — changeset + PR

- [ ] **Step 1: Run /changelog**

```bash
# On this worktree branch
```
Run `/changelog` to create a changeset for all the CI/docs changes in this branch.

- [ ] **Step 2: Create PR**

Run `/commit-push-pr` — it will detect this is a `claude/*` worktree branch and prompt for base. Choose `preview`.

Expected PR title: `feat: add preview branch workflow with auto-staging`

# Preview Branch Workflow Design

**Date:** 2026-03-17
**Status:** Approved

---

## Context

Currently all feature branches open PRs directly against `main`, which immediately triggers a production Vercel deployment on merge. There is no intermediate staging step between feature development and production. The `/stage-pr` command exists for manually pointing staging domains to a specific branch, but this is an ad-hoc step rather than a formalized workflow.

The goal is to introduce a persistent `preview` branch that acts as a stable staging environment. Feature branches merge into `preview` first, are reviewed and tested at the staging domains, and only then are promoted to `main` for release. This keeps `main` always production-stable and provides a reliable, repeatable testing gate before release.

---

## Git Workflow

```
feature/xyz
    │
    └─── PR → preview  (claude-code-review only; no changeset, no docs-check)
                │
                └─── merge → staging.yml runs → staging domains updated → test
                                │
                                └─── /update-docs (if UI changed) + /changelog on preview
                                         │
                                         └─── PR preview → main  (changeset-check + docs-check + claude-review)
                                                  │
                                                  └─── merge → production Vercel deploy + changelog bot
                                                                │
                                                                └─── merge main back into preview (keep in sync)
```

- **`preview`** — persistent staging branch; always reflects what's ready to ship
- **`main`** — production-only; only receives PRs from `preview`
- **feature branches** — short-lived; PR targets `preview`

---

## CI/CD Changes

### Existing Workflows (unchanged)

| Workflow | Trigger | Notes |
|---|---|---|
| `claude-code-review.yml` | All PRs | Already runs on all PRs — no change |
| `changeset-check.yml` | PRs → `main` | Already scoped to `main` — no change |
| `docs-check.yml` | PRs → `main` | Already scoped to `main` — no change |
| `changelog.yml` | Push to `main` | Still processes changesets on merge — no change |

No existing workflow files need modification.

### New Workflow: `staging.yml`

**Trigger:** Push to `preview` branch
**Purpose:** Automatically alias all 4 staging domains to the latest `preview` deployment

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

          # NOTE: Verify these project names match the Vercel dashboard before first deploy.
          # The /stage-pr skill is the source of truth. The website project may be
          # `dejajs-website` or `deja-js-www` — confirm and update this map accordingly.
          # Also fix the mismatched comment on line 39 of .claude/commands/stage-pr.md.
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

**Notes on Vercel API:**
- The `projectId` query param accepts both the opaque project ID and the project slug/name. The `/stage-pr` skill already uses project name strings successfully — this is consistent with that behavior.
- `readyState == "READY"` filters for completed deployments only, avoiding aliasing an in-progress build.

**Prerequisites:**
- `VERCEL_TOKEN` must be added to GitHub repository secrets (Settings → Secrets → Actions)
- The token needs permission to alias deployments in the `jmcdannels-projects` scope
- **Verify the website project name** (`dejajs-website` vs `deja-js-www`) by running `/stage-pr main` and checking which project name succeeds. Update the workflow to match.

---

## Staging Domains

These are the 4 domains that track the `preview` branch:

| App | Staging Domain | Vercel Project (verify) |
|---|---|---|
| Throttle | `staging-throttle.dejajs.com` | `deja-js-throttle` |
| Cloud | `staging-cloud.dejajs.com` | `deja-js-cloud` |
| Monitor | `staging-monitor.dejajs.com` | `deja-js-monitor` |
| Website | `staging.dejajs.com` | `dejajs-website` (confirm vs `deja-js-www`) |

Firebase Auth is already authorized for all 4 domains. No Firebase changes needed.

---

## Developer Workflow (Updated CLAUDE.md Steps)

### Feature branch → preview

1. Create feature branch, write code
2. `pnpm lint && pnpm check-types`
3. `/verify-changes`
4. `/commit-push-pr` → PR targets `preview` (**not `main`**)
5. CI runs `claude-code-review` only; no changeset or docs required
6. Merge to `preview`
7. `staging.yml` polls until Vercel deployments are ready, then updates staging domains (typically 3–6 minutes after merge)

### preview → main (release)

1. Test on staging domains (`staging-throttle.dejajs.com`, `staging-cloud.dejajs.com`, etc.)
2. `/update-docs` if any UI changed (screenshots + MDX)
3. `/changelog` to create the changeset on `preview` branch
   - Changesets accumulate on `preview` across multiple feature merges. The single `preview → main` PR captures all accumulated changesets at once. The changelog bot on `main` will process them all.
4. `/commit-push-pr` → PR targets `main`
5. CI runs `changeset-check` + `docs-check` + `claude-code-review`
6. Merge → production Vercel deploy + changelog bot processes all accumulated changesets

### After merge to main — sync preview

After each merge to `main` (including the changelog bot's automated commit), sync `main` back into `preview` to prevent divergence:

```bash
git checkout preview
git merge main
git push
```

This is important because the changelog bot pushes directly to `main` (clearing consumed changeset files and updating `CHANGELOG.md`). If `preview` is not synced, the next `preview → main` PR will show changeset files as "added" that were already processed, causing confusing diffs. The `/resolve-conflicts` skill is available if merge conflicts arise.

---

## Skill Updates

### `/commit-push-pr`

Add context-aware base branch detection using three explicit cases:

1. **Current branch is `preview`** → `--base main` (release PR)
2. **Current branch is a feature branch** (anything other than `preview` or `main`) → `--base preview` (feature PR)
3. **Current branch is a worktree branch** (e.g., `claude/worktree-*`) → prompt the user to confirm the intended base branch before creating the PR

The `gh pr create` call should pass `--base` explicitly based on the above logic. This logic should be stated as explicit rules in the skill file.

### `/stage-pr`

Add a note that staging domains now auto-update on push to `preview` via `staging.yml`. Manual `/stage-pr` remains useful for pointing staging to a specific feature branch for early review (e.g., `/stage-pr my-feature-branch`).

---

## CLAUDE.md Updates

The **Development Workflow** section in CLAUDE.md needs to:
- Show PRs targeting `preview` instead of `main` for feature work
- Remove the changeset/docs requirement from feature PRs
- Add a "release" phase (preview → main) as a distinct step with changeset + docs requirements
- Add a "sync" step (merge main → preview) after release
- Note that staging domains auto-update 3–6 minutes after merging to `preview`

---

## Branch Protection (Recommended Settings)

Configure in GitHub Settings → Branches after implementation:

| Branch | Recommended Rules |
|---|---|
| `main` | Require PR, require CI pass (`changeset-check`, `docs-check`), no direct push (see exception below) |
| `preview` | Require PR, require CI pass (`claude-code-review`), no direct push |

**Exception — changelog bot bypass:** The `changelog.yml` workflow uses `GITHUB_TOKEN` to push directly to `main` (it commits updated `CHANGELOG.md` and deletes consumed changeset files). If "no direct push" is enforced strictly, this bot push will be blocked. In GitHub Settings, add a bypass for the `changesets/action` service account or use the "Allow specified actors to bypass required pull requests" option for the `main` branch rule. Without this, the changelog automation will break.

---

## Verification

After implementation:

1. **Feature branch flow:** Create a test branch, open a PR targeting `preview`, confirm only `claude-code-review` CI runs (no `changeset-check`, no `docs-check`)
2. **Auto-staging:** Merge the PR to `preview`, wait for `staging.yml` to complete (~3–6 minutes), confirm staging domains reflect the new deployment
3. **Release flow:** Run `/changelog` on `preview`, open PR targeting `main`, confirm `changeset-check` + `docs-check` both run and require compliance
4. **Production deploy:** Merge `preview` → `main`, confirm Vercel deploys to production and changelog bot runs, then sync `main` → `preview`
5. **Website project name:** Before first use, run `/stage-pr main` to confirm whether `dejajs-website` or `deja-js-www` is the correct Vercel project slug for the website app

---

## Out of Scope

- `install-api` and `billing-api` apps are not included in staging domain aliasing (server-side APIs, not user-testable via browser staging)
- The `release-server.yml` tag-based server distribution workflow is unchanged
- The `preview` branch itself does not need to be created here — it is being created manually by the developer as part of this workflow change

# /stage-pr — Point all DEJA.js staging domains to a PR or branch
 
Alias all 4 DEJA.js staging domains to the latest Vercel preview deployment for a given PR number or branch name.

> **Auto-staging:** Staging domains now automatically update on every push to the `staging` branch via the `staging.yml` GitHub Actions workflow. Use this command when you need to point staging to a **specific feature branch** for early review before it merges to `staging`.

**Usage:**
- `/stage-pr 42` — use PR number
- `/stage-pr my-feature-branch` — use branch name directly
 
---
 
## Instructions
 
The argument is: `$ARGUMENTS`
 
### Step 1 — Resolve branch name
 
If `$ARGUMENTS` is a number (digits only), resolve the branch:
```bash
BRANCH=$(gh pr view $ARGUMENTS --json headRefName -q .headRefName)
echo "PR #$ARGUMENTS → branch: $BRANCH"
```
 
Otherwise use `$ARGUMENTS` directly as the branch name:
```bash
BRANCH="$ARGUMENTS"
```
 
### Step 2 — Find the latest preview deployment for each project
 
For each of the 4 projects, query the Vercel API for the most recent preview deployment on that branch.
 
You'll need a Vercel token. Check if `VERCEL_TOKEN` is set; if not, run `vercel whoami` to confirm auth and use the Vercel CLI instead.
 
```bash
# Project → staging domain mapping:
# deja-js-throttle  → staging-throttle.dejajs.com
# deja-js-cloud     → staging-cloud.dejajs.com
# deja-js-monitor   → staging-monitor.dejajs.com
# dejajs-website    → staging.dejajs.com
 
TEAM="jmcdannels-projects"
BRANCH="<resolved branch from Step 1>"
 
for PROJECT in deja-js-throttle deja-js-cloud deja-js-monitor dejajs-website; do
  DEPLOYMENT_URL=$(curl -s "https://api.vercel.com/v6/deployments?projectId=${PROJECT}&meta-gitBranch=${BRANCH}&limit=1&target=preview&teamId=${TEAM}" \
    -H "Authorization: Bearer $VERCEL_TOKEN" | jq -r '.deployments[0].url')
  echo "$PROJECT → $DEPLOYMENT_URL"
done
```
 
If `VERCEL_TOKEN` is not available, use the CLI to list deployments:
```bash
vercel ls --scope $TEAM --meta gitBranch=$BRANCH $PROJECT
```
 
### Step 3 — Alias each deployment to its staging domain
 
```bash
vercel alias staging-throttle-deployment-url staging-throttle.dejajs.com --scope jmcdannels-projects
vercel alias staging-cloud-deployment-url    staging-cloud.dejajs.com    --scope jmcdannels-projects
vercel alias staging-monitor-deployment-url  staging-monitor.dejajs.com  --scope jmcdannels-projects
vercel alias staging-deployment-url          staging.dejajs.com        --scope jmcdannels-projects
```
 
Or in a loop:
```bash
declare -A DOMAINS=(
  ["deja-js-throttle"]="staging-throttle.dejajs.com"
  ["deja-js-cloud"]="staging-cloud.dejajs.com"
  ["deja-js-monitor"]="staging-monitor.dejajs.com"
  ["dejajs-website"]="staging.dejajs.com"
)
 
for PROJECT in "${!DOMAINS[@]}"; do
  DOMAIN="${DOMAINS[$PROJECT]}"
  DEPLOYMENT_URL=$(curl -s "https://api.vercel.com/v6/deployments?projectId=${PROJECT}&meta-gitBranch=${BRANCH}&limit=1&target=preview&teamId=jmcdannels-projects" \
    -H "Authorization: Bearer $VERCEL_TOKEN" | jq -r '.deployments[0].url // empty')
 
  if [ -z "$DEPLOYMENT_URL" ]; then
    echo "⚠️  No preview deployment found for $PROJECT on branch '$BRANCH'"
    continue
  fi
 
  echo "🔗 Aliasing $DOMAIN → $DEPLOYMENT_URL"
  vercel alias "$DEPLOYMENT_URL" "$DOMAIN" --scope jmcdannels-projects
done
```
 
### Step 4 — Print summary
 
After all aliases are set, print:
```
✅ Staging domains updated for branch: <BRANCH>
 
  https://staging-throttle.dejajs.com  → <deployment url>
  https://staging-cloud.dejajs.com     → <deployment url>
  https://staging-monitor.dejajs.com   → <deployment url>
  https://staging.dejajs.com   → <deployment url>
 
DNS may take ~30s to propagate. Firebase Auth is pre-authorized for all 4 domains.
```
 
---
 
## Notes
 
- These domains are **Production-assigned** in Vercel but `vercel alias` overrides which deployment they serve — that's intentional (Option B workflow).
- Firebase Auth already has all 4 staging domains authorized (`staging-throttle.dejajs.com`, `staging-cloud.dejajs.com`, `staging-monitor.dejajs.com`, `staging.dejajs.com`).
- To point staging back to the main branch after a PR merges, run `/stage-pr main` (or whatever your default branch is).
- Vercel scope: `jmcdannels-projects`
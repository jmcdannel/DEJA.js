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

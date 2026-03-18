# /resolve-conflicts

Resolve merge conflicts on a PR branch by merging the base branch (usually `main`) into the PR branch.

## Arguments

`$ARGUMENTS` — PR number (e.g. "191") or branch name (e.g. "claude/create-splash-page-173LB"). Required.

## Steps

1. **Identify the PR branch and base branch:**
   - If `$ARGUMENTS` is a number, fetch PR details:
     ```bash
     gh pr view $ARGUMENTS --json headRefName,baseRefName --jq '{head: .headRefName, base: .baseRefName}'
     ```
   - If `$ARGUMENTS` is a branch name, use it as the head and assume `main` as the base.

2. **Fetch latest refs:**
   ```bash
   git fetch origin <head-branch> <base-branch>
   ```

3. **Check out the PR branch:**
   - If the branch is already checked out in a worktree, `cd` to that worktree.
   - Otherwise, check it out in the current working directory.

4. **Attempt the merge:**
   ```bash
   git merge origin/<base-branch> --no-commit
   ```

5. **Resolve conflicts by file type:**
   - **`pnpm-lock.yaml`**: Accept the base branch version, then regenerate:
     ```bash
     git checkout --theirs pnpm-lock.yaml
     pnpm install --no-frozen-lockfile
     git add pnpm-lock.yaml
     ```
   - **Source files (`.ts`, `.vue`, `.json`, etc.)**: Read the conflicted file, understand both sides, and make an intelligent merge that preserves both sets of changes. Use the `Edit` tool to resolve conflicts — never leave `<<<<<<<` markers in the file. After editing, `git add` the file.
   - **Generated files** (build artifacts, `.d.ts` outputs): Accept the base branch version and regenerate if needed.
   - **Changeset files (`.changeset/*.md`)**: Keep both — if there's a conflict in the same file, combine the entries.

6. **Verify the merge:**
   - Run `git diff --cached --stat` to review what's staged.
   - If source files were modified, run `pnpm lint` and `pnpm check-types` on the affected packages to confirm nothing is broken.

7. **Commit the merge:**
   ```bash
   git commit -m "Merge branch '<base-branch>' into <head-branch>"
   ```

8. **Push:**
   ```bash
   git push origin <head-branch>
   ```

9. **Verify PR status:**
   ```bash
   gh pr view $ARGUMENTS --json mergeable,mergeStateStatus --jq '{mergeable, mergeState: .mergeStateStatus}'
   ```
   Report the final merge status to the user.

## Notes

- Never force-push when resolving conflicts.
- If a conflict is ambiguous and you can't determine the correct resolution, ask the user before proceeding.
- For `pnpm-lock.yaml`, always regenerate rather than manually resolving — manual edits to lockfiles are fragile.
- If the merge introduces type errors or lint failures, fix them before committing.

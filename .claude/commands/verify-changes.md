# /verify-changes

Full verification loop: lint → type-check → build. This is the most important step before opening a PR. A good verification loop 2–3x the quality of the final result.

## Arguments

`$ARGUMENTS` — optional: name of a specific app or package to limit the build step (e.g. `throttle`, `cloud`, `server`). Lint and type-check always run monorepo-wide.

## Steps

1. **Lint** — auto-fix and check for errors:
   ```bash
   pnpm lint
   ```

2. **Type check** — ensure TypeScript compiles cleanly:
   ```bash
   pnpm check-types
   ```

3. **Build** — compile the affected package(s):
   ```bash
   # If $ARGUMENTS is provided, build only that app/package
   pnpm --filter=deja-$ARGUMENTS build

   # Otherwise build everything
   pnpm build
   ```

4. **Unit tests** (if applicable — only throttle has tests today):
   ```bash
   pnpm --filter=deja-throttle test:unit
   ```

5. **Report** the outcome of each step:
   - Pass ✓ / Fail ✗ for each step
   - If anything fails: show errors, fix them, and re-run the failed step before proceeding
   - Only when all steps pass: confirm the changes are ready to commit

## Notes

- Always run this before using `/commit-push-pr` on non-trivial changes.
- The build step is the slowest — if you only changed a single Vue component, you can skip to `/lint-type-check` for a faster feedback loop.
- If the build fails with a Turbo cache issue, try `turbo run build --force` to bypass the cache.

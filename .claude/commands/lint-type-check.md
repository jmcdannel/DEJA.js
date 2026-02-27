# /lint-type-check

Run linting and TypeScript type checking across the monorepo. Use this as a quick inner-loop check before committing.

## Arguments

`$ARGUMENTS` — optional filter to scope to a specific app or package (e.g. `throttle`, `cloud`, `server`). If not provided, runs across the whole monorepo.

## Steps

1. **Lint** — run ESLint with auto-fix across the monorepo (or filtered package):
   ```bash
   # Full monorepo
   pnpm lint

   # Filtered (if $ARGUMENTS provided, e.g. "throttle")
   pnpm --filter=deja-$ARGUMENTS lint
   ```

2. **Type check** — run TypeScript checks:
   ```bash
   # Full monorepo
   pnpm check-types

   # Filtered
   pnpm --filter=deja-$ARGUMENTS type-check
   ```

3. Report results:
   - If both pass: confirm "Lint and type-check passed."
   - If either fails: show the errors and suggest fixes. Do not proceed with a commit until all errors are resolved.

## Notes

- ESLint is configured with `--fix` so most style issues are auto-corrected.
- Type errors must be fixed manually — never suppress with `@ts-ignore` unless truly necessary.
- This is a subset of `/verify-changes` — use that command for a full build check.

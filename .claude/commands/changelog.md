---
description: Create a changeset entry for the current branch's changes
---

# /changelog — Create a Changeset Entry

You are creating a changeset entry for the current branch. Follow these steps exactly:

## Step 1: Analyze the diff

Run `git diff main...HEAD` and `git log main..HEAD --oneline` to understand what changed.

If there are no changes vs main, tell the user and stop.

## Step 2: Determine the target workspace package

Based on the files changed in the diff, determine which workspace package to reference in the changeset frontmatter. **Never use `"deja"` (the root package) — changesets doesn't recognize it.**

Map changed files to workspace package names:

| Path prefix | Package name |
|-------------|-------------|
| `apps/cloud/` | `deja-cloud` |
| `apps/monitor/` | `deja-monitor` |
| `apps/server/` | `deja-serverts` |
| `apps/throttle/` | `deja-throttle` |
| `apps/tour/` | `deja-tour` |
| `apps/sound-api/` | `deja-sound-api` |
| `apps/dejajs-www/` | `dejajs-www` |
| `apps/billing-api/` | `billing-api` |
| `apps/install-api/` | `install-api` |
| `packages/ui/` | `@repo/ui` |
| `packages/modules/` | `@repo/modules` |
| `packages/auth/` | `@repo/auth` |
| `packages/dccex/` | `@repo/dccex` |
| `packages/deja/` | `@repo/deja` |
| `packages/sounds/` | `@repo/sounds` |
| `packages/utils/` | `@repo/utils` |
| `packages/firebase-config/` | `@repo/firebase-config` |
| `docs/` | `dejajs-www` |

If changes span multiple packages, pick the **primary** package (the one most impacted). If multiple packages are significantly affected, list them all in the frontmatter (one per line).

## Step 3: Determine category and bump level

**Category** — choose based on the nature of the change:

| Change Type | Prefix | Examples |
|-------------|--------|----------|
| New feature, new component, new command | `added:` | New view, new composable, new API endpoint |
| Modified existing behavior | `changed:` | Updated UI, changed data flow, altered config |
| Bug fix | `fixed:` | Resolved crash, fixed regression, corrected logic |
| Removed feature or code | `removed:` | Deleted component, removed deprecated API |
| Refactor, performance, DX improvement | `improved:` | Reduced bundle size, better error messages |

**Bump level:**
- `minor` — New features (added: entries)
- `patch` — Bug fixes, improvements, changes, removals

## Step 4: Write the summary

Format: `<prefix>: **[<app/package>]** <description>`

- Use an app tag: `[throttle]`, `[cloud]`, `[server]`, `[tour]`, `[monitor]`, `[ui]`, `[modules]`, `[dccex]`, `[auth]`, or omit for cross-cutting changes
- Be specific and user-facing — describe the *impact*, not the code change
- Use present tense, imperative mood: "Add...", "Fix...", "Improve..."
- One changeset per logical change. If the branch has multiple distinct changes, create multiple changeset files.

**Good examples:**
- `added: **[throttle]** New route planning view with drag-and-drop turnout sequencing`
- `fixed: **[server]** Prevent duplicate serial port connections on rapid reconnect`
- `improved: **[ui]** Reduce EffectList re-renders with memoized sort comparator`
- `changed: **[cloud]** Replace device grid layout with sortable table view`

**Bad examples:**
- `Refactored code` (too vague)
- `fixed: Updated useLocos.ts` (describes file, not impact)
- `added: Changes to throttle app` (meaningless)

## Step 6: Generate filename

Create a descriptive slug from the summary:
- Lowercase, hyphenated
- 3-6 words max
- Example: `throttle-route-planning-view.md`, `fix-serial-duplicate-connections.md`

## Step 7: Create the changeset file

Write the file to `.changeset/<slug>.md`:

```markdown
---
"<workspace-package-name>": <patch|minor>
---

<prefix>: <summary>
```

For example, a throttle change:
```markdown
---
"deja-throttle": minor
---

added: **[throttle]** New route planning view with drag-and-drop turnout sequencing
```

Or a multi-package change:
```markdown
---
"deja-cloud": minor
"@repo/ui": patch
---

added: **[cloud]** New device configuration wizard with shared UI components
```

**IMPORTANT:** Never use `"deja"` as the package name — it's the root package and is not recognized by changesets. Always use the workspace package name from the mapping table in Step 2.

## Step 8: Show the result

Display the created file path and content. Ask the user if they want to modify anything.

## Multiple changes

If the branch contains multiple distinct user-facing changes, create a separate changeset file for each one. Name each file descriptively.

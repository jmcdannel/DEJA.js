---
description: Create a changeset entry for the current branch's changes
---

# /changelog — Create a Changeset Entry

You are creating a changeset entry for the current branch. Follow these steps exactly:

## Step 1: Analyze the diff

Run `git diff main...HEAD` and `git log main..HEAD --oneline` to understand what changed.

If there are no changes vs main, tell the user and stop.

## Step 2: Determine category and bump level

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

## Step 3: Write the summary

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

## Step 4: Generate filename

Create a descriptive slug from the summary:
- Lowercase, hyphenated
- 3-6 words max
- Example: `throttle-route-planning-view.md`, `fix-serial-duplicate-connections.md`

## Step 5: Create the changeset file

Write the file to `.changeset/<slug>.md`:

```markdown
---
"deja": <patch|minor>
---

<prefix>: <summary>
```

## Step 6: Show the result

Display the created file path and content. Ask the user if they want to modify anything.

## Multiple changes

If the branch contains multiple distinct user-facing changes, create a separate changeset file for each one. Name each file descriptively.

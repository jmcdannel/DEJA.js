# Changesets

This directory is used by [@changesets/cli](https://github.com/changesets/changesets) to track changes for the DEJA.js changelog.

## How It Works

Each changeset is a Markdown file in this directory describing a change. When PRs are merged to `main`, a GitHub Action processes these files and updates `CHANGELOG.md`.

## Creating a Changeset

The easiest way is to run `/changelog` in Claude Code — it analyzes your branch diff and creates the changeset automatically.

You can also create one manually:

```bash
pnpm changeset
```

Or create a file directly in `.changeset/` with this format:

```markdown
---
"deja": patch
---

fixed: **[throttle]** Resolve slider regression on mobile touch devices
```

## Category Prefixes

Use a prefix on the summary line to categorize the change:

| Prefix | CHANGELOG Section |
|--------|-------------------|
| `added:` or no prefix | **Added** |
| `changed:` | **Changed** |
| `fixed:` | **Fixed** |
| `removed:` | **Removed** |
| `improved:` | **Technical Improvements** |

## Bump Levels

- **`major`** — Breaking changes (rarely used)
- **`minor`** — New features, new components, new commands
- **`patch`** — Bug fixes, improvements, refactors

## App Tags

Use bold tags in brackets to indicate which app is affected:

- `**[throttle]**` — Throttle app changes
- `**[cloud]**` — Cloud app changes
- `**[server]**` — Server changes
- `**[tour]**` — Tour app changes
- `**[ui]**` — Shared UI component changes
- `**[modules]**` — Shared module changes

## Examples

```markdown
---
"deja": minor
---

added: **[throttle]** New route planning view with drag-and-drop turnout sequencing
```

```markdown
---
"deja": patch
---

fixed: **[server]** Prevent duplicate serial port connections on rapid reconnect
```

```markdown
---
"deja": patch
---

improved: **[ui]** Reduce EffectList re-renders with memoized sort comparator
```

---
name: update-docs
description: Analyze PR changes and update MDX documentation with fresh screenshots. Use when UI changes have been made and docs need updating. Trigger on "/update-docs" or when asked to "update documentation", "refresh docs", or "update docs with screenshots".
user_invocable: true
---

# Update Docs

Analyze the current branch's changes, capture screenshots of affected views, and update MDX documentation pages.

## Usage

```
/update-docs [--app throttle|cloud|monitor] [--skip-screenshots]
```

- `--app`: Only update docs for a specific app (default: auto-detect from git diff)
- `--skip-screenshots`: Skip screenshot capture, only update MDX content

## Procedure

### 1. Detect Changed Apps

Run `git diff main...HEAD --name-only` and categorize changes:

```
apps/throttle/src/**  → throttle app changed
apps/cloud/src/**     → cloud app changed
apps/monitor/src/**   → monitor app changed
packages/ui/**        → all apps potentially affected
packages/modules/**   → all apps potentially affected
```

If no UI-related files changed, report "No UI changes detected" and exit.

### 2. Capture Screenshots

For each affected app, invoke the `/capture-screenshots` skill:
```
/capture-screenshots <app> --viewport both
```

This captures desktop and mobile screenshots of all views.

### 3. Analyze Changes for Doc Updates

For each affected app, analyze the git diff to understand what changed:
- New views/routes added?
- Existing views redesigned?
- New components or features visible in the UI?
- Layout/navigation changes?

### 4. Update MDX Documentation

MDX doc files live in `docs/apps/{app}/`. Each app has:
- `overview.mdx` — app overview with key screenshots and feature list
- Additional feature-specific pages as needed

**MDX frontmatter format:**
```mdx
---
title: Throttle App
description: Train speed, direction, and function controls
order: 1
---
```

**Screenshot references in MDX:**
```mdx
![Throttle Home](/screenshots/throttle_desktop_home.png)
```

When updating MDX:
- Update screenshot references if filenames changed
- Add new sections for new features/views
- Update descriptions to match current UI
- Keep content concise — focus on what the user sees and can do
- Do NOT remove existing content unless the feature was removed

### 5. Verify References

After updating MDX, verify all screenshot references point to files that exist:
```bash
# Extract all image references from MDX files
grep -roh '/screenshots/[^)]*' docs/ | sort -u | while read img; do
  file="apps/dejajs-www/public${img}"
  if [ ! -f "$file" ]; then
    echo "MISSING: $file (referenced in MDX)"
  fi
done
```

### 6. Report

Output a summary:
- Apps analyzed
- Screenshots captured (new/updated count)
- MDX pages created/updated
- Any broken references or issues

## MDX Doc Structure

```
docs/
├── apps/
│   ├── throttle/
│   │   └── overview.mdx      — Throttle app overview
│   ├── cloud/
│   │   └── overview.mdx      — Cloud app overview
│   └── monitor/
│       └── overview.mdx      — Monitor app overview
└── architecture/
    └── overview.mdx           — System architecture (optional)
```

The `sync-docs.mjs` script in `apps/dejajs-www/scripts/` copies these to `content/docs/` at build time, where they're rendered by the Next.js docs page at `/docs/[...slug]`.

## Notes

- Always run this AFTER your code changes are complete, BEFORE `/changelog` and `/commit-push-pr`
- The CI `docs-check.yml` workflow will warn if UI changes are made without doc updates
- Screenshots are compressed JPEG from Claude Preview — suitable for web docs
- MDX supports GitHub Flavored Markdown (tables, task lists, etc.) via remark-gfm

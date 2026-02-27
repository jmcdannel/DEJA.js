---
description: Create a release from unreleased changelog entries
---

# /release-notes — Create a Release

You are creating a new release for DEJA.js. Follow these steps exactly:

## Step 1: Read current state

1. Read `CHANGELOG.md` and extract the `[Unreleased]` section content
2. Read the current version from root `package.json`
3. Run `git log --oneline -10` to see recent history

If the `[Unreleased]` section is empty, tell the user there's nothing to release and stop.

## Step 2: Determine version

**Auto-detect from changelog content:**
- If there are `### Added` entries → **minor** bump (new features)
- Otherwise → **patch** bump (fixes, improvements, changes)
- **Major** bumps are only used when explicitly requested by the user

Parse the current version from `package.json` and compute the next version.

If the user provided an explicit version (e.g., `/release-notes 1.2.0`), use that instead.

Show the proposed version and ask for confirmation before proceeding.

## Step 3: Update CHANGELOG.md

1. Replace `## [Unreleased]` content by moving entries into a new versioned section
2. The new section heading: `## [<version>] - <YYYY-MM-DD>` (today's date)
3. Leave an empty `## [Unreleased]` section at the top
4. Preserve everything below the moved section as-is

**Before:**
```markdown
## [Unreleased]

### Added
- New feature X

### Fixed
- Bug fix Y

---

## [1.0.0] - 2025-08-12
```

**After:**
```markdown
## [Unreleased]

---

## [1.1.0] - 2026-02-26

### Added
- New feature X

### Fixed
- Bug fix Y

---

## [1.0.0] - 2025-08-12
```

## Step 4: Update package.json versions

Update the `version` field in the root `package.json` to the new version.

## Step 5: Commit and tag

```bash
git add CHANGELOG.md package.json
git commit -m "release: v<version>"
git tag "v<version>"
```

## Step 6: Push

```bash
git push origin main --follow-tags
```

## Step 7: Create GitHub Release

Use `gh release create` with the changelog entries as the body:

```bash
gh release create "v<version>" \
  --title "v<version>" \
  --notes "$(cat <<'EOF'
<formatted release notes from the changelog section>
EOF
)"
```

Format the notes with the same markdown sections (### Added, ### Fixed, etc.) from the changelog.

## Step 8: Report

Show:
- The new version number
- The git tag created
- Link to the GitHub Release
- Reminder that Vercel will auto-deploy frontend changes

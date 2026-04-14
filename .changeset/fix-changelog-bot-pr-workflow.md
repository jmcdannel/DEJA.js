---
"deja": patch
---

changed: **[ci]** 🤖 Changelog bot now opens a PR instead of pushing directly to `main` — works around branch protection that rejected the previous direct-push approach. `changeset-check` skips PRs authored by the bot so the automated flow doesn't deadlock.

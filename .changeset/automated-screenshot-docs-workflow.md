---
"deja-cloud": patch
"@repo/auth": patch
---

feat: add automated screenshot capture and doc update workflow

- Add `/capture-screenshots` and `/update-docs` Claude Code skills for headless screenshot capture
- Add `DEV_AUTO_LOGIN` auth bypass in `requireAuth` guard for automated testing
- Add `.claude/launch.json` dev server configs for Playwright MCP
- Add initial MDX doc pages for throttle, cloud, and monitor apps
- Add `docs-check.yml` CI workflow to remind about doc updates on UI PRs

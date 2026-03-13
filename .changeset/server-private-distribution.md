---
"deja": minor
---

added: **[server]** Subscription validation with Firebase Admin SDK, 48-hour offline grace period, and periodic re-check
added: **[server]** Docker distribution via multi-stage Dockerfile with tsup bundling for standalone ESM output
added: **[scripts]** Install script for one-line Docker-based server deployment with serial port detection
added: **[scripts]** `deja` CLI wrapper for server management (status, logs, update, restart, stop, start)
added: **[ci]** GitHub Actions workflow for multi-arch Docker image builds on tag push (amd64 + arm64)
fixed: **[server]** ENABLE_WS environment variable now correctly defaults to true instead of being always true
fixed: **[security]** Remove hardcoded Vercel Blob tokens from vercel.json files

---
"deja-serverts": minor
---

added: **[server]** Subscription validation with Firebase Admin SDK, 48-hour offline grace period, and periodic re-check
added: **[server]** Standalone server distribution via tsup bundling + GitHub Releases tarball
added: **[scripts]** Install script for one-line server deployment with Node.js check and serial port detection
added: **[scripts]** `deja` CLI for native Node.js server management (start, stop, restart, status, logs, update)
added: **[ci]** GitHub Actions workflow for server tarball builds and GitHub Releases on tag push
fixed: **[server]** ENABLE_WS environment variable now correctly defaults to true instead of being always true
fixed: **[security]** Remove hardcoded Vercel Blob tokens from vercel.json files

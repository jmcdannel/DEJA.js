# deja-serverts

## 0.1.0

### Minor Changes

- 3721738: added: **[server]** Cloudflare Tunnel support for secure remote access to local DEJA server without port forwarding
- d5fafba: added: **[server]** Subscription validation with Firebase Admin SDK, 48-hour offline grace period, and periodic re-check
  added: **[server]** Standalone server distribution via tsup bundling + GitHub Releases tarball
  added: **[scripts]** Install script for one-line server deployment with Node.js check and serial port detection
  added: **[scripts]** `deja` CLI for native Node.js server management (start, stop, restart, status, logs, update)
  added: **[ci]** GitHub Actions workflow for server tarball builds and GitHub Releases on tag push
  fixed: **[server]** ENABLE_WS environment variable now correctly defaults to true instead of being always true
  fixed: **[security]** Remove hardcoded Vercel Blob tokens from vercel.json files

### Patch Changes

- 3c624ba: added: **[cloud]** Vercel serverless `/api/cleanup-logs` endpoint — deletes RTDB log entries older than 24 hours, runs daily at 3 AM UTC via Vercel Cron

  added: **[cloud]** Vercel serverless `/api/diagnostics` endpoint — returns RTDB queue sizes and timestamp ranges per layout

  added: **[server]** Clear stale RTDB log/command queues (`dccLog`, `dccCommands`, `dejaCommands`) on server startup to prevent replaying old commands

- 5c941ef: feat: **[cli]** Make `deja start` interactive by default with live server output and REPL command loop; use `deja start -b` for background mode
- ca184e7: feat: redesign monitor header, device connection cards, and settings navigation

  - Redesign monitor app to use MonitorStatusBar globally with server status, layout selector, and user profile
  - Add deja-server device type support to connection cards with server status integration
  - Move settings navigation to right side with sticky positioning (fix v-responsive overflow)
  - Add server IP broadcasting from server to Firebase RTDB
  - Show device IDs in cloud app port list
  - Add size prop to UserProfile component

- 8b833ed: added: **[throttle]** Display app version on Settings page footer

  added: **[cloud]** Display app version on Settings page footer

  added: **[monitor]** Display app version on Settings page footer

  added: **[cli]** `deja version` command to show installed server version from `~/.deja/server/version.txt`

  improved: **[installer]** Write server version to `~/.deja/server/version.txt` and install `deja` CLI during setup

- Updated dependencies [7a7be39]
- Updated dependencies [ca184e7]
  - @repo/modules@0.1.0

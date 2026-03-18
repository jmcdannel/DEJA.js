# deja-cloud

## 0.1.0

### Minor Changes

- 7a7be39: added: **[cloud]** Trial banner, billing settings section, PlanGate and UpgradeBanner components for subscription-aware UI
- 7a7be39: added: **[cloud]** Plan selection and payment steps in onboarding wizard with Stripe checkout integration
- 59c43df: redesigned: **[cloud]** Replace flat ModuleTitle headers with gradient accent strip PageHeader component across all cloud app pages

  improved: **[cloud]** Eliminate duplicate headers on Turnouts, Layout, and Settings pages

  added: **[ui]** ListMenu inline responsive mode — inline toolbar with chip dropdowns on desktop, bottom sheet on mobile

- 14d3647: added: **[cloud]** Redesigned DCC-EX console with retro LCD terminal, predefined command grid, and command cheat sheet — replaces old log viewer with real-time Firebase RTDB-backed interface
  added: **[server]** Server-side DCC command and serial response logging to Firebase RTDB for cloud console consumption
- ca184e7: feat: redesign monitor header, device connection cards, and settings navigation

  - Redesign monitor app to use MonitorStatusBar globally with server status, layout selector, and user profile
  - Add deja-server device type support to connection cards with server status integration
  - Move settings navigation to right side with sticky positioning (fix v-responsive overflow)
  - Add server IP broadcasting from server to Firebase RTDB
  - Show device IDs in cloud app port list
  - Add size prop to UserProfile component

- a41c219: added: **[cloud, throttle, monitor]** Display Firebase UID and Layout ID in Settings pages with copy-to-clipboard buttons and install command for server setup
  added: **[cloud]** Show UID and Layout ID prominently on Pending Approval page with install instructions referencing the new `curl` install flow

### Patch Changes

- 455aa91: feat: add automated screenshot capture and doc update workflow

  - Add `/capture-screenshots` and `/update-docs` Claude Code skills for headless screenshot capture
  - Add `DEV_AUTO_LOGIN` auth bypass in `requireAuth` guard for automated testing
  - Add `.claude/launch.json` dev server configs for Playwright MCP
  - Add initial MDX doc pages for throttle, cloud, and monitor apps
  - Add `docs-check.yml` CI workflow to remind about doc updates on UI PRs

- 3c624ba: added: **[cloud]** Vercel serverless `/api/cleanup-logs` endpoint — deletes RTDB log entries older than 24 hours, runs daily at 3 AM UTC via Vercel Cron

  added: **[cloud]** Vercel serverless `/api/diagnostics` endpoint — returns RTDB queue sizes and timestamp ranges per layout

  added: **[server]** Clear stale RTDB log/command queues (`dccLog`, `dccCommands`, `dejaCommands`) on server startup to prevent replaying old commands

- fa1ad09: changed: **[docs]** Update getting started content for new onboarding flow with pricing tiers. Updated README, homepage, and MDX docs to emphasize quick setup: Sign Up → Pick Plan → Register Layout → Install.

# Changelog

All notable changes to the DEJA.js project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

---

## [1.6.0] - 2026-04-13

### Added
- **[server]** 🚀 Add `deja deploy` command for Arduino and Pico W firmware deployment with arduino-cli auto-install
- **[cloud]** Bidirectional DCC-EX CommandStation roster sync — push locos to the CommandStation from the Roster page, import locos from the CommandStation into DEJA Cloud, and auto-sync on loco save
- **[cloud]** ✨ Redesign all Cloud forms with form-section pattern — consistent hero headers, accent colors, and radial glow effects across Roster, Routes, Effects, Signals, Sensors, and Turnouts
- **[cloud]** Add "Install" step (step 4) to the onboarding wizard using the QuickStart component, and refactor the Setup Complete page to use QuickStart in place of the bare install command card
- **[cloud]** VueFlow-based track diagram editor with custom track nodes and edges, live SVG preview, CSS export, and Firebase Storage upload — create and save visual layout diagrams from the Cloud app
- **[cloud]** Upgrade page for comparing and switching subscription plans
- **[cli]** `deja start` now launches an interactive terminal UI — scrolling log pane, live status bar (pid + uptime), and a command input line supporting `restart`, `stop`, and `help`. Two implementations available: `blessed` (default, ncurses-style with real scrolling) and `ink` (React-based, set `DEJA_UI=ink` to use).
- feat: complete homepage redesign with cinematic dark theme

- Replaced Sanity CMS-driven carousel homepage with modular component architecture
- Added 19+ new section components: HeroSection, ThrottleSpotlight, CloudSpotlight, MonitorSpotlight, ServerCLISection, GuidesSection, FAQSection, and more
- Added FallingStars animation, DEJA brand color tokens, and glow utilities to globals.css
- Added `/guides` section with sidebar navigation layout
- Added `ThrottleLaunchQR` shared UI component for QR code throttle launch
- Updated site metadata: "Run your railroad. From anywhere."
- Updated documentation content for cloud, monitor, throttle apps and onboarding flows
- **[cloud]** Firmware deploy dialog with config preview, WiFi credential input (Pico W), and ZIP download for Arduino and Pico W devices
added: **[io]** Automated firmware config generation from Firebase device data — Arduino config.h and Pico W settings.toml/config.json
added: **[io]** Interactive deploy CLI (`pnpm deploy`) with device selection, compile & upload (Arduino), and CIRCUITPY copy (Pico W)
fixed: **[io]** Fix hardcoded empty turnouts array and sensor pins in Arduino config.h generation
fixed: **[io]** Fix stray `*-` syntax error on line 201 of Pico W code.py
fixed: **[io]** Fix typo "daja-arduino" → "deja-arduino" in config.default.h
- **[modules]** 🔌 Add device-config generators for Arduino config.h, Pico W settings.toml/config.json — shared across io/ firmware and Cloud app
- feat: **[cloud]** Migrate sound API from standalone `sound-api` app into cloud app

- Added Vercel Serverless API endpoints (`api/sounds.ts`, `api/sounds/upload.ts`, `api/sounds/[pathname].ts`) with Firebase Auth verification for protected operations
- Created full CRUD UI for sound management (`/sounds` route) with list, upload, and delete functionality
- Added Sounds menu entry with `mdi-volume-high` icon
- Updated `SoundFileService` to use relative `/api` URLs instead of cross-origin `localhost:3001`
- Removed `apps/sound-api/` (Next.js app) entirely
- Removed `http://localhost:3001` CORS origins from all Vite configs
- **[ui]** OnboardingProgress train track component with animated steam locomotive that follows a winding SVG path between 5 onboarding stations
- feat(ui): add QuickStart component — 2-step onboarding stepper with prop-driven completion state, composes ServerSetupInfo, includes Storybook stories
- **[modules]** `remoteMonitoring` plan limit distinguishes paid (Engineer/Conductor) from free (Hobbyist) tier capabilities

changed: **[cloud]** Onboarding plan cards and pricing page updated to highlight Remote Monitoring as a paid feature
- **[ui]** 🚂 Add LocoRoster system — LocoNumberPlate, LocoCard, LocoListRow components with avatar/card/list views, railroad logos, and placeholder locomotive images
- **[cloud, throttle]** Sentry user feedback widget — persistent floating button for general feedback plus automatic report dialog on unhandled errors, with user identity pre-filled from Firebase Auth
- **[throttle]** **[cloud]** Add DEJA Server auto-detect status card to quick connect panels using same detection as header chip
- **[ui]** Shared `NotFoundPage` component with brand-aligned design and configurable nav links, wired into all apps
- **[ui]** Configurable SplashPage backgrounds with 9 options — starfield canvas, aurora animated glow, nebula, milky way, neon lines, railroad at night, dark tracks, steam locomotive, and train station; all registered in background system for app-wide use
- **[ui]** 🎨 Light mode & high-contrast theme support with WCAG AA accessibility — new `color2k`-powered a11y utilities (`ensureContrast`, `meetsContrast`, `contrastReport`), automatic color adjustment for light backgrounds, pure black-and-white high-contrast mode, backgrounds disabled in non-dark themes, and 80+ components updated from hardcoded dark colors to theme-aware CSS variables
- **[throttle]** Vercel Analytics for real-user page view and visitor tracking of train control interface
- **[server]** Cloudflare tunnel auto-starts with server on Engineer and Conductor plans; add `deja tunnel [start|stop|status|logs]` commands for manual tunnel management
- feat: redesign monitor header, device connection cards, and settings navigation

- Redesign monitor app to use MonitorStatusBar globally with server status, layout selector, and user profile
- Add deja-server device type support to connection cards with server status integration
- Move settings navigation to right side with sticky positioning (fix v-responsive overflow)
- Add server IP broadcasting from server to Firebase RTDB
- Show device IDs in cloud app port list
- Add size prop to UserProfile component
- **[ui]** New `SplashPage` component — dark full-screen splash with ambient cyan/magenta/purple gradients, centered DEJA.js logo, and a row of color-coded app icons
- **[www]** 📚 Add IO Guide, Cloud Guide, and Server Guide with CLI walkthroughs, video placeholders, shared guide components, and scroll-driven architecture page animations
- **[www]** Integrate Sanity CMS for dynamic marketing content with embedded Studio, GROQ queries, and graceful fallback to hardcoded content when env vars are missing

### Changed
- **[cloud]** Redesign left nav with grouped sections and pinned app switcher

Navigation items are now organized into three labeled sections (Modules, Hardware, System) with a Vercel-style neutral active state. The suite app links at the bottom are replaced with a compact icon-only row (Cloud, Throttle, Monitor, Tour) pinned to the drawer footer.
- **[auth]** 🎮 Replace VITE_DEMO_MODE with runtime isDemoUser check — add ensureAutoLogin, Try Demo button on throttle login, and mock DCC-EX responses for demo mode
- **[docs]** Update getting started, quick start, and installation docs for tarball-based distribution with `deja` CLI
- **[cloud]** 🎯 Streamline onboarding — reorder wizard (NameLayout → Plan → Payment → Install), add 'Use Free for Now' skip option, DejaTracker railroad progress, and persistent onboarding banner
- **[throttle]** Update login page to match cloud app layout with proper navigation event handling

### Fixed
- **[cloud]** Resolve `requireAuth is not defined` crash on track-diagram routes
- **[server]** Fix release-server CI workflow upload format and add install.sh upload to Vercel Blob
- **[ui]** Fix Storybook Tailwind CSS not generating utility classes by using absolute content paths in config
- **[server]** Handle EADDRINUSE error on WebSocket startup with a clear "port already in use" message instead of a silent crash

### Removed
- **[cloud]** Remove pending approval gate — new layouts are automatically approved on signup
added: **[cloud]** New "Setup Complete" page replaces pending approval with install script prompt, quick-add loco, and docs links

### Technical Improvements
- **[cloud]** Consolidate sound file API into cloud app as a Vercel Function, removing dependency on the standalone sound-api service
- **[docs]** 🔐 Add comprehensive ENV.md environment variable guide with config.json mapping, per-app breakdowns, and worktree setup instructions
- **[install-api]** Personalized install command with embedded UID and Layout ID — users copy one command with no manual entry required
- **[ci]** Add preview branch staging workflow — feature PRs now target `preview`, staging domains auto-update on merge, and only `preview → main` PRs require changesets and docs review
- **[server]** Clean up turnout command handling — separate device routing from command building, remove duplicate servo validation, move command types to shared package
- **[throttle]** 🎛️ Polish throttle UI — standardize button variants, container queries, draggable quick menu with throttle controls, and roster cab view

---

## [1.5.0] - 2026-03-18

### Added

- **[cloud]** Add "Install" step (step 4) to the onboarding wizard using the QuickStart component, and refactor the Setup Complete page to use QuickStart in place of the bare install command card
- **[cli]** `deja start` now launches an interactive terminal UI — scrolling log pane, live status bar (pid + uptime), and a command input line supporting `restart`, `stop`, and `help`. Two implementations available: `blessed` (default, ncurses-style with real scrolling) and `ink` (React-based, set `DEJA_UI=ink` to use).
- **[cloud, throttle]** Sentry user feedback widget — persistent floating button for general feedback plus automatic report dialog on unhandled errors, with user identity pre-filled from Firebase Auth

### Fixed

- **[cloud]** Resolve `requireAuth is not defined` crash on track-diagram routes
- **[server]** Handle EADDRINUSE error on WebSocket startup with a clear "port already in use" message instead of a silent crash

### Improved

- **[ci]** Add preview branch staging workflow — feature PRs now target `preview`, staging domains auto-update on merge, and only `preview → main` PRs require changesets and docs review

---

## [1.4.0] - 2026-03-16

### Added

#### Track Diagram Editor
- **[cloud]** VueFlow-based track diagram editor with custom track nodes and edges, live SVG preview, CSS export, and Firebase Storage upload — create and save visual layout diagrams from the Cloud app
- **[modules]** `useTrackDiagrams` composable with CRUD operations and type definitions for track diagram management
- **[firebase-config]** Firebase Storage export for file upload support

#### Navigation & UI Components
- **[cloud, ui]** Redesign left nav with grouped sections (Modules, Hardware, System) and pinned app switcher — compact icon row for Cloud, Throttle, Monitor, Tour pinned to drawer footer
- **[ui]** `QuickStart` component for guided onboarding with step-by-step server setup instructions and Storybook stories
- **[ui]** `SplashPage` component for full-screen branded landing experiences
- **[ui]** Shared `NotFoundPage` component deployed across cloud, throttle, monitor, and tour apps
- **[ui]** Configurable background system with aurora, starfield, and photo backgrounds (dark-tracks, milkyway, nebula, railroad-night, steam-locomotive, train-station-night)

#### Sanity CMS Integration
- **[www]** Integrate Sanity CMS for dynamic marketing content with embedded Studio at `/studio`, GROQ queries for site settings, homepage, FAQ, and product pages, graceful fallback to hardcoded content when env vars are missing, and dynamic sitemap generation

#### DCC-EX Roster Sync
- **[cloud, server]** Bidirectional DCC-EX CommandStation roster sync — push locos to the CommandStation from the Roster page, import locos from the CommandStation into DEJA Cloud, and auto-sync on loco save

#### Cloud App Enhancements
- **[cloud]** Sound API consolidated into cloud app — removed separate `sound-api` dependency
- **[cloud]** Upgrade page for subscription plan management
- **[server, cloud]** Cloudflare tunnel gated on paid plans with `deja tunnel` CLI commands

#### Distribution
- **[scripts]** Personalized install URL with embedded UID and layout ID
- **[cloud]** Setup Complete page replacing the pending approval gate

### Fixed

- **[ui]** Compact nav spacing, reduce icon-label gap, brand colors on app switcher
- **[ui]** Add `noreferrer` to external link `rel` attributes
- **[www]** Downgrade Sanity to v3 for React 18 compatibility and fix Studio route
- **[firebase-config]** Lazy Firebase Storage initialization and add `trackDiagrams` Firestore rules
- **[cloud]** Add Vite plugin for local Vercel API development

---

## [1.3.0] - 2026-03-14

### Added

#### Billing & Subscription System
- **[billing-api]** New Hono billing API with Stripe subscription management, webhooks, plan changes, and billing portal
- **[cloud]** Trial banner, billing settings section, PlanGate and UpgradeBanner components for subscription-aware UI
- **[cloud]** Plan selection and payment steps in onboarding wizard with Stripe checkout integration
- **[modules]** Plans module with subscription types, plan constants, and useSubscription composable
- **[server]** Subscription validation with Firebase Admin SDK, 48-hour offline grace period, and periodic re-check

#### Server Distribution & CLI
- **[server]** Standalone server distribution via tsup bundling + GitHub Releases tarball
- **[scripts]** Install script for one-line server deployment with Node.js check and serial port detection
- **[scripts]** `deja` CLI for native Node.js server management (start, stop, restart, status, logs, update)
- **[cli]** `deja start` interactive mode by default with live server output and REPL command loop
- **[cli]** `deja version` command to show installed server version
- **[ci]** GitHub Actions workflow for server tarball builds and GitHub Releases on tag push
- **[install-api]** Install API for public release hosting via Vercel Blob

#### Cloudflare Tunnel & Remote Access
- **[server]** Cloudflare Tunnel support for secure remote access to local DEJA server without port forwarding
- **[monitor]** Dashboard banner guiding remote users to configure server connection via Cloudflare tunnel

#### Cloud App Enhancements
- **[cloud]** Redesigned DCC-EX console with retro LCD terminal, predefined command grid, and command cheat sheet
- **[server]** Server-side DCC command and serial response logging to Firebase RTDB for cloud console consumption
- **[cloud]** Vercel serverless `/api/cleanup-logs` and `/api/diagnostics` endpoints
- **[cloud, throttle, monitor]** Display Firebase UID and Layout ID in Settings pages with copy-to-clipboard
- **[cloud]** Show UID and Layout ID on Pending Approval page with install instructions

#### UI & Theme System
- **[ui]** Shared theme factory (`createVuetifyThemes`) generating light, dark, and high-contrast Vuetify themes
- **[ui]** Registry-based theme mode system for extensible theme management
- **[ui]** ListMenu inline responsive mode — chip dropdowns on desktop, bottom sheet on mobile
- **[ui]** Storybook testing with 77 stories covering all components, interaction tests, and a11y checks

#### Monitor & Dashboard Redesign
- **[monitor]** Redesigned monitor app with MonitorStatusBar, device connection cards, and settings navigation
- **[cloud]** Redesigned page headers with gradient accent strip PageHeader component

#### Documentation
- **[website]** 44 MDX documentation files for dejajs-www — fixes all 404s on docs pages
- **[docs]** Overview MDX pages for cloud, monitor, and throttle apps
- **[docs]** Getting started content updated for new onboarding flow with pricing tiers

#### Automated Workflows
- **[auth]** `DEV_AUTO_LOGIN` auth bypass for automated testing
- **[ci]** `/capture-screenshots` and `/update-docs` skills for headless screenshot capture
- **[ci]** `docs-check.yml` workflow to remind about doc updates on UI PRs

### Changed

- **[monitor]** Default remote WebSocket host to ws.dejajs.com via Cloudflare Tunnel
- **[cloud]** Replace flat ModuleTitle headers with gradient accent strip PageHeader
- **[throttle, cloud, monitor]** Replace inline Vuetify theme definitions with shared factory
- **[monitor]** Convert ~100 hardcoded CSS color values to Vuetify CSS variables
- **[docs]** Updated ROADMAP.md with new P1/P2 items

### Fixed

- **[monitor]** Fix missing build script and type errors preventing production builds
- **[monitor]** Fix hardcoded `ws://` protocol that blocked WebSocket connections from HTTPS hosts
- **[ui]** Fix NaN uptime display in device connection cards by handling Firestore Timestamp objects
- **[sound-api]** Fix invalid vercel.json causing Vercel build failures
- **[docs]** Fix broken cross-reference links using incorrect path segment
- **[server]** ENABLE_WS environment variable now correctly defaults to true
- **[security]** Remove hardcoded Vercel Blob tokens from vercel.json files

### Improved

- **[monitor]** Shared WebSocket connection composable with smart protocol detection and auto-reconnect
- **[monitor]** Settings page shows live connection status and expandable tunnel setup instructions
- **[server]** Clear stale RTDB log/command queues on server startup
- **[throttle]** Vercel Analytics for real-user page view and visitor tracking
- **[throttle, cloud]** DEJA Server auto-detect status card in quick connect panels

---

## [1.2.0] - 2026-03-11

### Added

#### CV/Decoder Programming
- **[modules]** New `packages/modules/cv/` module with shared types, constants, and NMRA CV definitions for decoder programming
- **[server]** CV programming module with DCC-EX response parsing, request-response correlation via WebSocket, and timeout handling
- **[server]** Serial data listener registry in `serial.ts` for modules to subscribe to incoming serial data without modifying existing flow
- **[server]** WebSocket `cv-request`/`cv-response` protocol for bidirectional CV read/write operations (bypasses Firebase for low-latency request-response)
- **[throttle]** CV Programmer view with tabbed interface: Read/Write, CV29 Config, Address Calculator, Common CVs batch reader, and operation log
- **[throttle]** `useCvProgrammer` composable for WebSocket-based CV communication with promise correlation and auto-reconnect
- **[throttle]** CV29 bit-by-bit editor with toggle switches for direction, speed steps, analog conversion, RailCom, speed table, and long address
- **[throttle]** Address calculator with short/long address conversion (CV17/CV18) and auto-write via DCC-EX `<W address>` command
- **[throttle]** Common CVs reference table with batch read, inline editing, and factory reset (write 8 to CV8)
- **[throttle]** Support for both Service Track (read+write with ACK) and Programming on Main (write-only to addressed loco)

#### Device Connection & Dashboard Redesign
- **[cloud]** Rewrite dashboard with device connections overview and system status
- **[cloud]** `useCommandActivity` composable for tracking command throughput
- **[monitor]** Redesign dashboard as tmux-style pane grid with responsive layout, colorful stats KPIs, and per-device serial panes
- **[ui]** `DeviceConnectionCard` and `DeviceConnectionList` shared components
- **[ui]** Make device name and icon clickable to navigate to device details
- **[ui]** Link server chip to devices page with prepopulated ports and mobile layout
- **[throttle]** Device connection list on connect page with Connections menu item

#### Theme & UI Enhancements
- **[ui]** High-contrast theme support in ThemeSwitcher with device-specific colors
- **[cloud, throttle]** Configurable page backgrounds with user preferences system
- **[dejajs-www]** Updated fonts, color scheme, and new pricing page

#### Reliability & Resilience
- **[server]** Graceful shutdown with cleanup of all subsystems (serial, MQTT, Firebase, WebSocket)
- **[server]** Exponential backoff reconnection for serial, MQTT, and Firebase connections
- **[throttle]** Offline detection, command queuing, and retry logic for unreliable connections

### Changed

- **[cloud]** Rename Layout page to Devices; move Tags/Ports/Modules to Settings
- **[server]** Decouple `broadcast.ts` from transports using EventEmitter pattern
- **[server]** MQTT reconnection refactored with exponential backoff and dejaCloud cleanup

### Fixed

- **[monitor]** Auto-hide sidebar nav on dashboard and mobile views
- **[server]** Restore WebSocket and serial disconnect in dejaCloud shutdown
- **[cloud]** Resolve guard chain race conditions in router
- **[cloud]** Share layouts query between onboarding and approval guards
- **[cloud]** Fix DeviceDetails back link to navigate to Devices page
- **[throttle]** Make `queueSize` reactive with computed instead of static ref
- **[cloud, throttle]** Fix localStorage serialization, Firestore rules, and menu styling
- **[cloud]** Correct "modren" typo to "modern" on login/signup pages
- **[cloud, throttle]** Restore header gradient, update fonts and glow colors

---

## [1.1.0] - 2026-03-10

### Added

#### DEJA.js Marketing & Documentation Site
- **[dejajs-www]** Add DEJA.js marketing and documentation site to monorepo as Next.js 15 app with MDX-powered docs, product pages, screenshot carousels, and Sentry integration
- **[dejajs-www]** Dynamic MDX documentation rendering with frontmatter-driven sidebar navigation, remark-gfm support, and auto-generated doc navigation

#### Sensor & Block Occupancy System
- **[modules]** New `packages/modules/sensors/` module with composables for sensors, blocks, and automations CRUD
- **[cloud]** Sensors management UI: list, add, edit, delete sensors with advanced config
- **[cloud]** Automation builder: trigger actions on sensor state changes
- **[server]** Server-side sensor handling: debounce, cooldown, retry limits, effect/automation triggering
- **[server]** Block occupancy computation from sensor states
- **[server]** DCC-EX sensor commands: define, query sensors on command station
- **[server]** Process incoming sensor data from serial and update Firestore
- **[monitor]** SensorLogs panel with type icons and block info
- **[ui]** Shared sensor components: SensorList, SensorItem, SensorCard, SensorSwitch, SensorTable

#### Cloud Registration & Onboarding
- **[cloud]** User registration, onboarding wizard, and layout approval flow with signup, layout creation, and pending-approval gate
- **[cloud]** Empty state components with guided prompts for effects, roster, routes, signals, and turnouts collections

#### UI Component Systems
- **[ui]** Animation system with transition components (Fade, Slide, Expand, List), StatusPulse, Tailwind preset, and reduced-motion support
- **[ui]** Toast/snackbar notification system with `useNotification` composable for user-facing success, error, info, and warning messages
- **[ui]** Loading skeletons and empty states for list views with shared EmptyState component and contextual messages for locos, effects, and turnouts
- **[ui]** Share app icons (deja, cloud, throttle, monitor, tour) across all apps via @repo/ui package with Logo.vue and exported icon URLs

#### Infrastructure
- **[utils]** Structured production logging with level-gated `createLogger` utility, replacing 300+ console calls across all packages and apps

#### Sound Effects System
- **Complete sound effects management** - New comprehensive system for managing audio effects in railroad layouts:
  - **SoundPicker component** - Advanced sound browser with category tabs, search, and external library integration
  - **BBC Sound Effects Library integration** - High-quality sounds from BBC's royalty-free collection via Vercel blob store
  - **Sound effects service** - Centralized service for managing sound metadata, categories, and search functionality
  - **BBC Sound Importer** - Component for importing sounds from BBC Sound Effects Library URLs
  - **DEJA Server Device Type** - New device type representing the server machine for playing sound effects
  - **Vercel API Route Architecture** - Framework for implementing BBC sound import API in Vercel (replaces separate HTTP server)
  - **External library support** - Framework for FreeSound.org and Zapsplat integration
  - **Sound test page** - Dedicated testing interface for verifying sound effects functionality
  - **Category-based organization** - Train sounds (whistles, horns, wheel squeal), station sounds (announcements, machines), city sounds (traffic, pedestrians), nature sounds (birds, wind, water)

#### Sound Effect Types
- **Sound effect type** - New effect type in the effects system requiring sound URL configuration
- **Server-side sound handling** - Sound command processing in the effects module
- **Audio playback controls** - Play/pause/stop functionality with HTML5 Audio API integration
- **Sound metadata management** - Duration, tags, licensing, and attribution tracking

### Changed

- **[auth]** Replace users collection with layout-based onboarding and approval guards querying by owner email
- **[dejajs-www]** Restructure documentation to match app routing with per-app sections for Throttle, Cloud, Monitor, Tour, Server, Sound API, and IO Devices
- **Sound effects architecture** - Moved from monorepo package dependencies to local implementations:
  - Created local `soundService.ts` in cloud app for better reliability
  - Updated SoundPicker and SoundTest components to use local imports
  - Improved build stability by avoiding problematic monorepo exports
- **Login and signup redesign** - Full-height split layout with animated gradient, social auth buttons (Google, GitHub), password strength indicator, mobile-responsive stacked layout

### Fixed

- **[dejajs-www]** Screenshot images now display correctly in homepage carousel by using aspect-ratio sizing instead of h-full
- **[modules]** Remove hardcoded 'betatrack' layout default across all apps and composables
- **[cloud]** Fix blank page on initial load by awaiting Firebase Auth initialization before route guards execute
- **Tour app loading issues** - Resolved TypeScript compilation errors and dependency problems:
  - Fixed `currentGuest.value` references in tour store and TourLogin.vue
  - Replaced problematic `@repo/modules` imports with local implementations
  - Created local `GuestEffectCard.vue` component to avoid `@repo/ui` dependency issues
  - Updated Vite configuration to match working app patterns with proper `optimizeDeps.include`
  - Added `commonjsOptions` and proper package resolution for better compatibility
  - Tour app now builds successfully and runs on port 3003
- **Sound effects system** - Resolved import and export issues:
  - Fixed `soundEffectsService` export errors by creating local sound service
  - Resolved monorepo package resolution issues with local component copies
  - Fixed SoundPicker component import dependencies

### Improved

- **[server]** Enhanced sound playback with audio caching and improved DCC command handling
- Eliminate `any` types across 32 files with proper TypeScript typing, including typed Firebase snapshots, event handlers, and catch block narrowing
- **Sound effects infrastructure** - Comprehensive foundation for audio management:
  - **File organization** - Structured sound directories (`/sounds/train/`, `/sounds/station/`, etc.)
  - **Metadata system** - Rich sound information including duration, tags, source, and licensing
  - **Search capabilities** - Tag-based and text-based sound search functionality
  - **Category management** - Organized sound collections for easy browsing
  - **External library framework** - Extensible system for integrating additional sound sources

---

## [1.0.0] - 2025-08-12

### Added

#### Turnout Labels Feature
- **Printable turnout labels** - New route and component for generating printable turnout labels
- **Customizable label styling** - Support for custom colors and styles in turnout labels
- **LayoutChip enhancements** - Improved event handling for layout selection
- **Print-ready components** - New `TurnoutLabels.vue` component in UI package

#### Signals Management System
- **Complete signals feature** - New Signals route and view components for managing signal effects
- **Signal state management** - `SignalList` component for displaying and interacting with signal states
- **Cloud app integration** - Signals management in cloud app with enhanced effect forms
- **Signal wiring support** - EffectForm now supports signal wiring with pin effect references
- **Navigation enhancements** - Footer includes Signals page navigation button

#### Track Power Management
- **Centralized TrackPower component** - New unified component in `@repo/ui` package
- **Optimistic UI updates** - Immediate visual feedback for power state changes
- **Firebase integration** - Server-side power command handling with Firestore updates
- **Cross-app consistency** - TrackPower component integrated into cloud, monitor, and throttle apps

#### Application Startup & Management
- **Enhanced startup scripts** - New Turborepo filters for running specific app combinations
- **PM2 process management** - Added pm2 as devDependency for production process management
- **Production runbook** - Comprehensive README documentation for production deployment
- **Selective app startup** - `start` script runs server and monitor, `start:all` runs everything

#### Effect Components Suite
- **Complete Effects component suite** in `@repo/ui` package following turnout component pattern:
  - `EffectButton.vue` - Simple button for activating effects
  - `EffectCard.vue` - Detailed card view with tags and device info
  - `EffectSwitch.vue` - Compact switch-style control
  - `EffectItem.vue` - Wrapper component with view switching (`viewAs` prop)
  - `EffectRaw.vue` - Raw JSON display for debugging
  - `EffectTable.vue` - Table view for managing multiple effects
  - `EffectList.vue` - Main list component with toolbar and view switching
  - `GuestEffectCard.vue` - Enhanced card for guest/tour experiences with:
    - Automatic timeout handling with progress indicators
    - Pulse animations for active effects
    - Guest-friendly descriptions and icons
    - Better visual feedback for active states

#### Tour App Improvements
- **Real Firebase effects integration** - Replaced demo mode with actual Firebase data loading
- **Layout area navigation** - Made layout areas in LandingPage.vue clickable with router links
- **Comprehensive area data** - Updated all mock data with real layout areas:
  - Tamarack Station, Roseberry Yard, Payette Subdivision, Deadman's Curve
  - Round Valley, Thunder City, Eagle Nest, Tripod Peak
- **Enhanced media library** - Added area-specific videos and audio content
- **Improved area detail pages** - Complete information for each layout section

### Changed

#### Component Standardization
- **Throttle app effects** - Replaced custom Effects.vue and EffectItem.vue with `@repo/ui` components
  - Simplified Effects.vue to use `<EffectList />` component
  - Removed 150+ lines of duplicate code
  - Updated color scheme from purple to amber for consistency
- **Tour app effects** - Replaced custom EffectCard with `GuestEffectCard` from `@repo/ui`
  - Enhanced UX with better animations and timeout indicators
  - Consistent behavior across all apps

#### Tour App Configuration
- **Firebase integration** - Disabled demo mode (`VITE_DEMO_MODE=false`)
- **Layout ID initialization** - Proper setup using `useStorage('@DEJA/layoutId', 'betatrack')`
- **Error handling** - Added debugging and proper Firebase connection handling
- **Media content** - Replaced all mock data with realistic content matching actual layout areas

#### Package Dependencies
- **UI package reorganization** - Updated dependencies and devDependencies for better organization
- **Enhanced server modules** - Improved layout, effects, and turnouts modules with better error handling
- **Turbo configuration** - Enhanced build pipeline configuration for better app management

### Removed
- **Duplicate components** - Deleted app-specific effect components:
  - `apps/throttle/src/effects/EffectItem.vue`
  - `apps/tour/src/components/EffectCard.vue`
- **Demo mode logic** - Cleaned up tour store by removing demo effect data and logic
- **Old TrackPower components** - Replaced with unified component in UI package

### Fixed
- **VueFire SSR error** - Resolved "[VueFire SSR]: Could not get the path of the data source" by proper Firebase initialization
- **TypeScript issues** - Fixed Effect interface usage and type compatibility
- **Guest effects loading** - Proper filtering and display of `allowGuest: true` effects
- **Server-side command handling** - Improved command sending logic in effects module

### Technical Improvements
- **Consistent UI/UX** - All apps now use standardized effect components
- **Centralized maintenance** - Single source of truth for effect UI logic
- **Reduced code duplication** - Eliminated redundant component implementations
- **Better guest experience** - Enhanced tour app with professional-grade effect controls
- **Proper Firebase integration** - Tour app now connects to real layout data
- **Enhanced process management** - Better startup scripts and production deployment options

---

## Development Notes

### Component Pattern
The effect components follow the same pattern as turnout components:
- Same prop structure (`effect`, `effectId`, `state`)
- Same event emissions (`update:state`)
- Same view switching logic (`viewAs` prop)
- Same timeout handling with `useTimeoutFn`
- Same storage preferences for view and sort

### Usage Examples
```vue
<!-- Basic button -->
<EffectButton :effect="myEffect" @update:state="handleStateChange" />

<!-- Guest-friendly card for tour app -->
<GuestEffectCard
  :effect="myEffect"
  @activate="onActivate"
  @deactivate="onDeactivate"
/>

<!-- Full list with view switching -->
<EffectList />
```

### Migration Guide
Apps using custom effect components should:
1. Replace imports: `import { EffectList, GuestEffectCard } from '@repo/ui'`
2. Update component usage to match new prop names
3. Remove old custom components
4. Test effect activation/deactivation functionality

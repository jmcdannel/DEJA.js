# Changelog

All notable changes to the DEJA.js project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

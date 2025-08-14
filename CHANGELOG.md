# Changelog

All notable changes to the DEJA.js project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### Sound Effects System
- **Complete sound effects management** - New comprehensive system for managing audio effects in railroad layouts:
  - **SoundPicker component** - Advanced sound browser with category tabs, search, and external library integration
  - **Curated sound collections** - Pre-configured sounds organized by category (train, station, city, nature, ambient, mechanical, transport, industrial)
  - **Sound effects service** - Centralized service for managing sound metadata, categories, and search functionality
  - **BBC Sound Effects Library integration** - Ready for integration with BBC's high-quality, royalty-free sound collection
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

### Fixed
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
  - Sound effects system now builds and runs successfully

### Changed
- **Sound effects architecture** - Moved from monorepo package dependencies to local implementations:
  - Created local `soundService.ts` in cloud app for better reliability
  - Updated SoundPicker and SoundTest components to use local imports
  - Improved build stability by avoiding problematic monorepo exports

### Technical Improvements
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
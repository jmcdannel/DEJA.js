# Changelog

All notable changes to the DEJA.js project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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

### Removed
- **Duplicate components** - Deleted app-specific effect components:
  - `apps/throttle/src/effects/EffectItem.vue`
  - `apps/tour/src/components/EffectCard.vue`
- **Demo mode logic** - Cleaned up tour store by removing demo effect data and logic

### Fixed
- **VueFire SSR error** - Resolved "[VueFire SSR]: Could not get the path of the data source" by proper Firebase initialization
- **TypeScript issues** - Fixed Effect interface usage and type compatibility
- **Guest effects loading** - Proper filtering and display of `allowGuest: true` effects

### Technical Improvements
- **Consistent UI/UX** - All apps now use standardized effect components
- **Centralized maintenance** - Single source of truth for effect UI logic
- **Reduced code duplication** - Eliminated redundant component implementations
- **Better guest experience** - Enhanced tour app with professional-grade effect controls
- **Proper Firebase integration** - Tour app now connects to real layout data

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
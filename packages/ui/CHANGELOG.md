# @repo/ui

## 0.1.0

### Minor Changes

- 83af116: added: **[ui]** Shared theme factory (`createVuetifyThemes`) generating light, dark, and high-contrast Vuetify themes from per-app identity colors

  added: **[ui]** Registry-based theme mode system (`THEME_MODES`, `THEME_MODE_DEFINITIONS`) for extensible theme management

  changed: **[ui]** Rewrite `useThemeSwitcher` composable to be registry-driven with proper Tailwind HTML class sync

  changed: **[throttle]** Replace inline Vuetify theme definitions with shared `createVuetifyThemes` factory

  changed: **[cloud]** Replace inline Vuetify theme definitions with shared `createVuetifyThemes` factory

  changed: **[monitor]** Replace single `monitorDark` theme with full light/dark/high-contrast support via shared factory

  changed: **[monitor]** Convert ~100 hardcoded CSS color values to Vuetify CSS variables for theme-aware styling

- ca184e7: feat: redesign monitor header, device connection cards, and settings navigation

  - Redesign monitor app to use MonitorStatusBar globally with server status, layout selector, and user profile
  - Add deja-server device type support to connection cards with server status integration
  - Move settings navigation to right side with sticky positioning (fix v-responsive overflow)
  - Add server IP broadcasting from server to Firebase RTDB
  - Show device IDs in cloud app port list
  - Add size prop to UserProfile component

- 4412106: added: **[ui]** Add Storybook testing with 77 stories covering all components, interaction tests, and a11y checks

### Patch Changes

- 59c43df: redesigned: **[cloud]** Replace flat ModuleTitle headers with gradient accent strip PageHeader component across all cloud app pages

  improved: **[cloud]** Eliminate duplicate headers on Turnouts, Layout, and Settings pages

  added: **[ui]** ListMenu inline responsive mode — inline toolbar with chip dropdowns on desktop, bottom sheet on mobile

- b401fbc: fixed: **[ui]** Fix NaN uptime display in device connection cards and system overview by handling Firestore Timestamp objects
- Updated dependencies [7a7be39]
- Updated dependencies [ca184e7]
  - @repo/modules@0.1.0

# Adding New Theme Modes

This guide explains how to add a new theme mode (e.g., "solarized", "midnight") to the DEJA.js theme system.

## Steps

### 1. Add the mode name to the `ThemeMode` union

In `packages/ui/src/themes/types.ts`, extend the union:

```ts
// Before:
export type ThemeMode = 'light' | 'dark' | 'high-contrast'

// After:
export type ThemeMode = 'light' | 'dark' | 'high-contrast' | 'solarized'
```

### 2. Add a mode definition

In `packages/ui/src/themes/modes.ts`, add to `THEME_MODE_DEFINITIONS`:

```ts
solarized: {
  dark: true,  // or false for a light-based mode
  htmlClasses: ['dark', 'solarized'],  // classes added to <html>
  backgrounds: {
    background: '#002b36',
    surface: '#073642',
    'surface-bright': '#586e75',
    'surface-light': '#657b83',
    'surface-variant': '#073642',
  },
  variables: {
    'border-color': '#839496',
    'border-opacity': 0.2,
    'high-emphasis-opacity': 0.87,
    'medium-emphasis-opacity': 0.60,
    'disabled-opacity': 0.38,
    'idle-opacity': 0.04,
    'hover-opacity': 0.06,
    'focus-opacity': 0.12,
    'selected-opacity': 0.08,
    'activated-opacity': 0.12,
    'pressed-opacity': 0.12,
    'dragged-opacity': 0.08,
    'theme-kbd': '#073642',
    'theme-on-kbd': '#93a1a1',
    'theme-code': '#002b36',
    'theme-on-code': '#93a1a1',
  },
},
```

### 3. Add to the THEME_MODES array

In `packages/ui/src/themes/modes.ts`, add the mode name to control cycle order:

```ts
export const THEME_MODES: ThemeMode[] = ['light', 'dark', 'high-contrast', 'solarized']
```

### 4. (Optional) Add per-mode overrides in app configs

In any app's `createVuetifyThemes()` call, add mode-specific overrides:

```ts
const themes = createVuetifyThemes({
  primary: '#00E5FF',
  secondary: '#D500F9',
  accent: '#C6FF00',
  solarized: {
    primary: '#268bd2',  // solarized blue
  },
  custom: {
    solarized: { 'device-connected': '#859900' },
  },
})
```

### 5. (Optional) Add CSS targeting

Use the HTML class for mode-specific CSS overrides:

```css
.solarized .monitor-card {
  /* solarized-specific styles */
}
```

## What Happens Automatically

- The factory generates the new theme for **all apps** that call `createVuetifyThemes()`
- `useThemeSwitcher.cycleTheme()` includes the new mode in its rotation
- `applyTheme()` applies the correct HTML classes and Vuetify theme name
- No changes needed to `App.vue`, `ThemeSwitcher.vue`, or any other component

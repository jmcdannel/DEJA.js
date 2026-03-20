# App Themes Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a shared theme factory in `@repo/ui` that generates Vuetify theme objects (light, dark, high-contrast) from per-app identity colors, fix App.vue bindings in all three apps, and convert Monitor's hardcoded CSS to theme-aware variables.

**Architecture:** A registry-based theme mode system in `packages/ui/src/themes/` provides `createVuetifyThemes(config)` which each app calls with its identity colors. The existing `useThemeSwitcher` composable is updated to use the registry as source of truth. Monitor gets full theme integration and its 732-line `style.css` is converted to use Vuetify CSS variables.

**Tech Stack:** Vue 3, Vuetify 3 (ThemeDefinition API), TypeScript, Tailwind CSS (class-based dark mode)

**Spec:** `docs/superpowers/specs/2026-03-12-app-themes-design.md`

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `packages/ui/src/themes/types.ts` | `AppThemeConfig`, `ThemeMode`, `ThemeOverrides`, `ThemeVariables` interfaces |
| `packages/ui/src/themes/modes.ts` | `THEME_MODES` array, `THEME_MODE_DEFINITIONS` map, `ThemeModeDefinition` interface |
| `packages/ui/src/themes/createVuetifyThemes.ts` | Factory function that generates Vuetify `ThemeDefinition` objects |
| `packages/ui/src/themes/index.ts` | Barrel re-exports for themes module |
| `packages/ui/src/themes/ADDING_THEMES.md` | Guide for adding new theme modes |

### Modified Files
| File | Change |
|------|--------|
| `packages/ui/src/index.ts` | Add theme exports |
| `packages/ui/src/composables/useThemeSwitcher.ts` | Import from registry, remove local `ThemeMode` type |
| `apps/throttle/src/main.ts` | Replace inline themes with `createVuetifyThemes()` call |
| `apps/throttle/src/App.vue` | Bind `:theme="themePreference"` instead of ternary |
| `apps/cloud/src/main.ts` | Replace inline themes with `createVuetifyThemes()` call |
| `apps/cloud/src/App.vue` | Bind `:theme="themePreference"` instead of ternary |
| `apps/monitor/src/main.ts` | Replace `monitorDark` theme with `createVuetifyThemes()`, remove unused `pad` import |
| `apps/monitor/src/App.vue` | Replace `ref('monitorDark')` with `useThemeSwitcher()`, update both `<v-app>` elements |
| `apps/monitor/src/style.css` | Convert hardcoded colors to Vuetify CSS variables, remove body overrides |

---

## Chunk 1: Theme Infrastructure

### Task 1: Create Theme Types

**Files:**
- Create: `packages/ui/src/themes/types.ts`

- [ ] **Step 1: Create the types file**

```ts
// packages/ui/src/themes/types.ts

/** The supported theme modes */
export type ThemeMode = 'light' | 'dark' | 'high-contrast'

/** Any Vuetify theme color that can be overridden */
export interface ThemeOverrides {
  background: string
  surface: string
  'surface-bright': string
  'surface-light': string
  'surface-variant': string
  'on-surface': string
  'on-surface-variant': string
  primary: string
  secondary: string
  accent: string
  error: string
  info: string
  success: string
  warning: string
  [key: string]: string
}

/** Vuetify theme variables (opacity, border, hover, kbd/code styling) */
export interface ThemeVariables {
  'border-color': string
  'border-opacity': number
  'high-emphasis-opacity': number
  'medium-emphasis-opacity': number
  'disabled-opacity': number
  'idle-opacity': number
  'hover-opacity': number
  'focus-opacity': number
  'selected-opacity': number
  'activated-opacity': number
  'pressed-opacity': number
  'dragged-opacity': number
  'theme-kbd': string
  'theme-on-kbd': string
  'theme-code': string
  'theme-on-code': string
  [key: string]: string | number
}

/** Colors that define an app's visual identity */
export interface AppThemeConfig {
  /** App's primary brand color (e.g. '#00E5FF') */
  primary: string
  /** App's secondary brand color (e.g. '#D500F9') */
  secondary: string
  /** App's accent color (e.g. '#C6FF00') */
  accent: string
  /** Per-mode overrides for any theme color */
  light?: Partial<ThemeOverrides>
  dark?: Partial<ThemeOverrides>
  'high-contrast'?: Partial<ThemeOverrides>
  /** App-specific custom colors per mode (e.g. device-connected, stat-card) */
  custom?: Partial<Record<ThemeMode, Record<string, string>>>
}
```

- [ ] **Step 2: Verify file was created correctly**

Run: `cat packages/ui/src/themes/types.ts | head -5`
Expected: The first few lines of the file

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/themes/types.ts
git commit -m "feat(ui): add theme type definitions"
```

---

### Task 2: Create Theme Mode Registry

**Files:**
- Create: `packages/ui/src/themes/modes.ts`

- [ ] **Step 1: Create the modes file**

```ts
// packages/ui/src/themes/modes.ts

import type { ThemeMode, ThemeVariables } from './types'

/** Definition for a single theme mode */
export interface ThemeModeDefinition {
  /** Vuetify dark flag */
  dark: boolean
  /** CSS classes to add to <html> when this mode is active */
  htmlClasses: string[]
  /** Base background/surface colors for this mode */
  backgrounds: {
    background: string
    surface: string
    'surface-bright': string
    'surface-light': string
    'surface-variant': string
  }
  /** Vuetify variables for this mode */
  variables: ThemeVariables
  /** How to transform identity colors for this mode */
  colorTransform?: (color: string) => string
}

/** Ordered list of theme modes — determines cycle order in useThemeSwitcher */
export const THEME_MODES: ThemeMode[] = ['light', 'dark', 'high-contrast']

/** Mode definitions — the source of truth for all theme behavior */
export const THEME_MODE_DEFINITIONS: Record<ThemeMode, ThemeModeDefinition> = {
  light: {
    dark: false,
    htmlClasses: [],
    backgrounds: {
      background: '#F0F4F8',
      surface: '#FFFFFF',
      'surface-bright': '#FFFFFF',
      'surface-light': '#F8FAFC',
      'surface-variant': '#E2E8F0',
    },
    variables: {
      'border-color': '#000000',
      'border-opacity': 0.12,
      'high-emphasis-opacity': 0.87,
      'medium-emphasis-opacity': 0.60,
      'disabled-opacity': 0.38,
      'idle-opacity': 0.04,
      'hover-opacity': 0.04,
      'focus-opacity': 0.12,
      'selected-opacity': 0.08,
      'activated-opacity': 0.12,
      'pressed-opacity': 0.12,
      'dragged-opacity': 0.08,
      'theme-kbd': '#212529',
      'theme-on-kbd': '#FFFFFF',
      'theme-code': '#F5F5F5',
      'theme-on-code': '#000000',
    },
  },
  dark: {
    dark: true,
    htmlClasses: ['dark'],
    backgrounds: {
      background: '#0B1120',
      surface: '#111827',
      'surface-bright': '#1F2937',
      'surface-light': '#374151',
      'surface-variant': '#374151',
    },
    variables: {
      'border-color': '#FFFFFF',
      'border-opacity': 0.12,
      'high-emphasis-opacity': 0.87,
      'medium-emphasis-opacity': 0.60,
      'disabled-opacity': 0.38,
      'idle-opacity': 0.04,
      'hover-opacity': 0.04,
      'focus-opacity': 0.12,
      'selected-opacity': 0.08,
      'activated-opacity': 0.12,
      'pressed-opacity': 0.12,
      'dragged-opacity': 0.08,
      'theme-kbd': '#212529',
      'theme-on-kbd': '#FFFFFF',
      'theme-code': '#F5F5F5',
      'theme-on-code': '#000000',
    },
  },
  'high-contrast': {
    dark: true,
    htmlClasses: ['dark', 'high-contrast'],
    backgrounds: {
      background: '#000000',
      surface: '#1A1A1A',
      'surface-bright': '#333333',
      'surface-light': '#2A2A2A',
      'surface-variant': '#2A2A2A',
    },
    variables: {
      'border-color': '#FFFFFF',
      'border-opacity': 0.3,
      'high-emphasis-opacity': 1,
      'medium-emphasis-opacity': 0.8,
      'disabled-opacity': 0.5,
      'idle-opacity': 0.2,
      'hover-opacity': 0.08,
      'focus-opacity': 0.16,
      'selected-opacity': 0.12,
      'activated-opacity': 0.16,
      'pressed-opacity': 0.16,
      'dragged-opacity': 0.12,
      'theme-kbd': '#000000',
      'theme-on-kbd': '#FFFFFF',
      'theme-code': '#1A1A1A',
      'theme-on-code': '#FFFFFF',
    },
  },
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/ui/src/themes/modes.ts
git commit -m "feat(ui): add theme mode registry with light/dark/high-contrast definitions"
```

---

### Task 3: Create Theme Factory

**Files:**
- Create: `packages/ui/src/themes/createVuetifyThemes.ts`

- [ ] **Step 1: Create the factory function**

```ts
// packages/ui/src/themes/createVuetifyThemes.ts

import type { ThemeDefinition } from 'vuetify'
import type { AppThemeConfig, ThemeMode } from './types'
import { THEME_MODES, THEME_MODE_DEFINITIONS } from './modes'

/** Shared semantic colors — adjusted per mode */
const SEMANTIC_COLORS: Record<ThemeMode, Record<string, string>> = {
  light: {
    error: '#FF1744',
    info: '#2979FF',
    success: '#00E676',
    warning: '#FF9100',
  },
  dark: {
    error: '#FF1744',
    info: '#2979FF',
    success: '#00E676',
    warning: '#FF9100',
  },
  'high-contrast': {
    error: '#FF0000',
    info: '#00BFFF',
    success: '#00FF00',
    warning: '#FFA500',
  },
}

/**
 * Generate all registered Vuetify themes from an app's identity colors.
 *
 * @param config - The app's identity colors and optional per-mode overrides
 * @returns Record<ThemeMode, ThemeDefinition> — one theme per registered mode
 */
export function createVuetifyThemes(
  config: AppThemeConfig
): Record<string, ThemeDefinition> {
  const themes: Record<string, ThemeDefinition> = {}

  for (const mode of THEME_MODES) {
    const modeDef = THEME_MODE_DEFINITIONS[mode]
    const modeOverrides = config[mode] ?? {}
    const customColors = config.custom?.[mode] ?? {}
    const semantics = SEMANTIC_COLORS[mode]

    // Apply color transform if defined (e.g. high-contrast saturates)
    const primary = modeDef.colorTransform
      ? modeDef.colorTransform(config.primary)
      : config.primary
    const secondary = modeDef.colorTransform
      ? modeDef.colorTransform(config.secondary)
      : config.secondary
    const accent = modeDef.colorTransform
      ? modeDef.colorTransform(config.accent)
      : config.accent

    themes[mode] = {
      dark: modeDef.dark,
      colors: {
        // 1. Base backgrounds/surfaces from mode definition
        ...modeDef.backgrounds,
        // 2. On-surface defaults
        'on-surface-variant': mode === 'high-contrast' ? '#FFFFFF' : modeDef.dark ? '#E2E8F0' : '#334155',
        // 3. Identity colors
        primary,
        secondary,
        accent,
        // 4. Semantic colors (adjusted per mode)
        ...semantics,
        // 5. Per-mode overrides from app config
        ...modeOverrides,
        // 6. Custom colors for this mode
        ...customColors,
      },
      variables: {
        ...modeDef.variables,
      },
    }
  }

  return themes
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/ui/src/themes/createVuetifyThemes.ts
git commit -m "feat(ui): add createVuetifyThemes factory function"
```

---

### Task 4: Create Barrel Exports

**Files:**
- Create: `packages/ui/src/themes/index.ts`
- Modify: `packages/ui/src/index.ts:1-66`

- [ ] **Step 1: Create the themes barrel export**

```ts
// packages/ui/src/themes/index.ts

export { createVuetifyThemes } from './createVuetifyThemes'
export { THEME_MODES, THEME_MODE_DEFINITIONS } from './modes'
export type { ThemeModeDefinition } from './modes'
export type { AppThemeConfig, ThemeMode, ThemeOverrides, ThemeVariables } from './types'
```

- [ ] **Step 2: Add theme exports to the main `@repo/ui` barrel**

In `packages/ui/src/index.ts`, add these lines at the end of the file (after line 66):

```ts
// Themes
export { createVuetifyThemes, THEME_MODES, THEME_MODE_DEFINITIONS } from './themes'
export type { AppThemeConfig, ThemeMode, ThemeOverrides, ThemeVariables, ThemeModeDefinition } from './themes'

// Composables
export { useThemeSwitcher } from './composables/useThemeSwitcher'
```

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/themes/index.ts packages/ui/src/index.ts
git commit -m "feat(ui): add barrel exports for themes and useThemeSwitcher"
```

---

### Task 5: Update useThemeSwitcher to Use Registry

**Files:**
- Modify: `packages/ui/src/composables/useThemeSwitcher.ts:1-65`

- [ ] **Step 1: Update useThemeSwitcher**

Replace the entire file contents:

```ts
// packages/ui/src/composables/useThemeSwitcher.ts

import { ref, watch, onMounted } from 'vue'
import { useStorage } from '@vueuse/core'
import { useTheme as useVuetifyTheme } from 'vuetify'
import type { ThemeMode } from '../themes/types'
import { THEME_MODES, THEME_MODE_DEFINITIONS } from '../themes/modes'

export type { ThemeMode }

export function useThemeSwitcher() {
  const vuetifyTheme = useVuetifyTheme()

  // Store the user's explicit preference
  const themePreference = useStorage<ThemeMode>('@DEJA/theme-preference', 'dark')

  // Computed actual state (light or dark)
  const isDark = ref(false)

  const applyTheme = (mode: ThemeMode) => {
    const modeDef = THEME_MODE_DEFINITIONS[mode]
    isDark.value = modeDef.dark

    // Sync HTML classes from mode definition
    const html = document.documentElement
    // Remove all possible theme classes first
    const allClasses = THEME_MODES.flatMap(m => THEME_MODE_DEFINITIONS[m].htmlClasses)
    const uniqueClasses = [...new Set(allClasses)]
    uniqueClasses.forEach(cls => html.classList.remove(cls))
    // Add classes for the current mode
    modeDef.htmlClasses.forEach(cls => html.classList.add(cls))

    // Update Vuetify theme name directly
    vuetifyTheme.global.name.value = mode
  }

  // Watch for changes in preference
  watch(themePreference, (newPref) => {
    applyTheme(newPref)
  })

  // Initialize on mount
  onMounted(() => {
    applyTheme(themePreference.value)
  })

  const setTheme = (mode: ThemeMode) => {
    themePreference.value = mode
  }

  const cycleTheme = () => {
    const currentIndex = THEME_MODES.indexOf(themePreference.value)
    const nextIndex = (currentIndex + 1) % THEME_MODES.length
    setTheme(THEME_MODES[nextIndex])
  }

  return {
    themePreference,
    isDark,
    setTheme,
    cycleTheme
  }
}
```

Key changes from the original (`packages/ui/src/composables/useThemeSwitcher.ts`):
- Line 5: Remove local `export type ThemeMode = 'light' | 'dark' | 'high-contrast'` — import from `../themes/types` instead
- Line 8: Add re-export `export type { ThemeMode }` for backwards compatibility
- `applyTheme()`: Replace manual if/else HTML class logic (old lines 17-36) with registry-driven class management using `THEME_MODE_DEFINITIONS[mode].htmlClasses`
- `isDark`: Use `THEME_MODE_DEFINITIONS[mode].dark` instead of string comparison (old line 17)
- `cycleTheme()`: Use `THEME_MODES` array instead of local hardcoded `order` array (old lines 53-56)

- [ ] **Step 2: Verify types compile**

Run: `cd packages/ui && npx tsc --noEmit src/composables/useThemeSwitcher.ts --skipLibCheck 2>&1 | head -20`
Expected: No errors, or only errors about missing ambient types (not about our code)

- [ ] **Step 3: Commit**

```bash
git add packages/ui/src/composables/useThemeSwitcher.ts
git commit -m "refactor(ui): update useThemeSwitcher to use theme mode registry"
```

---

## Chunk 2: App Integration (Throttle & Cloud)

### Task 6: Update Throttle App

**Files:**
- Modify: `apps/throttle/src/main.ts:1-187`
- Modify: `apps/throttle/src/App.vue:43,62`

- [ ] **Step 1: Replace inline themes in throttle main.ts**

In `apps/throttle/src/main.ts`:

1. Add import after line 16 (`import { firebaseApp } from '@repo/firebase-config'`):
```ts
import { createVuetifyThemes } from '@repo/ui'
```

2. Remove the entire `light` object (lines 21-63), `dark` object (lines 65-106), and `highContrast` object (lines 108-140). Replace all three with:
```ts
const themes = createVuetifyThemes({
  primary: '#00E5FF',
  secondary: '#D500F9',
  accent: '#C6FF00',
  light: {
    primary: '#00B8D4',
  },
  custom: {
    light: { 'device-connected': '#4CAF50', 'device-disconnected': '#F44336', 'stat-card': '#F5F7FA' },
    dark: { 'device-connected': '#66BB6A', 'device-disconnected': '#EF5350', 'stat-card': '#1A2332' },
    'high-contrast': { 'device-connected': '#00FF00', 'device-disconnected': '#FF0000', 'stat-card': '#1A1A1A' },
  },
})
```

Note: The old inline themes included `primary-darken-1` and `secondary-darken-1` colors. These are NOT used anywhere in the codebase (verified via grep — only defined in theme configs, never referenced by components or CSS). The factory intentionally does not generate them.

3. Update the `theme` property in `createVuetify()` (currently lines 156-163):
```ts
  theme: {
    defaultTheme: 'dark',
    themes,
  },
```

- [ ] **Step 2: Fix throttle App.vue theme binding**

In `apps/throttle/src/App.vue`:

1. Line 43: Change `const { isDark } = useThemeSwitcher()` to:
```ts
const { isDark, themePreference } = useThemeSwitcher()
```

2. Line 62: Change `<v-app :theme="isDark ? 'dark' : 'light'"` to:
```vue
<v-app :theme="themePreference"
```

- [ ] **Step 3: Commit**

```bash
git add apps/throttle/src/main.ts apps/throttle/src/App.vue
git commit -m "feat(throttle): use shared theme factory, fix high-contrast binding"
```

---

### Task 7: Update Cloud App

**Files:**
- Modify: `apps/cloud/src/main.ts:1-203`
- Modify: `apps/cloud/src/App.vue:56,72`

- [ ] **Step 1: Replace inline themes in cloud main.ts**

In `apps/cloud/src/main.ts`:

1. Add import after line 15 (`import { firebaseApp } from '@repo/firebase-config'`):
```ts
import { createVuetifyThemes } from '@repo/ui'
```

2. Remove the entire `light` object (lines 28-70), `dark` object (lines 71-112), and `highContrast` object (lines 114-146). Replace all three with:
```ts
const themes = createVuetifyThemes({
  primary: '#00E5FF',
  secondary: '#D500F9',
  accent: '#C6FF00',
  light: {
    primary: '#00B8D4',
  },
  custom: {
    light: { 'device-connected': '#4CAF50', 'device-disconnected': '#F44336', 'stat-card': '#F5F7FA' },
    dark: { 'device-connected': '#66BB6A', 'device-disconnected': '#EF5350', 'stat-card': '#1A2332' },
    'high-contrast': { 'device-connected': '#00FF00', 'device-disconnected': '#FF0000', 'stat-card': '#1A1A1A' },
  },
})
```

3. Update the `theme` property in `createVuetify()` (currently lines 172-179):
```ts
  theme: {
    defaultTheme: 'dark',
    themes,
  },
```

4. Remove the unused `colors` import on line 11:
```ts
// DELETE: import colors from 'vuetify/util/colors'
```
This import is not referenced as a value anywhere — the `colors:` keys in the inline themes were object property names, not references to this import. Removing the inline themes makes this a lint error.

Note: Keep `VStepperVertical` import (line 9) and the `defaults` section (lines 153-163) — those are app-specific and stay.

- [ ] **Step 2: Fix cloud App.vue theme binding**

In `apps/cloud/src/App.vue`:

1. Line 56: Change `const { isDark } = useThemeSwitcher()` to:
```ts
const { isDark, themePreference } = useThemeSwitcher()
```

2. Line 72: Change `<v-app :theme="isDark ? 'dark' : 'light'"` to:
```vue
<v-app :theme="themePreference"
```

- [ ] **Step 3: Commit**

```bash
git add apps/cloud/src/main.ts apps/cloud/src/App.vue
git commit -m "feat(cloud): use shared theme factory, fix high-contrast binding"
```

---

## Chunk 3: Monitor Integration

### Task 8: Update Monitor main.ts and App.vue

**Files:**
- Modify: `apps/monitor/src/main.ts:30,86-108`
- Modify: `apps/monitor/src/App.vue:1-155`

- [ ] **Step 1: Update monitor main.ts**

In `apps/monitor/src/main.ts`:

1. Add import after line 17 (`import { firebaseApp } from '@repo/firebase-config'`):
```ts
import { createVuetifyThemes } from '@repo/ui'
```

2. Remove the unused import on line 30:
```ts
// DELETE: import { pad } from 'vuetify/lib/components/VTimePicker/util.mjs'
```

3. Replace the `theme` property in `createVuetify()` (currently lines 86-108) from:
```ts
  theme: {
    defaultTheme: 'monitorDark',
    themes: {
      monitorDark: {
        dark: true,
        colors: { ... },
        variables: { ... },
      },
    },
  },
```
To:
```ts
  theme: {
    defaultTheme: 'dark',
    themes: createVuetifyThemes({
      primary: '#38bdf8',
      secondary: '#22d3ee',
      accent: '#a78bfa',
      light: {
        background: '#f1f5f9',
        surface: '#ffffff',
      },
      custom: {
        dark: { 'monitor-glow': '#38bdf8' },
        light: { 'monitor-glow': '#0284c7' },
        'high-contrast': { 'monitor-glow': '#00FFFF' },
      },
    }),
  },
```

- [ ] **Step 2: Update monitor App.vue**

In `apps/monitor/src/App.vue`:

1. Add import — after line 7 (`import { AppHeader, TransitionFade, NotificationContainer, provideNotifications, PageBackground } from '@repo/ui'`), add:
```ts
import { useThemeSwitcher } from '@repo/ui/src/composables/useThemeSwitcher'
```

2. Line 59: Remove `const theme = ref('monitorDark')` and replace with:
```ts
const { themePreference } = useThemeSwitcher()
```

3. Line 98: Change `<v-app v-if="user" :theme="theme">` to:
```vue
<v-app v-if="user" :theme="themePreference">
```

4. Line 150: Change `<v-app v-else :theme="theme">` to:
```vue
<v-app v-else :theme="themePreference">
```

- [ ] **Step 3: Commit**

```bash
git add apps/monitor/src/main.ts apps/monitor/src/App.vue
git commit -m "feat(monitor): integrate theme factory and useThemeSwitcher"
```

---

### Task 9: Convert Monitor CSS to Theme-Aware Variables

**Files:**
- Modify: `apps/monitor/src/style.css:1-732`

This is the largest task. The monitor's `style.css` has hardcoded dark-mode colors throughout. We need to:
1. Remove body-level color overrides (let Vuetify handle them)
2. Remove `.v-theme--monitorDark` selectors (theme renamed)
3. Convert hardcoded rgba colors to Vuetify CSS variable equivalents

- [ ] **Step 1: Fix body/root-level overrides**

In `apps/monitor/src/style.css`:

1. Lines 15-20 — Remove the hardcoded body colors. Change:
```css
body {
  background-color: #020617;
  color: #e2e8f0;
  font-size: 0.8125rem;
  letter-spacing: 0.01em;
}
```
To:
```css
body {
  font-size: 0.8125rem;
  letter-spacing: 0.01em;
}
```

2. Lines 22-24 — Make color-scheme conditional on dark class. Change:
```css
:root {
  color-scheme: dark;
}
```
To:
```css
.dark {
  color-scheme: dark;
}
```

- [ ] **Step 2: Remove `.v-theme--monitorDark` selectors**

Remove or convert the three `.v-theme--monitorDark` selectors (lines 38-62). These will break since the theme is now named `dark` instead of `monitorDark`. The `color-mix` approach they use works with `currentColor` and is theme-independent, so we can drop the `.v-theme--monitorDark` qualifier:

1. Line 38: Change `.v-theme--monitorDark .monitor-card.v-card--variant-tonal` to:
```css
.monitor-card.v-card--variant-tonal
```

2. Line 44: Change `.v-theme--monitorDark .monitor-card.v-card--variant-tonal::after` to:
```css
.monitor-card.v-card--variant-tonal::after
```

3. Line 53: Change `.v-theme--monitorDark .monitor-card.v-card--variant-tonal .v-card__underlay` to:
```css
.monitor-card.v-card--variant-tonal .v-card__underlay
```

- [ ] **Step 3: Convert `.monitor-card` base styles to CSS variables**

Lines 27-36 — Change the `.monitor-card` class. Replace hardcoded colors with Vuetify CSS variables:

```css
.monitor-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.18);
  background: radial-gradient(120% 140% at 0% 0%, rgba(var(--v-theme-primary), 0.12), transparent 55%),
    linear-gradient(180deg, rgba(var(--v-theme-surface), 0.92) 0%, rgba(var(--v-theme-background), 0.9) 100%);
  box-shadow: 0 28px 65px -40px rgba(var(--v-theme-primary), 0.55);
  transition: border-color 150ms ease, box-shadow 150ms ease, transform 150ms ease;
  backdrop-filter: blur(6px);
}
```

- [ ] **Step 4: Convert `.monitor-card` pseudo-element and hover**

Lines 64-81:

```css
.monitor-card::after {
  content: '';
  position: absolute;
  left: 18px;
  right: 18px;
  top: 8px;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(var(--v-theme-primary), 0.6), rgba(var(--v-theme-secondary), 0.35));
  opacity: 0.9;
  pointer-events: none;
}

.monitor-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.45);
  box-shadow: 0 32px 80px -36px rgba(var(--v-theme-secondary), 0.65);
}
```

- [ ] **Step 5: Convert `.monitor-card__header`**

Lines 83-95:

```css
.monitor-card__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: linear-gradient(90deg, rgba(var(--v-theme-primary), 0.16), transparent);
  text-transform: uppercase;
  font-size: 0.68rem;
  letter-spacing: 0.2em;
  font-weight: 600;
  color: rgba(var(--v-theme-primary), 0.85);
}
```

- [ ] **Step 6: Convert remaining `.monitor-card__*` text color classes**

Lines 107-112 (`.monitor-card__subtitle`):
```css
.monitor-card__subtitle {
  font-size: 0.625rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), 0.55);
}
```

Lines 120-126 (`.monitor-card__icon-btn`):
```css
.monitor-card__icon-btn {
  border-radius: 999px !important;
  background-color: rgba(var(--v-theme-surface), 0.55) !important;
  border: 1px solid rgba(var(--v-theme-primary), 0.25);
  color: rgba(var(--v-theme-on-surface), 0.9) !important;
  transition: background-color 120ms ease, border-color 120ms ease, color 120ms ease;
}
```

Lines 128-132 (`.monitor-card__icon-btn:hover`):
```css
.monitor-card__icon-btn:hover {
  background-color: rgba(var(--v-theme-primary), 0.2) !important;
  border-color: rgba(var(--v-theme-primary), 0.5);
  color: rgb(var(--v-theme-on-surface)) !important;
}
```

Lines 134-137 (`.monitor-card__icon-btn:focus-visible`):
```css
.monitor-card__icon-btn:focus-visible {
  outline: 2px solid rgba(var(--v-theme-primary), 0.65);
  outline-offset: 2px;
}
```

- [ ] **Step 7: Convert `.monitor-card__footer` and related**

Lines 143-149 (`.monitor-card__footer`, `.monitor-card__actions`, `.monitor-card__toolbar-row`):
```css
.monitor-card__footer,
.monitor-card__actions,
.monitor-card__toolbar-row {
  padding: 0.85rem 1.25rem !important;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: linear-gradient(180deg, transparent, rgba(var(--v-theme-background), 0.45));
}
```

Lines 151-156 (`.monitor-card__log-list`):
```css
.monitor-card__log-list {
  font-family: 'Roboto Mono', 'Roboto', 'Segoe UI', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 0.02em;
  color: rgba(var(--v-theme-on-surface), 0.92);
}
```

Lines 158-160 (`.monitor-card__log-list li`):
```css
.monitor-card__log-list li {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
```

Lines 166-171 (`.monitor-card__alert`):
```css
.monitor-card__alert {
  border-radius: 0.65rem !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgba(var(--v-theme-surface), 0.45);
  backdrop-filter: blur(4px);
}
```

Lines 173-178 (`.monitor-card__meta`):
```css
.monitor-card__meta {
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), 0.5);
}
```

- [ ] **Step 8: Convert `.monitor-chip` and `.monitor-card__scroll`**

Lines 180-185 (`.monitor-chip`):
```css
.monitor-chip {
  background-color: rgba(var(--v-theme-primary), 0.18) !important;
  border: 1px solid rgba(var(--v-theme-primary), 0.35);
  color: rgba(var(--v-theme-on-surface), 0.9) !important;
  letter-spacing: 0.08em;
}
```

Lines 187-191 (`.monitor-card__scroll`):
```css
.monitor-card__scroll {
  background: rgba(var(--v-theme-background), 0.6);
  border-radius: 0.75rem;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}
```

Lines 197-200 (scrollbar thumb):
```css
.monitor-card__scroll::-webkit-scrollbar-thumb {
  background-color: rgba(var(--v-theme-primary), 0.3);
  border-radius: 999px;
}
```

- [ ] **Step 9: Convert accent variant cards**

Lines 213-229:
```css
.monitor-card--accent-teal::after {
  background: linear-gradient(90deg, rgba(var(--v-theme-secondary), 0.7), rgba(var(--v-theme-secondary), 0.4));
}

.monitor-card--accent-teal:hover {
  border-color: rgba(var(--v-theme-secondary), 0.48);
  box-shadow: 0 32px 80px -36px rgba(var(--v-theme-secondary), 0.55);
}

.monitor-card--accent-blue::after {
  background: linear-gradient(90deg, rgba(var(--v-theme-primary), 0.6), rgba(var(--v-theme-primary), 0.45));
}

.monitor-card--accent-blue:hover {
  border-color: rgba(var(--v-theme-primary), 0.5);
  box-shadow: 0 32px 80px -36px rgba(var(--v-theme-primary), 0.6);
}
```

- [ ] **Step 10: Convert `.monitor-card__terminal`**

Lines 231-239:
```css
.monitor-card__terminal {
  position: relative;
  padding: 1rem 1.1rem;
  border-radius: 0.8rem;
  background: radial-gradient(140% 120% at 100% 0%, rgba(var(--v-theme-info), 0.08), transparent 55%),
    rgba(var(--v-theme-background), 0.75);
  border: 1px solid rgba(var(--v-theme-primary), 0.16);
  box-shadow: inset 0 0 0 1px rgba(var(--v-theme-surface), 0.4);
}
```

Lines 257-260 (terminal line hover):
```css
.monitor-card__terminal-line:hover {
  background-color: rgba(var(--v-theme-primary), 0.1);
  transform: translateX(2px);
}
```

Lines 262-266 (timestamp):
```css
.monitor-card__timestamp {
  font-size: 0.68rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  min-width: 72px;
}
```

Lines 268-272 (payload):
```css
.monitor-card__payload {
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.95);
  word-break: break-word;
}
```

- [ ] **Step 11: Convert `.monitor-card__ghost-btn`**

Lines 274-297:
```css
.monitor-card__ghost-btn {
  border-radius: 999px !important;
  padding-inline: 1rem !important;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.65rem !important;
  background: rgba(var(--v-theme-primary), 0.14) !important;
  border: 1px solid rgba(var(--v-theme-primary), 0.35);
  color: rgba(var(--v-theme-on-surface), 0.9) !important;
  transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease;
}

.monitor-card__ghost-btn:hover:not(.v-btn--disabled) {
  background: rgba(var(--v-theme-primary), 0.25) !important;
  border-color: rgba(var(--v-theme-primary), 0.5);
  color: rgb(var(--v-theme-on-surface)) !important;
}

.monitor-card__ghost-btn.v-btn--disabled {
  opacity: 0.5;
  border-color: rgba(var(--v-theme-on-surface), 0.18);
  background: rgba(var(--v-theme-surface), 0.45) !important;
  color: rgba(var(--v-theme-on-surface), 0.45) !important;
}
```

- [ ] **Step 12: Convert monitor layout/grid colors**

Lines 319 (`.monitor-grid`):
```css
.monitor-grid {
  display: grid;
  gap: 1px;
  flex: 1;
  min-height: 0;
  background: rgba(var(--v-theme-on-surface), 0.12);
}
```

Lines 322-327 (`.monitor-minimized-bar`):
```css
.monitor-minimized-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 1px;
  background: rgba(var(--v-theme-on-surface), 0.12);
}
```

Lines 337-343 (`.monitor-pane`):
```css
.monitor-pane {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: rgb(var(--v-theme-background));
  min-height: 0;
}
```

- [ ] **Step 13: Convert monitor pane title/index/actions colors**

Lines 368-371 (`.monitor-pane__index`):
```css
.monitor-pane__index {
  color: rgba(var(--v-theme-on-surface), 0.45);
  font-weight: 600;
}
```

Lines 380-387 (`.monitor-pane__live-badge`):
```css
.monitor-pane__live-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: rgb(var(--v-theme-success));
  font-size: 0.6rem;
  font-weight: 600;
}
```

Lines 389-396 (`.monitor-pane__live-dot`):
```css
.monitor-pane__live-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgb(var(--v-theme-success));
  animation: monitor-pane-pulse 2s ease-in-out infinite;
}
```

Lines 403-407 (`.monitor-pane__message-count`):
```css
.monitor-pane__message-count {
  color: rgba(var(--v-theme-on-surface), 0.45);
  font-size: 0.6rem;
  white-space: nowrap;
}
```

Lines 415-427 (`.monitor-pane__action-btn`):
```css
.monitor-pane__action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: rgba(var(--v-theme-on-surface), 0.45);
  cursor: pointer;
  transition: background-color 120ms ease, color 120ms ease;
}

.monitor-pane__action-btn:hover {
  background: rgba(var(--v-theme-on-surface), 0.12);
  color: rgb(var(--v-theme-on-surface));
}
```

- [ ] **Step 14: Convert monitor status bar colors**

Lines 460-474 (`.monitor-status-bar`):
```css
.monitor-status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 28px;
  min-height: 28px;
  padding: 0 0.75rem;
  background: linear-gradient(180deg, rgba(var(--v-theme-surface), 1) 0%, rgba(var(--v-theme-background), 1) 100%);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  font-family: 'Roboto Mono', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  color: rgba(var(--v-theme-on-surface), 0.6);
  user-select: none;
}
```

Lines 484-496 (`.monitor-status-bar__menu-btn`):
```css
.monitor-status-bar__menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: rgba(var(--v-theme-on-surface), 0.6);
  cursor: pointer;
  transition: background-color 120ms ease;
}

.monitor-status-bar__menu-btn:hover {
  background: rgba(var(--v-theme-on-surface), 0.12);
}
```

Lines 502-507 (`.monitor-status-bar__app-name`):
```css
.monitor-status-bar__app-name {
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: rgb(var(--v-theme-primary));
}
```

Lines 516-523 (`.monitor-status-bar__ws-dot`):
```css
.monitor-status-bar__ws-dot--connected {
  background: rgb(var(--v-theme-success));
  animation: monitor-pane-pulse 2s ease-in-out infinite;
}

.monitor-status-bar__ws-dot--disconnected {
  background: rgb(var(--v-theme-error));
}
```

Lines 531-547 (`.monitor-status-bar__power-btn`):
```css
.monitor-status-bar__power-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.15);
  background: transparent;
  color: rgba(var(--v-theme-on-surface), 0.55);
  font-family: 'Roboto Mono', monospace;
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 120ms ease;
}

.monitor-status-bar__power-btn:hover {
  border-color: rgba(var(--v-theme-primary), 0.4);
  color: rgb(var(--v-theme-on-surface));
}

.monitor-status-bar__power-btn--on {
  border-color: rgba(var(--v-theme-success), 0.5);
  color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.1);
}
```

Lines 560-581 (`.monitor-status-bar__estop-btn`):
```css
.monitor-status-bar__estop-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  border: 1px solid rgba(var(--v-theme-error), 0.4);
  background: rgba(var(--v-theme-error), 0.08);
  color: rgb(var(--v-theme-error));
  font-family: 'Roboto Mono', monospace;
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 120ms ease;
}

.monitor-status-bar__estop-btn:hover {
  background: rgba(var(--v-theme-error), 0.2);
  border-color: rgba(var(--v-theme-error), 0.6);
}
```

Lines 583-591 (`.monitor-status-bar__info` and `__clock`):
```css
.monitor-status-bar__info {
  font-size: 0.6rem;
  color: rgba(var(--v-theme-on-surface), 0.45);
}

.monitor-status-bar__clock {
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.6);
}
```

- [ ] **Step 15: Convert remaining pane log/scrollbar/stat colors**

Lines 609 (scrollbar thumb):
```css
.monitor-pane__content::-webkit-scrollbar-thumb,
.monitor-pane__content *::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-on-surface), 0.15);
  border-radius: 999px;
}
```

Lines 625 (log entry border):
```css
.monitor-pane__log-entry {
  ...existing layout properties unchanged...
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  transition: background-color 120ms ease;
}
```

Lines 629-631 (log entry hover):
```css
.monitor-pane__log-entry:hover {
  background: rgba(var(--v-theme-on-surface), 0.04);
}
```

Lines 633-637 (log timestamp):
```css
.monitor-pane__log-timestamp {
  font-size: 0.62rem;
  color: rgba(var(--v-theme-on-surface), 0.4);
  min-width: 60px;
}
```

Lines 639-642 (log message):
```css
.monitor-pane__log-message {
  color: rgba(var(--v-theme-on-surface), 0.9);
  word-break: break-word;
}
```

Lines 653-663 (empty pane):
```css
.monitor-pane__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-family: 'Roboto Mono', monospace;
  font-size: 0.7rem;
  color: rgba(var(--v-theme-on-surface), 0.3);
  text-transform: uppercase;
  letter-spacing: 0.15em;
}
```

Lines 683-685 (stat row):
```css
.monitor-pane__stat-row {
  ...existing layout properties unchanged...
  background: rgba(var(--v-theme-on-surface), 0.03);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}
```

Lines 687-692 (stat label):
```css
.monitor-pane__stat-label {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(var(--v-theme-on-surface), 0.45);
}
```

Lines 694-698 (stat value):
```css
.monitor-pane__stat-value {
  font-size: 0.75rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}
```

- [ ] **Step 16: Commit**

```bash
git add apps/monitor/src/style.css
git commit -m "refactor(monitor): convert hardcoded CSS colors to Vuetify theme variables"
```

---

## Chunk 4: Documentation & Verification

### Task 10: Create ADDING_THEMES.md Guide

**Files:**
- Create: `packages/ui/src/themes/ADDING_THEMES.md`

- [ ] **Step 1: Create the guide**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add packages/ui/src/themes/ADDING_THEMES.md
git commit -m "docs(ui): add guide for adding new theme modes"
```

---

### Task 11: Lint, Type-Check, and Verify

**Files:** None (verification only)

- [ ] **Step 1: Run type checking**

Run: `pnpm check-types 2>&1 | tail -30`
Expected: Clean exit (no type errors)

If there are type errors, fix them before proceeding.

- [ ] **Step 2: Run linting**

Run: `pnpm lint 2>&1 | tail -30`
Expected: Clean exit (no lint errors)

If there are lint errors, fix them before proceeding.

- [ ] **Step 3: Run throttle unit tests**

Run: `pnpm --filter=deja-throttle test:unit 2>&1 | tail -20`
Expected: All tests pass

- [ ] **Step 4: Commit any fixes**

If any fixes were needed from steps 1-3:
```bash
git add -A
git commit -m "fix: address lint and type-check issues from theme refactor"
```

# Design: Light, Dark & High-Contrast Themes for Throttle, Cloud, and Monitor

**Date:** 2026-03-12
**Status:** Approved
**Scope:** apps/throttle, apps/cloud, apps/monitor, packages/ui

---

## Problem

The three Vue apps have inconsistent theming:

- **Throttle & Cloud** define all 3 Vuetify themes (light, dark, high-contrast) in their own `main.ts`, but the App.vue binding (`isDark ? 'dark' : 'light'`) drops high-contrast mode.
- **Monitor** has a single hardcoded `monitorDark` theme and is not connected to `useThemeSwitcher` at all.
- Theme color definitions are duplicated across apps with no shared structure.
- Monitor's custom `.monitor-*` CSS classes use hardcoded colors, not theme-aware variables.

## Solution

A **theme factory** in `@repo/ui` that generates Vuetify theme objects from per-app color configs, plus fixes to App.vue bindings and monitor CSS.

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Theme color ownership | Per-app identity | Each app has its own visual character (monitor = terminal, throttle = train control, cloud = management) |
| Shared infrastructure location | `@repo/ui` | Already hosts `useThemeSwitcher` and `ThemeSwitcher.vue` |
| Monitor light theme direction | Inverted terminal | Keep terminal aesthetic but with light backgrounds, subtle glow-to-shadow conversion |
| Extensibility | Registry-based mode system | New themes added by registering a mode definition, not modifying factory internals |
| ThemeSwitcher component | Not touched | Moving to settings page in a separate PR |

---

## Architecture

### File Structure

```
packages/ui/src/themes/
├── index.ts                    # Re-exports everything
├── createVuetifyThemes.ts      # Factory function
├── types.ts                    # AppThemeConfig, ThemeMode, ThemeOverrides
├── modes.ts                    # THEME_MODES registry + mode definitions
└── ADDING_THEMES.md            # Guide for adding new themes
```

### Theme Factory API

```ts
// packages/ui/src/themes/types.ts

/** Colors that define an app's visual identity */
interface AppThemeConfig {
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

/** Any Vuetify theme color that can be overridden */
interface ThemeOverrides {
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
```

```ts
// packages/ui/src/themes/createVuetifyThemes.ts

import type { ThemeDefinition } from 'vuetify'

/**
 * Generate all registered Vuetify themes from an app's identity colors.
 *
 * @returns Record<ThemeMode, ThemeDefinition> — one theme per registered mode
 */
export function createVuetifyThemes(
  config: AppThemeConfig
): Record<string, ThemeDefinition>
```

The factory:
1. Iterates registered theme modes
2. For each mode, generates a base palette (backgrounds, surfaces, opacity scales)
3. Applies the app's identity colors (primary, secondary, accent)
4. Applies shared semantic colors (success, error, warning, info) — adjusted per mode
5. Merges per-mode overrides from the app config
6. Merges custom colors for that mode
7. Returns a complete `ThemeDefinition` per mode

### Theme Mode Registry

```ts
// packages/ui/src/themes/modes.ts

interface ThemeModeDefinition {
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
  /** Text/icon opacity scales */
  opacity: {
    highEmphasis: number
    mediumEmphasis: number
    disabled: number
  }
  /** How to transform identity colors for this mode (e.g. high-contrast saturates) */
  colorTransform?: (color: string) => string
}

/** Ordered list of theme modes — determines cycle order */
export const THEME_MODES: ThemeMode[] = ['light', 'dark', 'high-contrast']

/** Mode definitions */
export const THEME_MODE_DEFINITIONS: Record<ThemeMode, ThemeModeDefinition>
```

**Built-in modes:**

| Mode | dark | htmlClasses | Character |
|------|------|-------------|-----------|
| `light` | `false` | `[]` | Light gray backgrounds, white surfaces, standard opacity |
| `dark` | `true` | `['dark']` | Deep slate backgrounds, elevated surfaces, slightly boosted colors |
| `high-contrast` | `true` | `['dark', 'high-contrast']` | Pure black background, near-black surfaces, fully saturated colors, max opacity |

### ThemeMode Type

```ts
// packages/ui/src/themes/types.ts

export type ThemeMode = 'light' | 'dark' | 'high-contrast'
```

When adding new themes, this union grows. The `THEME_MODES` array and `THEME_MODE_DEFINITIONS` map are the source of truth.

---

## useThemeSwitcher Updates

**File:** `packages/ui/src/composables/useThemeSwitcher.ts`

Changes:
- Import `THEME_MODES` and `THEME_MODE_DEFINITIONS` from `../themes/modes`
- `cycleTheme()` — iterate `THEME_MODES` array instead of hardcoded switch
- `isDark` — check `THEME_MODE_DEFINITIONS[mode].dark` instead of string comparison
- `applyTheme()` — derive HTML classes from `THEME_MODE_DEFINITIONS[mode].htmlClasses` instead of manual if/else
- `ThemeMode` type imported from `../themes/types` (single source of truth)

---

## Per-App Changes

### All 3 Apps: App.vue Fix

**Current (broken for high-contrast):**
```vue
<v-app :theme="isDark ? 'dark' : 'light'">
```

**Fixed:**
```vue
<v-app :theme="themePreference">
```

One-line change. `themePreference` already holds the exact Vuetify theme name.

### Throttle (`apps/throttle/src/main.ts`)

Replace the inline theme definitions with:

```ts
import { createVuetifyThemes } from '@repo/ui'

const themes = createVuetifyThemes({
  primary: '#00E5FF',
  secondary: '#D500F9',
  accent: '#C6FF00',
  light: {
    primary: '#00B8D4',  // slightly muted for light backgrounds
  },
  custom: {
    light: { 'device-connected': '#4CAF50', 'device-disconnected': '#F44336', 'stat-card': '#F5F7FA' },
    dark: { 'device-connected': '#66BB6A', 'device-disconnected': '#EF5350', 'stat-card': '#1A2332' },
    'high-contrast': { 'device-connected': '#00FF00', 'device-disconnected': '#FF0000', 'stat-card': '#1A1A1A' },
  },
})
```

### Cloud (`apps/cloud/src/main.ts`)

Same pattern — replace inline themes with `createVuetifyThemes()` call using cloud's identity colors. Cloud shares the same primary/secondary/accent as throttle currently, so the config will be similar but can diverge later.

### Monitor (`apps/monitor/src/main.ts`)

Replace the single `monitorDark` theme:

```ts
import { createVuetifyThemes } from '@repo/ui'

const themes = createVuetifyThemes({
  primary: '#38bdf8',    // sky-blue (monitor identity)
  secondary: '#22d3ee',  // cyan
  accent: '#a78bfa',     // violet (differentiate from throttle/cloud lime)
  light: {
    background: '#f1f5f9',  // slate-100
    surface: '#ffffff',
  },
  custom: {
    dark: { 'monitor-glow': '#38bdf8' },
    light: { 'monitor-glow': '#0284c7' },
    'high-contrast': { 'monitor-glow': '#00FFFF' },
  },
})
```

**Connect to theme switcher in App.vue:**
```vue
// Replace: const theme = ref('monitorDark')
// With:
const { themePreference } = useThemeSwitcher()

// Template:
<v-app :theme="themePreference">
```

### Monitor CSS: Theme-Aware `.monitor-*` Classes

**File:** `apps/monitor/src/style.css`

Convert hardcoded colors to Vuetify CSS variables. Key conversions:

| Current | Becomes |
|---------|---------|
| `background: #0f172a` | `background: rgb(var(--v-theme-surface))` |
| `border-color: #1e293b` | `border-color: rgba(var(--v-theme-on-surface), 0.12)` |
| `color: #e2e8f0` | `color: rgb(var(--v-theme-on-surface))` |
| `box-shadow: 0 0 15px rgba(56, 189, 248, 0.1)` | `box-shadow: 0 0 15px rgba(var(--v-theme-primary), 0.1)` |
| `background: rgba(15, 23, 42, 0.95)` | `background: rgba(var(--v-theme-surface), 0.95)` |

**Light mode (inverted terminal) adjustments:**
- Glassmorphic cards get `backdrop-filter: blur(12px)` with light surface colors
- Cyan glows become subtle cyan-tinted shadows: `box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.08)`
- Terminal areas keep monospace font, get light gray backgrounds with faint borders
- Status indicators retain their colors (green/red/yellow) against the light background

---

## What We Don't Touch

- **ThemeSwitcher.vue component** — moving to settings in separate PR
- **Tailwind configs** — class-based dark mode already works via `useThemeSwitcher`'s HTML class management
- **Animation preset** — theme-independent
- **Background/PageBackground system** — already theme-aware via overlay opacity
- **`useColors` composable** — already has dark mode variants
- **Tour app** — not in scope

---

## Extensibility: Adding New Themes

A guide (`ADDING_THEMES.md`) will be created alongside the code. The process:

1. **Add the mode name** to the `ThemeMode` union in `types.ts`
2. **Add a mode definition** to `THEME_MODE_DEFINITIONS` in `modes.ts` (dark flag, HTML classes, base palette, opacity scales)
3. **Add the mode name** to the `THEME_MODES` array in `modes.ts` (determines cycle order)
4. **Optionally add per-mode overrides** in each app's `createVuetifyThemes()` config
5. **Optionally add CSS targeting** via the HTML class (e.g., `.my-new-mode .monitor-card { ... }`)

The factory automatically generates the new theme for all apps. No changes to `useThemeSwitcher`, App.vue, or the ThemeSwitcher component needed.

---

## Testing Strategy

- **Visual verification** — cycle through all 3 themes in each app, confirm colors/contrast
- **Type checking** — `pnpm check-types` across monorepo
- **Lint** — `pnpm lint` across monorepo
- **Existing tests** — `pnpm --filter=deja-throttle test:unit` (no new tests needed for theme config)

---
"@repo/ui": minor
---

added: **[ui]** Shared theme factory (`createVuetifyThemes`) generating light, dark, and high-contrast Vuetify themes from per-app identity colors

added: **[ui]** Registry-based theme mode system (`THEME_MODES`, `THEME_MODE_DEFINITIONS`) for extensible theme management

changed: **[ui]** Rewrite `useThemeSwitcher` composable to be registry-driven with proper Tailwind HTML class sync

changed: **[throttle]** Replace inline Vuetify theme definitions with shared `createVuetifyThemes` factory

changed: **[cloud]** Replace inline Vuetify theme definitions with shared `createVuetifyThemes` factory

changed: **[monitor]** Replace single `monitorDark` theme with full light/dark/high-contrast support via shared factory

changed: **[monitor]** Convert ~100 hardcoded CSS color values to Vuetify CSS variables for theme-aware styling

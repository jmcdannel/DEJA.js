# Cloud Forms Redesign — Edit Loco

**Date:** 2026-04-03
**Status:** Approved
**Scope:** Redesign the Edit Loco form in the cloud app; establish a reusable `form-section` CSS pattern for all cloud forms.

---

## Problem

The current Edit Loco form (`apps/cloud/src/Roster/EditLoco.vue`) uses the older `v-card` + `bg-zinc-900` pattern — a single dark card with outlined Vuetify inputs, chip groups, and duplicated Close/Submit buttons at top and bottom. It looks disconnected from the Settings page and Connect page, which use a cleaner section-based design with subtle borders, row layouts, and better visual hierarchy.

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Page structure | Single page with sections | Matches Settings page pattern; all sections (Identity, EZ Consist, Functions) flow as one continuous page |
| Input layout | Hybrid | Text inputs use labels-above in a grid row; toggles, color picker, and chips use settings-row (label-left, control-right) |
| Action buttons | Per-section save | Each section saves independently — "Save" button (no icon) in section footer. No global submit. |
| Page header | Rich header with avatar | Loco color swatch, name, DCC address badge, roadname tag, and back-to-Roster button |
| Consist display | EZ Consist (throttle-style) | Reuses `ConsistIndicator` from `@repo/ui` — purple badge bar with directional arrows, matching the throttle app for brand consistency |
| Section styling | New `form-section` CSS | Separate from `settings-section` — optimized for form inputs with slightly different radius/spacing |
| Color theming | Module colors | Each section uses its module's color for accent bar, focus rings, chip selection, and save button tint |

## Module Color Map

| Module | Color | Tailwind | Hex | Icon |
|---|---|---|---|---|
| Roster | pink | `pink-400` | `#f472b6` | `mdi-train` |
| EZ Consist | purple | `violet-600` | `#7c3aed` | (uses ConsistIndicator) |
| Effects | indigo | `indigo-500` | `#6366f1` | `mdi-rocket-launch` |
| Routes | purple | `purple-500` | `#a855f7` | `mdi-map` |
| Sensors | teal | `teal-500` | `#14b8a6` | `mdi-access-point` |
| Turnouts | amber | `amber-500` | `#f59e0b` | `mdi-call-split` |
| Signals | emerald | `emerald-500` | `#10b981` | `mdi-traffic-light` |
| Settings | blue | `blue-500` | `#3b82f6` | `mdi-cog` |
| Devices | cyan | `cyan-400` | `#22d3ee` | `mdi-developer-board` |
| DCC-EX | lime | `lime-400` | `#a3e635` | `mdi-cpu-64-bit` |
| Sounds | sky | `sky-400` | `#38bdf8` | `mdi-volume-high` |

## Page Layout

```
┌─────────────────────────────────────────────────────┐
│  [color avatar]  BNSF 5801                ← Roster  │
│                  DCC #1 · BNSF                      │
└─────────────────────────────────────────────────────┘

┌─ Identity ──────────────────────── Docs ↗ ──────────┐
│ pink accent bar                                      │
│                                                      │
│  DCC ADDRESS          NAME                           │
│  ┌──────────┐         ┌─────────────────────┐        │
│  │ 1        │         │ BNSF 5801           │        │
│  └──────────┘         └─────────────────────┘        │
│  hint text             hint text                     │
│                                                      │
│  Roadname                                            │
│  [✓ BNSF] [Amtrak] [Union Pacific] [CSX] ...        │
│                                                      │
│  Color                     [● Deep Orange ›]         │
│  Theme color for UI                                  │
│                                                      │
│  Onboard Sound                          [toggle ON]  │
│  Locomotive has sound decoder                        │
│                                                      │
│                                           [Save]     │
└──────────────────────────────────────────────────────┘

┌─ EZ Consist ────────────────────── Docs ↗ ──────────┐
│ purple accent bar                                    │
│                                                      │
│  ┌ EZ [◀ 1] [◀ 3] [7 ▶] [✎] ┐                      │
│  └────────────────────────────┘                      │
│  Tap to add or remove consist members                │
└──────────────────────────────────────────────────────┘

┌─ Functions ──────────────── F0-F28  Docs ↗ ─────────┐
│ pink accent bar                                      │
│                                                      │
│  ┌ F0 Headlight ┐ ┌ F1 Bell ┐ ┌ F2 Horn ┐           │
│  ┌ F3 Coupler   ┐ ┌ F4 Brake┐ ┌ F5 +Add ┐           │
│                                                      │
│                                           [Save]     │
└──────────────────────────────────────────────────────┘

┌ View Raw JSON                                    › ┐
└────────────────────────────────────────────────────┘
```

## CSS Architecture

### New `form-section` classes

Create in `apps/cloud/src/style.css` (or a dedicated `form-section.css` imported globally). These are separate from `settings-section` in Settings.vue.

```css
.form-section {
  background: rgba(var(--v-theme-surface), 0.5);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.07);
  border-radius: 14px;
  margin-bottom: 16px;
  overflow: clip;
}

.form-section__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  /* accent bar via border-left, color set dynamically or via modifier */
  border-left: 3px solid var(--form-accent, rgb(var(--v-theme-primary)));
}

.form-section__header-icon {
  color: var(--form-accent, rgb(var(--v-theme-primary)));
}

.form-section__title {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.9);
  flex: 1;
}

.form-section__docs-link {
  font-size: 0.7rem;
  color: rgba(var(--v-theme-info), 0.5);
  text-decoration: none;
}
.form-section__docs-link:hover {
  color: rgba(var(--v-theme-info), 0.8);
}

.form-section__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.04);
  gap: 16px;
}
.form-section__row:last-child { border-bottom: none; }
.form-section__row--block { flex-direction: column; align-items: stretch; }

.form-section__row-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.form-section__row-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.75);
}
.form-section__row-desc {
  font-size: 0.65rem;
  color: rgba(var(--v-theme-on-surface), 0.3);
}

.form-section__grid {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.04);
  display: grid;
  gap: 14px;
}

.form-section__input-label {
  font-size: 0.7rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.45);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 6px;
}

.form-section__input-hint {
  font-size: 0.65rem;
  color: rgba(var(--v-theme-on-surface), 0.3);
  margin-top: 4px;
}

.form-section__footer {
  padding: 12px 20px 14px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.04);
}
```

### Dynamic accent color

Pass the module color via a CSS custom property on the section container:

```vue
<div class="form-section" :style="{ '--form-accent': moduleColor }">
```

Where `moduleColor` is the resolved CSS color for the module (e.g., `#f472b6` for Roster/pink).

## Component Changes

### `EditLoco.vue` — Full Rewrite

**Remove:**
- `v-card`, `v-card-title`, `v-card-body`, `v-card-actions` wrappers
- Duplicated top/bottom Close + Submit buttons
- Inline `bg-zinc-900` styling
- `v-divider` separators between cards

**Add:**
- `PageHeader` component at top (or custom hero header)
- Hero header with loco avatar (color swatch), name, DCC badge, roadname tag, back button
- Three `form-section` containers: Identity, EZ Consist, Functions
- Per-section save buttons (tonal variant, module color, text "Save")
- `ConsistIndicator` from `@repo/ui` replaces the old consist chip display
- Docs links in section headers

**Keep:**
- All existing form logic (validation, submit, color picker dialog, consist editor dialog)
- `v-text-field` with `variant="outlined"` for DCC Address and Name (but wrapped in `form-section__grid`)
- `v-chip-group` for roadname selection
- `v-switch` for sound toggle
- Color picker dialog trigger
- `ViewJson` debug component at bottom

### Hero Header

```vue
<div class="loco-hero" :style="{ '--hero-color': locoColor }">
  <div class="loco-hero__avatar">
    <v-icon>mdi-train</v-icon>
  </div>
  <div class="loco-hero__info">
    <h1 class="loco-hero__name">{{ loco.name }}</h1>
    <div class="loco-hero__meta">
      <span class="loco-hero__badge">DCC #{{ loco.address }}</span>
      <span class="loco-hero__roadname">{{ roadname?.label }}</span>
    </div>
  </div>
  <v-btn variant="outlined" size="small" @click="$router.push({ name: 'Roster' })">
    <v-icon start>mdi-arrow-left</v-icon> Roster
  </v-btn>
</div>
```

### Identity Section

```vue
<div class="form-section" :style="{ '--form-accent': '#f472b6' }">
  <div class="form-section__header">
    <v-icon size="18" class="form-section__header-icon">mdi-label</v-icon>
    <span class="form-section__title">Identity</span>
    <a class="form-section__docs-link" href="..." target="_blank">Docs ↗</a>
  </div>

  <!-- Text inputs: grid row, labels above -->
  <div class="form-section__grid" style="grid-template-columns: 160px 1fr;">
    <div>
      <label class="form-section__input-label">DCC Address</label>
      <v-text-field v-model="loco.address" variant="outlined" :color="color" density="compact" ... />
      <div class="form-section__input-hint">2 or 4-digit decoder address</div>
    </div>
    <div>
      <label class="form-section__input-label">Name</label>
      <v-text-field v-model="loco.name" variant="outlined" :color="color" density="compact" ... />
      <div class="form-section__input-hint">Display name for this locomotive</div>
    </div>
  </div>

  <!-- Roadname: block row with chips -->
  <div class="form-section__row form-section__row--block">
    <span class="form-section__row-name">Roadname</span>
    <v-chip-group v-model="roadname" column mandatory selected-class="text-pink-400">
      <v-chip v-for="road in ROADNAMES" ... />
    </v-chip-group>
  </div>

  <!-- Color: settings-row style -->
  <div class="form-section__row">
    <div class="form-section__row-label">
      <span class="form-section__row-name">Color</span>
      <span class="form-section__row-desc">Theme color for throttle & UI</span>
    </div>
    <!-- color picker trigger -->
  </div>

  <!-- Sound: settings-row style -->
  <div class="form-section__row">
    <div class="form-section__row-label">
      <span class="form-section__row-name">Onboard Sound</span>
      <span class="form-section__row-desc">Locomotive has sound decoder</span>
    </div>
    <v-switch v-model="hasSound" color="pink" hide-details />
  </div>

  <div class="form-section__footer">
    <v-btn variant="tonal" :color="color" size="small" @click="saveIdentity">Save</v-btn>
  </div>
</div>
```

### EZ Consist Section

```vue
<div class="form-section" :style="{ '--form-accent': '#7c3aed' }">
  <div class="form-section__header">
    <v-icon size="18" class="form-section__header-icon">mdi-link-variant</v-icon>
    <span class="form-section__title">EZ Consist</span>
    <a class="form-section__docs-link" href="..." target="_blank">Docs ↗</a>
  </div>
  <div style="padding: 16px 20px;">
    <ConsistIndicator :loco="loco" />
    <div class="form-section__input-hint mt-2">Tap to add or remove consist members</div>
  </div>
</div>
```

No save button — the ConsistIndicator opens the ConsistEditor dialog which saves on its own.

### Functions Section

```vue
<div class="form-section" :style="{ '--form-accent': '#f472b6' }">
  <div class="form-section__header">
    <v-icon size="18" class="form-section__header-icon">mdi-tune-vertical</v-icon>
    <span class="form-section__title">Functions</span>
    <span class="text-xs opacity-30">F0 – F28</span>
    <a class="form-section__docs-link" href="..." target="_blank">Docs ↗</a>
  </div>
  <Functions v-if="loco" :loco="loco" />
  <div class="form-section__footer">
    <v-btn variant="tonal" :color="color" size="small" @click="saveFunctions">Save</v-btn>
  </div>
</div>
```

## Save Behavior

Each section saves independently:

- **Identity** — calls `updateLoco()` with name, address, roadname, color, hasSound + `syncRosterEntry()` for CommandStation sync
- **EZ Consist** — handled by `ConsistEditor` dialog (already saves on its own)
- **Functions** — calls `updateLoco()` with functions array + `syncRosterEntry()`

Split the current `submit()` function into `saveIdentity()` and `saveFunctions()`. Both share the `syncRosterEntry()` call.

## Reusability

The `form-section` CSS classes are designed to be reused across all cloud app forms:

- **Edit Turnout** — `--form-accent: amber` with turnout-specific fields
- **Edit Effect** — `--form-accent: indigo` with effect-specific fields
- **Edit Signal** — `--form-accent: emerald` with signal-specific fields
- **Edit Route** — `--form-accent: purple` with route-specific fields
- **Edit Sensor** — `--form-accent: teal` with sensor-specific fields
- **Add forms** — same pattern, hero header shows "New [Entity]" instead of existing data

Each form gets the same structure: hero header → form-sections with module-colored accents → per-section save.

## Files to Change

| File | Action |
|---|---|
| `apps/cloud/src/style.css` | Add `form-section` CSS classes |
| `apps/cloud/src/Roster/EditLoco.vue` | Rewrite template and split save logic |

## Files Unchanged

- `ConsistIndicator.vue` — reused as-is from `@repo/ui`
- `ConsistEditor.vue` — reused as-is (opened via dialog from ConsistIndicator)
- `Functions.vue` — reused as-is inside the Functions section
- `ColorPicker.vue` — reused as-is (opened via dialog from color row)
- `ViewJson.vue` — reused as-is at bottom

## Out of Scope

- Redesigning other forms (turnouts, effects, signals, etc.) — those follow this same pattern but are separate tasks
- Changes to the Functions component internals
- Changes to the ConsistEditor dialog internals
- Mobile-specific responsive breakpoints (the grid already collapses via Tailwind)

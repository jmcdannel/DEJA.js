# Cloud Forms Redesign — Edit Loco Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Edit Loco form using a new `form-section` CSS pattern that matches the Settings page aesthetic, with module-colored section accents, per-section save, a rich hero header, and the EZ Consist indicator from the throttle app.

**Architecture:** Two files change — `style.css` gets the reusable `form-section` CSS classes, and `EditLoco.vue` gets a full template rewrite (logic stays mostly the same, split into per-section save). The `ConsistIndicator`, `ConsistEditor`, `Functions`, `ColorPicker`, and `ViewJson` components are reused as-is.

**Tech Stack:** Vue 3, Vuetify 3, Tailwind CSS, Vuefire, TypeScript

**Spec:** `docs/superpowers/specs/2026-04-03-cloud-forms-redesign.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `apps/cloud/src/style.css` | Modify (append) | Add `form-section` CSS classes at the end |
| `apps/cloud/src/Roster/EditLoco.vue` | Rewrite | New template with hero header + form-sections; split save logic |
| `apps/cloud/src/Roster/Functions/Functions.vue` | Modify | Remove its own save button/card-actions (parent now owns the save footer) |

---

### Task 1: Add `form-section` CSS classes to `style.css`

**Files:**
- Modify: `apps/cloud/src/style.css:73` (append after the glassmorphism utilities block)

- [ ] **Step 1: Add the form-section CSS block**

Append the following CSS after line 73 (the closing `}` of `@layer utilities`) in `apps/cloud/src/style.css`:

```css

/* ═══ Form Section — reusable card pattern for cloud app forms ═══ */
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
.form-section__row:last-child {
  border-bottom: none;
}
.form-section__row--block {
  flex-direction: column;
  align-items: stretch;
}

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

- [ ] **Step 2: Verify CSS parses correctly**

Run: `pnpm --filter=deja-cloud build 2>&1 | head -20`
Expected: Build starts without CSS parse errors.

- [ ] **Step 3: Commit**

```bash
git add apps/cloud/src/style.css
git commit -m "feat(cloud): add form-section CSS classes for cloud form redesign"
```

---

### Task 2: Update `Functions.vue` to remove its own save button

The Functions component currently has its own `v-card-actions` with Save buttons (duplicated top and bottom) and wraps content in `v-card-body`. The parent `EditLoco.vue` will now own the save footer, so Functions should only render the function list and expose a save method.

**Files:**
- Modify: `apps/cloud/src/Roster/Functions/Functions.vue`

- [ ] **Step 1: Remove card wrappers and duplicate save buttons**

Replace the entire `<template>` block in `apps/cloud/src/Roster/Functions/Functions.vue` (lines 46–80) with:

```vue
<template>
  <div class="px-5 py-4">
    <EditFunc
      v-for="defaultFunc in defaultFunctions"
      :key="defaultFunc.label"
      :locoFunction="locoFunctions?.find((lf: LocoFunction) => lf.id === defaultFunc.id)"
      :defaultFunction="defaultFunc"
      @edit="handleEdit"
    />
  </div>
</template>
```

- [ ] **Step 2: Expose `handleSave` and `isModified` so the parent can call save**

Add `defineExpose` at the end of the `<script setup>` block (after the `handleEdit` function, before the closing `</script>` tag):

```typescript
defineExpose({ handleSave, isModified })
```

- [ ] **Step 3: Verify the component compiles**

Run: `pnpm --filter=deja-cloud build 2>&1 | head -20`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add apps/cloud/src/Roster/Functions/Functions.vue
git commit -m "refactor(cloud): simplify Functions component, expose save for parent control"
```

---

### Task 3: Rewrite `EditLoco.vue` template and split save logic

**Files:**
- Modify: `apps/cloud/src/Roster/EditLoco.vue`

- [ ] **Step 1: Update the script block**

Replace the entire `<script setup lang="ts">` block (lines 1–72) in `apps/cloud/src/Roster/EditLoco.vue` with:

```vue
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLocos, ROADNAMES, type Loco, type RoadName } from '@repo/modules/locos'
import { useDcc } from '@repo/dccex'
import { createLogger } from '@repo/utils'
import { ConsistIndicator } from '@repo/ui'
import ViewJson from '@/Core/UI/ViewJson.vue'
import Functions from '@/Roster/Functions/Functions.vue'
import ColorPicker from '@/Common/Color/ColorPicker.vue'

const log = createLogger('EditLoco')
const { syncRosterEntry } = useDcc()

interface ValidationRules {
  required: ((val: unknown) => boolean | string)[]
}

const route = useRoute()
const router = useRouter()
const { getLoco, updateLoco, getRoadname } = useLocos()

const locoDoc = getLoco(parseInt(route.params.address.toString()))
const loco = computed(() => (locoDoc.value as Loco) || null)

const editColor = ref(false)
const roadname = ref<RoadName | undefined>(undefined)
const color = ref<string>('pink')
const hasSound = ref(true)
const identityLoading = ref(false)
const functionsRef = ref<InstanceType<typeof Functions> | null>(null)

const rules: ValidationRules = {
  required: [(val) => !!val || 'Required.'],
}

watch(
  loco,
  (newLoco) => {
    if (newLoco) {
      roadname.value = getRoadname(newLoco.meta?.roadname || '')
      color.value = newLoco.meta?.color || roadname.value?.color || 'pink'
      hasSound.value = newLoco.hasSound !== false
    }
  },
  { immediate: true }
)

async function saveIdentity() {
  identityLoading.value = true
  const newLoco = loco.value || {}
  newLoco.meta = newLoco.meta || {}
  newLoco.meta.roadname = roadname.value?.value || ''
  newLoco.meta.color = color.value || 'primary'
  newLoco.hasSound = hasSound.value

  log.debug('Saving identity', { ...loco.value })
  await updateLoco(loco.value.id, newLoco)
  void syncRosterEntry(loco.value.address, loco.value.name, loco.value.functions)
  identityLoading.value = false
}

async function saveFunctions() {
  if (functionsRef.value) {
    await functionsRef.value.handleSave()
  }
}
</script>
```

- [ ] **Step 2: Replace the entire template**

Replace everything from `<template>` to `</template>` (lines 73–236) with:

```vue
<template>
  <div v-if="loco" class="animate-fade-in-up space-y-4 max-w-[800px] px-4">
    <!-- ═══ HERO HEADER ═══ -->
    <div
      class="flex items-center gap-4 p-5 rounded-[14px] border"
      :style="{
        background: `linear-gradient(135deg, ${color === 'pink' ? 'rgba(244,114,182,0.08)' : `color-mix(in srgb, ${color} 8%, transparent)`}, transparent)`,
        borderColor: `color-mix(in srgb, ${color} 15%, transparent)`,
      }"
    >
      <div
        class="w-14 h-14 rounded-[14px] flex items-center justify-center flex-shrink-0"
        :style="{ background: `color-mix(in srgb, ${color} 80%, black)` }"
      >
        <v-icon size="28" color="white">mdi-train</v-icon>
      </div>
      <div class="flex-1 min-w-0">
        <h1 class="text-xl font-bold text-white/95 tracking-tight">{{ loco.name || 'Unnamed Loco' }}</h1>
        <div class="flex items-center gap-2.5 mt-1">
          <span class="text-xs text-white/45 bg-white/6 px-2 py-0.5 rounded font-mono">DCC #{{ loco.address }}</span>
          <span
            v-if="roadname?.label"
            class="text-xs px-2 py-0.5 rounded"
            :style="{ color: `color-mix(in srgb, ${color} 80%, white)`, background: `color-mix(in srgb, ${color} 10%, transparent)` }"
          >{{ roadname.label }}</span>
        </div>
      </div>
      <v-btn variant="outlined" size="small" class="text-none" @click="router.push({ name: 'Roster' })">
        <v-icon start size="16">mdi-arrow-left</v-icon>
        Roster
      </v-btn>
    </div>

    <!-- ═══ IDENTITY SECTION — pink accent ═══ -->
    <v-form validate-on="submit lazy" @submit.prevent="saveIdentity">
      <div class="form-section" style="--form-accent: #f472b6">
        <div class="form-section__header">
          <v-icon size="18" class="form-section__header-icon">mdi-label</v-icon>
          <span class="form-section__title">Identity</span>
        </div>

        <!-- DCC Address + Name grid -->
        <div class="form-section__grid" style="grid-template-columns: 160px 1fr">
          <div>
            <label class="form-section__input-label">DCC Address</label>
            <v-text-field
              v-model="loco.address"
              variant="outlined"
              density="compact"
              :color="color"
              :rules="rules.required"
              hide-details="auto"
            />
            <div class="form-section__input-hint">2 or 4-digit decoder address</div>
          </div>
          <div>
            <label class="form-section__input-label">Name</label>
            <v-text-field
              v-model="loco.name"
              variant="outlined"
              density="compact"
              :color="color"
              hide-details="auto"
            />
            <div class="form-section__input-hint">Display name for this locomotive</div>
          </div>
        </div>

        <!-- Roadname chips -->
        <div class="form-section__row form-section__row--block">
          <span class="form-section__row-name mb-2">Roadname</span>
          <v-chip-group v-model="roadname" selected-class="text-pink-400" column mandatory>
            <v-chip
              v-for="road in ROADNAMES"
              :key="road.value"
              :value="road"
              :text="road.label"
              variant="outlined"
              filter
              size="small"
            />
          </v-chip-group>
        </div>

        <!-- Color picker row -->
        <div class="form-section__row">
          <div class="form-section__row-label">
            <span class="form-section__row-name">Color</span>
            <span class="form-section__row-desc">Theme color for throttle & UI</span>
          </div>
          <div
            class="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors"
            style="border-color: rgba(var(--v-theme-on-surface), 0.08); background: rgba(var(--v-theme-on-surface), 0.03)"
            @click="editColor = true"
          >
            <div class="w-6 h-6 rounded-full border-2 border-white/12" :style="{ background: color }"></div>
            <span class="text-sm text-white/60 capitalize">{{ color }}</span>
            <v-icon size="14" class="text-white/25">mdi-chevron-right</v-icon>
          </div>
        </div>
        <v-dialog v-model="editColor" max-width="80vw">
          <ColorPicker v-model="color" @select="editColor = false" @cancel="editColor = false; color = loco?.meta?.color ?? 'pink'" />
        </v-dialog>

        <!-- Sound toggle row -->
        <div class="form-section__row">
          <div class="form-section__row-label">
            <span class="form-section__row-name">Onboard Sound</span>
            <span class="form-section__row-desc">Locomotive has sound decoder</span>
          </div>
          <v-switch v-model="hasSound" color="pink" hide-details density="compact" />
        </div>

        <!-- Save footer -->
        <div class="form-section__footer">
          <v-btn variant="tonal" color="pink" size="small" type="submit" :loading="identityLoading" class="text-none">Save</v-btn>
        </div>
      </div>
    </v-form>

    <!-- ═══ EZ CONSIST — purple accent ═══ -->
    <div class="form-section" style="--form-accent: #7c3aed">
      <div class="form-section__header">
        <v-icon size="18" class="form-section__header-icon">mdi-link-variant</v-icon>
        <span class="form-section__title">EZ Consist</span>
      </div>
      <div class="px-5 py-4">
        <ConsistIndicator :loco="loco" />
        <div class="form-section__input-hint mt-2">Tap to add or remove consist members</div>
      </div>
    </div>

    <!-- ═══ FUNCTIONS — pink accent ═══ -->
    <div class="form-section" style="--form-accent: #f472b6">
      <div class="form-section__header">
        <v-icon size="18" class="form-section__header-icon">mdi-tune-vertical</v-icon>
        <span class="form-section__title">Functions</span>
        <span class="text-xs opacity-30">F0 – F28</span>
      </div>
      <Functions ref="functionsRef" :loco="loco" />
      <div class="form-section__footer">
        <v-btn
          variant="tonal"
          color="pink"
          size="small"
          :disabled="!functionsRef?.isModified"
          class="text-none"
          @click="saveFunctions"
        >Save</v-btn>
      </div>
    </div>

    <!-- Debug JSON -->
    <ViewJson :json="loco" label="RAW Loco Data" />
    <ViewJson :json="loco?.consist" label="RAW Consist Data" />
  </div>
</template>
```

- [ ] **Step 3: Verify the component compiles**

Run: `pnpm --filter=deja-cloud build 2>&1 | tail -5`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add apps/cloud/src/Roster/EditLoco.vue
git commit -m "feat(cloud): redesign Edit Loco with form-section pattern, hero header, EZ Consist"
```

---

### Task 4: Verify ConsistIndicator export and fix if needed

The `ConsistIndicator` is imported from `@repo/ui` in the new EditLoco. Verify it's exported from the package barrel.

**Files:**
- Check: `packages/ui/src/index.ts` or `packages/ui/src/Consist/index.ts`

- [ ] **Step 1: Check if ConsistIndicator is exported from @repo/ui**

Run: `grep -r "ConsistIndicator" packages/ui/src/index.ts packages/ui/src/Consist/index.ts 2>/dev/null || echo "NOT EXPORTED"`

If NOT EXPORTED, add the export to the appropriate barrel file:

```typescript
export { default as ConsistIndicator } from './Consist/ConsistIndicator.vue'
```

- [ ] **Step 2: Verify the full cloud app builds**

Run: `pnpm --filter=deja-cloud build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit (if changes were needed)**

```bash
git add packages/ui/src/index.ts
git commit -m "fix(ui): export ConsistIndicator from @repo/ui barrel"
```

---

### Task 5: Visual verification and cleanup

**Files:**
- All files from previous tasks

- [ ] **Step 1: Start the cloud dev server**

Run: `pnpm --filter=deja-cloud dev`

- [ ] **Step 2: Navigate to Edit Loco**

Open the cloud app in a browser, go to Roster, click any locomotive to open the edit page. Verify:

1. Hero header shows with loco name, DCC address badge, roadname tag, and back button
2. Identity section has pink left accent bar, grid inputs for Address/Name, chip group for Roadname, color picker row, sound toggle row, and Save button
3. EZ Consist section has purple left accent bar and shows the ConsistIndicator component
4. Functions section has pink left accent bar and shows function list with Save button
5. No duplicate Close/Submit buttons
6. No `v-card` chrome (no dark zinc backgrounds, no card titles)

- [ ] **Step 3: Test save functionality**

1. Change the loco name in Identity → click Save → verify it saves (page shouldn't navigate away)
2. Click the color picker → pick a new color → verify the hero header gradient updates
3. Edit a function label in Functions → verify Save button enables → click Save

- [ ] **Step 4: Run lint and type-check**

Run: `pnpm lint && pnpm check-types`
Expected: No errors.

- [ ] **Step 5: Final commit if any lint fixes were needed**

```bash
git add -A
git commit -m "fix(cloud): lint fixes for Edit Loco redesign"
```

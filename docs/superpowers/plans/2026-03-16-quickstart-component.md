# QuickStart Component Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `QuickStart` Vue 3 component in `@repo/ui` that shows a 2-step numbered stepper (Register + Install) with prop-driven completion state, suitable for the DEJAjs.com homepage, Cloud/Throttle settings, and the getting-started docs page.

**Architecture:** Single presentational component with no auth or Firebase coupling. The parent controls which steps appear complete by passing a `completed: number[]` prop. Step 2's install block composes the existing `ServerSetupInfo` component. A thin CTA links row sits below the steps.

**Tech Stack:** Vue 3 `<script setup lang="ts">`, Vuetify 3 (`v-btn`), Tailwind CSS utility classes, scoped `<style>` for custom step-track layout.

**Spec:** `docs/superpowers/specs/2026-03-16-quickstart-component-design.md`

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| **Create** | `packages/ui/src/QuickStart/QuickStart.vue` | The component: stepper, steps, CTA links |
| **Create** | `packages/ui/src/QuickStart/QuickStart.stories.ts` | Storybook stories — visual verification for all states |
| **Modify** | `packages/ui/src/index.ts` | Add barrel export for QuickStart |
| **Modify** | `packages/ui/package.json` | Add `./QuickStart` subpath export |

---

## Task 1: Create the QuickStart component

**Files:**
- Create: `packages/ui/src/QuickStart/QuickStart.vue`

### Context

`ServerSetupInfo` already lives at `packages/ui/src/ServerSetupInfo.vue`. It accepts `uid?: string | null` and `layoutId?: string` and renders the install command with a copy button. Import it with a relative path.

The component uses Vuetify (`v-btn`) and Tailwind classes. Follow the dark-theme palette: sky-400 (`#38bdf8`), green-500 (`#22c55e`), slate variants for muted text/borders.

- [ ] **Step 1: Create the component file**

Create `packages/ui/src/QuickStart/QuickStart.vue` with the following content:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import ServerSetupInfo from '../ServerSetupInfo.vue'

interface Props {
  /** Step numbers (1-based) that the parent considers already completed. */
  completed?: number[]
  /** Firebase UID — passed to ServerSetupInfo for a personalized install URL. */
  uid?: string | null
  /** Layout ID — passed to ServerSetupInfo for a personalized install URL. */
  layoutId?: string
}

const props = withDefaults(defineProps<Props>(), {
  completed: () => [],
  uid: undefined,
  layoutId: undefined,
})

const isComplete = (step: number) => props.completed.includes(step)

const ctaLinks = [
  { label: 'Docs', url: 'https://docs.dejajs.com' },
  { label: 'DEJA IO', url: 'https://dejajs.com/io' },
  { label: 'Help', url: 'https://dejajs.com/help' },
  { label: 'FAQ', url: 'https://dejajs.com/faq' },
]
</script>

<template>
  <div class="quick-start">
    <p class="quick-start__section-label">Quick Start</p>

    <!-- Step 1: Register -->
    <div class="quick-start__step">
      <div class="quick-start__track">
        <div
          class="quick-start__circle"
          :class="
            isComplete(1)
              ? 'quick-start__circle--complete'
              : 'quick-start__circle--active'
          "
        >
          <span>{{ isComplete(1) ? '✓' : '1' }}</span>
        </div>
        <div
          class="quick-start__connector"
          :class="isComplete(1) ? 'quick-start__connector--complete' : ''"
        />
      </div>
      <div
        class="quick-start__content"
        :class="{ 'quick-start__content--done': isComplete(1) }"
      >
        <p class="quick-start__title">Create your account</p>
        <p class="quick-start__desc">Sign up at DEJA Cloud to get your Layout ID</p>
        <v-btn
          v-if="!isComplete(1)"
          href="https://cloud.dejajs.com/sign-up"
          target="_blank"
          rel="noopener"
          color="primary"
          size="small"
          variant="flat"
          append-icon="mdi-open-in-new"
        >
          Register at cloud.dejajs.com
        </v-btn>
        <p v-else class="quick-start__hint">You're already registered</p>
      </div>
    </div>

    <!-- Step 2: Install -->
    <div class="quick-start__step">
      <div class="quick-start__track">
        <div
          class="quick-start__circle"
          :class="
            isComplete(2)
              ? 'quick-start__circle--complete'
              : isComplete(1)
                ? 'quick-start__circle--active'
                : 'quick-start__circle--pending'
          "
        >
          <span>{{ isComplete(2) ? '✓' : '2' }}</span>
        </div>
      </div>
      <div
        class="quick-start__content"
        :class="{ 'quick-start__content--done': isComplete(2) }"
      >
        <p class="quick-start__title">Install the server</p>
        <p class="quick-start__desc">Run on Raspberry Pi, Mac, or Linux</p>
        <ServerSetupInfo :uid="uid" :layout-id="layoutId" />
      </div>
    </div>

    <!-- CTA links -->
    <div class="quick-start__links">
      <a
        v-for="link in ctaLinks"
        :key="link.label"
        :href="link.url"
        target="_blank"
        rel="noopener"
        class="quick-start__link"
      >{{ link.label }}</a>
    </div>
  </div>
</template>

<style scoped>
.quick-start {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.quick-start__section-label {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.7);
  margin-bottom: 1.25rem;
}

/* Step row */
.quick-start__step {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

/* Left track: circle + connector */
.quick-start__track {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

/* Step circle */
.quick-start__circle {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 700;
  flex-shrink: 0;
  transition: background-color 300ms ease, border-color 300ms ease, color 300ms ease;
}

.quick-start__circle--active {
  background-color: #38bdf8;
  color: #0f172a;
}

.quick-start__circle--pending {
  border: 2px solid rgba(56, 189, 248, 0.3);
  color: rgba(148, 163, 184, 0.5);
}

.quick-start__circle--complete {
  background-color: #22c55e;
  color: #fff;
}

/* Connector line between circles */
.quick-start__connector {
  width: 1px;
  height: 4rem;
  margin-top: 0.25rem;
  background-color: rgba(56, 189, 248, 0.25);
  transition: background-color 300ms ease;
}

.quick-start__connector--complete {
  background-color: rgba(34, 197, 94, 0.25);
}

/* Step content */
.quick-start__content {
  flex: 1;
  padding-top: 0.25rem;
  padding-bottom: 1.5rem;
  transition: opacity 300ms ease;
}

.quick-start__content--done {
  opacity: 0.55;
}

.quick-start__title {
  font-size: 0.875rem;
  font-weight: 700;
  color: #e0f2fe;
  margin-bottom: 0.25rem;
}

.quick-start__content--done .quick-start__title {
  text-decoration: line-through;
  text-decoration-color: rgba(148, 163, 184, 0.4);
}

.quick-start__desc {
  font-size: 0.75rem;
  color: rgba(148, 163, 184, 0.7);
  margin-bottom: 0.625rem;
}

.quick-start__hint {
  font-size: 0.75rem;
  color: rgba(148, 163, 184, 0.5);
  font-style: italic;
}

/* CTA links */
.quick-start__links {
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
  padding-top: 0.875rem;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  margin-top: 0.25rem;
}

.quick-start__link {
  font-size: 0.75rem;
  color: #38bdf8;
  text-decoration: none;
  transition: color 150ms ease;
}

.quick-start__link:hover {
  color: #bae6fd;
  text-decoration: underline;
}
</style>
```

- [ ] **Step 2: Verify the file exists and has no obvious syntax errors**

```bash
cat packages/ui/src/QuickStart/QuickStart.vue | head -20
```

Expected: sees the `<script setup lang="ts">` opening.

- [ ] **Step 3: Commit the component**

```bash
git add packages/ui/src/QuickStart/QuickStart.vue
git commit -m "feat(ui): add QuickStart component"
```

---

## Task 2: Add barrel exports

**Files:**
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/package.json`

- [ ] **Step 1: Add the named export to `packages/ui/src/index.ts`**

Find the `ServerSetupInfo` export line (currently near line 43):

```typescript
export { default as ServerSetupInfo } from './ServerSetupInfo.vue'
```

Add the QuickStart export directly after it:

```typescript
export { default as ServerSetupInfo } from './ServerSetupInfo.vue'
export { default as QuickStart } from './QuickStart/QuickStart.vue'
```

- [ ] **Step 2: Add the subpath export to `packages/ui/package.json`**

In the `"exports"` object, add an entry for `./QuickStart`. A good place is after the `"./SplashPage"` entry at the end:

```json
"./SplashPage": "./src/SplashPage.vue",
"./QuickStart": "./src/QuickStart/QuickStart.vue"
```

- [ ] **Step 3: Run the type-checker to verify exports resolve**

```bash
pnpm check-types
```

Expected: no TypeScript errors related to QuickStart.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/index.ts packages/ui/package.json
git commit -m "feat(ui): export QuickStart from @repo/ui barrel"
```

---

## Task 3: Create Storybook stories (visual verification)

**Files:**
- Create: `packages/ui/src/QuickStart/QuickStart.stories.ts`

The `@repo/ui` package uses Storybook for visual QA. Stories are the test mechanism for presentational components in this package.

- [ ] **Step 1: Look at an existing story file for the pattern to follow**

```bash
cat packages/ui/src/EmptyState/EmptyState.stories.ts 2>/dev/null || \
cat packages/ui/src/Stat.stories.ts 2>/dev/null || \
ls packages/ui/src/**/*.stories.ts | head -3
```

Note the import path pattern and `Meta`/`StoryObj` usage.

- [ ] **Step 2: Create the stories file**

Create `packages/ui/src/QuickStart/QuickStart.stories.ts`:

```typescript
import type { Meta, StoryObj } from '@storybook/vue3'
import QuickStart from './QuickStart.vue'

const meta: Meta<typeof QuickStart> = {
  title: 'UI/QuickStart',
  component: QuickStart,
  tags: ['autodocs'],
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#0f172a' }],
    },
  },
  argTypes: {
    completed: {
      control: { type: 'check', options: [1, 2] },
      description: 'Step numbers (1-based) that are already done',
    },
    uid: { control: 'text', description: 'Firebase UID for personalized install URL' },
    layoutId: { control: 'text', description: 'Layout ID for personalized install URL' },
  },
}

export default meta
type Story = StoryObj<typeof QuickStart>

/** Both steps pending — homepage / docs page view. */
export const Default: Story = {
  args: {
    completed: [],
  },
}

/** Step 1 complete — user is logged in (Cloud / Throttle settings). */
export const StepOneComplete: Story = {
  args: {
    completed: [1],
    uid: 'demo-uid-abc123',
    layoutId: 'my-layout',
  },
}

/** Both steps complete — everything set up. */
export const BothComplete: Story = {
  args: {
    completed: [1, 2],
    uid: 'demo-uid-abc123',
    layoutId: 'my-layout',
  },
}

/** No uid/layoutId — generic install URL even when step 1 is done. */
export const StepOneCompleteNoUid: Story = {
  args: {
    completed: [1],
  },
}
```

- [ ] **Step 3: Start Storybook and visually verify all four stories**

```bash
pnpm --filter=@repo/ui storybook
```

Open `http://localhost:6006` and navigate to **UI / QuickStart**. Check each story:

| Story | What to look for |
|---|---|
| Default | Both circles numbered (1=blue filled, 2=outlined dim), green Register button, connector line visible, generic install URL, CTA links row |
| StepOneComplete | Circle 1 = green ✓, step 1 text dimmed + strikethrough, hint text "You're already registered", circle 2 = blue filled active, install URL includes `?uid=demo-uid-abc123` |
| BothComplete | Both circles green ✓, both steps dimmed + strikethrough |
| StepOneCompleteNoUid | Circle 1 = green ✓, install URL is the plain `https://install.dejajs.com` (no query params) |

- [ ] **Step 4: Fix any visual issues found during Storybook review**

Common things to check:
- Connector line height — adjust `height` in `.quick-start__connector` if it doesn't reach the second circle
- `content--done` opacity — make sure strikethrough renders on the title only, not on `ServerSetupInfo`
- CTA link spacing and color on dark background

- [ ] **Step 5: Commit the stories**

```bash
git add packages/ui/src/QuickStart/QuickStart.stories.ts
git commit -m "feat(ui): add QuickStart Storybook stories"
```

---

## Task 4: Lint and type-check

- [ ] **Step 1: Run lint**

```bash
pnpm lint
```

Expected: no errors in `packages/ui/src/QuickStart/`.

- [ ] **Step 2: Run type-check across the monorepo**

```bash
pnpm check-types
```

Expected: clean — no TypeScript errors. If errors appear referencing `QuickStart`, check that the export path in `index.ts` matches the actual file path exactly (case-sensitive).

- [ ] **Step 3: Commit a fix if needed, otherwise note it clean**

```bash
git add -p
git commit -m "fix(ui): resolve lint/type issues in QuickStart"
```

---

## Usage Reference

Once merged, consuming apps use the component like this:

### Homepage (dejajs-www) — no auth
```vue
<script setup lang="ts">
import { QuickStart } from '@repo/ui'
</script>

<template>
  <QuickStart />
</template>
```

### Cloud App Settings — user logged in
```vue
<script setup lang="ts">
import { useCurrentUser } from 'vuefire'
import { useStorage } from '@vueuse/core'
import { QuickStart } from '@repo/ui'

const user = useCurrentUser()
const layoutId = useStorage('@DEJA/layoutId', '')
</script>

<template>
  <QuickStart
    :completed="user ? [1] : []"
    :uid="user?.uid"
    :layout-id="layoutId"
  />
</template>
```

### Throttle App Settings — same pattern as Cloud
```vue
<template>
  <QuickStart
    :completed="user ? [1] : []"
    :uid="user?.uid"
    :layout-id="layoutId"
  />
</template>
```

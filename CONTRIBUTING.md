# 🤝 Contributing to DEJA.js

This guide covers everything you need to start contributing to DEJA.js -- from cloning the repository and installing dependencies to following the project's coding conventions and development workflow.

> 📐 For a high-level view of how the system fits together, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## ✅ Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js 20** or later
- **pnpm 9** or later -- this is a pnpm workspace; do not use npm or yarn
- **Git** for version control
- A **Firebase project** (free tier is sufficient) for real-time data synchronization
- Optionally, a **DCC-EX CommandStation** connected via USB for hardware testing

## 🚀 Getting Started

### 📥 Clone the Repository

```bash
git clone https://github.com/jmcdannel/DEJA.js.git
cd DEJA.js
```

### 📦 Install Dependencies

```bash
pnpm install
```

This installs all dependencies across the monorepo, including all apps and shared packages.

### ⚙️ Configure Environment

Copy the example environment file and fill in your Firebase credentials:

```bash
cp .env.example .env
```

Key variables to set:

| Variable | Description |
|----------|-------------|
| `LAYOUT_ID` | 🗺️ Your layout identifier in Firebase |
| `VITE_FIREBASE_API_KEY` | 🔑 Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | 🌐 Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | 📋 Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | 🪣 Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | 📨 Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | 🆔 Firebase app ID |

App-specific environment files go in `apps/<app>/.env.local`.

### ▶️ Start Development

```bash
pnpm dev
```

This starts all apps in development mode using Turborepo. To start a specific app:

```bash
pnpm --filter=deja-throttle dev    # 🚂 Throttle app only
pnpm --filter=deja-cloud dev       # ☁️ Cloud app only
pnpm --filter=deja-serverts dev    # ⚙️ Server only
pnpm deja                          # ⚙️📊 Server + Monitor together
```

## 🔄 Development Workflow

Follow these steps for every change:

1. **🧠 Plan before coding** -- For non-trivial changes, think through the approach before writing code.
2. **✏️ Make your changes** -- Follow the coding conventions described below.
3. **✅ Lint and type-check** -- Run both before committing:

```bash
pnpm lint
pnpm check-types
```

4. **🔍 Verify nothing is broken** -- Run the `/verify-changes` check to confirm the build passes.
5. **📝 Add a changelog entry** -- For any user-facing changes, update the changelog.
6. **🚀 Commit and push** -- Use the `/commit-push-pr` workflow to create a pull request.

## 📏 Coding Conventions

### 🖥️ Vue Components

- Always use `<script setup lang="ts">` with the Composition API. Never use the Options API.
- Define props, emits, and exposed members with TypeScript types using `defineProps`, `defineEmits`, and `defineExpose`.
- Name component files in PascalCase (e.g., `TurnoutSwitch.vue`).
- Use Vuetify components (`v-btn`, `v-card`, `v-list`, etc.) for all UI elements. Avoid raw HTML for common interface patterns.

```vue
<script setup lang="ts">
import { useTurnouts } from '@repo/modules'

interface Props {
  turnoutId: string
}

const props = defineProps<Props>()
const { getTurnouts } = useTurnouts()
</script>
```

### 📘 TypeScript

- Strict mode is enabled across the entire monorepo. Do not add `any` types unless absolutely unavoidable, and include a comment explaining why.
- Prefer `interface` over `type` for object shapes.
- Shared types live in `@repo/modules` or the relevant package.

### 📥 Imports

- Always use workspace imports for shared packages: `@repo/ui`, `@repo/modules`, `@repo/dccex`, etc.
- Never use relative paths that cross package boundaries (e.g., `../../packages/modules`).
- Vite apps have an `@/` alias pointing to `src/`.

```typescript
// ✅ Correct
import { useLocos } from '@repo/modules'
import { LocoAvatar } from '@repo/ui'

// ❌ Wrong -- do not cross package boundaries
import { useLocos } from '../../packages/modules/locos'
```

### 📊 State Management

- Use **Pinia** stores for global state management.
- Access Firebase Realtime Database through **Vuefire** composables (`useDocument`, `useCollection`).
- Use `useStorage` from `@vueuse/core` for persistent local state (e.g., `@DEJA/layoutId`).

### 🏷️ Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Vue composables | `use<Name>` (camelCase) | `useLocos`, `useTurnouts` |
| Vue components | PascalCase | `LocoAvatar`, `TurnoutSwitch` |
| Types and interfaces | PascalCase | `ThrottlePayload`, `TurnoutState` |
| Constants (objects) | camelCase | `defaultCommands` |
| Constants (primitives) | SCREAMING_SNAKE_CASE | `MAX_SPEED` |
| Internal packages | `@repo/<name>` | `@repo/modules`, `@repo/ui` |

## 📏 ESLint and Prettier

### ESLint

Shared flat configs live in `packages/config-eslint/`. The configuration includes `@eslint/js`, `typescript-eslint`, `eslint-config-turbo`, `eslint-plugin-import`, and `eslint-plugin-unicorn`, plus custom rule sets for best practices, ES6, stylistic preferences, and TypeScript-specific rules.

Each app has its own `eslint.config.mjs` that extends the shared config. Run linting across the entire monorepo:

```bash
pnpm lint
```

⚠️ Do not bypass ESLint with `// eslint-disable` without a specific reason documented in the comment.

### Prettier

Shared config lives in `packages/config-prettier/` and includes the Tailwind CSS plugin. Run formatting:

```bash
pnpm format
```

This formats all `.ts`, `.tsx`, and `.md` files across the monorepo.

## 🧪 Testing

The throttle app uses **Vitest** with `@vue/test-utils` and `jsdom` for unit testing. Run tests:

```bash
pnpm --filter=deja-throttle test:unit
```

Other packages do not currently have test files. When adding tests to a new package, use Vitest for consistency with the existing setup.

## 🚫 Things to Avoid

These rules have been established to prevent common mistakes:

- ❌ **Do not modify `pnpm-lock.yaml` manually** -- it is auto-generated by pnpm.
- ❌ **Do not use relative imports across package boundaries** -- always use `@repo/*` workspace imports.
- ❌ **Do not use the Options API** in Vue components.
- ❌ **Do not add `any` types** without a comment explaining why.
- ❌ **Do not create new packages** without updating `pnpm-workspace.yaml`.
- ❌ **Do not run `npm install` or `yarn`** -- always use `pnpm`.
- ❌ **Do not commit `.env` files** -- only `.env.example` belongs in version control.
- ❌ **Do not bypass ESLint** without a specific reason in the comment.

## 📦 Dependency Management

The monorepo uses syncpack to enforce consistent dependency versions across packages. Internal `@repo/` packages use the `workspace:*` protocol and are excluded from version checks.

```bash
pnpm deps:check    # 🔍 List version mismatches
pnpm deps:fix      # 🔧 Auto-fix mismatches
```

Run these commands periodically, especially after adding or updating dependencies.

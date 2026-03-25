# 🔧 @repo/typescript-config

Shared TypeScript configuration presets for all packages and apps in the DEJA.js monorepo.

## 📁 Configs

| File | Extends | Used By |
|------|---------|---------|
| `base.json` | — | Everything (root preset) |
| `node.json` | `base.json` | `apps/server`, Node.js packages |
| `vue-library.json` | `base.json` | Vue packages (`@repo/ui`, `@repo/modules`, etc.) |
| `react-library.json` | `base.json` | React packages |
| `nextjs.json` | `base.json` | `apps/sound-api` (Next.js) |

## 🚀 Usage

In any package or app `tsconfig.json`:

```json
{
  "extends": "@repo/typescript-config/vue-library.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

## ⚙️ Base Config Highlights

The `base.json` preset enables:

- **Strict mode** — `strict: true`, `strictNullChecks: true`
- **ESM-first** — `module: "ESNext"`, `moduleResolution: "Bundler"`
- **Declarations** — `declaration: true`, `declarationMap: true`
- **No emit** — `noEmit: true` (bundlers like Vite/Turbopack handle output)
- **Skip lib check** — `skipLibCheck: true` for faster builds

## 🔍 Config Details

### `node.json`
Extends base, adds `outDir: "./dist"` for compiled server output.

### `vue-library.json`
Extends base, enables `composite: true` for project references and configures the `@/*` → `./src/*` path alias.

### `react-library.json`
Extends base, adds `jsx: "react-jsx"` and DOM lib types.

### `nextjs.json`
Extends base, adds the `next` TypeScript plugin, `jsx: "preserve"`, and DOM libs. Includes `next-env.d.ts`.

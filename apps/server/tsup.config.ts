import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['index.ts'],
  format: ['esm'],
  target: 'node20',
  outDir: 'dist',
  clean: true,
  splitting: false,
  sourcemap: false,
  // Native modules and runtime deps that cannot/should not be bundled.
  // These are resolved from node_modules at runtime.
  external: [
    // Native/binary modules
    'serialport',
    '@serialport/parser-readline',
    // Firebase Admin SDK (native grpc bindings)
    'firebase-admin',
    'firebase-admin/app',
    'firebase-admin/firestore',
    'firebase-admin/database',
    // Firebase browser SDK — type-only import in @repo/modules/plans/types.ts
    // tsup erases `import type` but may still resolve the specifier; keep external
    'firebase',
    'firebase/firestore',
    // Vue ecosystem — pulled in transitively via @repo/modules root re-export
    // of useSubscription. These are dead code at runtime (server never calls
    // Vue composables) but must be external so tsup doesn't try to bundle them.
    'vue',
    'vuefire',
    '@vueuse/core',
    // Runtime deps with native optional bindings or dynamic requires
    'ws',
    'signale',
    'dotenv',
    'dotenv/config',
    'wait-on',
    // Other runtime deps
    '@sentry/node',
    'play-sound',
    'mqtt',
  ],
  // Workspace packages to inline (resolve at build time, not runtime).
  // These are bundled into the output so they don't need workspace resolution at runtime.
  noExternal: [
    '@repo/modules',
    '@repo/sounds',
    '@repo/dccex',
    // @repo/firebase-config is inlined; its firebase-admin/* imports stay external
    '@repo/firebase-config',
  ],
  banner: {
    js: [
      '// DEJA.js Server — Bundled with tsup',
      '// https://dejajs.com',
    ].join('\n'),
  },
})

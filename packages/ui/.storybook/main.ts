import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|ts|mjs|mts)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  async viteFinal(config) {
    const mockModules = path.resolve(__dirname, './mocks/modules.ts')

    // Use Vite's array alias format to avoid clobbering Storybook's existing aliases
    const existingAliases = Array.isArray(config.resolve?.alias)
      ? config.resolve.alias
      : Object.entries(config.resolve?.alias ?? {}).map(([find, replacement]) => ({
          find,
          replacement: replacement as string,
        }))

    config.resolve = config.resolve || {}
    config.resolve.alias = [
      ...existingAliases,
      // Sub-path aliases MUST come before the base alias so they match first
      { find: '@repo/modules/effects', replacement: mockModules },
      { find: '@repo/modules/locos', replacement: mockModules },
      { find: '@repo/modules/signals', replacement: mockModules },
      { find: '@repo/modules/sensors', replacement: mockModules },
      { find: '@repo/modules/turnouts', replacement: mockModules },
      { find: '@repo/modules/routes', replacement: mockModules },
      { find: '@repo/modules/layouts/constants', replacement: mockModules },
      { find: '@repo/modules/layouts', replacement: mockModules },
      // Base @repo/* aliases
      { find: '@repo/modules', replacement: mockModules },
      { find: '@repo/dccex', replacement: path.resolve(__dirname, './mocks/dccex.ts') },
      { find: '@repo/deja', replacement: path.resolve(__dirname, './mocks/deja.ts') },
      { find: '@repo/utils', replacement: path.resolve(__dirname, './mocks/utils.ts') },
      { find: 'vuefire', replacement: path.resolve(__dirname, './mocks/firebase.ts') },
      // Prevent real Firebase SDK from loading in Storybook
      { find: 'firebase/auth', replacement: path.resolve(__dirname, './mocks/firebase-auth.ts') },
      { find: 'firebase/firestore', replacement: path.resolve(__dirname, './mocks/firebase-firestore.ts') },
      // Self-import fix: @repo/ui → local src/ (sub-path first, then barrel)
      { find: '@repo/ui/src', replacement: path.resolve(__dirname, '../src') },
      { find: '@repo/ui', replacement: path.resolve(__dirname, '../src') },
    ]

    config.plugins = [...(config.plugins || []), vue()]

    config.css = config.css || {}
    config.css.postcss = path.resolve(__dirname, './postcss.config.cjs')

    return config
  },
}

export default config

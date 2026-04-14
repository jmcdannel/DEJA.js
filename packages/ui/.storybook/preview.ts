import type { Preview, Decorator } from '@storybook/vue3'
import { setup } from '@storybook/vue3'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import './tailwind.css'
import { mockRouter } from './mocks/router'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: { dark: true, colors: { background: '#0b0d10', surface: '#121212' } },
      light: { dark: false, colors: { background: '#ffffff', surface: '#f5f5f5' } },
    },
  },
})

setup((app) => {
  app.use(vuetify)
  app.use(mockRouter)
})

/** Decorator: switch Vuetify theme when user toggles the Storybook theme toolbar. */
const withVuetifyTheme: Decorator = (story, context) => {
  const selected = context.globals.theme === 'light' ? 'light' : 'dark'
  vuetify.theme.global.name.value = selected
  // Also update background to match so there's no visual mismatch
  document.documentElement.style.setProperty(
    'background-color',
    selected === 'light' ? '#ffffff' : '#0b0d10',
  )
  return { template: '<story />' }
}

const preview: Preview = {
  decorators: [withVuetifyTheme],
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'dark',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'dark', title: 'Dark', icon: 'moon' },
          { value: 'light', title: 'Light', icon: 'sun' },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0b0d10' },
        { name: 'light', value: '#ffffff' },
      ],
    },
  },
}

export default preview

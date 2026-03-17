import type { Meta, StoryObj } from '@storybook/vue3'
import ThemeSwitcher from './ThemeSwitcher.vue'

const meta: Meta<typeof ThemeSwitcher> = {
  title: 'Chrome/ThemeSwitcher',
  component: ThemeSwitcher,
  tags: ['autodocs'],
  decorators: [
    () => ({
      template: '<div class="p-4 flex items-center justify-center" style="min-height: 100px;"><story /></div>',
    }),
  ],
}

export default meta
type Story = StoryObj<typeof ThemeSwitcher>

export const Default: Story = {}

export const InDarkContext: Story = {
  decorators: [
    () => ({
      template: '<div class="bg-slate-900 p-8 rounded-lg flex items-center justify-center"><story /></div>',
    }),
  ],
}

export const InLightContext: Story = {
  decorators: [
    () => ({
      template: '<div class="bg-white p-8 rounded-lg flex items-center justify-center"><story /></div>',
    }),
  ],
}

export const InAppBar: Story = {
  decorators: [
    () => ({
      template: `
        <v-app-bar color="primary" class="px-4">
          <v-toolbar-title>DEJA.js</v-toolbar-title>
          <v-spacer />
          <story />
        </v-app-bar>
      `,
    }),
  ],
}

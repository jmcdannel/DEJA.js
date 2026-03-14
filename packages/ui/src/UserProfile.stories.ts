import type { Meta, StoryObj } from '@storybook/vue3'
import UserProfile from './UserProfile.vue'

const meta: Meta<typeof UserProfile> = {
  title: 'Chrome/UserProfile',
  component: UserProfile,
  tags: ['autodocs'],
  decorators: [
    () => ({
      template: '<div class="p-4 flex items-center justify-center" style="min-height: 100px;"><story /></div>',
    }),
  ],
}

export default meta
type Story = StoryObj<typeof UserProfile>

export const Default: Story = {}

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

export const InDarkBackground: Story = {
  decorators: [
    () => ({
      template: '<div class="bg-slate-900 p-8 rounded-lg flex items-center justify-center"><story /></div>',
    }),
  ],
}

export const WithSiblingControls: Story = {
  decorators: [
    () => ({
      template: `
        <div class="flex items-center gap-3 p-4 bg-slate-800 rounded">
          <v-chip size="small" color="success">Online</v-chip>
          <story />
          <v-btn icon="mdi-cog" size="small" variant="text" />
        </div>
      `,
    }),
  ],
}

import type { Meta, StoryObj } from '@storybook/vue3'
import LayoutChip from './LayoutChip.vue'

const meta: Meta<typeof LayoutChip> = {
  title: 'Chrome/LayoutChip',
  component: LayoutChip,
  tags: ['autodocs'],
  decorators: [
    () => ({
      template: '<div class="p-4 flex items-center" style="min-height: 80px;"><story /></div>',
    }),
  ],
}

export default meta
type Story = StoryObj<typeof LayoutChip>

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

export const WithSiblingChips: Story = {
  decorators: [
    () => ({
      template: `
        <div class="flex items-center gap-2 p-4 bg-slate-800 rounded">
          <story />
          <v-chip size="small" color="success" prepend-icon="mdi-server-network">Server</v-chip>
        </div>
      `,
    }),
  ],
}

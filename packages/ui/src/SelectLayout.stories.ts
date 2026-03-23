import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import SelectLayout from './SelectLayout.vue'

const meta: Meta<typeof SelectLayout> = {
  title: 'Chrome/SelectLayout',
  component: SelectLayout,
  tags: ['autodocs'],
  args: {
    onSelected: fn(),
  },
  decorators: [
    () => ({
      template: '<div class="p-4" style="max-width: 400px;"><story /></div>',
    }),
  ],
}

export default meta
type Story = StoryObj<typeof SelectLayout>

export const Default: Story = {}

export const InCard: Story = {
  decorators: [
    () => ({
      template: `
        <v-card class="pa-4" style="max-width: 400px;">
          <v-card-title>Select Layout</v-card-title>
          <v-card-text>
            <story />
          </v-card-text>
        </v-card>
      `,
    }),
  ],
}

export const InDialog: Story = {
  decorators: [
    () => ({
      template: `
        <v-sheet class="p-4" style="max-width: 500px;">
          <h3 class="text-lg font-semibold mb-4 text-white">Choose a Layout</h3>
          <story />
        </v-sheet>
      `,
    }),
  ],
}

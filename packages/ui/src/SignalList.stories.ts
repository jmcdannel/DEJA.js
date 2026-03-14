import type { Meta, StoryObj } from '@storybook/vue3'
import SignalList from './SignalList.vue'

const meta: Meta<typeof SignalList> = {
  title: 'Chrome/SignalList',
  component: SignalList,
  tags: ['autodocs'],
  decorators: [
    () => ({
      template: '<div class="p-4" style="min-height: 400px;"><story /></div>',
    }),
  ],
}

export default meta
type Story = StoryObj<typeof SignalList>

export const Default: Story = {}

export const InCard: Story = {
  decorators: [
    () => ({
      template: `
        <v-card class="pa-4">
          <v-card-title>Signal Control</v-card-title>
          <v-card-text>
            <story />
          </v-card-text>
        </v-card>
      `,
    }),
  ],
}

export const FullWidth: Story = {
  decorators: [
    () => ({
      template: '<div class="p-4" style="width: 100%; min-height: 600px;"><story /></div>',
    }),
  ],
}

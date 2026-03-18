import type { Meta, StoryObj } from '@storybook/vue3'
import Signout from './Signout.vue'

const meta: Meta<typeof Signout> = {
  title: 'Chrome/Signout',
  component: Signout,
  tags: ['autodocs'],
  decorators: [
    () => ({
      template: '<div class="p-4 flex items-center justify-center" style="min-height: 100px;"><story /></div>',
    }),
  ],
}

export default meta
type Story = StoryObj<typeof Signout>

export const Default: Story = {}

export const InMenu: Story = {
  decorators: [
    () => ({
      template: `
        <v-list style="max-width: 300px;">
          <v-list-item>
            <v-list-item-title>Mock User</v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item>
            <story />
          </v-list-item>
        </v-list>
      `,
    }),
  ],
}

export const InCard: Story = {
  decorators: [
    () => ({
      template: `
        <v-card style="max-width: 300px;" class="pa-4">
          <v-card-title>Account</v-card-title>
          <v-card-text>
            <p class="mb-4 text-white">Signed in as user@example.com</p>
            <story />
          </v-card-text>
        </v-card>
      `,
    }),
  ],
}

import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import EmergencyStop from './EmergencyStop.vue'

const meta: Meta<typeof EmergencyStop> = {
  title: 'Chrome/EmergencyStop',
  component: EmergencyStop,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
  },
  args: {
    onStop: fn(),
  },
  decorators: [
    () => ({
      template: '<div class="p-4 flex items-center justify-center" style="min-height: 100px;"><story /></div>',
    }),
  ],
}

export default meta
type Story = StoryObj<typeof EmergencyStop>

export const Default: Story = {
  args: {
    disabled: false,
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const InControlGroup: Story = {
  render: () => ({
    components: { EmergencyStop },
    template: `
      <div class="flex items-center gap-3 p-4 bg-slate-800 rounded">
        <v-btn icon="mdi-power" size="small" color="success" variant="flat" />
        <v-btn icon="mdi-fence-electric" size="small" variant="flat" />
        <EmergencyStop />
      </div>
    `,
  }),
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
  args: {
    disabled: false,
  },
}

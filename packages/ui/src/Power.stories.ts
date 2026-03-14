import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import Power from './Power.vue'

const meta: Meta<typeof Power> = {
  title: 'Chrome/Power',
  component: Power,
  tags: ['autodocs'],
  argTypes: {
    powerState: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    onToggle: fn(),
  },
  decorators: [
    () => ({
      template: '<div class="p-4 flex items-center justify-center" style="min-height: 100px;"><story /></div>',
    }),
  ],
}

export default meta
type Story = StoryObj<typeof Power>

export const PowerOff: Story = {
  args: {
    powerState: false,
    disabled: false,
  },
}

export const PowerOn: Story = {
  args: {
    powerState: true,
    disabled: false,
  },
}

export const Disabled: Story = {
  args: {
    powerState: false,
    disabled: true,
  },
}

export const InControlGroup: Story = {
  render: (args) => ({
    components: { Power },
    setup() {
      return { args }
    },
    template: `
      <div class="flex items-center gap-2 p-4 bg-slate-800 rounded">
        <Power v-bind="args" />
        <Power :power-state="true" />
        <Power :power-state="false" :disabled="true" />
      </div>
    `,
  }),
  args: {
    powerState: false,
  },
}

import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import TrackPower from './TrackPower.vue'

const meta: Meta<typeof TrackPower> = {
  title: 'Chrome/TrackPower',
  component: TrackPower,
  tags: ['autodocs'],
  argTypes: {
    powerState: { control: 'boolean' },
    isConnected: { control: 'boolean' },
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
type Story = StoryObj<typeof TrackPower>

export const PowerOff: Story = {
  args: {
    powerState: false,
    isConnected: true,
    disabled: false,
  },
}

export const PowerOn: Story = {
  args: {
    powerState: true,
    isConnected: true,
    disabled: false,
  },
}

export const Disconnected: Story = {
  args: {
    powerState: false,
    isConnected: false,
    disabled: false,
  },
}

export const Disabled: Story = {
  args: {
    powerState: false,
    isConnected: true,
    disabled: true,
  },
}

export const UnknownState: Story = {
  args: {
    powerState: undefined,
    isConnected: true,
    disabled: false,
  },
}

import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import DeviceStatus from './DeviceStatus.vue'
import { createDevice } from '../.storybook/mocks/data'

const meta: Meta<typeof DeviceStatus> = {
  title: 'Chrome/DeviceStatus',
  component: DeviceStatus,
  tags: ['autodocs'],
  argTypes: {
    devices: { control: 'object' },
    showLabel: { control: 'boolean' },
    compact: { control: 'boolean' },
  },
  args: {
    onSelect: fn(),
  },
  decorators: [
    () => ({
      template: '<div class="p-4 flex items-center" style="min-height: 80px;"><story /></div>',
    }),
  ],
}

export default meta
type Story = StoryObj<typeof DeviceStatus>

export const AllConnected: Story = {
  args: {
    devices: [
      createDevice({ id: 'dccex', name: 'DCC-EX', type: 'dcc-ex', isConnected: true }),
      createDevice({ id: 'arduino-01', name: 'Arduino Mega', type: 'deja-arduino', isConnected: true }),
    ],
    showLabel: true,
    compact: false,
  },
}

export const MixedStatus: Story = {
  args: {
    devices: [
      createDevice({ id: 'dccex', name: 'DCC-EX', type: 'dcc-ex', isConnected: true }),
      createDevice({ id: 'arduino-01', name: 'Arduino Mega', type: 'deja-arduino', isConnected: false }),
      createDevice({ id: 'pico-01', name: 'Pico W', type: 'deja-mqtt', isConnected: false, connection: 'wifi' }),
    ],
    showLabel: true,
    compact: false,
  },
}

export const AllDisconnected: Story = {
  args: {
    devices: [
      createDevice({ id: 'dccex', name: 'DCC-EX', type: 'dcc-ex', isConnected: false }),
      createDevice({ id: 'arduino-01', name: 'Arduino', type: 'deja-arduino', isConnected: false }),
    ],
    showLabel: true,
    compact: false,
  },
}

export const Compact: Story = {
  args: {
    devices: [
      createDevice({ id: 'dccex', name: 'DCC-EX', type: 'dcc-ex', isConnected: true }),
      createDevice({ id: 'arduino-01', name: 'Arduino', type: 'deja-arduino', isConnected: true }),
    ],
    showLabel: true,
    compact: true,
  },
}

export const NoLabel: Story = {
  args: {
    devices: [
      createDevice({ id: 'dccex', name: 'DCC-EX', type: 'dcc-ex', isConnected: true }),
    ],
    showLabel: false,
    compact: false,
  },
}

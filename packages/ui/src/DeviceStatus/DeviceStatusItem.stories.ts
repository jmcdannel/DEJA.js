import type { Meta, StoryObj } from '@storybook/vue3'
import DeviceStatusItem from './DeviceStatusItem.vue'
import { createDevice } from '../../.storybook/mocks/data'

const meta: Meta<typeof DeviceStatusItem> = {
  title: 'DeviceStatus/DeviceStatusItem',
  component: DeviceStatusItem,
  tags: ['autodocs'],
  argTypes: {
    device: { control: 'object' },
  },
}

export default meta
type Story = StoryObj<typeof DeviceStatusItem>

export const ConnectedDccEx: Story = {
  args: {
    device: createDevice({
      name: 'DCC-EX CommandStation',
      type: 'dcc-ex',
      connection: 'usb',
      isConnected: true,
      port: '/dev/ttyUSB0',
    }),
  },
}

export const DisconnectedDccEx: Story = {
  args: {
    device: createDevice({
      name: 'DCC-EX CommandStation',
      type: 'dcc-ex',
      connection: 'usb',
      isConnected: false,
      port: '/dev/ttyUSB0',
    }),
  },
}

export const ConnectedArduino: Story = {
  args: {
    device: createDevice({
      name: 'Arduino MEGA Effects',
      type: 'deja-arduino',
      connection: 'usb',
      isConnected: true,
      port: '/dev/ttyACM0',
    }),
  },
}

export const ConnectedMQTT: Story = {
  args: {
    device: createDevice({
      name: 'Pico W LED Board',
      type: 'deja-mqtt',
      connection: 'wifi',
      isConnected: true,
      port: undefined,
      topic: 'deja/pico-w-01',
    }),
  },
}

export const ConnectedArduinoLed: Story = {
  args: {
    device: createDevice({
      name: 'Arduino LED Strip',
      type: 'deja-arduino-led',
      connection: 'usb',
      isConnected: true,
      port: '/dev/ttyACM1',
    }),
  },
}

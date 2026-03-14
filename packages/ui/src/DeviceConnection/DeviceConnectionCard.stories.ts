import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import DeviceConnectionCard from './DeviceConnectionCard.vue'
import { createDevice } from '../../.storybook/mocks/data'

const meta: Meta<typeof DeviceConnectionCard> = {
  title: 'DeviceConnection/DeviceConnectionCard',
  component: DeviceConnectionCard,
  tags: ['autodocs'],
  argTypes: {
    device: { control: 'object' },
    availablePorts: { control: 'object' },
    availableTopics: { control: 'object' },
    linkMode: { control: 'select', options: ['page', 'modal'] },
    turnoutCount: { control: 'number' },
    effectCount: { control: 'number' },
    trackPower: { control: 'select', options: [true, false, null] },
  },
}

export default meta
type Story = StoryObj<typeof DeviceConnectionCard>

export const ConnectedUSB: Story = {
  args: {
    device: createDevice({
      name: 'DCC-EX CommandStation',
      type: 'dcc-ex',
      connection: 'usb',
      isConnected: true,
      port: '/dev/ttyUSB0',
      lastConnected: new Date(Date.now() - 3600000),
    }),
    availablePorts: ['/dev/ttyUSB0', '/dev/ttyUSB1', '/dev/ttyACM0'],
    linkMode: 'page',
    turnoutCount: 8,
    effectCount: 12,
    trackPower: true,
    onConnect: fn(),
    onDisconnect: fn(),
    onReconnect: fn(),
    onNavigate: fn(),
  },
}

export const DisconnectedUSB: Story = {
  args: {
    device: createDevice({
      name: 'DCC-EX CommandStation',
      type: 'dcc-ex',
      connection: 'usb',
      isConnected: false,
      port: '/dev/ttyUSB0',
    }),
    availablePorts: ['/dev/ttyUSB0', '/dev/ttyUSB1'],
    linkMode: 'page',
    turnoutCount: 0,
    effectCount: 0,
    trackPower: null,
    onConnect: fn(),
    onDisconnect: fn(),
    onReconnect: fn(),
    onNavigate: fn(),
  },
}

export const ConnectedMQTT: Story = {
  args: {
    device: createDevice({
      name: 'Pico W Effects Board',
      type: 'deja-mqtt',
      connection: 'wifi',
      isConnected: true,
      port: undefined,
      topic: 'deja/pico-w-01',
      lastConnected: new Date(Date.now() - 7200000),
    }),
    availablePorts: [],
    availableTopics: ['deja/pico-w-01', 'deja/pico-w-02'],
    linkMode: 'page',
    turnoutCount: 0,
    effectCount: 6,
    trackPower: null,
    onConnect: fn(),
    onDisconnect: fn(),
    onReconnect: fn(),
    onNavigate: fn(),
  },
}

export const DisconnectedMQTT: Story = {
  args: {
    device: createDevice({
      name: 'Pico W Effects Board',
      type: 'deja-mqtt',
      connection: 'wifi',
      isConnected: false,
      port: undefined,
      topic: 'deja/pico-w-01',
    }),
    availablePorts: [],
    availableTopics: ['deja/pico-w-01'],
    linkMode: 'page',
    turnoutCount: 0,
    effectCount: 0,
    trackPower: null,
    onConnect: fn(),
    onDisconnect: fn(),
    onReconnect: fn(),
    onNavigate: fn(),
  },
}

export const DisconnectedNoPort: Story = {
  args: {
    device: createDevice({
      name: 'Arduino MEGA',
      type: 'deja-arduino',
      connection: 'usb',
      isConnected: false,
      port: undefined,
    }),
    availablePorts: [],
    linkMode: 'page',
    turnoutCount: 0,
    effectCount: 0,
    trackPower: null,
    onConnect: fn(),
    onDisconnect: fn(),
    onReconnect: fn(),
    onNavigate: fn(),
  },
}

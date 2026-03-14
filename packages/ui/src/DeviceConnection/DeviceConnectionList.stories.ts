import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import DeviceConnectionList from './DeviceConnectionList.vue'
import { createDevice } from '../../.storybook/mocks/data'

const meta: Meta<typeof DeviceConnectionList> = {
  title: 'DeviceConnection/DeviceConnectionList',
  component: DeviceConnectionList,
  tags: ['autodocs'],
  argTypes: {
    devices: { control: 'object' },
    availablePorts: { control: 'object' },
    availableTopics: { control: 'object' },
    linkMode: { control: 'select', options: ['page', 'modal'] },
    showHeader: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof DeviceConnectionList>

const connectedDccEx = createDevice({
  name: 'DCC-EX CommandStation',
  type: 'dcc-ex',
  connection: 'usb',
  isConnected: true,
  port: '/dev/ttyUSB0',
  lastConnected: new Date(Date.now() - 3600000),
})

const connectedArduino = createDevice({
  name: 'Arduino MEGA Effects',
  type: 'deja-arduino',
  connection: 'usb',
  isConnected: true,
  port: '/dev/ttyACM0',
  lastConnected: new Date(Date.now() - 1800000),
})

const disconnectedMqtt = createDevice({
  name: 'Pico W LED Board',
  type: 'deja-mqtt',
  connection: 'wifi',
  isConnected: false,
  port: undefined,
  topic: 'deja/pico-w-01',
})

const disconnectedArduinoLed = createDevice({
  name: 'Arduino LED Strip',
  type: 'deja-arduino-led',
  connection: 'usb',
  isConnected: false,
  port: undefined,
})

export const Default: Story = {
  args: {
    devices: [connectedDccEx, connectedArduino, disconnectedMqtt, disconnectedArduinoLed],
    availablePorts: ['/dev/ttyUSB0', '/dev/ttyUSB1', '/dev/ttyACM0'],
    availableTopics: ['deja/pico-w-01', 'deja/pico-w-02'],
    linkMode: 'page',
    showHeader: true,
    onConnect: fn(),
    onDisconnect: fn(),
    onReconnect: fn(),
    onNavigate: fn(),
    onRefreshPorts: fn(),
    onAddDevice: fn(),
  },
}

export const AllConnected: Story = {
  args: {
    ...Default.args,
    devices: [connectedDccEx, connectedArduino],
  },
}

export const AllDisconnected: Story = {
  args: {
    ...Default.args,
    devices: [disconnectedMqtt, disconnectedArduinoLed],
  },
}

export const Empty: Story = {
  args: {
    ...Default.args,
    devices: [],
  },
}

export const NoHeader: Story = {
  args: {
    ...Default.args,
    showHeader: false,
  },
}

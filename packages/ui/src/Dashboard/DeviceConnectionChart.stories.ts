import type { Meta, StoryObj } from '@storybook/vue3'
import DeviceConnectionChart from './DeviceConnectionChart.vue'

const meta: Meta<typeof DeviceConnectionChart> = {
  title: 'Dashboard/DeviceConnectionChart',
  component: DeviceConnectionChart,
  tags: ['autodocs'],
  argTypes: {
    connected: { control: 'number' },
    disconnected: { control: 'number' },
  },
}

export default meta
type Story = StoryObj<typeof DeviceConnectionChart>

export const MostConnected: Story = {
  args: {
    connected: 3,
    disconnected: 1,
  },
}

export const AllConnected: Story = {
  args: {
    connected: 4,
    disconnected: 0,
  },
}

export const AllDisconnected: Story = {
  args: {
    connected: 0,
    disconnected: 3,
  },
}

export const NoDevices: Story = {
  args: {
    connected: 0,
    disconnected: 0,
  },
}

export const SingleDevice: Story = {
  args: {
    connected: 1,
    disconnected: 0,
  },
}

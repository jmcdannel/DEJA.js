import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import DeviceStatusList from './DeviceStatusList.vue'

const meta: Meta<typeof DeviceStatusList> = {
  title: 'DeviceStatus/DeviceStatusList',
  component: DeviceStatusList,
  tags: ['autodocs'],
  argTypes: {
    showThrottles: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof DeviceStatusList>

export const Default: Story = {
  args: {
    showThrottles: false,
    onDisconnect: fn(),
    'onThrottle-click': fn(),
  },
}

export const WithThrottles: Story = {
  args: {
    showThrottles: true,
    onDisconnect: fn(),
    'onThrottle-click': fn(),
  },
}

export const NoThrottles: Story = {
  args: {
    showThrottles: false,
    onDisconnect: fn(),
    'onThrottle-click': fn(),
  },
}

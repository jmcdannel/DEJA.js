import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import AppHeader from './AppHeader.vue'

const meta: Meta<typeof AppHeader> = {
  title: 'Chrome/AppHeader',
  component: AppHeader,
  tags: ['autodocs'],
  argTypes: {
    appName: { control: 'text' },
    appIcon: { control: 'text' },
    drawer: { control: 'boolean' },
    variant: {
      control: 'select',
      options: ['default', 'cloud', 'throttle', 'monitor', 'tour'],
    },
    showLayoutPower: { control: 'boolean' },
    showEmergencyStop: { control: 'boolean' },
    showUserProfile: { control: 'boolean' },
    showDeviceStatus: { control: 'boolean' },
    showDeviceStatusLabel: { control: 'boolean' },
    deviceStatusCompact: { control: 'boolean' },
    color: { control: 'color' },
    dark: { control: 'boolean' },
    layoutPowerState: { control: 'boolean' },
  },
  args: {
    onDrawerToggle: fn(),
  },
}

export default meta
type Story = StoryObj<typeof AppHeader>

export const Default: Story = {
  args: {
    appName: 'DEJA',
    appIcon: 'mdi-train',
    variant: 'default',
    showLayoutPower: true,
    showEmergencyStop: true,
    showUserProfile: true,
    showDeviceStatus: true,
    dark: true,
    layoutPowerState: false,
  },
}

export const CloudVariant: Story = {
  args: {
    appName: 'Cloud',
    appIcon: 'mdi-cloud',
    variant: 'cloud',
    showLayoutPower: true,
    showEmergencyStop: true,
    showUserProfile: true,
    dark: true,
  },
}

export const ThrottleVariant: Story = {
  args: {
    appName: 'Throttle',
    appIcon: 'mdi-gamepad-variant',
    variant: 'throttle',
    showLayoutPower: true,
    showEmergencyStop: true,
    showUserProfile: true,
    dark: true,
    layoutPowerState: true,
  },
}

export const MinimalHeader: Story = {
  args: {
    appName: 'DEJA',
    variant: 'default',
    showLayoutPower: false,
    showEmergencyStop: false,
    showUserProfile: false,
    showDeviceStatus: false,
    dark: true,
  },
}

export const PowerOn: Story = {
  args: {
    appName: 'DEJA',
    variant: 'default',
    showLayoutPower: true,
    showEmergencyStop: true,
    showUserProfile: true,
    dark: true,
    layoutPowerState: true,
  },
}

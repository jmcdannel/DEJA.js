import type { Meta, StoryObj } from '@storybook/vue3'
import SystemOverviewStats from './SystemOverviewStats.vue'
import { createServerStatus } from '../../.storybook/mocks/data'

const meta: Meta<typeof SystemOverviewStats> = {
  title: 'Dashboard/SystemOverviewStats',
  component: SystemOverviewStats,
  tags: ['autodocs'],
  argTypes: {
    serverStatus: { control: 'object' },
    deviceCount: { control: 'object' },
    trackPower: { control: 'select', options: [true, false, null] },
    commandCount: { control: 'number' },
  },
}

export default meta
type Story = StoryObj<typeof SystemOverviewStats>

export const AllOnline: Story = {
  args: {
    serverStatus: createServerStatus({
      online: true,
      lastSeen: Date.now() - 60000,
    }),
    deviceCount: { connected: 3, total: 4 },
    trackPower: true,
    commandCount: 142,
  },
}

export const ServerOffline: Story = {
  args: {
    serverStatus: createServerStatus({
      online: false,
      lastSeen: Date.now() - 3600000,
    }),
    deviceCount: { connected: 0, total: 4 },
    trackPower: null,
    commandCount: 0,
  },
}

export const TrackPowerOff: Story = {
  args: {
    serverStatus: createServerStatus({ online: true, lastSeen: Date.now() - 120000 }),
    deviceCount: { connected: 2, total: 3 },
    trackPower: false,
    commandCount: 57,
  },
}

export const NoTrackPower: Story = {
  args: {
    serverStatus: createServerStatus({ online: true, lastSeen: Date.now() - 30000 }),
    deviceCount: { connected: 1, total: 1 },
    trackPower: null,
    commandCount: 12,
  },
}

export const NoServerStatus: Story = {
  args: {
    serverStatus: null,
    deviceCount: { connected: 0, total: 0 },
    trackPower: null,
    commandCount: 0,
  },
}

import type { Meta, StoryObj } from '@storybook/vue3'
import EmptyState from './EmptyState.vue'

const meta: Meta<typeof EmptyState> = {
  title: 'EmptyState/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  argTypes: {
    icon: { control: 'text' },
    title: { control: 'text' },
    description: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof EmptyState>

export const Default: Story = {
  args: {},
}

export const NoTurnouts: Story = {
  args: {
    icon: 'mdi-railroad-light',
    title: 'No turnouts configured',
    description: 'Add turnouts to control track switches on your layout. Each turnout maps to a DCC decoder address.',
  },
}

export const NoEffects: Story = {
  args: {
    icon: 'mdi-lightning-bolt-outline',
    title: 'No effects found',
    description: 'Create effects to control lights, sounds, and animations on your model railroad.',
  },
}

export const NoDevices: Story = {
  args: {
    icon: 'mdi-devices',
    title: 'No devices connected',
    description: 'Connect a DCC-EX command station or DEJA device to start controlling your layout.',
  },
}

export const IconOnly: Story = {
  args: {
    icon: 'mdi-magnify',
    title: 'No results found',
  },
}

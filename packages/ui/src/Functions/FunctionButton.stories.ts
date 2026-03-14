import type { Meta, StoryObj } from '@storybook/vue3'
import FunctionButton from './FunctionButton.vue'
import { createLocoFunction } from '../../.storybook/mocks/data'

// No vi.mock needed — @repo/modules is aliased to the mock via Vite in main.ts

const meta: Meta<typeof FunctionButton> = {
  title: 'Functions/FunctionButton',
  component: FunctionButton,
  tags: ['autodocs'],
  argTypes: {
    func: { control: 'object' },
    address: { control: 'number' },
    showLabel: { control: 'boolean' },
    showDefaultIcon: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof FunctionButton>

export const Default: Story = {
  args: {
    func: createLocoFunction({ id: 0, label: 'Headlight', icon: 'mdi-lightbulb' }),
    address: 3,
    showLabel: false,
    showDefaultIcon: false,
  },
}

export const WithLabel: Story = {
  args: {
    func: createLocoFunction({ id: 0, label: 'Headlight', icon: 'mdi-lightbulb' }),
    address: 3,
    showLabel: true,
    showDefaultIcon: false,
  },
}

export const Momentary: Story = {
  args: {
    func: createLocoFunction({ id: 2, label: 'Horn', icon: 'mdi-bullhorn', isMomentary: true }),
    address: 3,
    showLabel: false,
    showDefaultIcon: false,
  },
}

export const MomentaryWithLabel: Story = {
  args: {
    func: createLocoFunction({ id: 2, label: 'Horn', icon: 'mdi-bullhorn', isMomentary: true }),
    address: 3,
    showLabel: true,
    showDefaultIcon: false,
  },
}

export const ActiveState: Story = {
  args: {
    func: { ...createLocoFunction({ id: 1, label: 'Bell', icon: 'mdi-bell' }), state: true },
    address: 3,
    showLabel: true,
    showDefaultIcon: false,
  },
}

export const NoFunction: Story = {
  args: {
    func: undefined,
    address: 3,
    showLabel: false,
    showDefaultIcon: false,
  },
}

import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import EditFunction from './EditFunction.vue'
import { createLocoFunction } from '../../.storybook/mocks/data'

// No vi.mock needed — @repo/modules is aliased to the mock via Vite in main.ts

const meta: Meta<typeof EditFunction> = {
  title: 'Functions/EditFunction',
  component: EditFunction,
  tags: ['autodocs'],
  argTypes: {
    defaultFunction: { control: 'object' },
    locoFunction: { control: 'object' },
  },
  args: {
    onEdit: fn(),
  },
}

export default meta
type Story = StoryObj<typeof EditFunction>

const headlightDefault = createLocoFunction({ id: 0, label: 'F0', icon: null, isFavorite: false })
const bellDefault = createLocoFunction({ id: 1, label: 'F1', icon: null, isFavorite: false })

export const Default: Story = {
  args: {
    defaultFunction: headlightDefault,
    locoFunction: undefined,
  },
}

export const WithCustomizedFunction: Story = {
  args: {
    defaultFunction: headlightDefault,
    locoFunction: createLocoFunction({ id: 0, label: 'Headlight', icon: 'mdi-lightbulb', isFavorite: true }),
  },
}

export const MomentaryFunction: Story = {
  args: {
    defaultFunction: bellDefault,
    locoFunction: createLocoFunction({ id: 1, label: 'Horn', icon: 'mdi-bullhorn', isFavorite: true, isMomentary: true }),
  },
}

export const HiddenFunction: Story = {
  args: {
    defaultFunction: createLocoFunction({ id: 5, label: 'F5', icon: null, isFavorite: false }),
    locoFunction: createLocoFunction({ id: 5, label: 'Unused', icon: null, isFavorite: false }),
  },
}

export const FavoriteFunction: Story = {
  args: {
    defaultFunction: createLocoFunction({ id: 2, label: 'F2', icon: null, isFavorite: false }),
    locoFunction: createLocoFunction({ id: 2, label: 'Bell', icon: 'mdi-bell', isFavorite: true, isMomentary: false }),
  },
}

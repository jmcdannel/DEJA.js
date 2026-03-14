import type { Meta, StoryObj } from '@storybook/vue3'
import Functions from './Functions.vue'
import { createLoco, createLocoFunction } from '../../.storybook/mocks/data'

// No vi.mock needed — @repo/modules is aliased to the mock via Vite in main.ts

const meta: Meta<typeof Functions> = {
  title: 'Functions/Functions',
  component: Functions,
  tags: ['autodocs'],
  argTypes: {
    loco: { control: 'object' },
  },
}

export default meta
type Story = StoryObj<typeof Functions>

export const Default: Story = {
  args: {
    loco: createLoco({
      functions: [
        createLocoFunction({ id: 0, label: 'Headlight', icon: 'mdi-lightbulb', isFavorite: true }),
        createLocoFunction({ id: 1, label: 'Bell', icon: 'mdi-bell', isFavorite: true }),
        createLocoFunction({ id: 2, label: 'Horn', icon: 'mdi-bullhorn', isFavorite: true }),
        createLocoFunction({ id: 3, label: 'Coupler', icon: 'mdi-connection', isFavorite: false }),
      ],
    }),
  },
}

export const NoFunctions: Story = {
  args: {
    loco: createLoco({ functions: [] }),
  },
}

export const AllFavorites: Story = {
  args: {
    loco: createLoco({
      functions: [
        createLocoFunction({ id: 0, label: 'Headlight', icon: 'mdi-lightbulb', isFavorite: true }),
        createLocoFunction({ id: 1, label: 'Bell', icon: 'mdi-bell', isFavorite: true }),
        createLocoFunction({ id: 2, label: 'Horn', icon: 'mdi-bullhorn', isFavorite: true }),
        createLocoFunction({ id: 3, label: 'Coupler', icon: 'mdi-connection', isFavorite: true }),
        createLocoFunction({ id: 4, label: 'Dynamic Brake', icon: 'mdi-train', isFavorite: true }),
        createLocoFunction({ id: 5, label: 'Notch Up', icon: 'mdi-chevron-up', isFavorite: true }),
      ],
    }),
  },
}

export const WithMomentaryFunctions: Story = {
  args: {
    loco: createLoco({
      functions: [
        createLocoFunction({ id: 0, label: 'Headlight', icon: 'mdi-lightbulb', isFavorite: true, isMomentary: false }),
        createLocoFunction({ id: 1, label: 'Bell', icon: 'mdi-bell', isFavorite: true, isMomentary: false }),
        createLocoFunction({ id: 2, label: 'Horn', icon: 'mdi-bullhorn', isFavorite: true, isMomentary: true }),
        createLocoFunction({ id: 3, label: 'Coupler', icon: 'mdi-connection', isFavorite: true, isMomentary: true }),
      ],
    }),
  },
}

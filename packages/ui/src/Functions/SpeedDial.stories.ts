import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import SpeedDial from './SpeedDial.vue'
import { createLoco, createLocoFunction, createConsistLoco } from '../../.storybook/mocks/data'

// No vi.mock needed — @repo/modules is aliased to the mock via Vite in main.ts

const meta: Meta<typeof SpeedDial> = {
  title: 'Functions/SpeedDial',
  component: SpeedDial,
  tags: ['autodocs'],
  argTypes: {
    loco: { control: 'object' },
  },
  args: {
    onSaveLoco: fn(),
  },
}

export default meta
type Story = StoryObj<typeof SpeedDial>

export const Default: Story = {
  args: {
    loco: createLoco({
      functions: [
        createLocoFunction({ id: 0, label: 'Headlight', icon: 'mdi-lightbulb', isFavorite: true }),
        createLocoFunction({ id: 1, label: 'Bell', icon: 'mdi-bell', isFavorite: true }),
        createLocoFunction({ id: 2, label: 'Horn', icon: 'mdi-bullhorn', isFavorite: true }),
      ],
    }),
  },
}

export const NoFavoriteFunctions: Story = {
  args: {
    loco: createLoco({
      functions: [
        createLocoFunction({ id: 0, label: 'Headlight', icon: 'mdi-lightbulb', isFavorite: false }),
        createLocoFunction({ id: 1, label: 'Bell', icon: 'mdi-bell', isFavorite: false }),
      ],
    }),
  },
}

export const ManyFavorites: Story = {
  args: {
    loco: createLoco({
      functions: [
        createLocoFunction({ id: 0, label: 'Headlight', icon: 'mdi-lightbulb', isFavorite: true }),
        createLocoFunction({ id: 1, label: 'Bell', icon: 'mdi-bell', isFavorite: true }),
        createLocoFunction({ id: 2, label: 'Horn', icon: 'mdi-bullhorn', isFavorite: true }),
        createLocoFunction({ id: 3, label: 'Coupler', icon: 'mdi-connection', isFavorite: true }),
        createLocoFunction({ id: 4, label: 'Dynamic Brake', icon: 'mdi-train', isFavorite: true }),
        createLocoFunction({ id: 5, label: 'Notch Up', icon: 'mdi-chevron-up', isFavorite: true }),
        createLocoFunction({ id: 6, label: 'Notch Down', icon: 'mdi-chevron-down', isFavorite: true }),
        createLocoFunction({ id: 7, label: 'Mute', icon: 'mdi-volume-off', isFavorite: true }),
        createLocoFunction({ id: 8, label: 'Brake', icon: 'mdi-car-brake-alert', isFavorite: true }),
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
      ],
    }),
  },
}

export const NoFunctions: Story = {
  args: {
    loco: createLoco({ functions: [] }),
  },
}

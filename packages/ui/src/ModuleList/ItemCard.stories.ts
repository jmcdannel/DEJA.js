import type { Meta, StoryObj } from '@storybook/vue3'
import ItemCard from './ItemCard.vue'
import { createEffect } from '../../.storybook/mocks/data'

const meta: Meta<typeof ItemCard> = {
  title: 'ModuleList/ItemCard',
  component: ItemCard,
  tags: ['autodocs'],
  argTypes: {
    item: { control: 'object' },
    isRunning: { control: 'boolean' },
    state: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof ItemCard>

export const Inactive: Story = {
  args: {
    item: createEffect({
      name: 'Yard Lights',
      color: 'yellow',
      icon: 'mdi-lightbulb',
      device: 'arduino-01',
      type: 'light',
      tags: ['yard', 'lighting'],
      allowGuest: true,
    }),
    isRunning: false,
    state: false,
  },
}

export const Active: Story = {
  args: {
    item: createEffect({
      name: 'Station Bell',
      color: 'cyan',
      icon: 'mdi-bell',
      device: 'deja-server',
      type: 'sound',
      tags: ['station', 'audio'],
      allowGuest: false,
    }),
    isRunning: false,
    state: true,
  },
}

export const Running: Story = {
  args: {
    item: createEffect({
      name: 'Crossing Gate',
      color: 'indigo',
      icon: 'mdi-gate',
      device: 'arduino-01',
      type: 'relay',
    }),
    isRunning: true,
    state: false,
  },
}

export const WithGuestAccess: Story = {
  args: {
    item: createEffect({
      name: 'Water Tower LED',
      color: 'lime',
      icon: 'mdi-led-variant-on',
      device: 'arduino-02',
      type: 'led',
      tags: ['scenery'],
      allowGuest: true,
    }),
    isRunning: false,
    state: true,
  },
}

export const MinimalData: Story = {
  args: {
    item: createEffect({
      name: 'Simple Effect',
      device: undefined,
      type: '',
      tags: [],
      allowGuest: false,
    }),
    isRunning: false,
    state: false,
  },
}

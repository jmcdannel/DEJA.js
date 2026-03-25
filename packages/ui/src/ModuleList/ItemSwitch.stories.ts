import type { Meta, StoryObj } from '@storybook/vue3'
import ItemSwitch from './ItemSwitch.vue'
import { createEffect } from '../../.storybook/mocks/data'

const meta: Meta<typeof ItemSwitch> = {
  title: 'ModuleList/ItemSwitch',
  component: ItemSwitch,
  tags: ['autodocs'],
  argTypes: {
    item: { control: 'object' },
    isRunning: { control: 'boolean' },
    state: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof ItemSwitch>

export const Inactive: Story = {
  args: {
    item: createEffect({
      name: 'Yard Lights',
      color: 'yellow',
      icon: 'mdi-lightbulb',
      device: 'arduino-01',
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
    }),
    isRunning: true,
    state: false,
  },
}

export const NoDevice: Story = {
  args: {
    item: createEffect({
      name: 'Macro Effect',
      color: 'purple',
      icon: 'mdi-magic-staff',
      device: undefined,
    }),
    isRunning: false,
    state: false,
  },
}

export const CustomColor: Story = {
  args: {
    item: createEffect({
      name: 'LED Strip',
      color: 'teal',
      icon: 'mdi-led-strip-variant',
      device: 'arduino-02',
    }),
    isRunning: false,
    state: true,
  },
}

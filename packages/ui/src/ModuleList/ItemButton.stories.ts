import type { Meta, StoryObj } from '@storybook/vue3'
import ItemButton from './ItemButton.vue'
import { createEffect } from '../../.storybook/mocks/data'

const meta: Meta<typeof ItemButton> = {
  title: 'ModuleList/ItemButton',
  component: ItemButton,
  tags: ['autodocs'],
  argTypes: {
    item: { control: 'object' },
    isRunning: { control: 'boolean' },
    state: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof ItemButton>

export const Inactive: Story = {
  args: {
    item: createEffect({ name: 'Yard Lights', color: 'yellow', icon: 'mdi-lightbulb' }),
    isRunning: false,
    state: false,
  },
}

export const Active: Story = {
  args: {
    item: createEffect({ name: 'Station Bell', color: 'cyan', icon: 'mdi-bell' }),
    isRunning: false,
    state: true,
  },
}

export const Running: Story = {
  args: {
    item: createEffect({ name: 'Crossing Gate', color: 'indigo', icon: 'mdi-gate' }),
    isRunning: true,
    state: false,
  },
}

export const CustomColor: Story = {
  args: {
    item: createEffect({ name: 'LED Strip', color: 'lime', icon: 'mdi-led-strip-variant' }),
    isRunning: false,
    state: true,
  },
}

export const NoIcon: Story = {
  args: {
    item: createEffect({ name: 'Unknown Effect', color: 'grey', icon: undefined }),
    isRunning: false,
    state: false,
  },
}

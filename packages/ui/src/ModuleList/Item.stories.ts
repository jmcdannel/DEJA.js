import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import Item from './Item.vue'
import { createEffect } from '../../.storybook/mocks/data'

const meta: Meta<typeof Item> = {
  title: 'ModuleList/Item',
  component: Item,
  tags: ['autodocs'],
  argTypes: {
    item: { control: 'object' },
    viewAs: {
      control: 'select',
      options: ['switch', 'button', 'card'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Item>

const sampleItem = createEffect({
  name: 'Yard Lights',
  type: 'light',
  color: 'yellow',
  device: 'arduino-01',
  state: false,
})

export const AsSwitch: Story = {
  args: {
    item: sampleItem,
    viewAs: 'switch',
    'onUpdate:state': fn(),
  },
}

export const AsButton: Story = {
  args: {
    item: sampleItem,
    viewAs: 'button',
    'onUpdate:state': fn(),
  },
}

export const AsCard: Story = {
  args: {
    item: sampleItem,
    viewAs: 'card',
    'onUpdate:state': fn(),
  },
}

export const ActiveState: Story = {
  args: {
    item: createEffect({ name: 'Station Bell', type: 'sound', color: 'cyan', state: true, icon: 'mdi-bell' }),
    viewAs: 'switch',
    'onUpdate:state': fn(),
  },
}

export const NoViewAs: Story = {
  args: {
    item: sampleItem,
    viewAs: undefined,
    'onUpdate:state': fn(),
  },
}

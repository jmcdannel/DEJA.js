import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import Table from './Table.vue'
import { createEffect } from '../../.storybook/mocks/data'

const meta: Meta<typeof Table> = {
  title: 'ModuleList/Table',
  component: Table,
  tags: ['autodocs'],
  argTypes: {
    list: { control: 'object' },
    sortBy: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof Table>

const sampleList = [
  createEffect({ name: 'Yard Lights', type: 'light', device: 'arduino-01', state: false, color: 'yellow', allowGuest: true }),
  createEffect({ name: 'Station Bell', type: 'sound', device: 'deja-server', state: true, color: 'cyan', allowGuest: false }),
  createEffect({ name: 'Crossing Gate', type: 'relay', device: 'arduino-01', state: false, color: 'indigo', allowGuest: true }),
  createEffect({ name: 'Water Tower LED', type: 'led', device: 'arduino-02', state: true, color: 'lime', allowGuest: false }),
]

export const Default: Story = {
  args: {
    list: sampleList,
    sortBy: 'order',
    'onUpdate:state': fn(),
  },
}

export const Empty: Story = {
  args: {
    list: [],
    sortBy: 'order',
    'onUpdate:state': fn(),
  },
}

export const SortedByName: Story = {
  args: {
    list: sampleList,
    sortBy: 'name',
    'onUpdate:state': fn(),
  },
}

export const AllGuestAccess: Story = {
  args: {
    list: sampleList.map((item) => ({ ...item, allowGuest: true })),
    sortBy: 'order',
    'onUpdate:state': fn(),
  },
}

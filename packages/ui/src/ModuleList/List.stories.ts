import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import List from './List.vue'
import { createEffect, createEffects } from '../../.storybook/mocks/data'

const meta: Meta<typeof List> = {
  title: 'ModuleList/List',
  component: List,
  tags: ['autodocs'],
  argTypes: {
    icon: { control: 'text' },
    color: { control: 'text' },
    title: { control: 'text' },
    moduleName: { control: 'text' },
    list: { control: 'object' },
    loading: { control: 'boolean' },
    emptyIcon: { control: 'text' },
    emptyTitle: { control: 'text' },
    emptyDescription: { control: 'text' },
    filters: { control: 'object' },
    viewOptions: { control: 'object' },
    sortOptions: { control: 'object' },
  },
}

export default meta
type Story = StoryObj<typeof List>

const sampleEffects = [
  createEffect({ name: 'Yard Lights', type: 'light', color: 'yellow', device: 'arduino-01', state: false, tags: ['yard', 'lighting'], allowGuest: true }),
  createEffect({ name: 'Station Bell', type: 'sound', color: 'cyan', device: 'deja-server', state: true, tags: ['station', 'audio'] }),
  createEffect({ name: 'Crossing Gate', type: 'relay', color: 'indigo', device: 'arduino-01', state: false, tags: ['crossing'] }),
  createEffect({ name: 'Water Tower LED', type: 'led', color: 'lime', device: 'arduino-02', state: true, tags: ['scenery', 'lighting'], allowGuest: true }),
  createEffect({ name: 'Engine House', type: 'light', color: 'orange', device: 'arduino-01', state: false, tags: ['yard'] }),
  createEffect({ name: 'Street Lights', type: 'streetlight', color: 'yellow', device: 'arduino-02', state: true, tags: ['scenery', 'lighting'] }),
]

export const Default: Story = {
  args: {
    icon: 'mdi-lightning-bolt',
    color: 'amber-darken-4',
    title: 'Effects',
    moduleName: 'effects',
    list: sampleEffects,
    loading: false,
    'onUpdate:state': fn(),
  },
}

export const Loading: Story = {
  args: {
    ...Default.args,
    loading: true,
    list: [],
  },
}

export const Empty: Story = {
  args: {
    ...Default.args,
    list: [],
    emptyIcon: 'mdi-lightning-bolt-outline',
    emptyTitle: 'No effects configured',
    emptyDescription: 'Add effects to control lights, sounds, and animations on your layout.',
  },
}

export const WithFilters: Story = {
  args: {
    ...Default.args,
    filters: [
      {
        type: 'type',
        label: 'Type',
        options: [
          { value: 'light', label: 'Light' },
          { value: 'sound', label: 'Sound' },
          { value: 'relay', label: 'Relay' },
          { value: 'led', label: 'LED' },
          { value: 'streetlight', label: 'Street Light' },
        ],
      },
      {
        type: 'device',
        label: 'Device',
        options: [
          { value: 'arduino-01', label: 'Arduino 01' },
          { value: 'arduino-02', label: 'Arduino 02' },
          { value: 'deja-server', label: 'DEJA Server' },
        ],
      },
    ],
  },
}

export const ManyItems: Story = {
  args: {
    ...Default.args,
    list: createEffects(20),
  },
}

import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import Menu from './Menu.vue'
import type { MenuItem } from './types'

const sampleMenu: MenuItem[] = [
  { label: 'Throttle', icon: 'mdi-gamepad-variant', name: 'throttle-list', color: 'green' },
  { label: 'Turnouts', icon: 'mdi-source-branch', name: 'turnouts', color: 'blue' },
  { label: 'Routes', icon: 'mdi-map', name: 'routes', color: 'purple' },
  { label: 'Effects', icon: 'mdi-magic-staff', name: 'effects', color: 'orange' },
  { label: 'Signals', icon: 'mdi-traffic-light', name: 'signals', color: 'cyan' },
  { label: 'Roster', icon: 'mdi-train', name: 'roster', color: 'red' },
]

const meta: Meta<typeof Menu> = {
  title: 'Navigation/Menu',
  component: Menu,
  tags: ['autodocs'],
  argTypes: {
    drawer: { control: 'boolean' },
    menu: { control: 'object' },
    temporary: { control: 'boolean' },
  },
  args: {
    'onUpdate:drawer': fn(),
    onHandleMenu: fn(),
  },
}

export default meta
type Story = StoryObj<typeof Menu>

export const Open: Story = {
  args: {
    drawer: true,
    menu: sampleMenu,
    temporary: false,
  },
}

export const Closed: Story = {
  args: {
    drawer: false,
    menu: sampleMenu,
    temporary: false,
  },
}

export const Temporary: Story = {
  args: {
    drawer: true,
    menu: sampleMenu,
    temporary: true,
  },
}

export const MinimalMenu: Story = {
  args: {
    drawer: true,
    menu: [
      { label: 'Throttle', icon: 'mdi-gamepad-variant', name: 'throttle-list', color: 'green' },
      { label: 'Turnouts', icon: 'mdi-source-branch', name: 'turnouts', color: 'blue' },
    ],
    temporary: false,
  },
}

export const WithFavorites: Story = {
  args: {
    drawer: true,
    menu: [
      { label: 'Throttle', icon: 'mdi-gamepad-variant', name: 'throttle-list', color: 'green', isFavorite: true },
      { label: 'Turnouts', icon: 'mdi-source-branch', name: 'turnouts', color: 'blue', isFavorite: true },
      { label: 'Routes', icon: 'mdi-map', name: 'routes', color: 'purple', isFavorite: false },
      { label: 'Effects', icon: 'mdi-magic-staff', name: 'effects', color: 'orange', isFavorite: false },
    ],
    temporary: false,
  },
}

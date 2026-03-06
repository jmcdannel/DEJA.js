import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import { createRouter, createMemoryHistory } from 'vue-router'
import LocoAvatar from './LocoAvatar.vue'

// Provide a stub router so vue-router useRouter() doesn't throw
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/throttle/:address', name: 'throttle', component: { template: '<div />' } },
    { path: '/throttle', name: 'throttle-list', component: { template: '<div />' } },
  ],
})

const meta: Meta<typeof LocoAvatar> = {
  title: 'Locos/LocoAvatar',
  component: LocoAvatar,
  tags: ['autodocs'],
  decorators: [
    (story) => ({
      components: { story },
      template: '<story />',
      setup() {
        return {}
      },
    }),
  ],
  parameters: {
    router,
  },
  argTypes: {
    size: { control: { type: 'range', min: 32, max: 200, step: 8 } },
    color: { control: 'color' },
    showConsist: { control: 'boolean' },
    showMenu: { control: 'boolean' },
    variant: {
      control: 'select',
      options: ['text', 'flat', 'elevated', 'tonal', 'outlined', 'plain'],
    },
  },
}

export default meta
type Story = StoryObj<typeof LocoAvatar>

const baseLoco = {
  id: 'loco-3',
  address: 3,
  name: 'Southern Pacific 4449',
  hasSound: true,
  meta: { color: 'red', roadname: 'sp' },
  consist: [],
}

export const Default: Story = {
  args: {
    loco: baseLoco,
    size: 72,
    showConsist: true,
    showMenu: false,
    variant: 'tonal',
  },
}

export const WithConsist: Story = {
  args: {
    loco: {
      ...baseLoco,
      consist: [{ address: 4 }, { address: 5 }],
    },
    size: 72,
    showConsist: true,
    showMenu: false,
    variant: 'tonal',
  },
}

export const Large: Story = {
  args: {
    loco: baseLoco,
    size: 120,
    showConsist: false,
    showMenu: false,
    variant: 'elevated',
  },
}

export const WithMenu: Story = {
  args: {
    loco: baseLoco,
    size: 72,
    showConsist: false,
    showMenu: true,
    variant: 'tonal',
  },
}

export const CustomColor: Story = {
  args: {
    loco: { ...baseLoco, meta: { color: 'orange', roadname: 'bnsf' } },
    size: 72,
    showConsist: false,
    showMenu: false,
    variant: 'tonal',
  },
}

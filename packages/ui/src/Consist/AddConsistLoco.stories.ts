import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import AddConsistLoco from './AddConsistLoco.vue'
import { createLoco, createConsistLoco, createLocos } from '../../.storybook/mocks/data'

// No vi.mock needed — @repo/modules is aliased to the mock via Vite in main.ts

const meta: Meta<typeof AddConsistLoco> = {
  title: 'Consist/AddConsistLoco',
  component: AddConsistLoco,
  tags: ['autodocs'],
  argTypes: {
    alocos: { control: 'object' },
    loco: { control: 'object' },
    color: { control: 'color' },
    open: { control: 'boolean' },
  },
  args: {
    onAdd: fn(),
  },
}

export default meta
type Story = StoryObj<typeof AddConsistLoco>

const leadLoco = createLoco({ address: 3, name: 'BNSF GP38-2' })
const availableLocos = createLocos(5)

export const Default: Story = {
  args: {
    alocos: availableLocos,
    loco: leadLoco,
    color: 'purple',
    open: false,
  },
}

export const DialogOpen: Story = {
  args: {
    alocos: availableLocos,
    loco: leadLoco,
    color: 'purple',
    open: true,
  },
}

export const WithExistingConsist: Story = {
  args: {
    alocos: availableLocos,
    loco: createLoco({
      address: 3,
      consist: [
        createConsistLoco({ address: 1, direction: true, trim: 0 }),
        createConsistLoco({ address: 2, direction: false, trim: 0 }),
      ],
    }),
    color: 'pink',
    open: true,
  },
}

export const NoAvailableLocos: Story = {
  args: {
    alocos: [],
    loco: leadLoco,
    color: 'blue',
    open: true,
  },
}

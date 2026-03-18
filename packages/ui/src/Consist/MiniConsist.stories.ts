import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import MiniConsist from './MiniConsist.vue'
import { createLoco, createConsistLoco } from '../../.storybook/mocks/data'

// No vi.mock needed — @repo/modules is aliased to the mock via Vite in main.ts

const meta: Meta<typeof MiniConsist> = {
  title: 'Consist/MiniConsist',
  component: MiniConsist,
  tags: ['autodocs'],
  argTypes: {
    loco: { control: 'object' },
    selectedAddress: { control: 'number' },
  },
  args: {
    onSelect: fn(),
  },
}

export default meta
type Story = StoryObj<typeof MiniConsist>

export const Default: Story = {
  args: {
    loco: createLoco({
      consist: [
        createConsistLoco({ address: 1234, direction: true, trim: 0 }),
        createConsistLoco({ address: 5678, direction: false, trim: 2 }),
      ],
    }),
    selectedAddress: null,
  },
}

export const WithSelection: Story = {
  args: {
    loco: createLoco({
      consist: [
        createConsistLoco({ address: 1234, direction: true, trim: 0 }),
        createConsistLoco({ address: 5678, direction: false, trim: 2 }),
      ],
    }),
    selectedAddress: 1234,
  },
}

export const EmptyConsist: Story = {
  args: {
    loco: createLoco({ consist: [] }),
    selectedAddress: null,
  },
}

export const SingleConsistLoco: Story = {
  args: {
    loco: createLoco({
      consist: [createConsistLoco({ address: 4567, direction: true, trim: 0 })],
    }),
    selectedAddress: null,
  },
}

export const LargeConsist: Story = {
  args: {
    loco: createLoco({
      meta: { color: '#FF6600', roadname: 'BNSF' },
      consist: [
        createConsistLoco({ address: 100, direction: true, trim: 0 }),
        createConsistLoco({ address: 200, direction: false, trim: 0 }),
        createConsistLoco({ address: 300, direction: true, trim: 0 }),
        createConsistLoco({ address: 400, direction: false, trim: 0 }),
        createConsistLoco({ address: 500, direction: true, trim: 0 }),
      ],
    }),
    selectedAddress: 300,
  },
}

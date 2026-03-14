import type { Meta, StoryObj } from '@storybook/vue3'
import Consist from './Consist.vue'
import { createLoco, createConsistLoco } from '../../.storybook/mocks/data'

// No vi.mock needed — @repo/modules is aliased to the mock via Vite in main.ts

const meta: Meta<typeof Consist> = {
  title: 'Consist/Consist',
  component: Consist,
  tags: ['autodocs'],
  argTypes: {
    loco: { control: 'object' },
  },
}

export default meta
type Story = StoryObj<typeof Consist>

export const Default: Story = {
  args: {
    loco: createLoco({
      consist: [
        createConsistLoco({ address: 1234, direction: true, trim: 0 }),
        createConsistLoco({ address: 5678, direction: false, trim: 2 }),
      ],
    }),
  },
}

export const EmptyConsist: Story = {
  args: {
    loco: createLoco({ consist: [] }),
  },
}

export const NoConsist: Story = {
  args: {
    loco: createLoco({ consist: undefined }),
  },
}

export const SingleConsistLoco: Story = {
  args: {
    loco: createLoco({
      consist: [createConsistLoco({ address: 4567, direction: true, trim: 0 })],
    }),
  },
}

export const LargeConsist: Story = {
  args: {
    loco: createLoco({
      consist: [
        createConsistLoco({ address: 100, direction: true, trim: 0 }),
        createConsistLoco({ address: 200, direction: false, trim: -3 }),
        createConsistLoco({ address: 300, direction: true, trim: 5 }),
        createConsistLoco({ address: 400, direction: false, trim: 1 }),
      ],
    }),
  },
}

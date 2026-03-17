import type { Meta, StoryObj } from '@storybook/vue3'
import LeadLoco from './LeadLoco.vue'
import { createLoco, createConsistLoco } from '../../.storybook/mocks/data'

// No vi.mock needed — @repo/modules is aliased to the mock via Vite in main.ts

const meta: Meta<typeof LeadLoco> = {
  title: 'Consist/LeadLoco',
  component: LeadLoco,
  tags: ['autodocs'],
  argTypes: {
    loco: { control: 'object' },
    color: { control: 'color' },
  },
}

export default meta
type Story = StoryObj<typeof LeadLoco>

export const Default: Story = {
  args: {
    loco: createLoco({
      address: 3,
      consist: [
        createConsistLoco({ address: 1234, direction: true, trim: 0 }),
      ],
    }),
    color: 'purple',
  },
}

export const HighAddress: Story = {
  args: {
    loco: createLoco({ address: 9999 }),
    color: 'blue',
  },
}

export const LowAddress: Story = {
  args: {
    loco: createLoco({ address: 1 }),
    color: 'green',
  },
}

export const CustomColor: Story = {
  args: {
    loco: createLoco({ address: 42 }),
    color: 'pink',
  },
}

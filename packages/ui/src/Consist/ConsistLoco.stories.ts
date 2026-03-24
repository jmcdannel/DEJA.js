import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import ConsistLoco from './ConsistLoco.vue'
import { createConsistLoco } from '../../.storybook/mocks/data'

// No vi.mock needed — @repo/modules is aliased to the mock via Vite in main.ts

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Storybook Meta args include event handlers not in component type
const meta: Meta<any> = {
  title: 'Consist/ConsistLoco',
  component: ConsistLoco,
  tags: ['autodocs'],
  argTypes: {
    cloco: { control: 'object' },
    color: { control: 'color' },
  },
  args: {
    onToggle: fn(),
    onTrim: fn(),
    onDelete: fn(),
  },
}

export default meta
type Story = StoryObj<typeof ConsistLoco>

export const Default: Story = {
  args: {
    cloco: createConsistLoco({ address: 1234, direction: true, trim: 0 }),
    color: 'purple',
  },
}

export const ReversedDirection: Story = {
  args: {
    cloco: createConsistLoco({ address: 5678, direction: false, trim: 0 }),
    color: 'purple',
  },
}

export const PositiveTrim: Story = {
  args: {
    cloco: createConsistLoco({ address: 100, direction: true, trim: 5 }),
    color: 'blue',
  },
}

export const NegativeTrim: Story = {
  args: {
    cloco: createConsistLoco({ address: 200, direction: false, trim: -3 }),
    color: 'pink',
  },
}

export const HighAddress: Story = {
  args: {
    cloco: createConsistLoco({ address: 9999, direction: true, trim: 10 }),
    color: 'green',
  },
}

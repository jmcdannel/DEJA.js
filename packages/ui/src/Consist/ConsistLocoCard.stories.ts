import type { Meta, StoryObj } from '@storybook/vue3'
import ConsistLocoCard from './ConsistLocoCard.vue'
import { createConsistLoco } from '../../.storybook/mocks/data'

const meta: Meta<typeof ConsistLocoCard> = {
  title: 'Consist/ConsistLocoCard',
  component: ConsistLocoCard,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ConsistLocoCard>

export const ForwardCollapsed: Story = {
  args: {
    cloco: createConsistLoco({ address: 17, direction: true, trim: 0 }),
    expanded: false,
  },
}

export const ForwardExpanded: Story = {
  args: {
    cloco: createConsistLoco({ address: 17, direction: true, trim: 0 }),
    expanded: true,
  },
}

export const ReversedCollapsed: Story = {
  args: {
    cloco: createConsistLoco({ address: 24, direction: false, trim: -2 }),
    expanded: false,
  },
}

export const ReversedExpanded: Story = {
  args: {
    cloco: createConsistLoco({ address: 24, direction: false, trim: -2 }),
    expanded: true,
  },
}

export const HighTrim: Story = {
  args: {
    cloco: createConsistLoco({ address: 50, direction: true, trim: 8 }),
    expanded: true,
  },
}

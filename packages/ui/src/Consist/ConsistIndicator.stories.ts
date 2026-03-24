import type { Meta, StoryObj } from '@storybook/vue3'
import ConsistIndicator from './ConsistIndicator.vue'
import { createLoco, createConsistLoco } from '../../.storybook/mocks/data'

const meta: Meta<typeof ConsistIndicator> = {
  title: 'Consist/ConsistIndicator',
  component: ConsistIndicator,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ConsistIndicator>

export const WithMembers: Story = {
  args: {
    loco: createLoco({
      address: 23,
      name: 'BNSF 5801',
      consist: [
        createConsistLoco({ address: 17, direction: true, trim: 0 }),
        createConsistLoco({ address: 24, direction: false, trim: -2 }),
      ],
    }),
  },
}

export const EmptyConsist: Story = {
  args: {
    loco: createLoco({ address: 23, name: 'BNSF 5801', consist: [] }),
  },
}

export const NoConsist: Story = {
  args: {
    loco: createLoco({ address: 23, name: 'BNSF 5801', consist: undefined }),
  },
}

export const SingleMember: Story = {
  args: {
    loco: createLoco({
      address: 23,
      name: 'BNSF 5801',
      consist: [createConsistLoco({ address: 17, direction: true, trim: 0 })],
    }),
  },
}

export const LargeConsist: Story = {
  args: {
    loco: createLoco({
      address: 23,
      name: 'BNSF 5801',
      consist: [
        createConsistLoco({ address: 100, direction: true, trim: 0 }),
        createConsistLoco({ address: 200, direction: false, trim: -3 }),
        createConsistLoco({ address: 300, direction: true, trim: 5 }),
        createConsistLoco({ address: 400, direction: false, trim: 1 }),
        createConsistLoco({ address: 500, direction: true, trim: 0 }),
      ],
    }),
  },
}

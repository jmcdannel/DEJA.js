import type { Meta, StoryObj } from '@storybook/vue3'
import ConsistEditor from './ConsistEditor.vue'
import { createLoco, createConsistLoco } from '../../.storybook/mocks/data'

const meta: Meta<typeof ConsistEditor> = {
  title: 'Consist/ConsistEditor',
  component: ConsistEditor,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ConsistEditor>

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

export const SingleMember: Story = {
  args: {
    loco: createLoco({
      address: 23,
      name: 'BNSF 5801',
      consist: [createConsistLoco({ address: 17, direction: true, trim: 3 })],
    }),
  },
}

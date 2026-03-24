import type { Meta, StoryObj } from '@storybook/vue3'
import ConsistLeadCard from './ConsistLeadCard.vue'
import { createLoco } from '../../.storybook/mocks/data'

const meta: Meta<typeof ConsistLeadCard> = {
  title: 'Consist/ConsistLeadCard',
  component: ConsistLeadCard,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ConsistLeadCard>

export const Default: Story = {
  args: {
    loco: createLoco({ address: 23, name: 'BNSF 5801' }),
  },
}

export const LongName: Story = {
  args: {
    loco: createLoco({ address: 4014, name: 'Union Pacific Big Boy 4014 Steam Locomotive' }),
  },
}

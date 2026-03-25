import type { Meta, StoryObj } from '@storybook/vue3'
import ConsistLocoPicker from './ConsistLocoPicker.vue'
import { createLoco, createConsistLoco } from '../../.storybook/mocks/data'

const meta: Meta<typeof ConsistLocoPicker> = {
  title: 'Consist/ConsistLocoPicker',
  component: ConsistLocoPicker,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ConsistLocoPicker>

const roster = [
  createLoco({ address: 10, name: 'BNSF 1000', meta: { roadname: 'BNSF', color: '#b91c1c' } }),
  createLoco({ address: 11, name: 'BN 3511', meta: { roadname: 'Burlington Northern', color: '#15803d' } }),
  createLoco({ address: 17, name: 'Great Northern 17', meta: { roadname: 'Great Northern', color: '#059669' } }),
  createLoco({ address: 23, name: 'BNSF 5801', meta: { roadname: 'BNSF', color: '#b91c1c' } }),
  createLoco({ address: 25, name: 'CP 9625', meta: { roadname: 'Canadian Pacific', color: '#dc2626' } }),
]

const leadLoco = createLoco({
  address: 23,
  name: 'BNSF 5801',
  consist: [createConsistLoco({ address: 17, direction: true, trim: 0 })],
})

export const Default: Story = {
  args: {
    locos: roster,
    loco: leadLoco,
  },
}

export const EmptyRoster: Story = {
  args: {
    locos: [],
    loco: createLoco({ address: 23, name: 'BNSF 5801' }),
  },
}

export const NoConsistMembers: Story = {
  args: {
    locos: roster,
    loco: createLoco({ address: 23, name: 'BNSF 5801', consist: [] }),
  },
}

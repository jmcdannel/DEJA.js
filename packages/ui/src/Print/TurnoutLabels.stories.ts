import type { Meta, StoryObj } from '@storybook/vue3'
import TurnoutLabels from './TurnoutLabels.vue'
import { createTurnout, createTurnouts } from '../../.storybook/mocks/data'

const meta: Meta<typeof TurnoutLabels> = {
  title: 'Print/TurnoutLabels',
  component: TurnoutLabels,
  tags: ['autodocs'],
  argTypes: {
    turnouts: { control: 'object' },
  },
}

export default meta
type Story = StoryObj<typeof TurnoutLabels>

export const Default: Story = {
  args: {
    turnouts: [
      createTurnout({ name: 'Yard Entry', color: 'blue', turnoutIdx: 100 }),
      createTurnout({ name: 'Main Crossover', color: 'green', turnoutIdx: 101 }),
      createTurnout({ name: 'Siding Switch', color: 'red', turnoutIdx: 102 }),
      createTurnout({ name: 'Engine House', color: 'orange', turnoutIdx: 103 }),
      createTurnout({ name: 'Industrial Lead', color: 'purple', turnoutIdx: 104 }),
    ],
  },
}

export const SingleLabel: Story = {
  args: {
    turnouts: [
      createTurnout({ name: 'Yard Entry', color: '#3366FF', turnoutIdx: 100 }),
    ],
  },
}

export const ManyLabels: Story = {
  args: {
    turnouts: createTurnouts(20),
  },
}

export const NoIndex: Story = {
  args: {
    turnouts: [
      createTurnout({ name: 'Unlabeled Switch', color: 'teal', turnoutIdx: undefined }),
      createTurnout({ name: 'Another Switch', color: 'cyan', turnoutIdx: undefined }),
    ],
  },
}

export const CustomHexColors: Story = {
  args: {
    turnouts: [
      createTurnout({ name: 'BNSF Orange', color: '#FF6600', turnoutIdx: 1 }),
      createTurnout({ name: 'UP Yellow', color: '#FFD700', turnoutIdx: 2 }),
      createTurnout({ name: 'CSX Blue', color: '#003DA5', turnoutIdx: 3 }),
      createTurnout({ name: 'NS Black', color: '#333333', turnoutIdx: 4 }),
      createTurnout({ name: 'CN Red', color: '#FF0000', turnoutIdx: 5 }),
    ],
  },
}

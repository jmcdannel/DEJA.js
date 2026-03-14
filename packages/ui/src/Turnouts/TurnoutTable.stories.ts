import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, userEvent, within } from '@storybook/test'
import TurnoutTable from './TurnoutTable.vue'
import { createTurnout, createTurnouts } from '../../.storybook/mocks/data'

const meta: Meta<typeof TurnoutTable> = {
  title: 'Turnouts/TurnoutTable',
  component: TurnoutTable,
  tags: ['autodocs'],
  argTypes: {
    turnouts: { control: 'object' },
    sortBy: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof TurnoutTable>

export const Default: Story = {
  args: {
    turnouts: createTurnouts(4),
  },
}

export const SingleTurnout: Story = {
  args: {
    turnouts: [createTurnout({ name: 'Solo Turnout', device: 'mega-01', type: 'servo' })],
  },
}

export const MixedTypes: Story = {
  args: {
    turnouts: [
      createTurnout({ name: 'Servo Switch', type: 'servo', device: 'arduino-01', color: 'blue' }),
      createTurnout({ name: 'Electric Switch', type: 'electric', device: 'arduino-02', color: 'green' }),
      createTurnout({ name: 'Manual Switch', type: 'manual', device: 'arduino-01', color: 'orange' }),
    ],
  },
}

export const EmptyTable: Story = {
  args: {
    turnouts: [],
  },
}

export const MixedStates: Story = {
  args: {
    turnouts: [
      createTurnout({ name: 'Closed Switch', state: false }),
      createTurnout({ name: 'Thrown Switch', state: true }),
      createTurnout({ name: 'Another Closed', state: false }),
    ],
  },
}

export const ToggleInteraction: Story = {
  args: {
    turnouts: [createTurnout({ name: 'Toggle Me' })],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const switchInput = canvas.getByRole('checkbox')
    await expect(switchInput).toBeInTheDocument()
    await userEvent.click(switchInput)
  },
}

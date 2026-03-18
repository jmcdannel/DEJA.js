import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, userEvent, within } from '@storybook/test'
import TurnoutSwitch from './TurnoutSwitch.vue'
import { createTurnout } from '../../.storybook/mocks/data'

const meta: Meta<typeof TurnoutSwitch> = {
  title: 'Turnouts/TurnoutSwitch',
  component: TurnoutSwitch,
  tags: ['autodocs'],
  argTypes: {
    turnout: { control: 'object' },
    isRunning: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof TurnoutSwitch>

export const Closed: Story = {
  args: {
    turnout: createTurnout({ state: false }),
    isRunning: false,
  },
}

export const Thrown: Story = {
  args: {
    turnout: createTurnout({ state: true, name: 'Yard Ladder' }),
    isRunning: false,
  },
}

export const Loading: Story = {
  args: {
    turnout: createTurnout(),
    isRunning: true,
  },
}

export const WithDevice: Story = {
  args: {
    turnout: createTurnout({ device: 'mega-01', name: 'Industrial Spur' }),
    isRunning: false,
  },
}

export const ElectricType: Story = {
  args: {
    turnout: createTurnout({ type: 'electric', name: 'Electric Switch', color: 'green' }),
    isRunning: false,
  },
}

export const ToggleInteraction: Story = {
  args: {
    turnout: createTurnout({ name: 'Interactive Switch' }),
    isRunning: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const switchInput = canvas.getByRole('checkbox')
    await expect(switchInput).toBeInTheDocument()
    await userEvent.click(switchInput)
  },
}

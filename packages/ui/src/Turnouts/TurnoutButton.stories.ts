import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, userEvent, within } from '@storybook/test'
import TurnoutButton from './TurnoutButton.vue'
import { createTurnout } from '../../.storybook/mocks/data'

const meta: Meta<typeof TurnoutButton> = {
  title: 'Turnouts/TurnoutButton',
  component: TurnoutButton,
  tags: ['autodocs'],
  argTypes: {
    turnout: { control: 'object' },
    isRunning: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof TurnoutButton>

export const Closed: Story = {
  args: {
    turnout: createTurnout({ state: false }),
    isRunning: false,
  },
}

export const Thrown: Story = {
  args: {
    turnout: createTurnout({ state: true, name: 'Main Crossover' }),
    isRunning: false,
  },
}

export const Loading: Story = {
  args: {
    turnout: createTurnout({ name: 'Busy Turnout' }),
    isRunning: true,
  },
}

export const CustomColor: Story = {
  args: {
    turnout: createTurnout({ color: 'green', name: 'Green Turnout' }),
    isRunning: false,
  },
}

export const ClickInteraction: Story = {
  args: {
    turnout: createTurnout({ name: 'Clickable Turnout' }),
    isRunning: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    await expect(button).toBeInTheDocument()
    await expect(button).not.toBeDisabled()
    await userEvent.click(button)
  },
}

export const DisabledWhileRunning: Story = {
  args: {
    turnout: createTurnout({ name: 'Disabled Button' }),
    isRunning: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    await expect(button).toBeDisabled()
  },
}

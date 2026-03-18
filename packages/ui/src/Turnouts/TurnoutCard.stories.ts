import type { Meta, StoryObj } from '@storybook/vue3'
import TurnoutCard from './TurnoutCard.vue'
import { createTurnout } from '../../.storybook/mocks/data'

// No vi.mock needed — @repo/modules is aliased to the mock via Vite in main.ts

const meta: Meta<typeof TurnoutCard> = {
  title: 'Turnouts/TurnoutCard',
  component: TurnoutCard,
  tags: ['autodocs'],
  argTypes: {
    turnout: { control: 'object' },
    isRunning: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof TurnoutCard>

const baseTurnout = createTurnout()

export const Closed: Story = {
  args: {
    turnout: createTurnout({ state: false }),
    isRunning: false,
  },
}

export const Thrown: Story = {
  args: {
    turnout: createTurnout({ state: true }),
    isRunning: false,
  },
}

export const Loading: Story = {
  args: {
    turnout: baseTurnout,
    isRunning: true,
  },
}

export const NoDescription: Story = {
  args: {
    turnout: createTurnout({ desc: undefined, tags: [] }),
    isRunning: false,
  },
}

export const ElectricSwitch: Story = {
  args: {
    turnout: createTurnout({ type: 'electric', color: 'green' }),
    isRunning: false,
  },
}

import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import TurnoutCard from './TurnoutCard.vue'

// Stub the Firebase-dependent useTurnouts composable so stories run without a backend
vi.mock('@repo/modules', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@repo/modules')>()
  return {
    ...actual,
    useTurnouts: () => ({
      setTurnout: fn(),
      getTurnouts: fn(() => ({ value: [] })),
      getTurnoutsByDevice: fn(),
      getTurnoutsByIds: fn(),
      getTurnout: fn(),
      switchTurnout: fn(),
    }),
  }
})

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

const baseTurnout = {
  id: 'turnout-1',
  name: 'Yard Entry',
  desc: 'Controls the yard entry track switch',
  type: 'servo',
  state: false,
  color: 'blue',
  device: 'arduino-01',
  tags: ['yard', 'mainline'],
  order: 1,
}

export const Closed: Story = {
  args: {
    turnout: { ...baseTurnout, state: false },
    isRunning: false,
  },
}

export const Thrown: Story = {
  args: {
    turnout: { ...baseTurnout, state: true },
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
    turnout: { ...baseTurnout, desc: undefined, tags: [] },
    isRunning: false,
  },
}

export const ElectricSwitch: Story = {
  args: {
    turnout: { ...baseTurnout, type: 'electric', color: 'green' },
    isRunning: false,
  },
}

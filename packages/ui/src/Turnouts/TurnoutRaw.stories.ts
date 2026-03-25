import type { Meta, StoryObj } from '@storybook/vue3'
import TurnoutRaw from './TurnoutRaw.vue'
import { createTurnout } from '../../.storybook/mocks/data'

const meta: Meta<typeof TurnoutRaw> = {
  title: 'Turnouts/TurnoutRaw',
  component: TurnoutRaw,
  tags: ['autodocs'],
  argTypes: {
    turnout: { control: 'object' },
    state: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof TurnoutRaw>

export const Default: Story = {
  args: {
    turnout: createTurnout(),
  },
}

export const Thrown: Story = {
  args: {
    turnout: createTurnout({ state: true, name: 'Thrown Switch' }),
  },
}

export const WithStateOverride: Story = {
  args: {
    turnout: createTurnout({ state: false, name: 'State Override' }),
    state: true,
  },
}

export const MinimalData: Story = {
  args: {
    turnout: createTurnout({
      desc: undefined,
      tags: [],
      color: undefined,
      device: 'bare-device',
      name: 'Minimal Turnout',
    }),
  },
}

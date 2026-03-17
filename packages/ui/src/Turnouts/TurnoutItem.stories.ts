import type { Meta, StoryObj } from '@storybook/vue3'
import TurnoutItem from './TurnoutItem.vue'
import { createTurnout } from '../../.storybook/mocks/data'

const meta: Meta<typeof TurnoutItem> = {
  title: 'Turnouts/TurnoutItem',
  component: TurnoutItem,
  tags: ['autodocs'],
  argTypes: {
    turnout: { control: 'object' },
    viewAs: {
      control: 'select',
      options: ['switch', 'card', 'button', 'raw'],
    },
  },
}

export default meta
type Story = StoryObj<typeof TurnoutItem>

export const DefaultButton: Story = {
  args: {
    turnout: createTurnout(),
  },
}

export const ViewAsSwitch: Story = {
  args: {
    turnout: createTurnout({ name: 'Main Yard Switch' }),
    viewAs: 'switch',
  },
}

export const ViewAsCard: Story = {
  args: {
    turnout: createTurnout({ name: 'Siding Entry', color: 'green' }),
    viewAs: 'card',
  },
}

export const ViewAsButton: Story = {
  args: {
    turnout: createTurnout({ name: 'Crossover' }),
    viewAs: 'button',
  },
}

export const ViewAsRaw: Story = {
  args: {
    turnout: createTurnout({ name: 'Debug Turnout' }),
    viewAs: 'raw',
  },
}

export const ThrownState: Story = {
  args: {
    turnout: createTurnout({ state: true, name: 'Thrown Turnout' }),
    viewAs: 'button',
  },
}

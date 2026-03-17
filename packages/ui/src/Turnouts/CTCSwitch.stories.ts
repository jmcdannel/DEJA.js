import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, userEvent, within } from '@storybook/test'
import CTCSwitch from './CTCSwitch.vue'
import { createTurnout } from '../../.storybook/mocks/data'

const meta: Meta<typeof CTCSwitch> = {
  title: 'Turnouts/CTCSwitch',
  component: CTCSwitch,
  tags: ['autodocs'],
  argTypes: {
    turnout: { control: 'object' },
    turnoutId: { control: 'text' },
    state: { control: 'boolean' },
  },
  decorators: [
    () => ({
      template: '<div style="width: 200px; height: 240px;"><story /></div>',
    }),
  ],
}

export default meta
type Story = StoryObj<typeof CTCSwitch>

export const Normal: Story = {
  args: {
    turnout: createTurnout({ state: false, color: 'blue' }),
    state: false,
  },
}

export const Reversed: Story = {
  args: {
    turnout: createTurnout({ state: true, name: 'Yard Ladder', color: 'green' }),
    state: true,
  },
}

export const CustomColor: Story = {
  args: {
    turnout: createTurnout({ color: 'red', name: 'Red CTC Switch' }),
    state: false,
  },
}

export const WithTurnoutId: Story = {
  args: {
    turnout: createTurnout({ name: 'Override ID' }),
    turnoutId: 'custom-turnout-id',
    state: false,
  },
}

export const ClickToToggle: Story = {
  args: {
    turnout: createTurnout({ name: 'Interactive CTC' }),
    state: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const svg = canvasElement.querySelector('svg')
    await expect(svg).toBeInTheDocument()
    if (svg) {
      await userEvent.click(svg)
    }
  },
}

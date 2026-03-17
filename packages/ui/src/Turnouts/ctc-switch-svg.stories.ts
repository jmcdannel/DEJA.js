import type { Meta, StoryObj } from '@storybook/vue3'
import CTCSwitchSVG from './ctc-switch-svg.vue'
import { createTurnout } from '../../.storybook/mocks/data'

// ctc-switch-svg is a presentational SVG component that renders the CTC switch
// graphic. It accepts state and turnout props but does not handle click events
// (that is the responsibility of the parent CTCSwitch component).

const meta: Meta<typeof CTCSwitchSVG> = {
  title: 'Turnouts/CTCSwitchSVG',
  component: CTCSwitchSVG,
  tags: ['autodocs'],
  argTypes: {
    turnout: { control: 'object' },
    turnoutId: { control: 'text' },
    state: { control: 'boolean' },
    viewAs: { control: 'text' },
  },
  decorators: [
    () => ({
      template: '<div style="width: 200px; height: 240px;"><story /></div>',
    }),
  ],
}

export default meta
type Story = StoryObj<typeof CTCSwitchSVG>

export const Normal: Story = {
  args: {
    turnout: createTurnout({ name: 'Yard Entry', color: 'blue' }),
    state: false,
  },
}

export const Reversed: Story = {
  args: {
    turnout: createTurnout({ name: 'Siding Switch', color: 'green' }),
    state: true,
  },
}

export const NoColor: Story = {
  args: {
    turnout: createTurnout({ name: 'Default Color', color: undefined }),
    state: false,
  },
}

export const WithTurnoutId: Story = {
  args: {
    turnout: createTurnout({ name: 'Custom ID' }),
    turnoutId: 'my-custom-id',
    state: true,
  },
}

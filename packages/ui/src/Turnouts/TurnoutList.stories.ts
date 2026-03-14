import type { Meta, StoryObj } from '@storybook/vue3'
import TurnoutList from './TurnoutList.vue'

// TurnoutList is a self-contained component that calls useTurnouts() and useLayout()
// internally — it does not accept props. The mocked composables return empty refs,
// so the list renders in its "empty" state by default.

const meta: Meta<typeof TurnoutList> = {
  title: 'Turnouts/TurnoutList',
  component: TurnoutList,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TurnoutList>

export const Default: Story = {}

export const Empty: Story = {
  name: 'Empty State',
}

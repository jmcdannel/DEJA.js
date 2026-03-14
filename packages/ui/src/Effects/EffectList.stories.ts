import type { Meta, StoryObj } from '@storybook/vue3'
import EffectList from './EffectList.vue'

// EffectList is a self-contained component that calls useEfx() and useLayout()
// internally — it does not accept props. The mocked composables return empty refs,
// so the list renders in its "empty" state by default.

const meta: Meta<typeof EffectList> = {
  title: 'Effects/EffectList',
  component: EffectList,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof EffectList>

export const Default: Story = {}

export const Empty: Story = {
  name: 'Empty State',
}

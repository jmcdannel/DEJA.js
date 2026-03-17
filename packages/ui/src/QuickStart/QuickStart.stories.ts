import type { Meta, StoryObj } from '@storybook/vue3'
import QuickStart from './QuickStart.vue'

const meta: Meta<typeof QuickStart> = {
  title: 'UI/QuickStart',
  component: QuickStart,
  tags: ['autodocs'],
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#0f172a' }],
    },
  },
  argTypes: {
    completed: {
      control: { type: 'check', options: [1, 2] },
      description: 'Step numbers (1-based) that are already done',
    },
    uid: { control: 'text', description: 'Firebase UID for personalized install URL' },
    layoutId: { control: 'text', description: 'Layout ID for personalized install URL' },
  },
}

export default meta
type Story = StoryObj<typeof QuickStart>

/** Both steps pending — homepage / docs page view. */
export const Default: Story = {
  args: {
    completed: [],
  },
}

/** Step 1 complete — user is logged in (Cloud / Throttle settings). */
export const StepOneComplete: Story = {
  args: {
    completed: [1],
    uid: 'demo-uid-abc123',
    layoutId: 'my-layout',
  },
}

/** Both steps complete — everything set up. */
export const BothComplete: Story = {
  args: {
    completed: [1, 2],
    uid: 'demo-uid-abc123',
    layoutId: 'my-layout',
  },
}

/** No uid/layoutId — generic install URL even when step 1 is done. */
export const StepOneCompleteNoUid: Story = {
  args: {
    completed: [1],
  },
}

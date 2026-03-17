import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import { ref } from 'vue'
import EditConsist from './EditConsist.vue'
import { createLoco, createConsistLoco, createLocos } from '../../.storybook/mocks/data'
import { useLocos } from '@repo/modules'

// No vi.mock needed — @repo/modules is aliased to the mock via Vite in main.ts

const meta: Meta<typeof EditConsist> = {
  title: 'Consist/EditConsist',
  component: EditConsist,
  tags: ['autodocs'],
  argTypes: {
    loco: { control: 'object' },
    color: { control: 'color' },
  },
  args: {
    onClose: fn(),
  },
  decorators: [
    () => {
      const { getLocos } = useLocos()
      ;(getLocos as ReturnType<typeof import('@storybook/test').fn>).mockReturnValue(ref(createLocos(6)))
      return { template: '<story />' }
    },
  ],
}

export default meta
type Story = StoryObj<typeof EditConsist>

export const Default: Story = {
  args: {
    loco: createLoco({
      consist: [
        createConsistLoco({ address: 1234, direction: true, trim: 0 }),
        createConsistLoco({ address: 5678, direction: false, trim: 2 }),
      ],
    }),
    color: 'purple',
  },
}

export const EmptyConsist: Story = {
  args: {
    loco: createLoco({ consist: [] }),
    color: 'purple',
  },
}

export const SingleConsistLoco: Story = {
  args: {
    loco: createLoco({
      consist: [createConsistLoco({ address: 4567, direction: true, trim: 0 })],
    }),
    color: 'blue',
  },
}

export const WithTrim: Story = {
  args: {
    loco: createLoco({
      consist: [
        createConsistLoco({ address: 100, direction: true, trim: 5 }),
        createConsistLoco({ address: 200, direction: false, trim: -3 }),
      ],
    }),
    color: 'pink',
  },
}

import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import FunctionList from './FunctionList.vue'
import { createLoco, createLocoFunction, createLocos, createConsistLoco } from '../../.storybook/mocks/data'
import { useLocos } from '@repo/modules'

// No vi.mock needed — @repo/modules is aliased to the mock via Vite in main.ts

const meta: Meta<typeof FunctionList> = {
  title: 'Functions/FunctionList',
  component: FunctionList,
  tags: ['autodocs'],
  argTypes: {
    loco: { control: 'object' },
  },
  decorators: [
    () => {
      const { getLocos } = useLocos()
      ;(getLocos as ReturnType<typeof import('@storybook/test').fn>).mockReturnValue(ref(createLocos(5)))
      return { template: '<story />' }
    },
  ],
}

export default meta
type Story = StoryObj<typeof FunctionList>

export const Default: Story = {
  args: {
    loco: createLoco({
      functions: [
        createLocoFunction({ id: 0, label: 'Headlight', icon: 'mdi-lightbulb', isFavorite: true }),
        createLocoFunction({ id: 1, label: 'Bell', icon: 'mdi-bell', isFavorite: true }),
        createLocoFunction({ id: 2, label: 'Horn', icon: 'mdi-bullhorn', isFavorite: true }),
      ],
    }),
  },
}

export const NullLoco: Story = {
  args: {
    loco: null,
  },
}

export const WithConsist: Story = {
  args: {
    loco: createLoco({
      functions: [
        createLocoFunction({ id: 0, label: 'Headlight', icon: 'mdi-lightbulb', isFavorite: true }),
        createLocoFunction({ id: 1, label: 'Bell', icon: 'mdi-bell', isFavorite: true }),
      ],
      consist: [
        createConsistLoco({ address: 1234, direction: true, trim: 0 }),
        createConsistLoco({ address: 5678, direction: false, trim: 2 }),
      ],
    }),
  },
}

export const ManyFunctions: Story = {
  args: {
    loco: createLoco({
      functions: Array.from({ length: 12 }, (_, i) =>
        createLocoFunction({ id: i, label: `F${i}`, icon: 'mdi-train', isFavorite: true }),
      ),
    }),
  },
}

export const NoFunctions: Story = {
  args: {
    loco: createLoco({ functions: [] }),
  },
}

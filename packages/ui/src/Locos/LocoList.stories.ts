import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import LocoList from './LocoList.vue'
import { createLocos, createLoco } from '../../.storybook/mocks/data'
import { useLocos } from '@repo/modules'

// No vi.mock needed — @repo/modules is aliased to the mock via Vite in main.ts

const meta: Meta<typeof LocoList> = {
  title: 'Locos/LocoList',
  component: LocoList,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof LocoList>

export const Default: Story = {
  decorators: [
    () => {
      const { getLocos } = useLocos()
      ;(getLocos as ReturnType<typeof import('@storybook/test').fn>).mockReturnValue(ref(createLocos(5)))
      return { template: '<story />' }
    },
  ],
}

export const Empty: Story = {
  decorators: [
    () => {
      const { getLocos } = useLocos()
      ;(getLocos as ReturnType<typeof import('@storybook/test').fn>).mockReturnValue(ref([]))
      return { template: '<story />' }
    },
  ],
}

export const SingleLoco: Story = {
  decorators: [
    () => {
      const { getLocos } = useLocos()
      ;(getLocos as ReturnType<typeof import('@storybook/test').fn>).mockReturnValue(ref([createLoco()]))
      return { template: '<story />' }
    },
  ],
}

export const ManyLocos: Story = {
  decorators: [
    () => {
      const { getLocos } = useLocos()
      ;(getLocos as ReturnType<typeof import('@storybook/test').fn>).mockReturnValue(ref(createLocos(12)))
      return { template: '<story />' }
    },
  ],
}

export const WithSoundLocos: Story = {
  decorators: [
    () => {
      const { getLocos } = useLocos()
      ;(getLocos as ReturnType<typeof import('@storybook/test').fn>).mockReturnValue(
        ref([
          createLoco({ name: 'BNSF GP38-2', hasSound: true }),
          createLoco({ name: 'UP SD70ACe', hasSound: true }),
          createLoco({ name: 'CSX GP40-2', hasSound: false }),
          createLoco({ name: 'NS SD40-2', hasSound: false }),
        ]),
      )
      return { template: '<story />' }
    },
  ],
}

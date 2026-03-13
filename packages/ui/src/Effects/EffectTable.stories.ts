import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, userEvent, within } from '@storybook/test'
import EffectTable from './EffectTable.vue'
import { createEffect, createEffects, createSoundEffect } from '../../.storybook/mocks/data'

const meta: Meta<typeof EffectTable> = {
  title: 'Effects/EffectTable',
  component: EffectTable,
  tags: ['autodocs'],
  argTypes: {
    effects: { control: 'object' },
    sortBy: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof EffectTable>

export const Default: Story = {
  args: {
    effects: createEffects(4),
  },
}

export const SingleEffect: Story = {
  args: {
    effects: [createEffect({ name: 'Solo Effect', device: 'mega-01', type: 'light' })],
  },
}

export const MixedTypes: Story = {
  args: {
    effects: [
      createEffect({ name: 'Yard Lights', type: 'light', device: 'arduino-01', color: 'yellow' }),
      createSoundEffect({ name: 'Station Bell', device: 'deja-server' }),
      createEffect({ name: 'Crossing Gate', type: 'servo', device: 'arduino-02', color: 'red' }),
    ],
  },
}

export const EmptyTable: Story = {
  args: {
    effects: [],
  },
}

export const WithGuestAccess: Story = {
  args: {
    effects: [
      createEffect({ name: 'Guest Light', allowGuest: true }),
      createEffect({ name: 'Admin Only', allowGuest: false }),
      createEffect({ name: 'Public Sound', allowGuest: true, type: 'sound' }),
    ],
  },
}

export const ToggleInteraction: Story = {
  args: {
    effects: [createEffect({ name: 'Toggle Me' })],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const switchInput = canvas.getByRole('checkbox')
    await expect(switchInput).toBeInTheDocument()
    await userEvent.click(switchInput)
  },
}

import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, userEvent, within } from '@storybook/test'
import EffectCard from './EffectCard.vue'
import { createEffect, createSoundEffect } from '../../.storybook/mocks/data'

const meta: Meta<typeof EffectCard> = {
  title: 'Effects/EffectCard',
  component: EffectCard,
  tags: ['autodocs'],
  argTypes: {
    effect: { control: 'object' },
    isRunning: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof EffectCard>

export const Off: Story = {
  args: {
    effect: createEffect({ state: false }),
    isRunning: false,
  },
}

export const On: Story = {
  args: {
    effect: createEffect({ state: true, name: 'Depot Lights' }),
    isRunning: false,
  },
}

export const Loading: Story = {
  args: {
    effect: createEffect({ name: 'Busy Effect' }),
    isRunning: true,
  },
}

export const WithGuestAccess: Story = {
  args: {
    effect: createEffect({ allowGuest: true, name: 'Guest-Friendly Light', tags: ['guest', 'lighting'] }),
    isRunning: false,
  },
}

export const SoundEffect: Story = {
  args: {
    effect: createSoundEffect({ name: 'Diesel Horn' }),
    isRunning: false,
  },
}

export const ToggleInteraction: Story = {
  args: {
    effect: createEffect({ name: 'Toggle Me' }),
    isRunning: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const switchInput = canvas.getByRole('checkbox')
    await expect(switchInput).toBeInTheDocument()
    await userEvent.click(switchInput)
  },
}

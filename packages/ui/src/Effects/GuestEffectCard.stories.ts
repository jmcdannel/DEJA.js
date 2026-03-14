import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, userEvent, within } from '@storybook/test'
import GuestEffectCard from './GuestEffectCard.vue'
import { createEffect, createSoundEffect } from '../../.storybook/mocks/data'

const meta: Meta<typeof GuestEffectCard> = {
  title: 'Effects/GuestEffectCard',
  component: GuestEffectCard,
  tags: ['autodocs'],
  argTypes: {
    effect: { control: 'object' },
    effectId: { control: 'text' },
    state: { control: 'boolean' },
    showDescription: { control: 'boolean' },
    showTags: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof GuestEffectCard>

export const Inactive: Story = {
  args: {
    effect: createEffect({ state: false, name: 'Yard Lights', tags: ['yard', 'lighting'] }),
  },
}

export const Active: Story = {
  args: {
    effect: createEffect({ state: true, name: 'Station Lamp', tags: ['station'] }),
  },
}

export const SoundEffect: Story = {
  args: {
    effect: createSoundEffect({ state: false, name: 'Train Horn' }),
  },
}

export const HiddenDescription: Story = {
  args: {
    effect: createEffect({ name: 'Compact Card', tags: ['lighting'] }),
    showDescription: false,
  },
}

export const HiddenTags: Story = {
  args: {
    effect: createEffect({ name: 'No Tags Visible', tags: ['hidden', 'test'] }),
    showTags: false,
  },
}

export const WithCustomEffectId: Story = {
  args: {
    effect: createEffect({ name: 'Custom ID Effect' }),
    effectId: 'custom-effect-override',
  },
}

export const ActivateInteraction: Story = {
  args: {
    effect: createEffect({ state: false, name: 'Click to Activate' }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const activateButton = canvas.getByRole('button', { name: /activate/i })
    await expect(activateButton).toBeInTheDocument()
    await userEvent.click(activateButton)
  },
}

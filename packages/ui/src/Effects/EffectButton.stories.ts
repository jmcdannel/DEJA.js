import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, userEvent, within } from '@storybook/test'
import EffectButton from './EffectButton.vue'
import { createEffect, createSoundEffect } from '../../.storybook/mocks/data'

const meta: Meta<typeof EffectButton> = {
  title: 'Effects/EffectButton',
  component: EffectButton,
  tags: ['autodocs'],
  argTypes: {
    effect: { control: 'object' },
    isRunning: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof EffectButton>

export const Off: Story = {
  args: {
    effect: createEffect({ state: false }),
    isRunning: false,
  },
}

export const On: Story = {
  args: {
    effect: createEffect({ state: true, name: 'Station Lamp' }),
    isRunning: false,
  },
}

export const Loading: Story = {
  args: {
    effect: createEffect({ name: 'Busy Effect' }),
    isRunning: true,
  },
}

export const CustomColor: Story = {
  args: {
    effect: createEffect({ color: 'orange', name: 'Warning Beacon' }),
    isRunning: false,
  },
}

export const ClickInteraction: Story = {
  args: {
    effect: createEffect({ name: 'Clickable Effect' }),
    isRunning: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    await expect(button).toBeInTheDocument()
    await expect(button).not.toBeDisabled()
    await userEvent.click(button)
  },
}

export const DisabledWhileRunning: Story = {
  args: {
    effect: createEffect({ name: 'Disabled Button' }),
    isRunning: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    await expect(button).toBeDisabled()
  },
}

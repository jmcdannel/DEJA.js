import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, userEvent, within } from '@storybook/test'
import EffectSwitch from './EffectSwitch.vue'
import { createEffect } from '../../.storybook/mocks/data'

const meta: Meta<typeof EffectSwitch> = {
  title: 'Effects/EffectSwitch',
  component: EffectSwitch,
  tags: ['autodocs'],
  argTypes: {
    effect: { control: 'object' },
    isRunning: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof EffectSwitch>

export const Off: Story = {
  args: {
    effect: createEffect({ state: false }),
    isRunning: false,
  },
}

export const On: Story = {
  args: {
    effect: createEffect({ state: true, name: 'Yard Lights' }),
    isRunning: false,
  },
}

export const Loading: Story = {
  args: {
    effect: createEffect(),
    isRunning: true,
  },
}

export const WithDevice: Story = {
  args: {
    effect: createEffect({ device: 'mega-01', name: 'Platform Lights' }),
    isRunning: false,
  },
}

export const CustomColor: Story = {
  args: {
    effect: createEffect({ color: 'green', name: 'Green Signal Light' }),
    isRunning: false,
  },
}

export const ToggleInteraction: Story = {
  args: {
    effect: createEffect({ name: 'Interactive Switch' }),
    isRunning: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const switchInput = canvas.getByRole('checkbox')
    await expect(switchInput).toBeInTheDocument()
    await userEvent.click(switchInput)
  },
}

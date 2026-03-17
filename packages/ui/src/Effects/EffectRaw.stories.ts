import type { Meta, StoryObj } from '@storybook/vue3'
import EffectRaw from './EffectRaw.vue'
import { createEffect, createSoundEffect, createMacroEffect } from '../../.storybook/mocks/data'

const meta: Meta<typeof EffectRaw> = {
  title: 'Effects/EffectRaw',
  component: EffectRaw,
  tags: ['autodocs'],
  argTypes: {
    effect: { control: 'object' },
    state: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof EffectRaw>

export const Default: Story = {
  args: {
    effect: createEffect(),
  },
}

export const ActiveState: Story = {
  args: {
    effect: createEffect({ state: true, name: 'Active Light' }),
  },
}

export const WithStateOverride: Story = {
  args: {
    effect: createEffect({ state: false, name: 'State Override' }),
    state: true,
  },
}

export const SoundEffect: Story = {
  args: {
    effect: createSoundEffect(),
  },
}

export const MacroEffect: Story = {
  args: {
    effect: createMacroEffect(),
  },
}

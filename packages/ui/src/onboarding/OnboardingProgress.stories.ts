// packages/ui/src/onboarding/OnboardingProgress.stories.ts

import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import OnboardingProgress from './OnboardingProgress.vue'
import type { OnboardingStep } from './trackPath'

function makeSteps(activeIndex: number): OnboardingStep[] {
  const labels = ['Sign Up', 'Select Plan', 'Create Layout', 'Install', 'Drive Trains']
  return labels.map((label, i) => ({
    label,
    status: i < activeIndex ? 'completed' : i === activeIndex ? 'active' : 'pending',
  }))
}

const meta: Meta<typeof OnboardingProgress> = {
  title: 'Onboarding/OnboardingProgress',
  component: OnboardingProgress,
  tags: ['autodocs'],
  argTypes: {
    currentStep: {
      control: { type: 'range', min: 0, max: 4, step: 1 },
    },
    statusMessage: {
      control: 'text',
    },
  },
  decorators: [
    () => ({
      template:
        '<div class="p-6" style="min-height: 320px; background: #0f1729;"><story /></div>',
    }),
  ],
}

export default meta
type Story = StoryObj<typeof OnboardingProgress>

export const Default: Story = {
  args: {
    currentStep: 0,
    steps: makeSteps(0),
    statusMessage: 'Creating your account...',
  },
}

export const MidProgress: Story = {
  args: {
    currentStep: 3,
    steps: makeSteps(3),
    statusMessage: 'Clearing the signal...',
  },
}

export const Complete: Story = {
  args: {
    currentStep: 4,
    steps: [
      { label: 'Sign Up', status: 'completed' },
      { label: 'Select Plan', status: 'completed' },
      { label: 'Create Layout', status: 'completed' },
      { label: 'Install', status: 'completed' },
      { label: 'Drive Trains', status: 'completed' },
    ],
    statusMessage: 'All aboard! 🚂',
  },
}

export const Interactive: Story = {
  render: () => ({
    components: { OnboardingProgress },
    setup() {
      const currentStep = ref(0)
      const statusMessages = [
        'Creating your account...',
        'Choosing your plan...',
        'Building your layout...',
        'Clearing the signal...',
        'All aboard! 🚂',
      ]
      const steps = ref(makeSteps(0))

      function goTo(step: number) {
        currentStep.value = step
        steps.value = makeSteps(step)
      }

      return { currentStep, steps, statusMessages, goTo }
    },
    template: `
      <div>
        <OnboardingProgress
          :current-step="currentStep"
          :steps="steps"
          :status-message="statusMessages[currentStep]"
        />
        <div class="flex gap-2 mt-4 justify-center">
          <button
            v-for="i in 5"
            :key="i"
            @click="goTo(i - 1)"
            class="px-3 py-1 rounded text-sm"
            :class="currentStep === i - 1
              ? 'bg-cyan-500 text-slate-900'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'"
          >
            Station {{ i }}
          </button>
        </div>
      </div>
    `,
  }),
}

export const WithStatusMessage: Story = {
  args: {
    currentStep: 2,
    steps: makeSteps(2),
    statusMessage: 'Building your layout...',
  },
}

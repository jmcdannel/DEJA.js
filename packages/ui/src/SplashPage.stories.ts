import type { Meta, StoryObj } from '@storybook/vue3'
import SplashPage from './SplashPage.vue'

const meta: Meta<typeof SplashPage> = {
  title: 'Chrome/SplashPage',
  component: SplashPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof SplashPage>

export const Default: Story = {}

export const CustomApps: Story = {
  args: {
    apps: [
      { label: 'Cloud', icon: 'mdi-cloud', color: 'text-cyan-400' },
      { label: 'Throttle', icon: 'mdi-gamepad-variant', color: 'text-fuchsia-500' },
      { label: 'Monitor', icon: 'mdi-monitor', color: 'text-sky-400' },
    ],
  },
}

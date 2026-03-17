import type { Meta, StoryObj } from '@storybook/vue3'
import SplashPage from './SplashPage.vue'

const meta: Meta<typeof SplashPage> = {
  title: 'Chrome/SplashPage',
  component: SplashPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    background: {
      control: 'select',
      options: [
        'starfield', 'nebula', 'milkyway', 'neon', 'aurora',
        'railroad-night', 'dark-tracks', 'steam-locomotive', 'train-station',
      ],
    },
  },
}

export default meta
type Story = StoryObj<typeof SplashPage>

export const Starfield: Story = {
  args: { background: 'starfield' },
}

export const Nebula: Story = {
  args: { background: 'nebula' },
}

export const MilkyWay: Story = {
  args: { background: 'milkyway' },
}

export const NeonLines: Story = {
  args: { background: 'neon' },
}

export const Aurora: Story = {
  args: { background: 'aurora' },
}

export const RailroadAtNight: Story = {
  args: { background: 'railroad-night' },
}

export const DarkTracks: Story = {
  args: { background: 'dark-tracks' },
}

export const SteamLocomotive: Story = {
  args: { background: 'steam-locomotive' },
}

export const TrainStation: Story = {
  args: { background: 'train-station' },
}

import type { Meta, StoryObj } from '@storybook/vue3'
import BackgroundThumbnail from './BackgroundThumbnail.vue'

const meta: Meta<typeof BackgroundThumbnail> = {
  title: 'Backgrounds/BackgroundThumbnail',
  component: BackgroundThumbnail,
  tags: ['autodocs'],
  argTypes: {
    backgroundId: { control: 'text' },
    selected: { control: 'boolean' },
  },
  decorators: [
    () => ({
      template: '<div class="p-4 flex items-center justify-center" style="min-height: 120px;"><story /></div>',
    }),
  ],
}

export default meta
type Story = StoryObj<typeof BackgroundThumbnail>

export const NoneOption: Story = {
  args: {
    backgroundId: 'none',
    selected: false,
  },
}

export const NoneSelected: Story = {
  args: {
    backgroundId: 'none',
    selected: true,
  },
}

export const ImageBackground: Story = {
  args: {
    backgroundId: 'northernlights',
    selected: false,
  },
}

export const ImageBackgroundSelected: Story = {
  args: {
    backgroundId: 'tracks',
    selected: true,
  },
}

export const EffectBackground: Story = {
  args: {
    backgroundId: 'decor',
    selected: false,
  },
}

export const AllThumbnails: Story = {
  render: () => ({
    components: { BackgroundThumbnail },
    template: `
      <div class="flex flex-wrap gap-3 p-4">
        <BackgroundThumbnail background-id="none" :selected="false" />
        <BackgroundThumbnail background-id="northernlights" :selected="false" />
        <BackgroundThumbnail background-id="tracks" :selected="true" />
        <BackgroundThumbnail background-id="forest" :selected="false" />
        <BackgroundThumbnail background-id="waves" :selected="false" />
        <BackgroundThumbnail background-id="viaduct" :selected="false" />
        <BackgroundThumbnail background-id="decor" :selected="false" />
        <BackgroundThumbnail background-id="stars" :selected="false" />
      </div>
    `,
  }),
}

import type { Meta, StoryObj } from '@storybook/vue3'
import LocoFront from './LocoFront.vue'
import LocoFrontGallery from './LocoFrontGallery.vue'
import { LOCO_FRONT_DESIGNS } from './locoFrontData'

const roadnameOptions = Object.keys(LOCO_FRONT_DESIGNS)

/* ────── Single locomotive story ────── */

const meta: Meta<typeof LocoFront> = {
  title: 'Locos/LocoFront',
  component: LocoFront,
  tags: ['autodocs'],
  argTypes: {
    roadname: {
      control: 'select',
      options: roadnameOptions,
    },
    roadNumber: { control: 'text' },
    size: { control: { type: 'range', min: 100, max: 600, step: 20 } },
  },
}

export default meta
type Story = StoryObj<typeof LocoFront>

export const BNSF: Story = {
  args: { roadname: 'bnsf', roadNumber: '7132', size: 280 },
}

export const UnionPacific: Story = {
  args: { roadname: 'up', roadNumber: '6899', size: 280 },
}

export const CSX: Story = {
  args: { roadname: 'csx', roadNumber: '3194', size: 280 },
}

export const NorfolkSouthern: Story = {
  args: { roadname: 'ns', roadNumber: '9552', size: 280 },
}

export const CanadianNational: Story = {
  args: { roadname: 'cn', roadNumber: '2929', size: 280 },
}

export const Amtrak: Story = {
  args: { roadname: 'amtrak', roadNumber: '42', size: 280 },
}

export const MontanaRailLink: Story = {
  args: { roadname: 'mrl', roadNumber: '4301', size: 280 },
}

export const GreatNorthern: Story = {
  args: { roadname: 'gn', roadNumber: '400', size: 280 },
}

export const BurlingtonNorthern: Story = {
  args: { roadname: 'bn', roadNumber: '6430', size: 280 },
}

export const SantaFe: Story = {
  args: { roadname: 'santefe', roadNumber: '101', size: 280 },
}

export const Small: Story = {
  args: { roadname: 'bnsf', roadNumber: '7132', size: 120 },
}

export const Large: Story = {
  args: { roadname: 'up', roadNumber: '6899', size: 500 },
}

/* ────── Gallery story ────── */

export const Gallery: StoryObj<typeof LocoFrontGallery> = {
  render: () => ({
    components: { LocoFrontGallery },
    template: '<div style="background: #111; min-height: 100vh; padding: 2rem;"><LocoFrontGallery :size="220" /></div>',
  }),
  parameters: {
    layout: 'fullscreen',
  },
}

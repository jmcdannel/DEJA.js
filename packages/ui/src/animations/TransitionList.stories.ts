import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import TransitionList from './TransitionList.vue'

const meta: Meta<typeof TransitionList> = {
  title: 'Animations/TransitionList',
  component: TransitionList,
  tags: ['autodocs'],
  argTypes: {
    tag: { control: 'text' },
    stagger: { control: { type: 'range', min: 0, max: 200, step: 10 } },
  },
  decorators: [
    () => ({
      template: '<div class="p-4" style="min-height: 400px;"><story /></div>',
    }),
  ],
}

export default meta
type Story = StoryObj<typeof TransitionList>

export const Default: Story = {
  render: (args) => ({
    components: { TransitionList },
    setup() {
      const items = ref(['Turnout 1', 'Turnout 2', 'Turnout 3', 'Turnout 4', 'Turnout 5'])
      let counter = 5
      const addItem = () => {
        counter++
        items.value.push(`Turnout ${counter}`)
      }
      const removeItem = () => {
        items.value.pop()
      }
      return { items, addItem, removeItem, args }
    },
    template: `
      <div>
        <div class="flex gap-2 mb-4">
          <v-btn @click="addItem" color="success" size="small">Add Item</v-btn>
          <v-btn @click="removeItem" color="error" size="small">Remove Item</v-btn>
        </div>
        <TransitionList v-bind="args">
          <div
            v-for="(item, i) in items"
            :key="item"
            :data-index="i"
            class="bg-slate-800 p-3 rounded mb-2 text-white"
          >
            {{ item }}
          </div>
        </TransitionList>
      </div>
    `,
  }),
  args: {
    tag: 'div',
    stagger: 50,
  },
}

export const FastStagger: Story = {
  render: (args) => ({
    components: { TransitionList },
    setup() {
      const show = ref(true)
      const items = ['Item A', 'Item B', 'Item C', 'Item D', 'Item E']
      return { show, items, args }
    },
    template: `
      <div>
        <v-btn @click="show = !show" class="mb-4" color="primary">
          {{ show ? 'Remove All' : 'Show All' }}
        </v-btn>
        <TransitionList v-bind="args">
          <div
            v-for="(item, i) in (show ? items : [])"
            :key="item"
            :data-index="i"
            class="bg-indigo-900 p-3 rounded mb-2 text-white"
          >
            {{ item }}
          </div>
        </TransitionList>
      </div>
    `,
  }),
  args: {
    tag: 'div',
    stagger: 20,
  },
}

export const SlowStagger: Story = {
  render: (args) => ({
    components: { TransitionList },
    setup() {
      const show = ref(true)
      const items = ['Device 1', 'Device 2', 'Device 3', 'Device 4']
      return { show, items, args }
    },
    template: `
      <div>
        <v-btn @click="show = !show" class="mb-4" color="secondary">
          {{ show ? 'Hide' : 'Reveal' }}
        </v-btn>
        <TransitionList v-bind="args">
          <v-card
            v-for="(item, i) in (show ? items : [])"
            :key="item"
            :data-index="i"
            class="mb-2 pa-3"
            color="surface"
          >
            {{ item }}
          </v-card>
        </TransitionList>
      </div>
    `,
  }),
  args: {
    tag: 'div',
    stagger: 150,
  },
}

export const WithChips: Story = {
  render: (args) => ({
    components: { TransitionList },
    setup() {
      const tags = ref(['Mainline', 'Yard', 'Siding', 'Industrial', 'Mountain'])
      const removeTag = (tag: string) => {
        tags.value = tags.value.filter(t => t !== tag)
      }
      const resetTags = () => {
        tags.value = ['Mainline', 'Yard', 'Siding', 'Industrial', 'Mountain']
      }
      return { tags, removeTag, resetTags, args }
    },
    template: `
      <div>
        <v-btn @click="resetTags" class="mb-4" color="primary" size="small">Reset</v-btn>
        <TransitionList v-bind="args" class="flex flex-wrap gap-2">
          <v-chip
            v-for="(tag, i) in tags"
            :key="tag"
            :data-index="i"
            closable
            @click:close="removeTag(tag)"
            color="primary"
          >
            {{ tag }}
          </v-chip>
        </TransitionList>
      </div>
    `,
  }),
  args: {
    tag: 'div',
    stagger: 50,
  },
}

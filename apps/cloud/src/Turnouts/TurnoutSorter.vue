<script setup lang="ts">
import { ref } from 'vue'
import draggable from 'vuedraggable'
import { useTurnouts, type Turnout } from '@repo/modules'

const emit = defineEmits(['close'])

const { getTurnouts, setTurnout } = useTurnouts()
const list = getTurnouts()
const dragging = ref(false)

function handleSave() {
  console.log('Saving new order:', list.value.map(async (item: any, order: number) => {
    const turnout = item as Turnout
    console.log('Setting turnout', turnout.name, 'to order', order)
    await setTurnout(turnout.id, { ...turnout, order })
  }))
  emit('close')
} 

</script>
<template>
  <v-card title="Sort Turnouts" color="primary" variant="flat">
    <v-card-text>
      <p class="text-white">Drag and drop to sort turnouts.</p>
      <draggable
        :list="list"
        item-key="name"
        class="list-group grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2"
        ghost-class="ghost"
        @start="dragging = true"
        @end="dragging = false"
      >
        <template #item="{ element }">
          <v-btn class="list-group-item m-1">
            {{ element.name }}
          </v-btn>
        </template>
      </draggable>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn @click="$emit('close')" color="secondary" variant="flat">Close</v-btn>
      <v-btn @click="handleSave" color="pink" variant="flat">Save</v-btn>
    </v-card-actions>
  </v-card>
</template>
<style scoped>
.buttons {
  margin-top: 35px;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.not-draggable {
  cursor: no-drop;
}
</style>
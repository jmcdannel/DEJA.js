<script setup lang="ts">
import { computed, ref, type PropType } from 'vue'
import draggable from 'vuedraggable'
import { useSensors, type Sensor } from '@repo/modules/sensors'
import { useSortableList } from '@/Core/composables/useSortableList'
import SensorCard from './SensorCard.vue'

defineEmits(['edit'])
const props = defineProps({
  filteredList: { type: Array as PropType<Sensor[]>, default: undefined },
})

const { getSensors, setSensor, deleteSensor } = useSensors()
const sensors = getSensors()

const color = ref('teal')
const confirmDelete = ref('')

const { list: sortableList, onDragStart, onDragEnd } = useSortableList<Sensor>(
  sensors as any,
  (id, data) => setSensor(id, data as any),
)

const list = computed(() => props.filteredList ?? sortableList.value)
</script>

<template>
  <v-container v-if="list?.length">
    <draggable
      :list="list"
      item-key="id"
      handle=".drag-handle"
      ghost-class="ghost"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
      @start="onDragStart"
      @end="onDragEnd"
    >
      <template v-if="$slots.prepend" #header>
        <div>
          <slot name="prepend"></slot>
        </div>
      </template>
      <template #item="{ element: item }">
        <div>
          <SensorCard
            :sensor="item"
            :color="color"
            :confirming="confirmDelete === item?.id"
            @edit="$emit('edit', $event)"
            @request-delete="confirmDelete = $event"
            @cancel-delete="confirmDelete = ''"
            @confirm-delete="deleteSensor($event)"
          />
        </div>
      </template>
    </draggable>
  </v-container>
  <div v-if="!list?.length" class="flex flex-col items-center justify-center py-12 px-4">
    <v-icon size="48" class="opacity-30 mb-3">mdi-magnify-close</v-icon>
    <p class="text-sm opacity-60">No sensors match your filters.</p>
  </div>
</template>

<style scoped>
.ghost {
  opacity: 0.5;
}
</style>

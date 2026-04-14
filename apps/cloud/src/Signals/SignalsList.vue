<script setup lang="ts">
import { computed, ref, type PropType } from 'vue'
import draggable from 'vuedraggable'
import { useSignals, type Signal, type SignalAspect } from '@repo/modules/signals'
import { useSortableList } from '@/Core/composables/useSortableList'
import SignalCard from './SignalCard.vue'

defineEmits(['edit'])
const props = defineProps({
  filteredList: { type: Array as PropType<Signal[]>, default: undefined },
})

const { getSignals, setSignalAspect, setSignal, deleteSignal } = useSignals()
const signals = getSignals()

const color = ref('cyan')
const confirmDelete = ref('')
const aspectLabels: Record<Exclude<SignalAspect, null>, string> = {
  red: 'Red',
  yellow: 'Yellow',
  green: 'Green',
}

const { list: sortableList, onDragStart, onDragEnd } = useSortableList<Signal>(signals as any, (id, data) => setSignal(id, data as any))

const list = computed(() => props.filteredList ?? sortableList.value)

function canToggle(signal: Signal, aspect: Exclude<SignalAspect, null>): boolean {
  const pinMap: Record<Exclude<SignalAspect, null>, number | undefined> = {
    red: signal.red,
    yellow: signal.yellow,
    green: signal.green,
  }
  return typeof pinMap[aspect] === 'number'
}

async function toggleAspect(signal: Signal, aspect: Exclude<SignalAspect, null>) {
  if (!canToggle(signal, aspect)) return
  const nextAspect: SignalAspect = signal.aspect === aspect ? null : aspect
  await setSignalAspect(signal.id, nextAspect)
}

const wiring = (signal: Signal) => signal.commonAnode ? 'Common Anode' : 'Common Cathode'
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
          <SignalCard
            :signal="item"
            :color="color"
            :confirming="confirmDelete === item?.id"
            :can-toggle="canToggle"
            @toggle-aspect="toggleAspect"
            @request-delete="confirmDelete = item?.id"
            @cancel-delete="confirmDelete = ''"
            @confirm-delete="deleteSignal"
            @edit="$emit('edit', $event)"
          />
        </div>
      </template>
    </draggable>
  </v-container>
  <div v-if="!list?.length" class="flex flex-col items-center justify-center py-12 px-4">
    <v-icon size="48" class="opacity-30 mb-3">mdi-magnify-close</v-icon>
    <p class="text-sm opacity-60">No signals match your filters.</p>
  </div>
</template>
<style scoped>
.ghost {
  opacity: 0.5;
}
</style>

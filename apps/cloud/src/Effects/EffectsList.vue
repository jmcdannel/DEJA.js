<script setup lang="ts">
import { computed, type PropType } from 'vue'
import draggable from 'vuedraggable'
import { useEfx, type Effect } from '@repo/modules'
import { createLogger } from '@repo/utils'
import { useSortableList } from '@/Core/composables/useSortableList'
import EffectListItem from '@/Effects/EffectListItem.vue'

const log = createLogger('EffectsList')

const props = defineProps({
  filteredList: { type: Array as PropType<Effect[]>, default: undefined },
})
const emit = defineEmits(['edit'])

log.debug('EffectsList.vue loaded')
const { getEffects, setEfx } = useEfx()
const rawList = getEffects()
const { list: sortableList, onDragStart, onDragEnd } = useSortableList<Effect>(rawList as any, (id, data) => setEfx(id, data as any))

// Use filtered list from parent if provided, otherwise use the raw sortable list
const list = computed(() => props.filteredList ?? sortableList.value)

function handleEdit(item: Effect) {
  log.debug('handleEdit', item)
  emit('edit', item)
}

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
      <template #item="{ element }">
        <div>
          <EffectListItem :efx="element" :efxId="element.id" @edit="handleEdit" />
        </div>
      </template>
    </draggable>
  </v-container>
  <div v-if="!list?.length" class="flex flex-col items-center justify-center py-12 px-4">
    <v-icon size="48" class="opacity-30 mb-3">mdi-magnify-close</v-icon>
    <p class="text-sm opacity-60">No effects match your filters.</p>
  </div>
</template>
<style scoped>
.ghost {
  opacity: 0.5;
}
</style>

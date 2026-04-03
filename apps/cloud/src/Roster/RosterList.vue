<script setup lang="ts">
import { computed, type PropType } from 'vue'
import draggable from 'vuedraggable'
import RosterItem from '@/Roster/RosterItem.vue'
import { useLocos, type Loco } from '@repo/modules/locos'
import { createLogger } from '@repo/utils'
import { useSortableList } from '@/Core/composables/useSortableList'

const log = createLogger('RosterList')

const props = defineProps({
  filteredList: { type: Array as PropType<Loco[]>, default: undefined },
})
const emit = defineEmits(['edit'])

const { getLocos, updateLoco } = useLocos()

const rawLocos = getLocos()
const { list: sortableLocos, onDragStart, onDragEnd } = useSortableList<Loco>(rawLocos as any, (id, data) => updateLoco(id, data as any))

const list = computed(() => props.filteredList ?? sortableLocos.value)

function handleEdit(loco: Loco) {
  log.debug('handleEdit', loco)
  emit('edit', loco)
}

</script>
<template>
  <draggable
    v-if="list?.length"
    :list="list"
    item-key="id"
    handle=".drag-handle"
    ghost-class="ghost"
    class="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4"
    @start="onDragStart"
    @end="onDragEnd"
  >
    <template #header>
      <div>
        <slot name="prepend"></slot>
      </div>
    </template>
    <template #item="{ element }">
      <div>
        <RosterItem :loco="element as Loco" @edit="handleEdit" />
      </div>
    </template>
  </draggable>
  <div v-if="!list?.length" class="flex flex-col items-center justify-center py-12 px-4">
    <v-icon size="48" class="opacity-30 mb-3">mdi-magnify-close</v-icon>
    <p class="text-sm opacity-60">No locomotives match your filters.</p>
  </div>
</template>
<style scoped>
.ghost {
  opacity: 0.5;
}
</style>

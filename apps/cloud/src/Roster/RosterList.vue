<script setup lang="ts">
import draggable from 'vuedraggable'
import EmptyState from '@/Core/UI/EmptyState.vue'
import RosterItem from '@/Roster/RosterItem.vue'
import { useLocos, type Loco } from '@repo/modules/locos'
import { createLogger } from '@repo/utils'
import { useSortableList } from '@/Core/composables/useSortableList'

const log = createLogger('RosterList')

const emit = defineEmits(['edit'])

const { getLocos, updateLoco } = useLocos()

const rawLocos = getLocos()
const { list: locos, onDragStart, onDragEnd } = useSortableList<Loco>(rawLocos as any, (id, data) => updateLoco(id, data as any))

function handleEdit(loco: Loco) {
  log.debug('handleEdit', loco)
  emit('edit', loco)
}

</script>
<template>
  <draggable
    v-if="locos?.length"
    :list="locos"
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
  <EmptyState
    v-if="!locos?.length"
    icon="mdi-train"
    color="pink"
    title="No Locomotives Yet"
    description="Build your digital roster by adding locomotives with their DCC addresses, decoder functions, and custom configurations."
    :use-cases="[{ icon: 'mdi-memory', text: 'Program DCC decoders' }, { icon: 'mdi-tune', text: 'Configure functions & lights' }, { icon: 'mdi-train-car', text: 'Build consists' }]"
    action-label="Add Your First Loco"
    action-to="/locos/new"
  />
</template>
<style scoped>
.ghost {
  opacity: 0.5;
}
</style>

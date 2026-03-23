<script setup lang="ts">
import { computed, type PropType } from 'vue'
import draggable from 'vuedraggable'
import { useEfx, type Effect } from '@repo/modules'
import { createLogger } from '@repo/utils'
import { useSortableList } from '@/Core/composables/useSortableList'
import EffectListItem from '@/Effects/EffectListItem.vue'
import EmptyState from '@/Core/UI/EmptyState.vue'

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
      <template #header>
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
  <EmptyState
    v-if="!list?.length"
    icon="mdi-rocket-launch"
    color="indigo"
    title="No Effects Yet"
    description="Create lighting, sound, and animation effects to bring your layout to life with immersive scenery and interactive elements."
    :use-cases="[{ icon: 'mdi-volume-high', text: 'Ambient sounds & audio' }, { icon: 'mdi-led-on', text: 'LED animations & lighting' }, { icon: 'mdi-play-circle', text: 'Triggered sequences' }]"
    action-label="Create Your First Effect"
    action-to="/effects/new"
  />
</template>
<style scoped>
.ghost {
  opacity: 0.5;
}
</style>

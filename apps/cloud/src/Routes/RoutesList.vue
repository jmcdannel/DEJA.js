<script async setup lang="ts">
import { computed, type PropType } from 'vue'
import draggable from 'vuedraggable'
import { useCollection } from 'vuefire'
import { type Route } from '@repo/modules/index.ts'
import { useRoutes } from '@repo/modules/routes/useRoutes'
import { createLogger } from '@repo/utils'
import { useSortableList } from '@/Core/composables/useSortableList'
import RouteListItem from '@/Routes/RouteListItem.vue'

const log = createLogger('RoutesList')

const props = defineProps({
  filteredList: { type: Array as PropType<Route[]>, default: undefined },
})
const emit = defineEmits(['edit'])

const { routesCol, setRoute } = useRoutes()
const rawList = useCollection<Route>(routesCol, { ssrKey: 'routes' })
const { list: sortableList, onDragStart, onDragEnd } = useSortableList<Route>(rawList as any, (id, data) => setRoute(id, data as any))

const list = computed(() => props.filteredList ?? sortableList.value)

function handleEdit(item: Route) {
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
      class="grid grid-cols-1 gap-3"
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
          <RouteListItem :route="element" :route-id="element.id" @edit="handleEdit" />
        </div>
      </template>
    </draggable>
  </v-container>
  <div v-if="!list?.length" class="flex flex-col items-center justify-center py-12 px-4">
    <v-icon size="48" class="opacity-30 mb-3">mdi-magnify-close</v-icon>
    <p class="text-sm opacity-60">No routes match your filters.</p>
  </div>
</template>
<style scoped>
.ghost {
  opacity: 0.5;
}
</style>

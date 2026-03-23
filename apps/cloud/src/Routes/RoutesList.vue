<script async setup lang="ts">
import draggable from 'vuedraggable'
import { useCollection } from 'vuefire'
import { type Route } from '@repo/modules/index.ts'
import { useRoutes } from '@repo/modules/routes/useRoutes'
import { createLogger } from '@repo/utils'
import { useSortableList } from '@/Core/composables/useSortableList'
import RouteListItem from '@/Routes/RouteListItem.vue'
import EmptyState from '@/Core/UI/EmptyState.vue'

const log = createLogger('RoutesList')

const emit = defineEmits(['edit'])

const { routesCol, setRoute } = useRoutes()
const rawList = useCollection<Route>(routesCol, { ssrKey: 'routes' })
const { list, onDragStart, onDragEnd } = useSortableList<Route>(rawList as any, (id, data) => setRoute(id, data as any))

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
  <EmptyState
    v-if="!list?.length"
    icon="mdi-map"
    color="purple"
    title="No Routes Yet"
    description="Create automated paths that throw multiple turnouts in sequence, making complex track arrangements a single-click operation."
    :use-cases="[{ icon: 'mdi-arrow-decision', text: 'Yard entry paths' }, { icon: 'mdi-highway', text: 'Mainline bypass' }, { icon: 'mdi-format-list-group', text: 'Multi-turnout sequences' }]"
    action-label="Create Your First Route"
    action-to="/routes/new"
  />
</template>
<style scoped>
.ghost {
  opacity: 0.5;
}
</style>

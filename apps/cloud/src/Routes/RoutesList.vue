<script async setup lang="ts">
import { useCollection } from 'vuefire'
import { type Route } from '@repo/modules/index.ts'
import { useRoutes } from '@repo/modules/routes/useRoutes'
import RouteListItem from '@/Routes/RouteListItem.vue'
import EmptyState from '@/Core/UI/EmptyState.vue'

const emit = defineEmits(['edit'])

const { routesCol } = useRoutes()
const list = useCollection<Route>(routesCol, { ssrKey: 'routes' })

function handleEdit(item: Route) {
  console.log('handleEdit', item)
  emit('edit', item)
}

</script>
<template>
  <v-container v-if="list?.length">
    <v-row >
      <v-col
        cols="12"
        xs="12"
        sm="12"
        lg="12"
      >
      <slot name="prepend"></slot>      
    </v-col>
      <v-col
        v-for="item in list"
        :key="item.id"
        cols="12"
        xs="12"
        sm="12"
        lg="12"
      >
        <RouteListItem :route="item" :route-id="item.id" @edit="handleEdit"></RouteListItem>
         <!-- <pre>{{item}}</pre> -->
    </v-col>
    </v-row>
  </v-container>
  <EmptyState
    v-if="!list?.length"
    icon="mdi-map"
    color="purple"
    title="No Routes Yet"
    description="Create automated paths that throw multiple turnouts in sequence, making complex track arrangements a single-click operation."
    :useCases="[{ icon: 'mdi-arrow-decision', text: 'Yard entry paths' }, { icon: 'mdi-highway', text: 'Mainline bypass' }, { icon: 'mdi-format-list-group', text: 'Multi-turnout sequences' }]"
    actionLabel="Create Your First Route"
    actionTo="/routes/new"
  />
</template>
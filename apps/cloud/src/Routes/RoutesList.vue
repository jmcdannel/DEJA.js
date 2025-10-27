<script async setup lang="ts">
import { useCollection } from 'vuefire'
import { useRoutes, type Route } from '@repo/modules'
import RouteListItem from '@/Routes/RouteListItem.vue'
import LcdDisplay from '@/Core/UI/LcdDisplay.vue'

const emit = defineEmits(['edit'])

const { routesCol } = useRoutes()
const list = useCollection<Route>(routesCol, { ssrKey: 'routes' })

function handleEdit(item: Route) {
  console.log('handleEdit', item)
  emit('edit', item)
}

</script>
<template>
  <v-container>
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
    </v-col>
    </v-row>
    <LcdDisplay 
      :content="list.map(item => `${item.name}: ${item.point1 ?? ''} → ${item.point2 ?? ''}`)"
      title="ROUTES LIST"
      color="blue"
      size="sm"
      :max-lines="10"
    />
  </v-container>
</template>
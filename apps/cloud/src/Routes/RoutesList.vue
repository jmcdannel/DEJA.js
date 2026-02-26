<script async setup lang="ts">
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { useCollection } from 'vuefire'
import { type Route } from '@repo/modules/index.ts'
import { useRoutes } from '@repo/modules/routes/useRoutes'
import RouteListItem from '@/Routes/RouteListItem.vue'

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
    <v-row v-auto-animate>
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
</template>
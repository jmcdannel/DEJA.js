<script async setup lang="ts">
import { useCollection } from 'vuefire'
import { useEfx, type Effect } from '@repo/modules/effects'
import RouteListItem from '@/Routes/RouteListItem.vue'

const emit = defineEmits(['edit'])

const { getEffectsByType } = useEfx()
const list = useCollection(getEffectsByType('route'), { ssrKey: 'routes' })

function handleEdit(item: Effect) {
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
        sm="6"
        lg="4"
      >
      <slot name="prepend"></slot>      
    </v-col>
      <v-col
        v-for="item in list"
        :key="item.id"
        cols="12"
        xs="12"
        sm="6"
        lg="4"
      >
        <RouteListItem :efx="item" :efxId="item.id" @edit="handleEdit"></RouteListItem>
    </v-col>
    </v-row>
    <pre>{{ list }}</pre>
  </v-container>
</template>
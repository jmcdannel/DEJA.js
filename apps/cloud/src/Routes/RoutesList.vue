<script async setup lang="ts">
import { useCollection } from 'vuefire'
import { useEfx, type Effect } from '@repo/modules'
import RouteListItem from '@/Routes/RouteListItem.vue'
import LcdDisplay from '@/Core/UI/LcdDisplay.vue'

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
        <RouteListItem :efx="item" :efxId="item.id" @edit="handleEdit"></RouteListItem>
    </v-col>
    </v-row>
    <LcdDisplay 
      :content="list.map(item => `${item.name}: ${item.type}`)"
      title="ROUTES LIST"
      color="blue"
      size="sm"
      :max-lines="10"
    />
  </v-container>
</template>
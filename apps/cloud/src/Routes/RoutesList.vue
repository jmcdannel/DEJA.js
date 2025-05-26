<script setup lang="ts">
import { useEfx } from '@repo/modules/effects'
import RouteListItem from '@/Routes/RouteListItem.vue'

const emit = defineEmits(['edit'])

const { getEffects } = useEfx()
const all = getEffects()
const list = all.data.value.filter((item) => item.type === 'route')

function handleEdit(item) {
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
  </v-container>
</template>
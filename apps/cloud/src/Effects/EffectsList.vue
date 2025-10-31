<script setup lang="ts">
import { useEfx, type Effect } from '@repo/modules'
import EffectListItem from '@/Effects/EffectListItem.vue'

const emit = defineEmits(['edit'])

console.log('EffectsList.vue loaded')
const { getEffects } = useEfx()
const list = getEffects()

function handleEdit(item: Effect) {
  console.log('handleEdit', item)
  emit('edit', item)
}

</script>
<template>
  <v-container>
    <v-row>
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
        <EffectListItem :efx="item" :efxId="item.id" @edit="handleEdit"></EffectListItem>
    </v-col>
    </v-row>
  </v-container>
</template>
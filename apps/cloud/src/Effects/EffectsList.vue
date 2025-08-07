<script setup lang="ts">
import { useEfx, type Effect } from '@repo/modules/effects'
import CloudEventCard from '@/Effects/CloudEventCard.vue'

const emit = defineEmits(['edit'])

const { getEffects } = useEfx()
const list = getEffects()

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
        <CloudEventCard :efx="item as Effect" :efxId="item.id" @edit="handleEdit"></CloudEventCard>
    </v-col>
    </v-row>
  </v-container>
</template>
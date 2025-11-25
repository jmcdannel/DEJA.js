<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTimeoutFn } from '@vueuse/core'
import { useEfx, type Effect } from '@repo/modules/effects'
import type { ModuleListItem, ModuleListViewOption } from './types'
import type { DocumentData } from 'firebase/firestore'
import ItemSwitch from './ItemSwitch.vue'
import ItemButton from './ItemButton.vue'
import ItemCard from './ItemCard.vue'

interface Props {
  item: DocumentData
  viewAs?: string
}

const emit = defineEmits(['update:state'])
const props = defineProps<Props>()
const state = ref(props.item?.state)
const isRunning = ref(false)

const { start, stop } = useTimeoutFn(() => {
  isRunning.value = false
}, 2000)

watch(state, async (newState) => {
  console.log('Effect state watched to:', newState)
  isRunning.value = true
  stop()
  start()
  emit('update:state', { ...props.item, id: props.item.id }, newState)
//   await runEffect({...props.item, id: props.item.id, state: newState})
})
</script>

<template>
  <ItemSwitch
    v-if="viewAs === 'switch'"
    :item="item" 
    :is-running="isRunning"
    v-model:state.sync="state"
  />
  <ItemButton 
    v-else-if="viewAs === 'button'" 
    :item="item" 
    :is-running="isRunning"
    v-model:state.sync="state"
  />
  <ItemCard 
    v-else-if="viewAs === 'card'" 
    :item="item" 
    :is-running="isRunning"
    v-model:state.sync="state"
  />
  <pre v-else>{{ item }}</pre>
</template>
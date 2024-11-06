<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTimeoutFn } from '@vueuse/core'

import { useEfx } from '@/api/useEfx'

const { runEffect, getEfxType } = useEfx()

const props = defineProps({
  efx: Object,
  efxId: String,
})

const state = ref(props.efx?.state || false)
const efxType = ref(getEfxType(props.efx?.type))
const isRunning = ref(false)

watch(state, async (val) => {
  console.log('state', val)
  const { isPending } = useTimeoutFn(() => {
    isRunning.value = false
  }, 3000)
  isRunning.value = isPending.value
  await runEffect({
      ...props.efx,
      id: props.efxId,
      state: state.value
  })
})

</script>
<template>
  <button 
    class="border-[1px] border-gray-800 border-solid w-full h-full "
    :class="isRunning ? 'bg-gradient-to-r from-indigo-400 to-pink-900' : 'cursor-pointer'"
    :disabled="isRunning"
    @click="state = !state">
    <div 
      class="flex flex-col items-center justify-center bg-gray-900  w-full h-full "
      :class="isRunning || state ? 'shadow-inner shadow-pink-500 bg-opacity-80' : 'bg-opacity-95'">
      <v-progress-linear :class="isRunning ? 'visible' : 'invisible'" color="deep-purple" indeterminate></v-progress-linear>
      <section class="p-4">
        <component :is="efxType?.icon" class="w-10 h-10 stroke-none" :color="efxType?.color"></component>
        <!-- <v-switch v-model="state" @change="handleEfx" hide-details /> -->
      </section>
      <h4 class="flex-grow text-md font-bold p-4">{{efx?.name}}</h4>
      <!-- <pre>{{ state }}</pre> -->
    </div>
  </button>
</template>

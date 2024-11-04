<script setup lang="ts">
import { ref } from 'vue'
import { useTimeoutFn } from '@vueuse/core'

import { useEfx } from '@/api/useEfx'

const { runEffect, getEfxType } = useEfx()

const props = defineProps({
  efx: Object,
  efxId: String,
})

const state = ref(props.efx?.state)
const efxType = ref(getEfxType(props.efx?.type))
const isRunning = ref(false)

async function handleEfx (event: Event) {
  if (isRunning.value) return
  const target = event.target as HTMLInputElement
  console.log('handleEfx', props.efx, props.efx?.id, event, target.checked)

  const { isPending } = useTimeoutFn(() => {
    isRunning.value = false
  }, 3000)
  isRunning.value = isPending.value
  await runEffect({
      ...props.efx,
      id: props.efxId,
      state: target.checked
  })
}

</script>
<template>
  <div 
    class="border-[1px] border-gray-800 "
    :class="isRunning ? '' : 'cursor-pointer'"
    @click="handleEfx">
    <div 
      class="flex flex-col items-center justify-center bg-gray-900 "
      :class="isRunning ? 'bg-opacity-40' : 'bg-opacity-95'">
      <v-progress-linear :class="isRunning ? 'visible' : 'invisible'" color="deep-purple" indeterminate></v-progress-linear>
      <section class="p-4">
        <component :is="efxType?.icon" class="w-6 h-6 stroke-none" :color="efxType?.color"></component>
        <!-- <v-switch v-model="state" @change="handleEfx" hide-details /> -->
      </section>
      <h4 class="flex-grow text-md font-bold p-4">{{efx?.name}}</h4>
      <!-- <pre>{{ isRunning }}</pre> -->
    </div>
  </div>
</template>

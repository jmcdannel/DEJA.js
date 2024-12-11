<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PropType } from 'vue'
import type { IEfx } from '@/effects/types'
import { useTimeoutFn } from '@vueuse/core'

import { useEfx } from '@/effects/useEfx'

const { runEffect, getEfxType } = useEfx()

const props = defineProps({
  efx: Object as PropType<IEfx>,
  efxId: String,
})

const state = ref(props.efx?.state || false)
const efxType = ref(props.efx?.type && getEfxType(props.efx?.type))
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
  <v-btn 
    class="border-[1px] border-solid h-auto"
    :class="`
      ${isRunning ? 'bg-gradient-to-r from-indigo-400 to-pink-900' : 'cursor-pointer'}
      ${state ? 'border-primary-500' : ''}
    `"
    :color="efx?.color || efxType?.color || 'primary'"
    :disabled="isRunning"
    variant="tonal"
    @click="state = !state">
    <div 
      class="flex flex-col items-center justify-center">
      <v-progress-linear 
        :class="isRunning ? 'visible' : 'invisible'" 
        color="deep-purple" 
        indeterminate>
      </v-progress-linear>
      <section class="p-4">
        <component :is="efxType?.icon" class="w-10 h-10 stroke-none" :color="efxType?.color"></component>
      </section>
      <h4 class="flex-grow text-md font-bold p-4">{{efx?.name}}</h4>
      <!-- <pre>{{ efx }}</pre> -->
    </div>
  </v-btn>
</template>

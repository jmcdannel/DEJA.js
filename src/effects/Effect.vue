<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PropType } from 'vue'
import type { IEfx } from '@/effects/types'
import { useTimeoutFn } from '@vueuse/core'

import { useEfx } from '@/effects/useEfx'

const { runEffect, getEfxType } = useEfx()

const props = defineProps({
  efx: {
    type: Object as PropType<IEfx>,
    required: true
  },
  efxId: String,
  viewAs: {
    type: Array as PropType<string[]>,
    default: () => ['list']
  }
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
    <template v-if="viewAs.includes('list')">
      <v-switch
        :color="efx?.color || efxType?.color || 'primary'"
        density="compact"
        :disabled="isRunning"
        :label="efx?.name"
        :loading="isRunning"
        ripple
        size="small"
        v-model="state"
      >
        <template #prepend v-if="efxType?.icon">        
          <component 
            :is="efxType?.icon" 
            class="w-10 h-10 stroke-none" 
            :color="efx?.color || efxType?.color || 'primary'"
          />
        </template>
        <template #append>
          <v-chip 
            :color="efx?.color || efxType?.color || 'primary'" 
            size="small"
            :text="efx?.device || 'macro'"
          />
        </template>
      </v-switch>
    </template>
    <template v-else-if="viewAs.includes('card')">
        <v-card 
          class="shadow-xl my-1 p-[1px] rounded-full text-white"
          :class="isRunning ? 'bg-gradient-to-r from-indigo-400 to-pink-900 ' : ''"
          :color="efx?.color || efxType?.color || 'primary'"
          >
          <v-card-title 
            class="flex flex-row items-center justify-between relative rounded-full px-2 bg-gray-900 bg-opacity-40"
            :class="isRunning ? 'shadow-inner shadow-pink-500 bg-opacity-80' : 'bg-opacity-95'"
            >
            <h4 class="text-sm font-bold flex items-center gap-2">
              <component 
                v-if="efxType?.icon"
                :is="efxType?.icon" 
                class="w-6 h-6 stroke-none"
                :color="efx?.color || efxType?.color || 'primary'"
              />
              {{efx?.name}}
            </h4>
            <aside class="flex items-center gap-2">
              <v-chip size="small" :text="efx?.device || 'marco'" />
              <v-switch v-model="state" :color="efx?.color || efxType?.color || 'primary'" :disabled="isRunning" :loading="isRunning" hide-details />
            </aside>
          </v-card-title>
        </v-card>
    </template>
    <template v-else-if="viewAs.includes('button')">
      <v-btn 
        class="m-1"
        :color="efx?.color || efxType?.color || 'primary'"
        :disabled="isRunning"
        :loading="isRunning"
        variant="tonal"
        @click="state = !state">
        <template #prepend>
          <component v-if="efxType?.icon" :is="efxType?.icon" class="w-6 h-6 stroke-none" :color="efxType?.color"></component>
        </template>
        {{efx?.name}}
      </v-btn>
    </template>
    <template v-else-if="viewAs.includes('grid')">
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
            <!-- <pre>{{ viewAs }}</pre> -->
        </div>
      </v-btn>
    </template>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PropType } from 'vue'
import type { Effect, EffectType } from '@repo/modules/effects'
import { useTimeoutFn } from '@vueuse/core'

import { useEfx } from '@repo/modules/effects'

const { runEffect, getEfxType } = useEfx()

const props = defineProps({
  efx: {
    type: Object as PropType<Effect>,
    required: true
  },
  efxId: String,
  viewAs: {
    type: Array as PropType<string[]>,
    default: () => ['list']
  }
})

const state = ref(props.efx?.state || false)
const efxType = ref<EffectType | null>(props.efx?.type ? getEfxType(props.efx?.type) as EffectType : null)
const isRunning = ref(false)
watch(state, async (val) => {
  const { isPending } = useTimeoutFn(() => {
    isRunning.value = false
  }, 3000)
  isRunning.value = isPending.value
  await runEffect({
      ...props.efx,
      id: props.efxId || props.efx.id,
      state: state.value
  })
})

</script>
<template>
    <template v-if="viewAs.includes('switch')">      
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
              <v-icon 
                v-if="efxType?.icon" 
                :icon="efxType?.icon" 
                class="stroke-none"
                :size="32"
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
    <template v-else-if="viewAs.includes('card')">
       <v-card 
        class="m-1 shadow-xl"
        :color="efx?.color || 'primary'"
        :disabled="isRunning"
        :loading="isRunning"
        variant="tonal"
          >
          <v-card-title class="flex flex-row items-center gap-4" >
            <v-icon 
              v-if="efxType?.icon" 
              :icon="efxType?.icon" 
              class="stroke-none"
              :size="32"
              :color="efx?.color || efxType?.color || 'primary'"
            />
            <h4 class="text-sm font-bold flex items-center gap-2">
              {{efx?.name}}
            </h4>
          </v-card-title>
          <v-card-text>
            <p class="my-4">{{efx?.name}}</p>
              <div class="flex flex-wrap gap-2">
                <v-chip 
                  v-if="efx?.device" 
                  class="ml-2 text-xs"
                  prepend-icon="mdi-memory"
                  variant="outlined">
                  {{efx?.device}}
                </v-chip>
                <v-chip 
                  v-if="efx?.type" 
                  class="ml-2 text-xs"
                  prepend-icon="mdi-electric-switch"
                  variant="outlined">
                  {{efx?.type}}
                </v-chip>
                <v-chip v-for="tag in efx?.tags" 
                  :key="tag" 
                  class="ml-2 text-xs"
                  prepend-icon="mdi-tag"
                  variant="outlined">
                  {{tag}}
                </v-chip>
              </div>
            <!-- <v-btn 
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
                    <v-icon 
                      v-if="efxType?.icon" 
                      :icon="efxType?.icon" 
                      class="stroke-none"
                      :size="48"
                      :color="efx?.color || efxType?.color || 'primary'"
                    />
                  </section>
                  <h4 class="flex-grow text-md font-bold p-4">{{efx?.name}}</h4>
              </div>
            </v-btn> -->
          </v-card-text>

          <v-card-actions class="flex justify-end">
            <v-switch v-model="state"  :color="efx?.color || 'primary'" :disabled="isRunning" :loading="isRunning" hide-details />    
          </v-card-actions>
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
          <v-icon 
            v-if="efxType?.icon" 
            :icon="efxType?.icon" 
            class="stroke-none"
            :size="20"
            :color="efx?.color || efxType?.color || 'primary'"
          />
        </template>
        {{efx?.name}}
      </v-btn>
    </template>
  <template v-else-if="viewAs.includes('raw')">
    <pre class="m-1 p-2 rounded-lg text-sm">
{{ JSON.stringify(efx, null, 2) }}
    </pre>
  </template>
</template>

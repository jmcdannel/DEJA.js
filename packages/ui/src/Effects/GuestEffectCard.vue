<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTimeoutFn } from '@vueuse/core'
import { useEfx, efxTypes, type Effect } from '@repo/modules/effects'
import PlaySound from './PlaySound.vue'


interface Props {
  effect: Effect
  state?: boolean
  showDescription?: boolean
  showTags?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDescription: true,
  showTags: true
})
const { runEffect, getEfxType } = useEfx()
const state = ref(props.effect?.state)
const efxType = computed(() => efxTypes.find((type) => type.value === props?.effect?.type))
const isRunning = ref(false)

const { start, stop } = useTimeoutFn(() => {
  isRunning.value = false
}, 2000)

watch(state, async (newState) => {
  console.log('Effect state watched to:', newState)
  isRunning.value = true
  stop()
  start()
  await runEffect({...props.effect, state: newState})
})
</script>

<template>
  <v-card 
    :color="effect?.color || 'primary'"
    :elevation="state ? 8 : 2"
    class="effect-card"
    :class="{ active: state }"
    variant="tonal"
  >
    <v-card-text class="text-center pa-4">
      <v-icon 
        :icon="efxType?.icon || 'mdi-lightning-bolt'" 
        size="48" 
        :color="state ? 'white' : 'primary'"
        class="mb-3"
      ></v-icon>
      
      <h4 class="text-h6 mb-2" :class="{ 'text-white': effect.state }">
        {{ effect.name }}
      </h4>
      
      <p 
        v-if="showDescription"
        class="text-body-2 mb-3" 
        :class="{ 'text-white': effect.state, 'text-medium-emphasis': !effect.state }"
      >
        {{ effectType?.label || effect.type }} effect
        <span v-if="effect.device">on {{ effect.device }}</span>
        <span v-if="effect.pin">(Pin {{ effect.pin }})</span>
      </p>
      
      <div v-if="showTags && effect.tags?.length" class="mb-3">
        <v-chip 
          v-for="tag in effect.tags" 
          :key="tag"
          size="small" 
          :color="effect.state ? 'white' : 'info'"
          :text-color="effect.state ? 'success' : 'white'"
          class="ma-1"
        >
          {{ tag }}
        </v-chip>
      </div>
    </v-card-text>
      
    <v-card-actions class="flex justify-end">
      <PlaySound v-if="effect?.type === 'sound'" :effect="effect" view-as="card" />
      <template v-else>
        <v-btn
          v-if="!state"
          :color="effect?.color || 'primary'" 
          @click="state = true"
          :disabled="isRunning"
          :loading="isRunning"
          variant="flat"

        >
          <v-icon icon="mdi-play" class="mr-1"></v-icon>
          Activate
        </v-btn>
        
        <v-btn
          v-else
          :color="effect?.color || 'primary'" 
          @click="state = false"
          :disabled="isRunning"
          :loading="isRunning"
          variant="flat"
        >
          <v-icon icon="mdi-stop" class="mr-1"></v-icon>
          Stop
        </v-btn>
    </template>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.effect-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.effect-card:hover {
  transform: translateY(-2px);
}

.effect-card.active {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
  100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
}
</style>
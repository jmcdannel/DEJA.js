<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTimeoutFn } from '@vueuse/core'
import { useEfx, efxTypes, type Effect } from '@repo/modules'

interface Props {
  effect: Effect
}

const props = defineProps<Props>()
const { runEffect } = useEfx()
const state = ref(props.effect?.state)
const isRunning = ref(false)
const efxType = computed(() => efxTypes.find((type) => type.value === props?.effect?.type))

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
    :elevation="effect.state ? 8 : 2" 
    :class="{ 'active-effect': effect.state }"
    class="effect-card"
    variant="tonal"
    :color="effect?.color || 'primary'"
  >
    <v-card-title class="d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <v-icon 
          :icon="efxType?.icon || 'mdi-help'"
          class="text-5xl m-3"></v-icon>
        <span>{{ effect.name }}</span>
      </div>
      <v-chip 
        v-if="effect.category" 
        :color="effect.state ? 'primary' : 'grey'"
        size="small"
        variant="outlined"
      >
        {{ effect.category }}
      </v-chip>
    </v-card-title>

    <v-card-text v-if="effect.tags && effect.tags.length > 0">
      <v-chip-group>
        <v-chip 
          v-for="tag in effect.tags" 
          :key="tag"
          size="small"
          variant="outlined"
          :color="tag.color || 'secondary'"
        >
          {{ tag }}
        </v-chip>
      </v-chip-group>
    </v-card-text>

    <v-card-actions>
      <v-switch 
        v-model="state" 
        :color="effect?.color || 'primary'" 
        :disabled="isRunning" 
        :loading="isRunning" 
        hide-details 
        label="Toggle Effect"
      />
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.effect-card {
  transition: all 0.3s ease;
}

.active-effect {
  border: 2px solid var(--v-primary-base);
  transform: scale(1.02);
}

.effect-card:hover {
  transform: translateY(-2px);
}
</style>

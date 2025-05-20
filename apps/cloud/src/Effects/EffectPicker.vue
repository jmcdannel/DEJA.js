<script setup lang="ts">
import { useEfx } from '@/Effects/useEfx'

defineEmits(['select', 'cancel'])
defineProps({
  color: String
})
const model = defineModel<string>()
const { getEffects } = useEfx()
const effects = getEffects()

</script>
<template>
  <v-card class="mx-auto w-full h-full justify-between flex flex-col bg-zinc-500  bg-opacity-20"
    variant="tonal"
    density="compact"
    :color="color">
    <v-card-item class="font-weight-black">
      <v-card-title class="font-weight-black">
        Effect
      </v-card-title>
      <v-card-subtitle>
        Select an effect to run
      </v-card-subtitle>
    </v-card-item>
    <v-card-text>
      <v-btn v-for="efx in effects" :value="efx.id" :key="efx.id"
        prepend-icon="mdi-rocket"
        class="m-1"
        variant="tonal"
        @click="model = efx.id"
        :color="color">
        {{ efx.name }}
      </v-btn>
    </v-card-text>
    <v-card-actions>
      <v-btn
        prepend-icon="mdi-cancel"
        variant="outlined"
        @click="$emit('cancel')">
        Cacnel
      </v-btn>
      <v-btn
        prepend-icon="mdi-check"
        :color="model"
        variant="flat"
        @click="$emit('select')">
        Save
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
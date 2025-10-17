<script lang="ts" setup>
import { ref, type PropType } from 'vue'
import type { Loco } from '@repo/modules/locos'
import EditConsist from './EditConsist.vue'

defineProps({
  loco: {
    type: Object as PropType<Loco>,
    required: true
  }
})

const settingsDialogOpen = ref(false)

</script>
<template>
  <v-sheet class="bg-gradient-to-r from-pink-500 to-indigo-800 flex flex-row gap-2 justify-between items-center p-2 rounded-2xl shadow-lg bg-gradient-border ">
    <slot name="title">
      <h2 class="hidden md:block text-md text-purple-400 opacity-70 font-bold">Consist</h2>
    </slot>
    <div v-if="loco?.consist?.length" class="flex flex-row items-center justify-between overflow-x-auto p-1">
        <v-chip 
          class="ma-1 hidden md:flex" 
          variant="elevated" 
          prepend-icon="mdi-arrow-left-circle"
          :color="'primary'"
          size="small"
        >
          {{ loco?.address }}
        </v-chip>
      <template v-for="cloco in loco?.consist" :key="cloco">
        <v-chip 
          class="ma-1" 
          variant="elevated" 
          :append-icon="!cloco.direction ? 'mdi-arrow-right-circle' : undefined"
          :prepend-icon="cloco.direction ? 'mdi-arrow-left-circle' : undefined"
          :color="'secondary'"
          size="small"
        >
          {{ cloco?.address }}
        </v-chip>
      </template>
      <v-btn @click="settingsDialogOpen = true" color="purple" icon="mdi-cog" size="24" variant="tonal" />
    </div>
    <template v-else>
      <v-btn color="purple" @click="settingsDialogOpen = true" icon="mdi-cogs" size="24" variant="tonal" />
    </template>
  </v-sheet>

  <v-dialog 
    v-model="settingsDialogOpen" 
    transition="dialog-bottom-transition"
    width="auto"
    min-width="420"
    max-width="80vw">
    <template v-slot:default>
      <EditConsist :loco="loco" color="purple" @close="settingsDialogOpen = false" />
    </template>
  </v-dialog>
</template>
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
      <h2 class="hidden md:block text-xl text-purple-400 opacity-70 font-bold">Consist</h2>
    </slot>
    <ol v-if="loco?.consist?.length" class="flex flex-row items-center justify-between overflow-x-auto p-1">
      <li>
        <v-chip 
          class="ma-1 hidden md:block" 
          variant="elevated" 
          prepend-icon="mdi-arrow-left-circle"
          :color="'primary'"
        >
          {{ loco?.address }}
        </v-chip>
      </li>
      <template v-for="cloco in loco?.consist" :key="cloco">
        <v-chip 
          class="ma-1" 
          variant="elevated" 
          :append-icon="!cloco.direction ?  'mdi-arrow-right-circle' :null"
          :prepend-icon="cloco.direction ? 'mdi-arrow-left-circle' : null"
          :color="'secondary'"
          size="x-small"
        >
          {{ cloco?.address }}
        </v-chip>
      </template>
      <li>
        <v-btn @click="settingsDialogOpen = true" color="purple" icon="mdi-cog" size="24" variant="tonal" />
      </li>
    </ol>
    <template v-else>
      <v-btn color="purple" @click="settingsDialogOpen = true" icon="mdi-cogs" size="24" variant="tonal" />
    </template>
  </v-sheet>

  <v-dialog 
    v-model="settingsDialogOpen" 
    transition="dialog-bottom-transition"
    min-width="400"
    max-width="80vw">
    <template v-slot:default>
      <EditConsist :loco="loco" color="purple" @close="settingsDialogOpen = false" />
    </template>
  </v-dialog>
</template>
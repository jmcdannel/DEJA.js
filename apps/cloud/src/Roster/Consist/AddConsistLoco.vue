<script setup lang="ts">
import { ref } from 'vue'
import type { Loco } from '@repo/modules/locos'
defineEmits(['add'])
const props = defineProps<{
  alocos: Array<Loco>,
  loco: Loco
  color: string
  open: boolean
}>()
const show = ref(props.open)
</script>
<template>
  <v-list-item title="Add Loco to Consist">
    <template #prepend>
        <v-btn
          color="pink"
          icon="mdi-plus-circle"
          variant="tonal"
          class="mr-8"
          @click="show = !show"
        ></v-btn>
    </template>
  </v-list-item>
  <v-divider></v-divider>
  <v-list v-if="show || open" class="bg-red-960">
    <template  v-for="aloco in alocos" :key="aloco.address">
      <v-list-item :subtitle="aloco.name">
        <template #prepend>
          <v-icon icon="mdi-train" class="w-8 h-8"></v-icon>
        </template>
        <template #title>            
          <v-btn
            class="ma-2"
            icon="mdi-arrow-left-circle"
            variant="tonal"
            @click="$emit('add', aloco?.address, true)"
            :disabled="!!(aloco?.address === loco?.address || loco?.consist?.find((l) => l.address === aloco?.address))"
          ></v-btn>
          <v-avatar :color="color">{{ aloco?.address }}</v-avatar>
          <v-btn
            class="ma-2"
            icon="mdi-arrow-right-circle"
            variant="tonal"
            @click="$emit('add', aloco?.address, false)"
            :disabled="!!(aloco?.address === loco?.address || loco?.consist?.find((l) => l.address === aloco?.address))"
          ></v-btn>
        </template>
      </v-list-item>
    </template>
  </v-list>
</template>
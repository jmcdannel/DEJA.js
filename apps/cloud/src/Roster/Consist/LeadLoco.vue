<script setup lang="ts">
import type { Loco } from '@repo/modules/locos'
defineProps<{
  loco: Loco
  color: string
}>()

</script>

<template>
  <v-list-item>
    <template #prepend>
      <v-icon icon="mdi-train" class="w-8 h-8"></v-icon>
    </template>
    <template #title>
      <v-btn
        class="ma-2"
        icon="mdi-arrow-left-circle"
        variant="tonal"
        color="green"
      ></v-btn>
      <v-avatar :color="color">{{ loco?.locoId }}</v-avatar>
      <v-btn
        class="ma-2"
        icon="mdi-arrow-right-circle"
        variant="tonal"
        disabled
      ></v-btn>
    </template>
  </v-list-item>
</template>
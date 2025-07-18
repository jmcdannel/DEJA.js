<script setup lang="ts">
import { type ConsistLoco } from '@repo/modules/locos'
defineProps<{
  cloco: ConsistLoco
  color: string
}>()
</script>
<template>
  <v-list-item :title="cloco?.address">
    <template #prepend>
      <v-icon icon="mdi-train" class="w-8 h-8"></v-icon>
    </template>
    <template #title>
      <v-btn
        class="ma-2"
        icon="mdi-arrow-left-circle"
        variant="tonal"
        :color="cloco.direction ? 'green' : 'gray'"
        @click="$emit('toggle', cloco, true)"
      ></v-btn>
      <v-avatar :color="color">{{ cloco?.address }}</v-avatar>
      <v-btn
        class="ma-2"
        icon="mdi-arrow-right-circle"
        variant="tonal"
        :color="!cloco.direction ? 'green' : 'gray'"
        @click="$emit('toggle', cloco, false)"
      ></v-btn>
    </template>
    <v-sheet class="ma-2 bg-blue-800 rounded-full py-2 px-2 flex items-center justify-between">
      <span class="mx-2">Trim</span>
      <v-btn icon="mdi-minus-circle" color="secondary" size="small" variant="tonal" class="mx-1" @click="$emit('trim', cloco, -1)"></v-btn>
      <v-btn icon="mdi-plus-circle" color="secondary" size="small" variant="tonal" class="mx-1" @click="$emit('trim', cloco, 1)"></v-btn>
      <!-- <v-avatar rounded="0" varinat="tonal" :color="color" class="mx-1">{{ cloco?.trim }}</v-avatar> -->
      <span class="
        mx-1
        py-1
        px-3
        font-mono
        rounded-lg 
        text-center 
        text-xl
        shadow-inner 
        bg-gradient-to-r 
        from-purple-500 
        to-pink-600">{{ cloco?.trim }}</span>
    </v-sheet>
    <template #append>
      <v-spacer></v-spacer>
      <v-btn
        class="ma-2"
        icon="mdi-delete"
        variant="tonal"
        @click="$emit('delete', cloco)"
      ></v-btn>
    </template>
  </v-list-item>
</template>
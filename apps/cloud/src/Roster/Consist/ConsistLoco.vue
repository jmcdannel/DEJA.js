<script setup lang="ts">
  defineProps({
    cloco: Object,
    color: Object
  })
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
      <v-avatar :color="color.value">{{ cloco?.address }}</v-avatar>
      <v-btn
        class="ma-2"
        icon="mdi-arrow-right-circle"
        variant="tonal"
        :color="!cloco.direction ? 'green' : 'gray'"
        @click="$emit('toggle', cloco, false)"
      ></v-btn>
    </template>
    <template #append>
      <v-sheet class="ma-2 bg-blue-800 rounded-full py-2 px-2">
        <span class="mx-2">Trim</span>
        <v-btn icon="mdi-minus-circle" size="small" class="mx-1" @click="$emit('trim', cloco, -1)"></v-btn>
        <v-btn icon="mdi-plus-circle" size="small" class="mx-1" @click="$emit('trim', cloco, 1)"></v-btn>
        <v-avatar :color="color.value" class="mx-1">{{ cloco?.trim }}</v-avatar>
      </v-sheet>
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
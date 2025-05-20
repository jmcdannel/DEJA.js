<script setup lang="ts">
defineEmits(['consist', 'functions', 'park'])
</script>
<template>
  <v-btn-group color="light-blue">
    <v-btn 
      @click="$emit('consist')"
      icon="mdi-transit-connection-horizontal"
      variant="tonal"
    />
    <v-btn 
      @click="$emit('functions')"
      icon="mdi-train"
      variant="tonal"
    />
    <v-btn 
      @click="$emit('park')"
      icon="mdi-parking"
      variant="tonal"
    />
  </v-btn-group>
</template>
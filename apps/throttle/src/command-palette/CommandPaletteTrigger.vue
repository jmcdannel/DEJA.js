<script setup lang="ts">
import { useCommandPalette } from './useCommandPalette'

const { open } = useCommandPalette()

function handleClick() {
  open()
}
</script>

<template>
  <v-btn
    size="small"
    variant="text"
    class="ma-1"
    aria-label="Command palette (Cmd+K)"
    @click="handleClick"
  >
    <v-icon>mdi-magnify</v-icon>
    <v-tooltip activator="parent" location="bottom">
      Command palette
      <span class="text-caption opacity-60 ml-1">⌘K</span>
    </v-tooltip>
  </v-btn>
</template>

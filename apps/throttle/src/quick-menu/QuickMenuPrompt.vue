<script setup lang="ts">
import { ref } from 'vue'
import { useCommandPalette } from '@/command-palette/useCommandPalette'
import { useQuickMenu } from './useQuickMenu'

const palette = useCommandPalette()
const { closeAll } = useQuickMenu()
const text = ref('')

function submit() {
  const query = text.value.trim()
  closeAll()
  palette.open(query)
  text.value = ''
}
</script>

<template>
  <div class="qm-prompt">
    <v-icon size="16" class="qm-prompt__chevron">mdi-chevron-right</v-icon>
    <input
      v-model="text"
      type="text"
      class="qm-prompt__input"
      placeholder="What do you want to do?"
      @keyup.enter="submit"
    />
    <v-icon size="14" class="qm-prompt__enter">mdi-keyboard-return</v-icon>
  </div>
</template>

<style scoped>
.qm-prompt {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
}
.qm-prompt__chevron { color: rgba(96, 165, 250, 0.7); }
.qm-prompt__input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 12px;
  color: rgba(226, 232, 240, 0.9);
  font-family: ui-monospace, monospace;
}
.qm-prompt__input::placeholder {
  color: rgba(148, 163, 184, 0.4);
}
.qm-prompt__enter { color: rgba(148, 163, 184, 0.4); }
</style>

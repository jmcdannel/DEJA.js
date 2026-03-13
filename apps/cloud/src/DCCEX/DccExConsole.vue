<script setup lang="ts">
import { computed } from 'vue'
import { useStorage } from '@vueuse/core'
import { useDocument } from 'vuefire'
import { doc } from 'firebase/firestore'
import { db } from '@repo/firebase-config'
import { useDccLog } from './composables/useDccLog'
import LcdTerminal from './LcdTerminal.vue'
import CommandGrid from './CommandGrid.vue'
import CommandCheatSheet from './CommandCheatSheet.vue'

const layoutId = useStorage('@DEJA/layoutId', '')

// Subscribe to RTDB log
const { entries } = useDccLog(layoutId.value)

// Read layout doc for connection status and version
const layoutDoc = useDocument(
  computed(() => layoutId.value ? doc(db, 'layouts', layoutId.value) : null)
)
const isConnected = computed(() => layoutDoc.value?.dccEx?.isConnected ?? false)
const version = computed(() => layoutDoc.value?.dccEx?.version ?? '')
</script>

<template>
  <div class="dccex-console">
    <!-- Left: LCD Terminal -->
    <div class="dccex-console-lcd">
      <LcdTerminal
        :entries="entries"
        :is-connected="isConnected"
        :version="version"
      />
    </div>

    <!-- Right: Sidebar -->
    <div class="dccex-console-sidebar">
      <CommandGrid />
    </div>

    <!-- Full-width: Cheat Sheet -->
    <CommandCheatSheet class="dccex-console-cheatsheet" />
  </div>
</template>

<style scoped>
.dccex-console {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 16px;
  padding: 16px 0;
}

.dccex-console-lcd {
  min-width: 0; /* Prevent grid blowout */
}

.dccex-console-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dccex-console-cheatsheet {
  grid-column: 1 / -1;
}

/* Responsive: stack on narrow viewports */
@media (max-width: 768px) {
  .dccex-console {
    grid-template-columns: 1fr;
  }
}
</style>

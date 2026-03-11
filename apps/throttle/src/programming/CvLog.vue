<script setup lang="ts">
import type { CvLogEntry } from '@repo/modules'

defineProps<{
  log: CvLogEntry[]
}>()

const emit = defineEmits<{
  clear: []
}>()

function statusColor(status: string): string {
  switch (status) {
    case 'success': return 'success'
    case 'error': return 'error'
    case 'timeout': return 'warning'
    case 'pending': return 'info'
    default: return 'default'
  }
}

function statusIcon(status: string): string {
  switch (status) {
    case 'success': return 'mdi-check-circle'
    case 'error': return 'mdi-alert-circle'
    case 'timeout': return 'mdi-clock-alert'
    case 'pending': return 'mdi-loading'
    default: return 'mdi-circle-outline'
  }
}

function operationLabel(operation: string): string {
  switch (operation) {
    case 'read': return 'Read'
    case 'write': return 'Write'
    case 'write-bit': return 'Write Bit'
    case 'verify': return 'Verify'
    case 'read-address': return 'Read Address'
    case 'write-address': return 'Write Address'
    default: return operation
  }
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString()
}
</script>

<template>
  <v-card-text>
    <div class="flex items-center justify-between mb-4">
      <div class="text-sm text-slate-400">
        {{ log.length }} {{ log.length === 1 ? 'entry' : 'entries' }}
      </div>
      <v-btn
        v-if="log.length > 0"
        variant="text"
        size="small"
        prepend-icon="mdi-delete"
        @click="emit('clear')"
      >
        Clear
      </v-btn>
    </div>

    <div v-if="log.length === 0" class="text-center text-slate-500 py-8">
      No operations yet. Use the Read/Write tab to get started.
    </div>

    <v-list v-else density="compact">
      <v-list-item
        v-for="entry in log"
        :key="entry.id"
        class="mb-1"
      >
        <template #prepend>
          <v-icon :color="statusColor(entry.status)" size="small">
            {{ statusIcon(entry.status) }}
          </v-icon>
        </template>

        <v-list-item-title class="text-sm">
          <v-chip size="x-small" :color="entry.mode === 'service' ? 'info' : 'warning'" variant="tonal" class="mr-2">
            {{ entry.mode === 'service' ? 'SVC' : 'POM' }}
          </v-chip>
          <span class="font-semibold">{{ operationLabel(entry.operation) }}</span>
          <span v-if="entry.cv !== undefined" class="font-mono ml-2">CV{{ entry.cv }}</span>
          <span v-if="entry.value !== undefined" class="font-mono ml-1">= {{ entry.value }}</span>
          <span v-if="entry.bit !== undefined" class="font-mono ml-1">[bit {{ entry.bit }}]</span>
          <span v-if="entry.address !== undefined" class="text-slate-400 ml-2">@{{ entry.address }}</span>
        </v-list-item-title>

        <v-list-item-subtitle class="text-xs">
          <span>{{ formatTime(entry.timestamp) }}</span>
          <span v-if="entry.error" class="text-red-400 ml-2">{{ entry.error }}</span>
        </v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </v-card-text>
</template>

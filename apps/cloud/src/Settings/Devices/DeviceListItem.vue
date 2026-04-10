<script setup lang="ts">
import { computed } from 'vue'
import type { Device } from './useDevices'

const props = defineProps<{
  device: Device
}>()

const emit = defineEmits<{
  (e: 'revoke'): void
}>()

const lastSeen = computed(() => {
  if (!props.device.lastAuthAt) return 'Never connected'
  const date = new Date(props.device.lastAuthAt)
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
})

function confirmRevoke() {
  if (
    window.confirm(
      `Revoke "${props.device.label}"? The server on this device will lose access on next restart.`,
    )
  ) {
    emit('revoke')
  }
}
</script>

<template>
  <v-list-item>
    <template #prepend>
      <v-icon :color="device.revoked ? 'error' : 'success'">
        {{ device.revoked ? 'mdi-server-off' : 'mdi-server' }}
      </v-icon>
    </template>
    <v-list-item-title>
      {{ device.label }}
      <v-chip v-if="device.revoked" size="x-small" color="error" class="ms-2">Revoked</v-chip>
    </v-list-item-title>
    <v-list-item-subtitle>Last seen: {{ lastSeen }}</v-list-item-subtitle>
    <template #append>
      <v-menu>
        <template #activator="{ props: menuProps }">
          <v-btn
            icon="mdi-dots-vertical"
            variant="text"
            v-bind="menuProps"
            :disabled="device.revoked"
          />
        </template>
        <v-list>
          <v-list-item @click="confirmRevoke">
            <template #prepend>
              <v-icon>mdi-cancel</v-icon>
            </template>
            <v-list-item-title>Revoke</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
  </v-list-item>
</template>

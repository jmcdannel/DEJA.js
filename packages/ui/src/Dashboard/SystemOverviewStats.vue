<script setup lang="ts">
import { computed } from 'vue'
import type { ServerStatus } from '@repo/modules'

interface Props {
  serverStatus: ServerStatus | null
  deviceCount: { connected: number; total: number }
  trackPower: boolean | null
  commandCount?: number
}

const props = defineProps<Props>()

const serverUptime = computed(() => {
  if (!props.serverStatus?.online || !props.serverStatus?.lastSeen) return ''
  const now = Date.now()
  const last = typeof props.serverStatus.lastSeen === 'number'
    ? props.serverStatus.lastSeen
    : new Date(props.serverStatus.lastSeen).getTime()
  const diff = now - last
  const hours = Math.floor(diff / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
})
</script>

<template>
  <v-row dense>
    <!-- Server Status -->
    <v-col cols="6" md="3">
      <v-card variant="tonal" class="pa-4 h-100">
        <div class="text-overline text-medium-emphasis">Server</div>
        <div
          class="text-h5 font-weight-bold"
          :class="serverStatus?.online ? 'text-success' : 'text-error'"
        >
          {{ serverStatus?.online ? 'Online' : 'Offline' }}
        </div>
        <div v-if="serverUptime" class="text-caption text-medium-emphasis">
          uptime {{ serverUptime }}
        </div>
      </v-card>
    </v-col>

    <!-- Device Count -->
    <v-col cols="6" md="3">
      <v-card variant="tonal" class="pa-4 h-100">
        <div class="text-overline text-medium-emphasis">Devices</div>
        <div class="text-h5 font-weight-bold text-primary">
          {{ deviceCount.connected }} / {{ deviceCount.total }}
        </div>
        <div class="text-caption text-medium-emphasis">connected</div>
      </v-card>
    </v-col>

    <!-- Track Power -->
    <v-col cols="6" md="3">
      <v-card variant="tonal" class="pa-4 h-100">
        <div class="text-overline text-medium-emphasis">Track Power</div>
        <div
          class="text-h5 font-weight-bold"
          :class="trackPower ? 'text-warning' : 'text-medium-emphasis'"
        >
          {{ trackPower === null ? '\u2014' : trackPower ? 'ON' : 'OFF' }}
        </div>
        <div v-if="trackPower !== null" class="text-caption text-medium-emphasis">
          Main{{ trackPower ? ' + Prog' : '' }}
        </div>
      </v-card>
    </v-col>

    <!-- Command Count -->
    <v-col cols="6" md="3">
      <v-card variant="tonal" class="pa-4 h-100">
        <div class="text-overline text-medium-emphasis">Commands</div>
        <div class="text-h5 font-weight-bold text-secondary">
          {{ commandCount ?? 0 }}
        </div>
        <div class="text-caption text-medium-emphasis">last hour</div>
      </v-card>
    </v-col>
  </v-row>
</template>

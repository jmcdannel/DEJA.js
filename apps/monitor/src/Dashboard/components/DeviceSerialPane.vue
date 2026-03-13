<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLayout } from '@repo/modules'
import DeviceSerialMonitor from './DeviceSerialMonitor/DeviceSerialMonitor.vue'

const { getDevices } = useLayout()
const devices = getDevices()

const resolvedDevices = computed(() => {
  const candidate = devices as unknown as { value?: unknown } | unknown
  if (Array.isArray(candidate)) return candidate
  if (candidate && Array.isArray((candidate as { value?: unknown }).value)) {
    return (candidate as { value: unknown[] }).value
  }
  return [] as unknown[]
})

const connectedDevices = computed(() =>
  resolvedDevices.value.filter((d: Record<string, unknown>) => d.connected)
)

const activeTab = ref(0)
</script>

<template>
  <div class="flex flex-col h-full min-h-0">
    <div v-if="connectedDevices.length === 0" class="monitor-pane__empty">
      No devices connected
    </div>
    <template v-else>
      <v-tabs
        v-model="activeTab"
        density="compact"
        height="28"
        bg-color="transparent"
        slider-color="yellow"
        class="flex-shrink-0"
      >
        <v-tab
          v-for="(device, idx) in connectedDevices"
          :key="(device as Record<string, unknown>).id as string"
          :value="idx"
          class="text-xs"
          size="small"
        >
          <v-icon
            icon="mdi-circle"
            size="6"
            color="green"
            class="mr-1"
          />
          {{ (device as Record<string, unknown>).name || (device as Record<string, unknown>).id }}
        </v-tab>
      </v-tabs>

      <div class="flex-1 min-h-0 overflow-hidden">
        <template v-for="(device, idx) in connectedDevices" :key="(device as Record<string, unknown>).id as string">
          <div v-show="activeTab === idx" class="h-full">
            <DeviceSerialMonitor
              :device-id="(device as Record<string, unknown>).id as string"
              :device-name="((device as Record<string, unknown>).name as string) || ''"
              :device-type="((device as Record<string, unknown>).type as string) || 'Unknown'"
              :is-connected="true"
            />
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useDeviceStatus } from '@repo/modules'

/**
 * 🏷️ Minimal, subtle device indicator for item cards in lists.
 * Renders as:
 *   ● small colored dot + subtle device id text
 *
 * No pill background, no icon, no warning — just the dot (green when
 * connected, grey when offline) and the device id in a small, muted
 * monospace font. The parent card is expected to handle its own
 * disabled/dim state using the same `useDeviceStatus` hook.
 *
 * Tooltip on hover reveals the offline reason for diagnosis without
 * having to leave the list.
 */
interface DeviceBadgeProps {
  deviceId?: string | null
}

const props = withDefaults(defineProps<DeviceBadgeProps>(), {
  deviceId: '',
})

const deviceIdRef = toRef(props, 'deviceId')

const { device, isConnected, offlineReason } = useDeviceStatus(
  computed(() => deviceIdRef.value ?? ''),
)

const hasDevice = computed(() => !!device.value)

const tooltipText = computed(() => {
  if (!hasDevice.value) return 'No device assigned'
  if (isConnected.value) return `${device.value!.id} — connected`
  return offlineReason.value ?? `${device.value!.id} — offline`
})
</script>

<template>
  <v-tooltip location="top" :text="tooltipText">
    <template #activator="{ props: tipProps }">
      <span
        v-bind="tipProps"
        class="device-badge"
        :class="{ 'device-badge--offline': !isConnected }"
      >
        <span
          class="device-badge__dot"
          :class="{
            'device-badge__dot--connected': isConnected,
            'device-badge__dot--offline': !isConnected,
          }"
        />
        <span class="device-badge__id">{{ hasDevice ? deviceId : 'no device' }}</span>
      </span>
    </template>
  </v-tooltip>
</template>

<style scoped>
.device-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.68rem;
  line-height: 1;
  max-width: 100%;
  min-width: 0;
}

.device-badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  flex-shrink: 0;
  transition: background 200ms ease, box-shadow 200ms ease;
}

.device-badge__dot--connected {
  background: rgb(74, 222, 128);
  box-shadow: 0 0 6px -1px rgba(74, 222, 128, 0.55);
}

.device-badge__dot--offline {
  background: rgba(148, 163, 184, 0.45);
}

.device-badge__id {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  color: rgba(148, 163, 184, 0.72);
  letter-spacing: 0.01em;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-badge--offline .device-badge__id {
  color: rgba(148, 163, 184, 0.5);
}
</style>

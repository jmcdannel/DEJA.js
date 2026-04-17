<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useDeviceStatus } from '@repo/modules'
import DeviceBadge from './DeviceBadge.vue'

/**
 * 🧩 Shared card shell for list items that belong to a device (effects,
 * turnouts, sensors, signals). Mirrors the visual language of
 * `DeviceManageCard` on the /devices page: glassmorphic background, sky
 * shadow, rounded divider between header and body, muted footer strip.
 *
 * Behavior baked in:
 *  - Live `useDeviceStatus(deviceId)` drives dim + disabled state + warning row.
 *  - Subtle `DeviceBadge` (small dot + device id) rendered in the header.
 *  - Slots for the leading icon, title/subtitle, trailing status, body
 *    content, and footer actions — each card fills in what's relevant.
 *
 * Cards that don't belong to a device (e.g. macro effects) can pass
 * `device-id=""` and get the same shell with no offline behavior.
 */
interface ListItemCardProps {
  /** Item id for tests / key tracking; optional. */
  itemId?: string
  /** Device id this item belongs to. Empty → no device / always enabled. */
  deviceId?: string | null
  /** Accent color used by the header icon and footer pencil button. */
  color?: string
  /** Force-disable (e.g. while a command is in flight). */
  disabled?: boolean
  /** Show the v-card loading bar (e.g. during a save). */
  loading?: boolean
  /** Hide the built-in DeviceBadge even when a deviceId is present. */
  hideDeviceBadge?: boolean
}

const props = withDefaults(defineProps<ListItemCardProps>(), {
  itemId: '',
  deviceId: '',
  color: 'cyan',
  disabled: false,
  loading: false,
  hideDeviceBadge: false,
})

const deviceIdRef = toRef(props, 'deviceId')

const { isConnected: deviceConnected, offlineReason } = useDeviceStatus(
  computed(() => deviceIdRef.value ?? ''),
)

// Items without a device stay interactive. Only dim + disable when the
// card is bound to a device that's actually offline.
const hasDevice = computed(() => !!deviceIdRef.value)
const isDeviceOffline = computed(() => hasDevice.value && !deviceConnected.value)

defineExpose({ isDeviceOffline })
</script>

<template>
  <v-card
    class="list-item-card w-full h-full flex flex-col transition-all duration-200 hover:-translate-y-0.5"
    :class="{ 'list-item-card--offline': isDeviceOffline }"
    :disabled="disabled"
    :loading="loading"
    variant="flat"
  >
    <!-- ── Header ──────────────────────────────────────────────── -->
    <div class="list-item-card__header">
      <slot name="header-leading">
        <v-icon v-if="$slots['header-icon']" size="small" class="opacity-40">
          <slot name="header-icon" />
        </v-icon>
      </slot>

      <div class="list-item-card__title">
        <slot name="title" />
        <div v-if="$slots.subtitle" class="list-item-card__subtitle">
          <slot name="subtitle" />
        </div>
      </div>

      <div class="list-item-card__status">
        <slot name="status" :device-offline="isDeviceOffline" />
      </div>
    </div>

    <v-divider class="opacity-40" />

    <!-- ── Body ────────────────────────────────────────────────── -->
    <v-card-text class="list-item-card__body">
      <slot />

      <!-- 📟 Subtle device indicator (dot + id) + optional offline warning -->
      <div v-if="hasDevice && !hideDeviceBadge" class="list-item-card__device-row">
        <DeviceBadge :device-id="deviceId || ''" />
        <span
          v-if="isDeviceOffline && offlineReason"
          class="list-item-card__offline-reason"
        >
          · {{ offlineReason }}
        </span>
      </div>
    </v-card-text>

    <!-- ── Footer ──────────────────────────────────────────────── -->
    <div v-if="$slots.footer" class="list-item-card__footer">
      <slot name="footer" />
    </div>
  </v-card>
</template>

<style scoped>
.list-item-card {
  background: rgba(15, 23, 42, 0.55) !important;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 12px;
  backdrop-filter: blur(6px);
  box-shadow: 0 12px 30px -24px rgba(56, 189, 248, 0.35);
}

.list-item-card--offline {
  background: rgba(15, 23, 42, 0.35) !important;
  border-color: rgba(148, 163, 184, 0.08);
  box-shadow: none;
}

.list-item-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  min-width: 0;
}

.list-item-card__title {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.list-item-card__subtitle {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(148, 163, 184, 0.65);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-item-card__status {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.list-item-card__body {
  flex: 1 1 auto;
  padding: 0.85rem 1rem !important;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.list-item-card__device-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(148, 163, 184, 0.08);
  margin-top: auto;
}

.list-item-card__offline-reason {
  font-size: 0.65rem;
  color: rgba(251, 191, 36, 0.75);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.list-item-card__footer {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.5rem 0.35rem 0.75rem;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(148, 163, 184, 0.04);
}
</style>

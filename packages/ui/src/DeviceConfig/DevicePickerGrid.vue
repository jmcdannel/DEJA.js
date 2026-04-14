<script setup lang="ts">
import { computed } from 'vue'
import { getDeviceTypeMeta, type Device } from '@repo/modules'

/**
 * 📋 Responsive grid of device cards used for device selection on add-forms
 * and inside the DevicePicker dialog. Each tile shows the device type icon
 * colored to match the device, the device id (monospace), the human-readable
 * type label, and a tiny connection chip (USB / WiFi / Server).
 *
 * The selected tile gets a highlighted border + a check badge. When the
 * server is offline, the underlying `deja-server` still shows up — it's the
 * user's source of truth — we just don't hide anything.
 */
interface DevicePickerGridProps {
  /** Full device list to render. */
  devices: Device[]
  /** Currently selected device id — bound via v-model. */
  modelValue?: string
  /** Exclude deja-server from the grid (rarely selectable for user items). */
  excludeServer?: boolean
  /** Extra filter applied on top of excludeServer (e.g. Arduino-family only). */
  filter?: (device: Device) => boolean
  /** Empty state message when no devices match. */
  emptyMessage?: string
}

const props = withDefaults(defineProps<DevicePickerGridProps>(), {
  modelValue: '',
  excludeServer: true,
  filter: undefined,
  emptyMessage: 'No devices available. Add one on the Devices page.',
})

const emit = defineEmits<{
  'update:modelValue': [id: string]
}>()

const visibleDevices = computed<Device[]>(() => {
  let list = props.devices ?? []
  if (props.excludeServer) list = list.filter((d) => d.type !== 'deja-server')
  if (props.filter) list = list.filter(props.filter)
  return list
})

function metaFor(device: Device) {
  return getDeviceTypeMeta(device)
}

function connectionLabel(device: Device): 'USB' | 'WiFi' | 'Server' | 'Unknown' {
  if (device.type === 'deja-server') return 'Server'
  if (device.connection === 'wifi') return 'WiFi'
  if (device.connection === 'usb') return 'USB'
  return 'Unknown'
}

function connectionIcon(device: Device): string {
  if (device.type === 'deja-server') return 'mdi-server'
  if (device.connection === 'wifi') return 'mdi-wifi'
  if (device.connection === 'usb') return 'mdi-usb-port'
  return 'mdi-devices'
}

function handleSelect(id: string) {
  emit('update:modelValue', id)
}
</script>

<template>
  <div v-if="visibleDevices.length === 0" class="device-picker-grid__empty">
    <v-icon icon="mdi-devices" size="32" class="opacity-40" />
    <p class="text-sm opacity-60 mt-2">{{ emptyMessage }}</p>
  </div>

  <div v-else class="device-picker-grid">
    <button
      v-for="device in visibleDevices"
      :key="device.id"
      type="button"
      class="device-picker-grid__tile"
      :class="{ 'device-picker-grid__tile--selected': modelValue === device.id }"
      @click="handleSelect(device.id)"
    >
      <div class="device-picker-grid__tile-header">
        <v-avatar
          :color="metaFor(device).color"
          variant="tonal"
          size="34"
          rounded="lg"
        >
          <img
            v-if="metaFor(device).image"
            :src="metaFor(device).image"
            alt=""
            class="w-6 h-6"
          />
          <v-icon
            v-else
            :icon="metaFor(device).icon"
            :color="metaFor(device).color"
            size="18"
          />
        </v-avatar>

        <div class="device-picker-grid__tile-text">
          <div class="device-picker-grid__tile-id">{{ device.id }}</div>
          <div class="device-picker-grid__tile-type">{{ metaFor(device).label }}</div>
        </div>

        <v-icon
          v-if="modelValue === device.id"
          icon="mdi-check-circle"
          color="cyan"
          size="18"
          class="device-picker-grid__tile-check"
        />
      </div>

      <div class="device-picker-grid__tile-footer">
        <v-icon :icon="connectionIcon(device)" size="11" class="opacity-60" />
        <span class="device-picker-grid__tile-connection">
          {{ connectionLabel(device) }}
        </span>
        <v-spacer />
        <span
          class="device-picker-grid__tile-status"
          :class="
            device.isConnected
              ? 'device-picker-grid__tile-status--connected'
              : 'device-picker-grid__tile-status--disconnected'
          "
        >
          {{ device.isConnected ? 'Connected' : 'Offline' }}
        </span>
      </div>
    </button>
  </div>
</template>

<style scoped>
.device-picker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.6rem;
}

.device-picker-grid__tile {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 0.75rem;
  text-align: left;
  border-radius: 0.75rem;
  border: 1px solid rgba(148, 163, 184, 0.15);
  background: rgba(15, 23, 42, 0.55);
  color: #e0f2fe;
  cursor: pointer;
  transition:
    border-color 150ms ease,
    background 150ms ease,
    transform 150ms ease,
    box-shadow 150ms ease;
}

.device-picker-grid__tile:hover {
  border-color: rgba(56, 189, 248, 0.5);
  background: rgba(56, 189, 248, 0.06);
  transform: translateY(-1px);
}

.device-picker-grid__tile--selected {
  border-color: rgba(56, 189, 248, 0.8);
  background: rgba(56, 189, 248, 0.12);
  box-shadow: 0 12px 28px -18px rgba(56, 189, 248, 0.65);
}

.device-picker-grid__tile-header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
}

.device-picker-grid__tile-text {
  flex: 1;
  min-width: 0;
}

.device-picker-grid__tile-id {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.85rem;
  font-weight: 600;
  color: #f8fafc;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-picker-grid__tile-type {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(148, 163, 184, 0.72);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-picker-grid__tile-check {
  flex-shrink: 0;
}

.device-picker-grid__tile-footer {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding-top: 0.4rem;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  font-size: 0.68rem;
}

.device-picker-grid__tile-connection {
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(148, 163, 184, 0.75);
}

.device-picker-grid__tile-status {
  font-weight: 600;
  letter-spacing: 0.04em;
}

.device-picker-grid__tile-status--connected {
  color: rgb(74, 222, 128);
}

.device-picker-grid__tile-status--disconnected {
  color: rgba(148, 163, 184, 0.65);
}

.device-picker-grid__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  border: 1px dashed rgba(148, 163, 184, 0.25);
  border-radius: 0.75rem;
  background: rgba(15, 23, 42, 0.35);
}
</style>

<script setup lang="ts">
import { computed } from 'vue'
import { getDeviceTypeMeta, type Device } from '@repo/modules'

/**
 * 🔘 Compact, clickable row-input used on edit forms to show the currently
 * selected device without dedicating vertical space to a full picker grid.
 * Matches the "labeled row → chip → chevron" pattern used elsewhere in
 * the cloud forms, but adds the device-type icon + color so the user can
 * see at a glance which hardware they're pointing at.
 *
 * Stateless — parent owns the dialog / picker that actually changes the
 * selection. This component just emits `click` on the chip.
 */
interface DevicePickerChipProps {
  /** Currently selected device id. Empty string / undefined → "None" state. */
  deviceId?: string | null
  /** Full device list — used to resolve the icon/color/type of the selection. */
  devices: Device[]
  /** Row label, e.g. "Device". Default matches the TurnoutForm pattern. */
  label?: string
  /** Secondary hint under the label. */
  description?: string
  /** Disable interaction (e.g. while saving). */
  disabled?: boolean
}

const props = withDefaults(defineProps<DevicePickerChipProps>(), {
  deviceId: '',
  label: 'Device',
  description: '',
  disabled: false,
})

const emit = defineEmits<{
  click: []
}>()

const selected = computed<Device | null>(() => {
  if (!props.deviceId) return null
  return props.devices.find((d) => d.id === props.deviceId) ?? null
})

const meta = computed(() => getDeviceTypeMeta(selected.value))

function handleClick() {
  if (props.disabled) return
  emit('click')
}
</script>

<template>
  <div class="device-picker-chip">
    <div class="device-picker-chip__label">
      <span class="device-picker-chip__name">{{ label }}</span>
      <span v-if="description" class="device-picker-chip__desc">{{ description }}</span>
    </div>

    <button
      type="button"
      class="device-picker-chip__button"
      :class="{ 'device-picker-chip__button--empty': !selected, 'device-picker-chip__button--disabled': disabled }"
      :disabled="disabled"
      @click="handleClick"
    >
      <template v-if="selected">
        <v-avatar :color="meta.color" variant="tonal" size="22" rounded="md">
          <img
            v-if="meta.image"
            :src="meta.image"
            alt=""
            class="w-4 h-4"
          />
          <v-icon v-else :icon="meta.icon" :color="meta.color" size="14" />
        </v-avatar>
        <span class="device-picker-chip__value">{{ selected.id }}</span>
      </template>
      <template v-else>
        <v-icon icon="mdi-devices" size="14" class="opacity-40" />
        <span class="device-picker-chip__value opacity-60">None</span>
      </template>
      <v-icon icon="mdi-chevron-right" size="14" class="opacity-40" />
    </button>
  </div>
</template>

<style scoped>
.device-picker-chip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.device-picker-chip__label {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.device-picker-chip__name {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.92);
}

.device-picker-chip__desc {
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.48);
}

.device-picker-chip__button {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.4rem 0.7rem;
  border-radius: 0.55rem;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgba(var(--v-theme-on-surface), 0.035);
  color: rgba(var(--v-theme-on-surface), 0.82);
  font-size: 0.82rem;
  cursor: pointer;
  transition: border-color 150ms ease, background 150ms ease, transform 150ms ease;
}

.device-picker-chip__button:hover:not(.device-picker-chip__button--disabled) {
  border-color: rgba(56, 189, 248, 0.45);
  background: rgba(56, 189, 248, 0.08);
  transform: translateY(-1px);
}

.device-picker-chip__button--disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.device-picker-chip__value {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  letter-spacing: 0.01em;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

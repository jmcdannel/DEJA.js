import { computed, type ComputedRef } from 'vue'
import useLayout from './useLayout'
import { useServerStatus } from './useServerStatus'
import { getDeviceTypeMeta } from './constants'
import type { Device } from './types'

/**
 * 🔌 Reactive view of a single device's connection state — used by
 * item cards (effects, turnouts, sensors, signals) to gray themselves out
 * and badge the device as offline without each card having to replicate the
 * Firestore lookup + deja-server cross-check.
 *
 * Returns the resolved device, its display metadata (icon/color/label), and
 * the effective connection state — which for non-server devices requires
 * BOTH `device.isConnected` AND the deja-server itself being online, since
 * the server is the process that actually runs the serial/MQTT bridge.
 */
export function useDeviceStatus(deviceId: ComputedRef<string | null | undefined> | (() => string | null | undefined)) {
  const { getDevices } = useLayout()
  const { serverStatus } = useServerStatus()
  const devices = getDevices()

  const resolvedId = computed(() =>
    typeof deviceId === 'function' ? deviceId() : deviceId.value,
  )

  const device = computed<Device | null>(() => {
    const id = resolvedId.value
    if (!id) return null
    return (devices.value ?? []).find((d: Device) => d.id === id) ?? null
  })

  const meta = computed(() => getDeviceTypeMeta(device.value))

  const serverOnline = computed(() => serverStatus.value?.online ?? false)

  const isDejaServer = computed(() => device.value?.type === 'deja-server')

  const isConnected = computed(() => {
    if (!device.value) return false
    if (isDejaServer.value) return serverOnline.value
    return (device.value.isConnected ?? false) && serverOnline.value
  })

  const offlineReason = computed<string | null>(() => {
    if (!resolvedId.value) return 'No device assigned'
    if (!device.value) return `Device "${resolvedId.value}" not found`
    if (!serverOnline.value) return 'DEJA server is offline — start it with `deja start`'
    if (!device.value.isConnected) return `Device "${device.value.id}" is disconnected`
    return null
  })

  return {
    device,
    meta,
    isConnected,
    serverOnline,
    offlineReason,
  }
}

import { computed } from 'vue'
import { useLayout } from '@repo/modules'

export async function requireDccEx() {
  const { getDevices } = useLayout()
  const devices = getDevices()
  const dccExDevice = computed(() =>
    devices.value.find((device) => device.type === 'dcc-ex')
  )

  if (!dccExDevice.value) {
    return {
      path: '/',
    }
  }
}

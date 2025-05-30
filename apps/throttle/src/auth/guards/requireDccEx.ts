import { computed } from 'vue'
import { useLayout } from '@repo/modules/layouts'

export async function requireDccEx() {
  const { getDevices } = useLayout()
  const devices = getDevices()
  const dccExDevice = computed(() =>
    devices.value.find((device) => device.type === 'dcc-ex')
  )
  console.log('requireDccEx', dccExDevice, devices.value)
  if (!dccExDevice.value?.isConnected) {
    return {
      path: '/connect',
      query: { redirect: window.location.pathname },
    }
  }
}

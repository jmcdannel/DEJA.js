import { ref } from 'vue'
import { getAuth } from 'firebase/auth'

export interface Device {
  id: string
  label: string
  layoutId: string | null
  createdAt: string | null
  lastAuthAt: string | null
  revoked: boolean
  userAgent: string | null
}

async function authHeader(): Promise<string> {
  const token = await getAuth().currentUser?.getIdToken()
  if (!token) throw new Error('Not signed in')
  return `Bearer ${token}`
}

async function authedFetch(
  input: RequestInfo,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers)
  headers.set('Authorization', await authHeader())
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  return fetch(input, { ...init, headers })
}

export function useDevices() {
  const devices = ref<Device[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function load(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const res = await authedFetch('/api/devices/list')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as { devices: Device[] }
      devices.value = data.devices
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }

  async function mintInstallToken(
    label: string,
    layoutId: string | null,
  ): Promise<string> {
    const res = await authedFetch('/api/devices/mint-install-token', {
      method: 'POST',
      body: JSON.stringify({ label, layoutId }),
    })
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string }
      throw new Error(err.error ?? `HTTP ${res.status}`)
    }
    const data = (await res.json()) as { installUrl: string; pairingId: string }
    return data.installUrl
  }

  async function revoke(pairingId: string): Promise<void> {
    const res = await authedFetch('/api/devices/revoke', {
      method: 'POST',
      body: JSON.stringify({ pairingId }),
    })
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string }
      throw new Error(err.error ?? `HTTP ${res.status}`)
    }
    await load()
  }

  async function approveCode(
    userCode: string,
    label: string,
    layoutId: string | null,
  ): Promise<void> {
    const res = await authedFetch('/api/devices/pair-approve', {
      method: 'POST',
      body: JSON.stringify({ userCode, label, layoutId }),
    })
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string }
      throw new Error(err.error ?? `HTTP ${res.status}`)
    }
  }

  return {
    devices,
    loading,
    error,
    load,
    mintInstallToken,
    revoke,
    approveCode,
  }
}

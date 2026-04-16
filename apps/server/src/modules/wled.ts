import { WledClient } from '@repo/wled/client'
import type { WledEffectConfig, WledSegmentConfig } from '@repo/wled/types'
import type { Effect } from '@repo/modules'
import { db } from '@repo/firebase-config/firebase-admin-node'
import { log } from '../utils/logger.js'

const layoutId = process.env.LAYOUT_ID || 'betatrack'
const clients = new Map<string, WledClient>()

interface WledDeviceInfo {
  id: string
  host: string
  port: number
}

export async function connectDevice(device: WledDeviceInfo): Promise<void> {
  try {
    if (clients.has(device.id)) {
      log.warn(`[WLED] Device ${device.id} already connected`)
      return
    }

    log.start(`[WLED] Connecting to ${device.host}:${device.port}...`)
    const client = new WledClient(device.host, device.port)

    client.onDisconnect(() => {
      log.warn(`[WLED] Device ${device.id} disconnected`)
      db.doc(`layouts/${layoutId}/devices/${device.id}`).set(
        { isConnected: false },
        { merge: true }
      )
    })

    await client.connect()
    clients.set(device.id, client)

    // Fetch device info and write back to Firestore
    const info = await client.getInfo()
    await db.doc(`layouts/${layoutId}/devices/${device.id}`).set(
      {
        isConnected: true,
        lastConnected: new Date(),
        wledInfo: {
          version: info.ver,
          ledCount: info.leds.count,
          name: info.name,
          mac: info.mac,
          ip: info.ip,
        },
      },
      { merge: true }
    )

    log.success(`[WLED] Connected to ${info.name} (${info.leds.count} LEDs, v${info.ver})`)
  } catch (err) {
    log.error(`[WLED] Failed to connect device ${device.id}:`, err)
  }
}

export async function disconnectDevice(deviceId: string): Promise<void> {
  const client = clients.get(deviceId)
  if (client) {
    client.disconnect()
    clients.delete(deviceId)
    log.log(`[WLED] Disconnected device ${deviceId}`)
  }
}

export function getClient(deviceId: string): WledClient | undefined {
  return clients.get(deviceId)
}

/** Translate a DEJA Effect with wled config into a WLED JSON API payload */
function buildWledPayload(effect: Effect): Record<string, unknown> {
  const wled = effect.wled as WledEffectConfig | undefined
  if (!wled) {
    return { on: effect.state }
  }

  // If just toggling state, send minimal payload
  if (!effect.state) {
    return { on: false }
  }

  return {
    on: true,
    bri: wled.brightness,
    transition: wled.transition,
    seg: wled.segments.map((seg: WledSegmentConfig, i: number) => ({
      id: i,
      start: seg.start,
      stop: seg.stop,
      fx: seg.effectId,
      pal: seg.paletteId,
      col: seg.colors,
      sx: seg.speed,
      ix: seg.intensity,
      bri: seg.brightness,
      on: seg.on,
      rev: seg.reverse,
      mi: seg.mirror,
    })),
  }
}

export async function handleEffectChange(effect: Effect): Promise<void> {
  if (!effect.device) {
    log.error('[WLED] No device specified for WLED effect', effect.id)
    return
  }

  const client = clients.get(effect.device)
  if (!client?.isConnected) {
    log.error(`[WLED] Device ${effect.device} not connected`)
    return
  }

  const payload = buildWledPayload(effect)
  log.log(`[WLED] Sending to ${effect.device}:`, JSON.stringify(payload))
  client.setState(payload as any)
}

export default {
  connectDevice,
  disconnectDevice,
  getClient,
  handleEffectChange,
}

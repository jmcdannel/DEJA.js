import { collection, onSnapshot } from 'firebase/firestore'
import { getDb } from '../lib/firebase-client'
import { log } from '../utils/logger'
import { layout } from './layout'
import type { Device } from '@repo/modules'

const layoutId = process.env.LAYOUT_ID || 'betatrack'
let devicesListener: (() => void) | null = null

export function startDeviceConfigSync() {
  if (devicesListener) return;

  log.info('[LAYOUT] Starting real-time device config sync listener')

  const devicesRef = collection(getDb(), `layouts/${layoutId}/devices`)

  devicesListener = onSnapshot(devicesRef, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const deviceId = change.doc.id
      const deviceData = change.doc.data() as Device
      deviceData.id = deviceId
      
      // We only care about config modifications
      if (change.type === 'modified') {
        const connections = layout.connections()
        const connection = connections[deviceId]
        
        if (connection && connection.isConnected && deviceData.config) {
          log.info(`[LAYOUT] Sending updated config to device: ${deviceId}`)
          
          const payload = JSON.stringify({
            command: 'setConfig',
            config: deviceData.config
          }) + '\n'
          
          if (connection.port) {
            log.debug(`[LAYOUT] Writing config to USB serial for ${deviceId}`)
            connection.port.write(payload)
          } else if (connection.publish && connection.topic) {
            log.debug(`[LAYOUT] Publishing config to MQTT for ${deviceId}`)
            connection.publish(connection.topic, payload, true)
          }
        }
      }
    })
  },
  (err) => {
    log.error(`[LAYOUT] Error listening to device changes:`, err)
  })
}

export function stopDeviceConfigSync() {
  if (devicesListener) {
    devicesListener()
    devicesListener = null
  }
}

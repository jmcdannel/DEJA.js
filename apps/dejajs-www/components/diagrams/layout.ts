import {
  mdiLaptop,
  mdiFenceElectric,
  mdiIntegratedCircuitChip,
  mdiWifi,
  mdiRouterWireless,
  mdiUsb,
  mdiBolt,
  mdiCloud,
  mdiLedOn,
  mdiToggleSwitch,
  mdiRotateRight,
  mdiMotionSensor,
} from '@mdi/js'
import type { DiagramConfig, DiagramLayout, NodeDef, ConnectionDef, AreaDef, AppId, DeviceId } from './types'

// Node dimensions
const APP_W = 150
const APP_H = 110
const SERVER_W = 210
const SERVER_H = 110
const DCCEX_W = 175
const DCCEX_H = 110
const IO_W = 120     // smaller than before
const IO_H = 90      // compact — icon + label only
const TRACK_W = 165
const TRACK_H = 100

// Peripheral mini-node dimensions (4 per IO device, icon-circle only)
const PERIPH_SIZE = 24
const PERIPH_GAP = 8
const PERIPH_COUNT = 4
const PERIPH_ROW_W = PERIPH_COUNT * PERIPH_SIZE + (PERIPH_COUNT - 1) * PERIPH_GAP  // = 120 = IO_W ✓
const PERIPH_OFFSET_Y = 48   // gap from IO device bottom to peripheral row top (outside DEJA.js box)
const PERIPH_ROW_H = PERIPH_OFFSET_Y + PERIPH_SIZE  // = 72

const NODE_GAP = 20
const IO_BOUNDARY_GAP = 54  // extra gap between DCC-EX group and IO group (clears DEJA IO label strip)
const LAYER_GAP = 90
const AREA_PAD = 18
const AREA_LABEL_STRIP = 32

// DEJA apps+server = cyan  |  DEJA IO devices = yellow  |  DCC-EX (3rd party) = purple
// Physical hardware (track) = orange  |  Connected peripherals (LED, relay…) = green
export const COLORS = {
  app: 'rgb(6, 182, 212)',
  server: 'rgb(6, 182, 212)',
  dccex: 'rgb(139, 92, 246)',
  io: 'rgb(234, 179, 8)',
  track: 'rgb(249, 115, 22)',
  peripheral: 'rgb(34, 197, 94)',
} as const

export const CONN_COLORS = {
  websocket: 'rgb(6, 182, 212)',
  usb: 'rgb(139, 92, 246)',
  mqtt: 'rgb(234, 179, 8)',
  dcc: 'rgb(249, 115, 22)',
  wifi: 'rgb(6, 182, 212)',
  peripheral: 'rgb(34, 197, 94)',
} as const

const APP_LOGOS: Record<AppId, string> = {
  throttle: '/throttle/icon-512.png',
  cloud: '/cloud/icon-512.png',
  monitor: '/monitor/icon-512.png',
  tour: '/tour/icon-512.png',
}

const APP_LABELS: Record<AppId, string> = {
  throttle: 'Throttle',
  cloud: 'Cloud',
  monitor: 'Monitor',
  tour: 'Tour',
}

const DEVICE_LABELS: Record<DeviceId, string> = {
  dccex: 'DCC-EX',
  arduino: 'Arduino',
  'pico-w': 'Pico W',
  'mqtt-generic': 'MQTT Device',
}

const DEVICE_ICONS: Partial<Record<DeviceId, string>> = {
  arduino: mdiIntegratedCircuitChip,
  'pico-w': mdiWifi,
  'mqtt-generic': mdiRouterWireless,
}

// Peripheral device icons shown below Arduino / Pico W
const PERIPHERAL_ICONS = [
  mdiLedOn,         // LED strip
  mdiToggleSwitch,  // Relay
  mdiRotateRight,   // Servo
  mdiMotionSensor,  // IR / motion sensor
] as const

export function getLayout(config: DiagramConfig): DiagramLayout {
  const nodes: NodeDef[] = []
  const connections: ConnectionDef[] = []

  const hasApps = config.apps.length > 0
  const dccexInstances = config.devices.filter(d => d === 'dccex')
  const ioDeviceList = config.mqtt ? config.devices.filter(d => d !== 'dccex') : []
  const hasDccEx = dccexInstances.length > 0
  const hasIoDevices = ioDeviceList.length > 0

  // All layer-3 items (DCC-EX instances first, then IO devices)
  type Layer3Item = { id: string; isDccEx: boolean; deviceId: DeviceId; width: number; height: number }
  const layer3Items: Layer3Item[] = [
    ...dccexInstances.map((_, i) => ({
      id: `dccex-${i}`, isDccEx: true, deviceId: 'dccex' as DeviceId, width: DCCEX_W, height: DCCEX_H,
    })),
    ...ioDeviceList.map((deviceId, i) => ({
      id: `device-${deviceId}-${i}`, isDccEx: false, deviceId, width: IO_W, height: IO_H,
    })),
  ]

  const hasDccExIoBoundary = dccexInstances.length > 0 && ioDeviceList.length > 0
  const layer3TotalW = layer3Items.length > 0
    ? layer3Items.reduce((s, item) => s + item.width, 0) +
      (layer3Items.length - 1) * NODE_GAP +
      (hasDccExIoBoundary ? IO_BOUNDARY_GAP : 0)
    : 0

  // Canvas wide enough for layer-3 content with margins
  const CANVAS_W = Math.max(1000, layer3TotalW + 140)

  let y = 40

  // ── WiThrottle direct (server: false) ─────────────────────────────────────
  if (!config.server) {
    if (hasApps) {
      const totalW = config.apps.length * APP_W + (config.apps.length - 1) * NODE_GAP
      const startX = (CANVAS_W - totalW) / 2
      config.apps.forEach((appId, i) => {
        nodes.push({
          id: `app-${appId}`, x: startX + i * (APP_W + NODE_GAP), y,
          width: APP_W, height: APP_H, label: APP_LABELS[appId],
          color: COLORS.app, logoSrc: APP_LOGOS[appId], layer: 1,
        })
      })
      y += APP_H + LAYER_GAP
    }

    // DCC-EX takes the server position (layer 2)
    if (hasDccEx) {
      const dccexX = (CANVAS_W - DCCEX_W) / 2
      nodes.push({
        id: 'dccex-0', x: dccexX, y, width: DCCEX_W, height: DCCEX_H,
        label: 'DCC-EX', sublabel: 'Command Station',
        color: COLORS.dccex, logoSrc: '/dcc-ex/android-chrome-512x512.png', layer: 2,
      })
      y += DCCEX_H + LAYER_GAP
    }

    if (config.track && hasDccEx) {
      const trackX = (CANVAS_W - TRACK_W) / 2
      nodes.push({
        id: 'track', x: trackX, y, width: TRACK_W, height: TRACK_H,
        label: 'Track / Trains', color: COLORS.track, iconPath: mdiFenceElectric, layer: 4,
      })
      y += TRACK_H
    }

    // Apps → DCC-EX via WiThrottle (WiFi)
    config.apps.forEach((appId, i) => {
      connections.push({
        id: `conn-${appId}-dccex`, fromId: `app-${appId}`, toId: 'dccex-0',
        label: 'WiThrottle', color: CONN_COLORS.wifi, type: 'wifi',
        showLabel: true, iconPath: mdiWifi,
      })
    })

    if (config.track && hasDccEx) {
      connections.push({
        id: 'conn-dccex-track', fromId: 'dccex-0', toId: 'track',
        label: 'DCC +/-', color: CONN_COLORS.dcc, type: 'dcc',
        showLabel: true, iconPath: mdiBolt,
      })
    }

  // ── Standard layout (server: true) ────────────────────────────────────────
  } else {
    if (hasApps) {
      const totalW = config.apps.length * APP_W + (config.apps.length - 1) * NODE_GAP
      const startX = (CANVAS_W - totalW) / 2
      config.apps.forEach((appId, i) => {
        nodes.push({
          id: `app-${appId}`, x: startX + i * (APP_W + NODE_GAP), y,
          width: APP_W, height: APP_H, label: APP_LABELS[appId],
          color: COLORS.app, logoSrc: APP_LOGOS[appId], layer: 1,
        })
      })
      y += APP_H + LAYER_GAP
    }

    // Layer 2: DEJA Server (laptop icon)
    const serverX = (CANVAS_W - SERVER_W) / 2
    nodes.push({
      id: 'server', x: serverX, y, width: SERVER_W, height: SERVER_H,
      label: 'DEJA Server', color: COLORS.server, iconPath: mdiLaptop, layer: 2,
    })
    y += SERVER_H + LAYER_GAP

    // Layer 3: DCC-EX instances + IO devices in one row, centered
    const layer3Y = y
    const layer3StartX = (CANVAS_W - layer3TotalW) / 2
    let currentX = layer3StartX
    let prevWasDccEx = false
    layer3Items.forEach(item => {
      // Extra gap at the DCC-EX → IO boundary so DEJA IO label strip doesn't overlap
      if (!item.isDccEx && prevWasDccEx) currentX += IO_BOUNDARY_GAP

      if (item.isDccEx) {
        nodes.push({
          id: item.id, x: currentX, y: layer3Y, width: DCCEX_W, height: DCCEX_H,
          label: 'DCC-EX', sublabel: 'Command Station',
          color: COLORS.dccex, logoSrc: '/dcc-ex/android-chrome-512x512.png', layer: 3,
        })
      } else {
        nodes.push({
          id: item.id, x: currentX, y: layer3Y, width: IO_W, height: IO_H,
          label: DEVICE_LABELS[item.deviceId],
          color: COLORS.io, iconPath: DEVICE_ICONS[item.deviceId], layer: 3,
        })
      }
      prevWasDccEx = item.isDccEx
      currentX += item.width + NODE_GAP
    })

    // Peripheral mini-nodes below each IO device
    if (hasIoDevices) {
      ioDeviceList.forEach((_, i) => {
        const ioNodeId = `device-${ioDeviceList[i]}-${i}`
        const ioNode = nodes.find(n => n.id === ioNodeId)!
        const periphRowX = ioNode.x + (IO_W - PERIPH_ROW_W) / 2
        const periphRowY = ioNode.y + IO_H + PERIPH_OFFSET_Y

        PERIPHERAL_ICONS.forEach((iconPath, pi) => {
          const periphId = `periph-${ioNodeId}-${pi}`
          const px = periphRowX + pi * (PERIPH_SIZE + PERIPH_GAP)
          nodes.push({
            id: periphId, x: px, y: periphRowY,
            width: PERIPH_SIZE, height: PERIPH_SIZE,
            label: '', color: COLORS.peripheral, iconPath, layer: 3, mini: true,
          })
          // Short dashed connector from IO device bottom to this peripheral
          connections.push({
            id: `conn-${ioNodeId}-periph-${pi}`,
            fromId: ioNodeId, toId: periphId,
            label: '', color: CONN_COLORS.peripheral, type: 'peripheral',
            showLabel: false,
          })
        })
      })
    }

    // Height of layer 3 section (IO devices + their peripheral row if present)
    const layer3H = layer3Items.length > 0 ? Math.max(DCCEX_H, IO_H) : 0
    const ioExtraH = hasIoDevices ? PERIPH_ROW_H : 0
    y = layer3Y + layer3H + ioExtraH + LAYER_GAP

    // Layer 4: Track centered under the DCC-EX group
    if (config.track && hasDccEx) {
      const dccexGroupItems = layer3Items.filter(item => item.isDccEx)
      const firstId = dccexGroupItems[0].id
      const lastId = dccexGroupItems[dccexGroupItems.length - 1].id
      const firstDccexNode = nodes.find(n => n.id === firstId)!
      const lastDccexNode = nodes.find(n => n.id === lastId)!
      const groupCenterX = (firstDccexNode.x + lastDccexNode.x + lastDccexNode.width) / 2
      const trackX = groupCenterX - TRACK_W / 2

      nodes.push({
        id: 'track', x: trackX, y, width: TRACK_W, height: TRACK_H,
        label: 'Track / Trains', color: COLORS.track, iconPath: mdiFenceElectric, layer: 4,
      })
      y += TRACK_H
    }

    // Apps → Server (WebSocket)
    config.apps.forEach((appId, i) => {
      connections.push({
        id: `conn-${appId}-server`, fromId: `app-${appId}`, toId: 'server',
        label: 'WebSocket', color: CONN_COLORS.websocket, type: 'websocket',
        showLabel: true, iconPath: mdiCloud,
      })
    })

    // Server → each DCC-EX (USB)
    dccexInstances.forEach((_, i) => {
      connections.push({
        id: `conn-server-dccex-${i}`, fromId: 'server', toId: `dccex-${i}`,
        label: 'USB Serial', color: CONN_COLORS.usb, type: 'usb',
        showLabel: true, iconPath: mdiUsb,
      })
    })

    // Server → IO devices (MQTT)
    ioDeviceList.forEach((deviceId, i) => {
      connections.push({
        id: `conn-server-${deviceId}-${i}`, fromId: 'server', toId: `device-${deviceId}-${i}`,
        label: 'MQTT', color: CONN_COLORS.mqtt, type: 'mqtt',
        showLabel: true, iconPath: mdiWifi,
      })
    })

    // Each DCC-EX → Track (DCC +/-)
    if (config.track && hasDccEx) {
      dccexInstances.forEach((_, i) => {
        connections.push({
          id: `conn-dccex-${i}-track`, fromId: `dccex-${i}`, toId: 'track',
          label: 'DCC +/-', color: CONN_COLORS.dcc, type: 'dcc',
          showLabel: true, iconPath: mdiBolt,
        })
      })
    }
  }

  const height = y + 40

  // ── Area containers ────────────────────────────────────────────────────────
  const areas: AreaDef[] = []

  const YELLOW = 'rgb(234, 179, 8)'

  // DEJA.js area — apps (layer 1) + server (layer 2) only
  const dejaTopNodes = nodes.filter(n => n.layer <= 2 && !n.id.startsWith('dccex-'))

  if (dejaTopNodes.length > 0) {
    const minX = Math.min(...dejaTopNodes.map(n => n.x))
    const maxX = Math.max(...dejaTopNodes.map(n => n.x + n.width))
    const minY = Math.min(...dejaTopNodes.map(n => n.y))
    const maxY = Math.max(...dejaTopNodes.map(n => n.y + n.height))
    areas.push({
      id: 'area-deja', label: 'DEJA.js',
      x: minX - AREA_PAD - AREA_LABEL_STRIP, y: minY - AREA_PAD,
      width: maxX - minX + AREA_PAD * 2 + AREA_LABEL_STRIP,
      height: maxY - minY + AREA_PAD * 2,
      color: COLORS.app,
    })
  }

  // DEJA IO area (yellow) — Arduino, Pico W, and other MQTT IO devices
  const ioNodes3 = nodes.filter(n => n.layer === 3 && !n.id.startsWith('dccex-') && !n.mini)

  if (ioNodes3.length > 0) {
    const minX = Math.min(...ioNodes3.map(n => n.x))
    const maxX = Math.max(...ioNodes3.map(n => n.x + n.width))
    const minY = Math.min(...ioNodes3.map(n => n.y))
    const maxY = Math.max(...ioNodes3.map(n => n.y + n.height))
    areas.push({
      id: 'area-io', label: 'DEJA IO',
      x: minX - AREA_PAD - AREA_LABEL_STRIP, y: minY - AREA_PAD,
      width: maxX - minX + AREA_PAD * 2 + AREA_LABEL_STRIP,
      height: maxY - minY + AREA_PAD * 2,
      color: YELLOW,
    })
  }

  return { nodes, connections, areas, viewBox: `0 0 ${CANVAS_W} ${height}`, width: CANVAS_W, height }
}

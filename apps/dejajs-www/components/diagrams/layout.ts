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
  mdiLedStripVariant,
  mdiLightbulb,
  mdiElectricSwitch,
  mdiVolumeHigh,
  mdiPostLamp,
  mdiPower,
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

// Peripheral mini-node dimensions (count varies by config)
const PERIPH_SIZE = 32
const PERIPH_GAP = 14
const PERIPH_OFFSET_Y = 48   // gap from IO device bottom to peripheral row top (outside DEJA.js box)
const PERIPH_LABEL_H = 14    // space for label text below the circle

function periphRowWidth(count: number) {
  const cols = Math.min(count, PERIPH_MAX_PER_ROW)
  return cols * PERIPH_SIZE + (cols - 1) * PERIPH_GAP
}
function periphTotalHeight(count: number) {
  const rows = Math.ceil(count / PERIPH_MAX_PER_ROW)
  return PERIPH_OFFSET_Y + rows * (PERIPH_SIZE + PERIPH_LABEL_H) + (rows - 1) * PERIPH_ROW_GAP
}

// How many peripherals to show per IO device, by config id
const PERIPH_COUNTS: Record<string, number> = {
  tabletop: 3,
  withrottle: 3,
  shelf: 3,
  bedroom: 4,
  basement: 5,
  club: 6,
}
// Max peripherals per row — more than this wraps to a second row
const PERIPH_MAX_PER_ROW = 3
const PERIPH_ROW_GAP = 8  // vertical gap between peripheral rows

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

// All available peripheral types — configs pick a subset
const ALL_PERIPHERALS = [
  { icon: mdiLedStripVariant, label: 'IALED' },
  { icon: mdiLightbulb, label: 'Light' },
  { icon: mdiElectricSwitch, label: 'Relay' },
  { icon: mdiRotateRight, label: 'Servo' },
  { icon: mdiPostLamp, label: 'Signal' },
  { icon: mdiMotionSensor, label: 'Sensor' },
  { icon: mdiVolumeHigh, label: 'Sound' },
  { icon: mdiPower, label: 'Power' },
  { icon: mdiLedOn, label: 'LED' },
] as const

export function getLayout(config: DiagramConfig): DiagramLayout {
  const nodes: NodeDef[] = []
  const connections: ConnectionDef[] = []

  const hasApps = config.apps.length > 0
  const dccexInstances = config.devices.filter(d => d === 'dccex')
  const ioDeviceList = config.mqtt ? config.devices.filter(d => d !== 'dccex') : []
  const hasDccEx = dccexInstances.length > 0
  const hasIoDevices = ioDeviceList.length > 0

  // Peripheral count for this config
  const periphCount = PERIPH_COUNTS[config.id] ?? 3
  // Effective width of an IO device column = max(device box, peripheral row)
  const ioEffectiveW = Math.max(IO_W, periphRowWidth(periphCount))

  // All layer-3 items (DCC-EX instances first, then IO devices)
  // `slotWidth` is the horizontal space each item occupies for centering/spacing
  type Layer3Item = { id: string; isDccEx: boolean; deviceId: DeviceId; width: number; height: number; slotWidth: number }
  const layer3Items: Layer3Item[] = [
    ...dccexInstances.map((_, i) => ({
      id: `dccex-${i}`, isDccEx: true, deviceId: 'dccex' as DeviceId, width: DCCEX_W, height: DCCEX_H, slotWidth: DCCEX_W,
    })),
    ...ioDeviceList.map((deviceId, i) => ({
      id: `device-${deviceId}-${i}`, isDccEx: false, deviceId, width: IO_W, height: IO_H, slotWidth: ioEffectiveW,
    })),
  ]

  const hasDccExIoBoundary = dccexInstances.length > 0 && ioDeviceList.length > 0
  const layer3TotalW = layer3Items.length > 0
    ? layer3Items.reduce((s, item) => s + item.slotWidth, 0) +
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
        label: 'Track', color: COLORS.track, iconPath: mdiFenceElectric, layer: 4,
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

      // Center the device box within its slot (slot may be wider due to peripheral row)
      const boxX = currentX + (item.slotWidth - item.width) / 2

      if (item.isDccEx) {
        nodes.push({
          id: item.id, x: boxX, y: layer3Y, width: DCCEX_W, height: DCCEX_H,
          label: 'DCC-EX', sublabel: 'Command Station',
          color: COLORS.dccex, logoSrc: '/dcc-ex/android-chrome-512x512.png', layer: 3,
        })
      } else {
        nodes.push({
          id: item.id, x: boxX, y: layer3Y, width: IO_W, height: IO_H,
          label: DEVICE_LABELS[item.deviceId],
          color: COLORS.io, iconPath: DEVICE_ICONS[item.deviceId], layer: 3,
        })
      }
      prevWasDccEx = item.isDccEx
      currentX += item.slotWidth + NODE_GAP
    })

    // Peripheral mini-nodes below each IO device
    if (hasIoDevices) {
      let periphOffset = 0  // rotate through ALL_PERIPHERALS so each device gets variety
      ioDeviceList.forEach((_, i) => {
        const ioNodeId = `device-${ioDeviceList[i]}-${i}`
        const ioNode = nodes.find(n => n.id === ioNodeId)!
        const rowW = periphRowWidth(periphCount)
        const ioCenterX = ioNode.x + IO_W / 2
        const baseRowX = ioCenterX - rowW / 2
        const baseRowY = ioNode.y + IO_H + PERIPH_OFFSET_Y

        for (let pi = 0; pi < periphCount; pi++) {
          const row = Math.floor(pi / PERIPH_MAX_PER_ROW)
          const col = pi % PERIPH_MAX_PER_ROW
          // Center each row independently (last row may have fewer items)
          const itemsInRow = Math.min(PERIPH_MAX_PER_ROW, periphCount - row * PERIPH_MAX_PER_ROW)
          const thisRowW = itemsInRow * PERIPH_SIZE + (itemsInRow - 1) * PERIPH_GAP
          const thisRowX = ioCenterX - thisRowW / 2

          const periph = ALL_PERIPHERALS[(periphOffset + pi) % ALL_PERIPHERALS.length]
          const periphId = `periph-${ioNodeId}-${pi}`
          const px = thisRowX + col * (PERIPH_SIZE + PERIPH_GAP)
          const py = baseRowY + row * (PERIPH_SIZE + PERIPH_LABEL_H + PERIPH_ROW_GAP)
          nodes.push({
            id: periphId, x: px, y: py,
            width: PERIPH_SIZE, height: PERIPH_SIZE,
            label: periph.label, color: COLORS.peripheral, iconPath: periph.icon, layer: 3, mini: true,
          })
          connections.push({
            id: `conn-${ioNodeId}-periph-${pi}`,
            fromId: ioNodeId, toId: periphId,
            label: '', color: CONN_COLORS.peripheral, type: 'peripheral',
            showLabel: false,
          })
        }
        periphOffset += periphCount  // next IO device gets different peripherals
      })
    }

    // Height of layer 3 section (IO devices + their peripheral rows if present)
    const layer3H = layer3Items.length > 0 ? Math.max(DCCEX_H, IO_H) : 0
    const ioExtraH = hasIoDevices ? periphTotalHeight(periphCount) : 0
    y = layer3Y + layer3H + ioExtraH + LAYER_GAP

    // Layer 4: Track blocks — one per DCC-EX on "full", single track otherwise
    if (config.track && hasDccEx) {
      const dccexGroupItems = layer3Items.filter(item => item.isDccEx)

      if (dccexInstances.length > 1) {
        // Multiple DCC-EX → separate track blocks, each centered under its DCC-EX
        const BLOCK_GAP = 24
        const BLOCK_W = TRACK_W  // each block is the same width as a single track
        dccexGroupItems.forEach((item, i) => {
          const dccexNode = nodes.find(n => n.id === item.id)!
          const blockCenterX = dccexNode.x + dccexNode.width / 2
          const blockX = blockCenterX - BLOCK_W / 2
          nodes.push({
            id: `track-block-${i}`, x: blockX, y, width: BLOCK_W, height: TRACK_H,
            label: `Block ${i + 1}`, color: COLORS.track, iconPath: mdiFenceElectric, layer: 4,
          })
        })
        y += TRACK_H
      } else {
        // Single DCC-EX → one track centered under it
        const firstDccexNode = nodes.find(n => n.id === dccexGroupItems[0].id)!
        const groupCenterX = firstDccexNode.x + firstDccexNode.width / 2
        const trackX = groupCenterX - TRACK_W / 2
        nodes.push({
          id: 'track', x: trackX, y, width: TRACK_W, height: TRACK_H,
          label: 'Track', color: COLORS.track, iconPath: mdiFenceElectric, layer: 4,
        })
        y += TRACK_H
      }
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

    // Server → IO devices (USB for Arduino, MQTT for wireless devices)
    ioDeviceList.forEach((deviceId, i) => {
      const isUsb = deviceId === 'arduino'
      connections.push({
        id: `conn-server-${deviceId}-${i}`, fromId: 'server', toId: `device-${deviceId}-${i}`,
        label: isUsb ? 'USB Serial' : 'MQTT',
        color: isUsb ? CONN_COLORS.usb : CONN_COLORS.mqtt,
        type: isUsb ? 'usb' : 'mqtt',
        showLabel: true, iconPath: isUsb ? mdiUsb : mdiWifi,
      })
    })

    // Each DCC-EX → its track block (or single track)
    if (config.track && hasDccEx) {
      dccexInstances.forEach((_, i) => {
        const trackId = dccexInstances.length > 1 ? `track-block-${i}` : 'track'
        connections.push({
          id: `conn-dccex-${i}-track`, fromId: `dccex-${i}`, toId: trackId,
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

  // DEJA IO area (yellow) — Arduino, Pico W, MQTT IO devices + their peripherals
  const ioAllNodes = nodes.filter(n => n.layer === 3 && !n.id.startsWith('dccex-'))

  if (ioAllNodes.length > 0) {
    const minX = Math.min(...ioAllNodes.map(n => n.x))
    const maxX = Math.max(...ioAllNodes.map(n => n.x + n.width))
    const minY = Math.min(...ioAllNodes.filter(n => !n.mini).map(n => n.y))
    const maxY = Math.max(...ioAllNodes.map(n => n.y + n.height))
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

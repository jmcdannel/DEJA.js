import type { ConnectionDef, NodeDef, ConnectionType } from './types'

const MARKER_ID: Partial<Record<ConnectionType, string>> = {
  websocket: 'arrowhead-ws',
  usb: 'arrowhead-usb',
  mqtt: 'arrowhead-mqtt',
  dcc: 'arrowhead-dcc',
  wifi: 'arrowhead-wifi',
  // 'peripheral' intentionally omitted — no arrowhead
}

const ICON_SIZE = 20
const ICON_SCALE = ICON_SIZE / 24
const ICON_BG_R = 13  // backdrop circle radius

interface DiagramArrowProps {
  connection: ConnectionDef
  nodes: NodeDef[]
}

export function DiagramArrow({ connection, nodes }: DiagramArrowProps) {
  const fromNode = nodes.find(n => n.id === connection.fromId)
  const toNode = nodes.find(n => n.id === connection.toId)

  if (!fromNode || !toNode) return null

  const fromCenterX = fromNode.x + fromNode.width / 2
  const toCenterX = toNode.x + toNode.width / 2
  const dx = toCenterX - fromCenterX

  // Fan out multiple connections from the same node
  const maxBias = fromNode.width * 0.35
  const bias = Math.tanh(dx / 150) * maxBias

  const sx = fromCenterX + bias
  const sy = fromNode.y + fromNode.height
  const tx = toCenterX
  const ty = toNode.y
  const midY = (sy + ty) / 2

  const d = `M ${sx} ${sy} C ${sx} ${midY}, ${tx} ${midY}, ${tx} ${ty}`

  const iconX = (sx + tx) / 2 - ICON_SIZE / 2
  const iconY = (sy + ty) / 2 - ICON_SIZE / 2

  // Peripheral connections: thin straight dashed line, no arrowhead, no label
  if (connection.type === 'peripheral') {
    return (
      <line
        x1={sx} y1={sy} x2={tx} y2={ty}
        stroke={connection.color}
        strokeWidth={1}
        strokeOpacity={0.45}
        strokeDasharray="3 3"
      />
    )
  }

  const markerId = MARKER_ID[connection.type]

  return (
    <g>
      <path
        d={d}
        stroke={connection.color}
        strokeWidth={2}
        strokeOpacity={0.85}
        fill="none"
        markerEnd={markerId ? `url(#${markerId})` : undefined}
      />
      {/* Icon badge — dark backdrop + colored icon so it doesn't compete with the line */}
      {connection.showLabel && connection.iconPath && (
        <g>
          <circle
            cx={iconX + ICON_SIZE / 2}
            cy={iconY + ICON_SIZE / 2}
            r={ICON_BG_R}
            fill="rgb(15, 23, 42)"
            fillOpacity={0.85}
          />
          <path
            d={connection.iconPath}
            fill={connection.color}
            fillOpacity={0.95}
            transform={`translate(${iconX}, ${iconY}) scale(${ICON_SCALE})`}
          />
        </g>
      )}
    </g>
  )
}

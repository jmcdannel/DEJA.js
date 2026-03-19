import type { DiagramConfig, AreaDef } from './types'
import { getLayout, CONN_COLORS } from './layout'
import { CONFIG_MAP } from './configs'
import { DiagramNode } from './DiagramNode'
import { DiagramArrow } from './DiagramArrow'
import { DiagramArea } from './DiagramArea'

interface ArchitectureDiagramProps {
  config: DiagramConfig | string
  width?: number
  className?: string
  overrideAreas?: AreaDef[]
  showLegend?: boolean
}

// One arrowhead marker per connection type — IDs must match DiagramArrow's MARKER_ID map
const ARROWHEAD_DEFS = [
  { id: 'arrowhead-ws', color: CONN_COLORS.websocket },
  { id: 'arrowhead-usb', color: CONN_COLORS.usb },
  { id: 'arrowhead-mqtt', color: CONN_COLORS.mqtt },
  { id: 'arrowhead-dcc', color: CONN_COLORS.dcc },
  { id: 'arrowhead-wifi', color: CONN_COLORS.wifi },
] as const

const LEGEND_H = 44
const LEGEND_ITEMS = [
  { label: 'DEJA.js platform', color: CONN_COLORS.websocket },
  { label: 'DEJA IO devices', color: CONN_COLORS.mqtt },
  { label: 'DCC-EX (3rd party)', color: CONN_COLORS.usb },
  { label: 'Connected peripherals', color: CONN_COLORS.peripheral },
] as const

export function ArchitectureDiagram({
  config: configProp,
  width,
  className,
  overrideAreas,
  showLegend = true,
}: ArchitectureDiagramProps) {
  const config = typeof configProp === 'string' ? CONFIG_MAP[configProp] : configProp
  if (!config) return null

  const layout = getLayout(config)
  const areas = overrideAreas ?? layout.areas

  const totalHeight = layout.height + (showLegend ? LEGEND_H : 0)
  const aspectRatio = totalHeight / layout.width

  // Responsive when no explicit width is given
  const svgWidth: number | string = width ?? '100%'
  const svgHeight: number | undefined = width != null ? Math.round(width * aspectRatio) : undefined

  return (
    <svg
      viewBox={`0 0 ${layout.width} ${totalHeight}`}
      width={svgWidth}
      height={svgHeight}
      style={width == null ? { height: 'auto' } : undefined}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`DEJA.js architecture diagram — ${config.label} configuration`}
    >
      <defs>
        {ARROWHEAD_DEFS.map(({ id, color }) => (
          <marker
            key={id}
            id={id}
            markerWidth="10"
            markerHeight="7"
            refX="8"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill={color} fillOpacity={0.85} />
          </marker>
        ))}
      </defs>

      {/* Areas render first — behind everything */}
      {areas.map(area => (
        <DiagramArea key={area.id} area={area} />
      ))}

      {/* Connections behind nodes */}
      {layout.connections.map(conn => (
        <DiagramArrow key={conn.id} connection={conn} nodes={layout.nodes} />
      ))}

      {layout.nodes.map(node => (
        <DiagramNode key={node.id} node={node} />
      ))}

      {/* Legend row */}
      {showLegend && LEGEND_ITEMS.map((item, i) => {
        const spacing = layout.width / (LEGEND_ITEMS.length + 1)
        const cx = spacing * (i + 1)
        const cy = layout.height + 22
        return (
          <g key={item.label}>
            <circle cx={cx} cy={cy} r={6} fill={item.color} fillOpacity={0.9} />
            <text
              x={cx + 14}
              y={cy + 5}
              fontSize={12}
              fontFamily="system-ui, -apple-system, sans-serif"
              fill="rgba(255,255,255,0.6)"
            >
              {item.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

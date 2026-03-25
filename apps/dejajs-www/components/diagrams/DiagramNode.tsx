import type { NodeDef } from './types'

// MDI paths are designed for a 24×24 viewBox; we display them at IMG_SIZE × IMG_SIZE
const IMG_SIZE = 52
const PADDING_TOP = 10
const FONT_SIZE_PRIMARY = 12
const FONT_SIZE_SUB = 10

// Mini peripheral node — circle with icon + label below
const MINI_R = 16
const MINI_ICON_SIZE = 16
const MINI_ICON_SCALE = MINI_ICON_SIZE / 24
const MINI_LABEL_SIZE = 9

interface DiagramNodeProps {
  node: NodeDef
}

// Stadium oval track — straight sides + semicircular ends (like a real model railroad)
const TRACK_TOP_PAD = 10
const TRACK_OUTER_RH = 30      // end semicircle radius (= oval half-height)
const TRACK_INNER_RH = 21      // inner rail radius
const TRACK_OVAL_PAD_X = 10   // left/right padding inside node

// SVG path for a stadium shape: two straights + two semicircles
function stadiumPath(cx: number, cy: number, rh: number, sh: number): string {
  return [
    `M ${cx - sh} ${cy - rh}`,
    `L ${cx + sh} ${cy - rh}`,
    `A ${rh} ${rh} 0 0 1 ${cx + sh} ${cy + rh}`,
    `L ${cx - sh} ${cy + rh}`,
    `A ${rh} ${rh} 0 0 1 ${cx - sh} ${cy - rh}`,
    'Z',
  ].join(' ')
}

export function DiagramNode({ node }: DiagramNodeProps) {
  // ── Track node — stadium oval loop ─────────────────────────────────────────
  if (node.id === 'track' || node.id.startsWith('track-block-')) {
    const { x, y, width, height, label, color } = node
    const isBlock = node.id.startsWith('track-block-')
    const blockIdx = isBlock ? Number(node.id.split('-').pop()) : -1
    // Blocks use slightly different hue to distinguish power districts
    const blockOpacity = isBlock ? (blockIdx === 0 ? 0.9 : 0.65) : 0.9
    const cx = x + width / 2
    const cy = y + TRACK_TOP_PAD + TRACK_OUTER_RH
    const sh = width / 2 - TRACK_OVAL_PAD_X - TRACK_OUTER_RH  // straight half-length
    const primaryTextY = cy + TRACK_OUTER_RH + 8 + FONT_SIZE_PRIMARY

    // Straight-section ties (top + bottom, 8 each)
    const STRAIGHT_TIES = 8
    const straightTies = Array.from({ length: STRAIGHT_TIES }, (_, i) => {
      const tx = cx - sh + (i / (STRAIGHT_TIES - 1)) * sh * 2
      return [
        { x1: tx, y1: cy - TRACK_OUTER_RH, x2: tx, y2: cy - TRACK_INNER_RH },
        { x1: tx, y1: cy + TRACK_INNER_RH, x2: tx, y2: cy + TRACK_OUTER_RH },
      ]
    }).flat()

    // Curved-end ties (5 per end)
    const CURVE_TIES = 5
    const curveTies = Array.from({ length: CURVE_TIES }, (_, i) => {
      const angle = -Math.PI / 2 + ((i + 0.5) / CURVE_TIES) * Math.PI
      const cos = Math.cos(angle), sin = Math.sin(angle)
      return [
        // right end
        { x1: cx + sh + TRACK_INNER_RH * cos, y1: cy + TRACK_INNER_RH * sin,
          x2: cx + sh + TRACK_OUTER_RH * cos, y2: cy + TRACK_OUTER_RH * sin },
        // left end
        { x1: cx - sh - TRACK_INNER_RH * cos, y1: cy + TRACK_INNER_RH * sin,
          x2: cx - sh - TRACK_OUTER_RH * cos, y2: cy + TRACK_OUTER_RH * sin },
      ]
    }).flat()

    return (
      <g>
        <rect x={x} y={y} width={width} height={height} rx={10} ry={10}
          fill={color} fillOpacity={isBlock ? 0.08 : 0.12} stroke={color} strokeWidth={2}
          strokeDasharray={isBlock ? '6 3' : undefined} />
        {[...straightTies, ...curveTies].map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={color} strokeWidth={2} strokeOpacity={0.4 * blockOpacity} />
        ))}
        <path d={stadiumPath(cx, cy, TRACK_OUTER_RH, sh)}
          fill="none" stroke={color} strokeWidth={2.5} strokeOpacity={blockOpacity} />
        <path d={stadiumPath(cx, cy, TRACK_INNER_RH, sh)}
          fill="none" stroke={color} strokeWidth={2.5} strokeOpacity={blockOpacity} />
        <text x={cx} y={primaryTextY} textAnchor="middle"
          fontSize={FONT_SIZE_PRIMARY} fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="700" fill={color} fillOpacity={blockOpacity}>
          {label}
        </text>
      </g>
    )
  }

  // ── Mini / peripheral mode ─────────────────────────────────────────────────
  if (node.mini) {
    const cx = node.x + node.width / 2
    const cy = node.y + node.height / 2
    return (
      <g>
        <circle
          cx={cx} cy={cy} r={MINI_R}
          fill={node.color} fillOpacity={0.18}
          stroke={node.color} strokeWidth={1.5} strokeOpacity={0.65}
        />
        {node.iconPath && (
          <path
            d={node.iconPath}
            fill={node.color}
            fillOpacity={0.9}
            transform={`translate(${cx - MINI_ICON_SIZE / 2}, ${cy - MINI_ICON_SIZE / 2}) scale(${MINI_ICON_SCALE})`}
          />
        )}
        {node.label && (
          <text
            x={cx}
            y={cy + MINI_R + MINI_LABEL_SIZE + 2}
            textAnchor="middle"
            fontSize={MINI_LABEL_SIZE}
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="600"
            fill={node.color}
            fillOpacity={0.75}
          >
            {node.label}
          </text>
        )}
      </g>
    )
  }

  // ── Standard mode ──────────────────────────────────────────────────────────
  const { x, y, width, height, label, sublabel, color, logoSrc, iconPath } = node

  const hasMedia = !!(logoSrc || iconPath)
  const imgX = x + (width - IMG_SIZE) / 2
  const imgY = y + PADDING_TOP
  const mdiScale = IMG_SIZE / 24

  // Vertical text placement
  let primaryTextY: number
  if (hasMedia) {
    primaryTextY = imgY + IMG_SIZE + 6 + FONT_SIZE_PRIMARY
  } else if (sublabel) {
    primaryTextY = y + height / 2 - 4
  } else {
    primaryTextY = y + height / 2 + FONT_SIZE_PRIMARY / 2
  }

  return (
    <g>
      {/* Node background */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={10}
        ry={10}
        fill={color}
        fillOpacity={0.12}
        stroke={color}
        strokeWidth={2}
      />

      {/* PNG logo */}
      {logoSrc && !iconPath && (
        <image
          href={logoSrc}
          x={imgX}
          y={imgY}
          width={IMG_SIZE}
          height={IMG_SIZE}
          preserveAspectRatio="xMidYMid meet"
        />
      )}

      {/* MDI icon path */}
      {iconPath && (
        <path
          d={iconPath}
          fill={color}
          fillOpacity={0.9}
          transform={`translate(${imgX}, ${imgY}) scale(${mdiScale})`}
        />
      )}

      {/* Primary label */}
      <text
        x={x + width / 2}
        y={primaryTextY}
        textAnchor="middle"
        fontSize={FONT_SIZE_PRIMARY}
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="700"
        fill={color}
      >
        {label}
      </text>

      {/* Sublabel */}
      {sublabel && (
        <text
          x={x + width / 2}
          y={primaryTextY + FONT_SIZE_PRIMARY + 3}
          textAnchor="middle"
          fontSize={FONT_SIZE_SUB}
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="500"
          fill={color}
          fillOpacity={0.75}
        >
          {sublabel}
        </text>
      )}
    </g>
  )
}

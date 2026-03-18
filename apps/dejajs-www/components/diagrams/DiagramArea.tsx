import type { AreaDef } from './types'

const LABEL_STRIP = 32

interface DiagramAreaProps {
  area: AreaDef
}

export function DiagramArea({ area }: DiagramAreaProps) {
  const labelCX = area.x + LABEL_STRIP / 2
  const labelCY = area.labelAnchorY ?? area.y + area.height / 2

  const sharedStyle = {
    fill: area.color,
    fillOpacity: 0.06,
    stroke: area.color,
    strokeOpacity: 0.35,
    strokeWidth: 1.5,
    strokeDasharray: '8 5',
  }

  return (
    <g>
      {area.points ? (
        // L-shape or other polygon — right-angle corners, no rx/ry
        <polygon points={area.points} {...sharedStyle} />
      ) : (
        <rect
          x={area.x}
          y={area.y}
          width={area.width}
          height={area.height}
          rx={14}
          ry={14}
          {...sharedStyle}
        />
      )}
      {/* Rotated label on the left edge */}
      <text
        x={labelCX}
        y={labelCY}
        textAnchor="middle"
        fontSize={11}
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="700"
        fill={area.color}
        fillOpacity={0.75}
        letterSpacing="3"
        transform={`rotate(-90, ${labelCX}, ${labelCY})`}
      >
        {area.label.toUpperCase()}
      </text>
    </g>
  )
}

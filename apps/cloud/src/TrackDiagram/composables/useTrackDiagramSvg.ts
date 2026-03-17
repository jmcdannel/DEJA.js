import { DEFAULT_TRACK_COLORS } from '../constants'
import { backgroundSvg, turnoutForkSvg, turnoutLabelSvg, routeMarkerSvg } from '../templates/svgTemplates'

interface VueFlowNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: Record<string, unknown>
}

interface VueFlowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  data: { trackLine: string; color: string; strokeWidth: number; pathType: string }
}

function buildEdgePath(
  sourcePos: { x: number; y: number },
  targetPos: { x: number; y: number },
  pathType: string
): string {
  if (pathType === 'straight') {
    return `M${sourcePos.x},${sourcePos.y} L${targetPos.x},${targetPos.y}`
  }
  const cx1 = sourcePos.x + (targetPos.x - sourcePos.x) * 0.5
  const cy1 = sourcePos.y
  const cx2 = sourcePos.x + (targetPos.x - sourcePos.x) * 0.5
  const cy2 = targetPos.y
  return `M${sourcePos.x},${sourcePos.y} C${cx1},${cy1} ${cx2},${cy2} ${targetPos.x},${targetPos.y}`
}

export function generateSvg(
  nodes: VueFlowNode[],
  edges: VueFlowEdge[],
  viewBox: { width: number; height: number }
): string {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))

  // 1. Background
  const background = backgroundSvg(viewBox.width, viewBox.height)

  // 2. Lines -- group edges by trackLine
  const edgesByLine = new Map<string, string[]>()
  for (const edge of edges) {
    const trackLine = edge.data?.trackLine || 'Mainline'
    const source = nodeMap.get(edge.source)
    const target = nodeMap.get(edge.target)
    if (!source || !target) continue

    const color = edge.data?.color || DEFAULT_TRACK_COLORS[trackLine] || '#888'
    const sw = edge.data?.strokeWidth || 3
    const d = buildEdgePath(source.position, target.position, edge.data?.pathType || 'curve')
    const path = `<path d="${d}" style="fill:none;stroke:${color};stroke-width:${sw}px;stroke-linecap:round;"/>`

    if (!edgesByLine.has(trackLine)) edgesByLine.set(trackLine, [])
    edgesByLine.get(trackLine)!.push(path)
  }

  let linesGroup = '<g id="Lines">'
  for (const [lineName, paths] of edgesByLine) {
    linesGroup += `\n  <g id="${lineName}">\n    ${paths.join('\n    ')}\n  </g>`
  }
  linesGroup += '\n</g>'

  // 3. Turnouts
  const turnoutNodes = nodes.filter((n) => n.type === 'turnout')
  let turnoutsGroup = '<g id="Turnouts">'
  for (const node of turnoutNodes) {
    const id = (node.data.turnoutId as string) || node.id
    const rotation = (node.data.rotation as number) || 0
    turnoutsGroup += `\n  ${turnoutForkSvg(id, node.position.x, node.position.y, rotation)}`
  }
  turnoutsGroup += '\n</g>'

  // 4. TurnoutLabels
  let turnoutLabelsGroup = '<g id="TurnoutLabels">'
  for (const node of turnoutNodes) {
    const id = (node.data.turnoutId as string) || node.id
    const label = (node.data.label as string) || id
    turnoutLabelsGroup += `\n  ${turnoutLabelSvg(id, node.position.x, node.position.y - 25, label)}`
  }
  turnoutLabelsGroup += '\n</g>'

  // 5. Routes
  const stationNodes = nodes.filter((n) => n.type === 'station')
  let routesGroup = '<g id="Routes">'
  for (const node of stationNodes) {
    const id = (node.data.routePointId as string) || node.id
    const label = (node.data.label as string) || id
    const color = (node.data.color as string) || 'rgb(143,217,38)'
    routesGroup += `\n  ${routeMarkerSvg(id, node.position.x, node.position.y, label, color)}`
  }
  routesGroup += '\n</g>'

  // 6. Assembly
  return `<svg width="100%" height="100%" viewBox="0 0 ${viewBox.width} ${viewBox.height}" xmlns="http://www.w3.org/2000/svg" style="fill-rule:evenodd;clip-rule:evenodd;">
${background}
${linesGroup}
${turnoutsGroup}
${turnoutLabelsGroup}
${routesGroup}
</svg>`
}

interface CssNode {
  type: string
  data: { turnoutId?: string; routePointId?: string }
}

export function generateCss(nodes: CssNode[]): string {
  const turnoutIds = nodes
    .filter((n) => n.type === 'turnout' && n.data.turnoutId)
    .map((n) => n.data.turnoutId!)

  const routePointIds = nodes
    .filter((n) => n.type === 'station' && n.data.routePointId)
    .map((n) => n.data.routePointId!)

  let css = `:root {
  --turnout-hover-fill: rgb(253, 35, 253);
  --route-selected-fill: rgb(0, 255, 17);
  --route-available-fill: rgb(254, 217, 33);
  --route-hover-fill: rgb(254, 217, 33);
}

#TurnoutLabels > g,
#Routes > g {
  cursor: pointer;
}
#TurnoutLabels > g:hover {
  fill-opacity: .8;
}
#TurnoutLabels > g:hover circle {
  fill: var(--turnout-hover-fill) !important;
  fill-opacity: .8 !important;
}

#Routes > g:hover path {
  fill: var(--route-hover-fill) !important;
  fill-opacity: .8 !important;
}

.p1-selected #Routes > g path {
  fill-opacity: .1 !important;
}
.p1-selected #Routes > g text {
  opacity: .05 !important;
}
`

  for (const id of turnoutIds) {
    css += `
.${id}-straight #Turnouts #${id} > g:last-child { visibility: hidden; }
.${id}-straight #Turnouts #${id} > g:first-child path { stroke: black !important; }
.${id}-divergent #Turnouts #${id} > g:first-child { visibility: hidden; }
.${id}-divergent #Turnouts #${id} > g:last-child path { stroke: black !important; }
`
  }

  for (const point of routePointIds) {
    const P = point.toUpperCase().replace(/\s+/g, '')
    css += `
.selected-${P} #Routes > g#${P} path { fill: var(--route-selected-fill) !important; fill-opacity: .8 !important; }
.selected-${P} #Routes > g#${P} text { opacity: 1 !important; }
.available-${P} #Routes > g#${P} path { fill: var(--route-available-fill) !important; fill-opacity: .8 !important; }
.available-${P} #Routes > g#${P} text { opacity: 1 !important; }
`
  }

  return css
}

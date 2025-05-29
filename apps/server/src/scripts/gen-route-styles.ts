import fs from 'fs/promises'
import path from 'path'
import { getDocs, collection, query, where } from 'firebase/firestore'
import { db } from '@repo/firebase-config/firebase-node'
import type { Effect } from '@repo/modules/effects'
import type { Turnout } from '@repo/modules/turnouts'

const layoutId = process.env.LAYOUT_ID

console.log('Generating route styles for layout:', layoutId)
if (!layoutId) {
  throw new Error('LAYOUT_ID environment variable is not set')
}

function formatPoint(point: string) {
  return point.toUpperCase().replace(/\s+/g, '')
}

async function generateRouteCss() {
  const routesQuery = query(
    collection(db, `layouts/${layoutId}/effects`),
    where('type', '==', 'route')
  )

  const routeSnapshots = await getDocs(routesQuery)
  const routes: Effect[] = routeSnapshots.docs.map(
    (doc) =>
      ({
        ...doc.data(),
        id: doc.id,
      } as Effect)
  )
  const points = routes.reduce((acc, route) => {
    if (route.point1) acc.add(formatPoint(route.point1))
    if (route.point2) acc.add(formatPoint(route.point2))
    return acc
  }, new Set<string>())

  console.log('Found points:', points)

  const turnoutQuery = query(collection(db, `layouts/${layoutId}/turnouts`))
  const turnoutSnapshots = await getDocs(turnoutQuery)
  const turnouts: Turnout[] = turnoutSnapshots.docs.map(
    (doc) =>
      ({
        ...doc.data(),
        id: doc.id,
      } as Turnout)
  )

  console.log('Found turnouts:', turnouts)

  let css = `

:root {
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

.selected-PSUBM1 #Routes > g#PSUBM1 path {
  fill: var(--route-selected-fill) !important;
  fill-opacity: .8 !important;
}
`

  turnouts.forEach((turnout) => {
    css += `
.${turnout.id}-straight
  #Turnouts
  #${turnout.id}
  > g:last-child {
  visibility: hidden;
}

.${turnout.id}-straight
  #Turnouts
  #${turnout.id}
  > g:first-child
  path {
  stroke: black !important;
}
.${turnout.id}-divergent
  #Turnouts
  #${turnout.id}
  > g:first-child {
  visibility: hidden;
}

.${turnout.id}-divergent
  #Turnouts
  #${turnout.id}
  > g:last-child
  path {
  stroke: black !important;
}
  `
  })

  // Generate specific route styles
  points.forEach((point) => {
    css += `
/* Styles for route: ${point} */
.selected-${point} #Routes > g#${point} path {
  fill: var(--route-selected-fill) !important;
  fill-opacity: .8 !important;
}

.selected-${point} #Routes > g#${point} text {
  opacity: 1 !important;
}

.available-${point} #Routes > g#${point} path {
  fill: var(--route-available-fill) !important;
  fill-opacity: .8 !important;
}

.available-${point} #Routes > g#${point} text {
  opacity: 1 !important;
}
`
  })

  return css
}

async function writeRouteCssFile() {
  try {
    const css = await generateRouteCss()
    const filePath = path.resolve('./route-styles.css')
    await fs.writeFile(filePath, css)
    console.log('Route CSS file generated successfully!')
  } catch (error) {
    console.error('Error generating route CSS:', error)
  }
}

async function main() {
  await writeRouteCssFile()
}

main().catch((error) => {
  console.error('Error in main function:', error)
})

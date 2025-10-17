import { computed, ref, watch } from 'vue'
import { useCollection } from 'vuefire'
import { useEfx, useTurnouts, useLayoutRoutes, type Effect } from '@repo/modules'

const DELAY = 2000 // ms delay between turnouts being set in a route

export const useLayoutRoutesMap = () => {
  const clickableContainers = ['Routes', 'Turnouts', 'TurnoutLabels']

  const p1 = ref<string | null>(null)
  const p2 = ref<string | null>(null)

  const { getTurnout, getTurnouts, switchTurnout } = useTurnouts()
  const { getEffectsByType } = useEfx()
  const { runRoute } = useLayoutRoutes()
  const list = useCollection(getEffectsByType('route'), { ssrKey: 'routes' })
  const turnouts = getTurnouts()
  const routeTurnouts = ref<any[]>([])

  const routes = computed(() =>
    list.data.value?.filter((item) => item.type === 'route')
  )

  watch([p1, p2], async ([newP1, newP2]) => {
    if (newP1 !== null && newP2 !== null) {
      console.log('watch p1 and p2', newP1, newP2, routes)
      const route = routes.value?.find(
        (r) =>
          (r.point1 === newP1 && r.point2 === newP2) ||
          (r.point1 === newP2 && r.point2 === newP1)
      )
      if (route) {
        routeTurnouts.value = [...(route.on || [])]
        await runRoute(route as Effect)   
        setTimeout(() => {
          p1.value = null
          p2.value = null
          routeTurnouts.value = []
        }, routeTurnouts.value.length * DELAY + 500)
      } else {
        console.log('No route found between', newP1, 'and', newP2, routes.value)
      }
    }
  })

  function getMapClasses(): string {
    let classes = ['']
    // console.log('getMapClasses', p1.value, p2.value, routes.value)

    if (p1.value) {
      classes.push('p1-selected')
    }
    if (p2.value) {
      classes.push('p2-selected')
    }

    turnouts.value.forEach((turnout) => {
      if (turnout.state) {
        classes.push(`${turnout.id}-straight`)
      } else {
        classes.push(`${turnout.id}-divergent`)
      }
    })

    routes.value?.forEach((route) => {
      if (route.point1 === p1.value) {
        classes.push(`selected-${route.point1}`)
        classes.push(`available-${route.point2}`)
      } else if (route.point2 === p1.value) {
        classes.push(`selected-${route.point2}`)
        classes.push(`available-${route.point1}`)
      }
    })

    return classes.join(' ')
  }

  function findClickableParent(
    target: EventTarget | null
  ): { target: HTMLElement; type: string } | null {
    if (!target) return null

    const currentTarget = target as HTMLElement
    
    // Recursively check parent nodes to find a clickable parent
    function findClickableParentNode(node: HTMLElement | null): HTMLElement | null {
      if (!node) return null
      
      // Check if current node is clickable
      if (clickableContainers.indexOf(node.id || '') !== -1) {
        return node
      }
      
      // Check parent node recursively
      const parentNode = node.parentNode as HTMLElement
      return findClickableParentNode(parentNode)
    }

    // Find the clickable parent
    const clickableParent = findClickableParentNode(currentTarget)
    if (!clickableParent) return null

    // Find the direct child of the clickable parent that contains the clicked element
    function findDirectChildOfContainer(clickedNode: HTMLElement, container: HTMLElement): HTMLElement {
      let current = clickedNode
      while (current && current.parentNode !== container) {
        current = current.parentNode as HTMLElement
        if (!current) break
      }
      return current || clickedNode
    }

    // Return the direct child of the container with the type from the clickable parent
    const directChild = findDirectChildOfContainer(currentTarget, clickableParent)
    return { 
      target: directChild, 
      type: clickableParent.id 
    }
  }

  async function toggleTurnout(id: string): Promise<void> {
    const turnout = await getTurnout(id)
    if (turnout) {
      await switchTurnout({ ...turnout })
    }
  }

  async function handleMapClick2(e: MouseEvent) {
    console.log('handleMapClick', e.target)
    const clickableParent = findClickableParent(e.target)
    if (!clickableParent) return

    const { target, type } = clickableParent
    const targetType = target?.id

    if (type === 'Turnouts') {
      const turnoutId = target?.getAttribute('data-turnout-id')
      if (turnoutId) {
        await toggleTurnout(turnoutId)
      }
    } else if (type === 'Routes') {
      const routeId = target?.getAttribute('data-route-id')
      if (routeId) {
        const route = routes.value?.find((r) => r.id === routeId)
        if (route) {
          // await runRoute(route as Effect)
        }
      }
    }
  }

  

  async function handleMapClick(e: MouseEvent) {
    e.preventDefault()
    const svgBtn = findClickableParent(e.target)
    console.log('handleMapClick', svgBtn, svgBtn?.type, routes)
    if (svgBtn) {
      switch (svgBtn.type) {
        case 'Routes':
          if (p1.value === null) {
            p1.value = svgBtn.target.id
          } else if (p2.value === null) {
            p2.value = svgBtn.target.id
          } else {
            p1.value = svgBtn.target.id
            p2.value = null
          }
          break
        case 'Turnouts':
        case 'TurnoutLabels':
            await toggleTurnout(svgBtn.target.id.replace('lbl', ''))
          break
        default:
          // noop
          break
      }
    }
  }

  // async function runRoute(route: Effect): Promise<void> {
    // if (!route.id) return

    // isRunning.value = true
    // percentComplete.value = 0

    // const steps = (route?.on?.length || 0) + (route?.off?.length || 0)
    // console.log('Running route:', steps, route)

    // await runEffect({ ...route, state: true, type: route.type })

    // const interval = setInterval(() => {
    //   if (percentComplete.value < 100) {
    //     percentComplete.value += 100 / steps
    //   }
    // }, 1000)

    // setTimeout(() => {
    //   clearInterval(interval)
    //   percentComplete.value = 0
    //   isRunning.value = false
    // }, steps * 1000 + 500)
  // }

  function clearP1() {
    p1.value = null
  }

  function clearP2() {
    p2.value = null
  }

  return {
    p1,
    p2,
    routes,
    routeTurnouts,
    getMapClasses,
    handleMapClick,
    clearP1,
    clearP2,
  }
}

import { computed, ref, watch } from 'vue'
import { useCollection } from 'vuefire'
import type { Effect } from '@repo/modules/effects'
import { useEfx } from '@repo/modules/effects'
import { useTurnouts } from '@repo/modules/turnouts'

export const useLayoutRoutes = () => {
  const clickableContainers = ['Routes', 'Turnouts', 'TurnoutLabels']

  const p1 = ref<string | null>(null)
  const p2 = ref<string | null>(null)
  const isRunning = ref(false)
  const percentComplete = ref(0)

  const { getTurnout, getTurnouts, switchTurnout } = useTurnouts()
  const { getEffectsByType, runEffect, getEffect } = useEfx()
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
        isRunning.value = true
        percentComplete.value = 0
        routeTurnouts.value = [...(route.on || []), ...(route.off || [])]
        runEffect({ ...route, id: route.id, state: true, type: route.type })
        const steps = (route?.on?.length || 0) + (route?.off?.length || 0)
        console.log('Route found:', steps, route)

        const interval = setInterval(() => {
          if (percentComplete.value < 100) {
            percentComplete.value += 100 / steps
            console.log('Percent complete:', percentComplete.value)
          }
        }, 1000)

        // Clear the interval after the effect is done
        setTimeout(() => {
          clearInterval(interval)
          percentComplete.value = 0
          p1.value = null
          p2.value = null
          isRunning.value = false
        }, steps * 1000 + 500)
      } else {
        console.log('No route found between', newP1, 'and', newP2, routes.value)
      }
    }
  })

  function getMapClasses(): string {
    let classes = ['']
    console.log('getMapClasses', p1.value, p2.value, routes.value)

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
    const parentNode = currentTarget.parentNode as HTMLElement

    if (
      clickableContainers.indexOf(parentNode?.id || '') !== -1
    ) {
      return { target: parentNode, type: parentNode.id }
    }

    if (parentNode?.parentNode) {
      const grandParent = parentNode.parentNode as HTMLElement
      if (
        clickableContainers.indexOf(grandParent?.id || '') !== -1
      ) {
        return { target: grandParent, type: grandParent.id }
      }
    }

    return null
  }

  async function toggleTurnout(id: string): Promise<void> {
    const turnout = await getTurnout(id)
    if (turnout) {
      await switchTurnout({ ...turnout, state: !turnout.state })
    }
  }

  async function handleMapClick(e: MouseEvent) {
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
          await runRoute(route as Effect)
        }
      }
    }
  }

  async function runRoute(route: Effect): Promise<void> {
    if (!route.id) return

    isRunning.value = true
    percentComplete.value = 0

    const steps = (route?.on?.length || 0) + (route?.off?.length || 0)
    console.log('Running route:', steps, route)

    await runEffect({ ...route, state: true, type: route.type })

    const interval = setInterval(() => {
      if (percentComplete.value < 100) {
        percentComplete.value += 100 / steps
      }
    }, 1000)

    setTimeout(() => {
      clearInterval(interval)
      percentComplete.value = 0
      isRunning.value = false
    }, steps * 1000 + 500)
  }

  function clearP1() {
    p1.value = null
  }

  function clearP2() {
    p2.value = null
  }

  return {
    p1,
    p2,
    isRunning,
    percentComplete,
    routes,
    routeTurnouts,
    getMapClasses,
    handleMapClick,
    clearP1,
    clearP2,
  }
}

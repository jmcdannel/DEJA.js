import { computed, ref, watch } from 'vue'
import { useEfx } from '@repo/modules/effects'
import { useTurnouts } from '@repo/modules/turnouts'

export const useLayoutRoutes = () => {
  const clickableContainers = ['Routes', 'Turnouts', 'TurnoutLabels']

  const p1 = ref(<string | null>null)
  const p2 = ref(<string | null>null)
  const isRunning = ref(false)
  const percentComplete = ref(0)

  const { getTurnout, getTurnouts, switchTurnout } = useTurnouts()
  const { getEffects, runEffect, getEffect } = useEfx()
  const list = getEffects()
  const turnouts = getTurnouts()

  const routes = computed(() =>
    list.data.value?.filter((item) => item.type === 'route')
  )

  // watch(p2, async (newValue) => {
  //   if (newValue !== null) {
  //     const route = routes.find(r => r.point1 === p1.value && r.point2 === newValue) ||
  //                   routes.find(r => r.point1 === newValue && r.point2 === p1.value)
  //     if (route) {
  //       const efx = await  getEffect(route.id)
  //       console.log('Route found:', efx?.state, route, efx)
  //       runEffect({...route, state: !efx?.state, id: route.id })
  //     } else {
  //       console.log('No route found between', p1.value, 'and', newValue, routes)
  //     }
  //   }
  // })

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
        // const efx = await getEffect(route.id)
        runEffect({ ...route, id: route.id, state: true })
        const steps = route?.on?.length || 0
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

    routes.value.forEach((route) => {
      if (route.point1 === p1.value) {
        classes.push(`selected-${route.point1}`)
        classes.push(`available-${route.point2}`)
      } else if (route.point2 === p1.value) {
        classes.push(`selected-${route.point2}`)
        classes.push(`available-${route.point1}`)
      }
    })

    return [...new Set(classes)].join(' ')
  }

  function findClickableParent(
    target: EventTarget | null
  ): { target: HTMLElement; type: string } | null {
    if (!target || !(target instanceof Element)) {
      return null
    }
    let found = false
    let currentTarget = target

    let targetType = ''
    while (!found && currentTarget && currentTarget.parentNode) {
      if (currentTarget.parentNode.nodeName.toLowerCase() === 'svg') {
        currentTarget = null
      } else if (
        clickableContainers.indexOf(currentTarget.parentNode['id']) !== -1
      ) {
        targetType = currentTarget.parentNode['id']
        found = true
      } else {
        currentTarget = currentTarget.parentNode as HTMLElement
      }
    }
    return found
      ? { target: currentTarget as HTMLElement, type: targetType }
      : null
  }

  async function toggleTurnout(id: string): Promise<void> {
    if (!id) {
      console.error('toggleTurnout called with no id')
      return
    }
    const turnoutId = id.startsWith('lbl') ? id.slice(3) : id
    const turnout = await getTurnout(turnoutId)
    if (turnout) {
      turnout.state = !turnout.state
      await switchTurnout(turnout)
    } else {
      console.error('Turnout not found:', id)
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
          await toggleTurnout(svgBtn.target.id)
          break
        default:
          // noop
          break
      }
    }
  }

  return {
    getMapClasses,
    isRunning,
    p1,
    p2,
    percentComplete,
    routes,
    handleMapClick,
  }
}

export default useLayoutRoutes

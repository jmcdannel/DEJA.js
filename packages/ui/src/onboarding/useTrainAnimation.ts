// packages/ui/src/onboarding/useTrainAnimation.ts

import { ref, watch, onMounted, onUnmounted, type Ref } from 'vue'
import { STATION_COORDS } from './trackPath'

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * Finds the fraction along an SVG path that is closest to a given (x, y) point.
 * Samples the path at `steps` evenly-spaced intervals and returns the fraction
 * (0–1) of the closest sample.
 */
function findFractionForPoint(
  path: SVGPathElement,
  totalLen: number,
  targetX: number,
  targetY: number,
  steps = 2000
): number {
  let bestDist = Infinity
  let bestFrac = 0
  for (let i = 0; i <= steps; i++) {
    const frac = i / steps
    const pt = path.getPointAtLength(frac * totalLen)
    const dist = Math.hypot(pt.x - targetX, pt.y - targetY)
    if (dist < bestDist) {
      bestDist = dist
      bestFrac = frac
    }
  }
  return bestFrac
}

export function useTrainAnimation(
  pathRef: Ref<SVGPathElement | null>,
  currentStep: Ref<number>
) {
  const trainTransform = ref('')
  let stationFractions: number[] = []
  let currentFraction = 0
  let animFrame: number | null = null

  function positionTrain(path: SVGPathElement, totalLen: number, fraction: number) {
    const pt = path.getPointAtLength(fraction * totalLen)
    const delta = Math.min(2, totalLen * 0.002)
    const pt2 = path.getPointAtLength(
      Math.min(fraction * totalLen + delta, totalLen)
    )
    const angle =
      Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * (180 / Math.PI)
    trainTransform.value = `translate(${pt.x}, ${pt.y}) rotate(${angle})`
  }

  function animateTo(station: number) {
    const path = pathRef.value
    if (!path || stationFractions.length === 0) return

    const totalLen = path.getTotalLength()
    const targetFraction = stationFractions[station] ?? 0
    const startFraction = currentFraction

    if (animFrame) cancelAnimationFrame(animFrame)

    const duration =
      Math.abs(targetFraction - startFraction) * 2000 + 400
    const startTime = performance.now()

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeInOutCubic(progress)
      const frac =
        startFraction + (targetFraction - startFraction) * eased
      currentFraction = frac // track visual position for mid-animation restarts
      positionTrain(path!, totalLen, frac)
      if (progress < 1) {
        animFrame = requestAnimationFrame(tick)
      } else {
        animFrame = null
      }
    }
    animFrame = requestAnimationFrame(tick)
  }

  onMounted(() => {
    const path = pathRef.value
    if (!path) return

    const totalLen = path.getTotalLength()
    stationFractions = STATION_COORDS.map((c) =>
      findFractionForPoint(path, totalLen, c.x, c.y)
    )

    // Position immediately at current step (no animation on mount)
    const initialFrac = stationFractions[currentStep.value] ?? 0
    currentFraction = initialFrac
    positionTrain(path, totalLen, initialFrac)
  })

  watch(currentStep, (newStep) => {
    animateTo(newStep)
  })

  onUnmounted(() => {
    if (animFrame) cancelAnimationFrame(animFrame)
  })

  return { trainTransform }
}

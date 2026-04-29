import { ref } from 'vue'
import type { WledSegmentConfig } from '../types/config'
import { createDefaultSegmentConfig } from '../types/config'

/**
 * Manages WLED segments — CRUD, active selection, validation.
 */
export function useWledSegments(initialSegments: WledSegmentConfig[] = []) {
  const segments = ref<WledSegmentConfig[]>(
    initialSegments.length > 0 ? [...initialSegments] : [createDefaultSegmentConfig()]
  )
  const activeSegmentIndex = ref(0)

  function addSegment() {
    const lastSeg = segments.value[segments.value.length - 1]
    const nextStart = lastSeg ? lastSeg.stop : 0
    segments.value.push(createDefaultSegmentConfig(nextStart, nextStart + 30))
  }

  function removeSegment(index: number) {
    if (segments.value.length <= 1) return
    segments.value.splice(index, 1)
    if (activeSegmentIndex.value >= segments.value.length) {
      activeSegmentIndex.value = segments.value.length - 1
    }
  }

  function updateSegment(index: number, updates: Partial<WledSegmentConfig>) {
    segments.value[index] = { ...segments.value[index], ...updates }
  }

  function setActiveSegment(index: number) {
    activeSegmentIndex.value = index
  }

  return {
    segments,
    activeSegmentIndex,
    addSegment,
    removeSegment,
    updateSegment,
    setActiveSegment,
  }
}

import { ref, computed, onMounted, watch } from 'vue'
import { useStorage, useWindowSize } from '@vueuse/core'

const FAB_SIZE = 40
const MARGIN = 12
const DRAG_THRESHOLD = 8
const SNAP_DURATION = 300 // ms

export function useDraggableFab() {
  const savedPosition = useStorage('@DEJA/quickMenu/position', { x: -1, y: -1 })
  const position = ref({ ...savedPosition.value })
  const isDragging = ref(false)
  const wasDragging = ref(false)
  const { width: vw, height: vh } = useWindowSize()

  let startPointer = { x: 0, y: 0 }
  let startPos = { x: 0, y: 0 }
  let moved = false
  let tracking = false

  function snapToEdge(x: number, y: number) {
    const snapX = x < vw.value / 2 ? MARGIN : vw.value - FAB_SIZE - MARGIN
    const snapY = Math.max(MARGIN + 64, Math.min(y, vh.value - FAB_SIZE - MARGIN - 56))
    return { x: snapX, y: snapY }
  }

  function initPosition() {
    if (
      savedPosition.value.x === -1 ||
      savedPosition.value.x > vw.value ||
      savedPosition.value.y > vh.value
    ) {
      const initial = snapToEdge(vw.value, vh.value - 200)
      position.value = initial
      savedPosition.value = initial
    } else {
      position.value = { ...savedPosition.value }
    }
  }

  function onPointerDown(e: PointerEvent) {
    tracking = true
    moved = false
    wasDragging.value = false
    startPointer = { x: e.clientX, y: e.clientY }
    startPos = { ...position.value }
    const el = e.currentTarget as HTMLElement
    el.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: PointerEvent) {
    if (!tracking) return
    const dx = e.clientX - startPointer.x
    const dy = e.clientY - startPointer.y
    if (!moved && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
      moved = true
      isDragging.value = true
    }
    if (moved) {
      position.value = { x: startPos.x + dx, y: startPos.y + dy }
    }
  }

  function animateTo(target: { x: number; y: number }) {
    const from = { ...position.value }
    const start = performance.now()
    function tick(now: number) {
      const elapsed = now - start
      const t = Math.min(elapsed / SNAP_DURATION, 1)
      // ease-out cubic
      const ease = 1 - Math.pow(1 - t, 3)
      position.value = {
        x: from.x + (target.x - from.x) * ease,
        y: from.y + (target.y - from.y) * ease,
      }
      if (t < 1) {
        requestAnimationFrame(tick)
      } else {
        savedPosition.value = target
      }
    }
    requestAnimationFrame(tick)
  }

  function onPointerUp(e: PointerEvent) {
    if (!tracking) return
    tracking = false
    const el = e.currentTarget as HTMLElement
    el.releasePointerCapture(e.pointerId)
    if (moved) {
      const snapped = snapToEdge(position.value.x, position.value.y)
      animateTo(snapped)
      wasDragging.value = true
    }
    isDragging.value = false
    moved = false
  }

  const positionStyle = computed(() => ({
    left: `${position.value.x}px`,
    top: `${position.value.y}px`,
  }))

  const isOnRight = computed(() => position.value.x > vw.value / 2)

  onMounted(initPosition)

  // Re-snap on window resize
  watch([vw, vh], () => {
    const snapped = snapToEdge(position.value.x, position.value.y)
    position.value = snapped
    savedPosition.value = snapped
  })

  return {
    position,
    positionStyle,
    isDragging,
    wasDragging,
    isOnRight,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  }
}

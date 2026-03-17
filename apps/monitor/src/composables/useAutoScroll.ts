import { ref, watch, nextTick, type Ref, onMounted } from 'vue'

/**
 * Auto-scrolls a container to the bottom when data changes.
 * Respects manual scroll position — if user scrolled up, auto-scroll pauses
 * until they scroll back near the bottom.
 */
export function useAutoScroll(
  container: Ref<HTMLElement | null>,
  data: Ref<unknown[] | unknown>,
) {
  const isAtBottom = ref(true)
  const THRESHOLD = 40 // px from bottom to consider "at bottom"

  function checkScrollPosition() {
    const el = container.value
    if (!el) return
    isAtBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight < THRESHOLD
  }

  function scrollToBottom() {
    const el = container.value
    if (!el) return
    el.scrollTop = el.scrollHeight
  }

  function onScroll() {
    checkScrollPosition()
  }

  watch(
    data,
    async () => {
      if (isAtBottom.value) {
        await nextTick()
        scrollToBottom()
      }
    },
    { deep: true },
  )

  onMounted(() => {
    if (container.value) {
      container.value.addEventListener('scroll', onScroll, { passive: true })
      scrollToBottom()
    }
  })

  return {
    isAtBottom,
    scrollToBottom,
  }
}

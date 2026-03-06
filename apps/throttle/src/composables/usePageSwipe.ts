import { type Ref } from 'vue'
import { useSwipe, type UseSwipeDirection } from '@vueuse/core'
import { useRoute } from 'vue-router'
import { useMenu } from '@/core/Menu/useMenu'
import { useHaptics } from './useHaptics'

export function usePageSwipe(
  targetRef: Ref<HTMLElement | null>,
  options?: { disabledRoutes?: string[] }
) {
  const route = useRoute()
  const { menuFavorites, handleMenu } = useMenu()
  const { vibrate } = useHaptics()

  useSwipe(targetRef, {
    passive: false,
    onSwipe() {
      // Reserved for visual drag feedback if desired later
    },
    onSwipeEnd(_e: TouchEvent, direction: UseSwipeDirection) {
      if (options?.disabledRoutes?.includes(route.name as string)) return

      const currentIndex = menuFavorites.value.findIndex(
        item => item.name === route.name
      )
      if (currentIndex === -1) return

      if (direction === 'left') {
        const nextIndex = currentIndex + 1
        if (nextIndex < menuFavorites.value.length) {
          vibrate('medium')
          handleMenu(menuFavorites.value[nextIndex])
        }
      } else if (direction === 'right') {
        const prevIndex = currentIndex - 1
        if (prevIndex >= 0) {
          vibrate('medium')
          handleMenu(menuFavorites.value[prevIndex])
        }
      }
    },
  })
}

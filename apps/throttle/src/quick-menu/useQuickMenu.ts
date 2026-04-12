import { ref } from 'vue'
import { useStorage } from '@vueuse/core'

export function useQuickMenu() {
  const isOpen = ref(false)
  const quickMenuVisible = useStorage('@DEJA/quickMenu/visible', true)

  function closeAll() {
    isOpen.value = false
  }

  return {
    isOpen,
    quickMenuVisible,
    closeAll,
  }
}

import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLocos } from '@repo/modules/locos'

const globalDialogOpen = ref(false)

export function useQuickThrottle() {
  const router = useRouter()
  const { acquireThrottle } = useLocos()

  async function open(address: number) {
    if (!Number.isInteger(address) || address < 1 || address > 9999) return
    await acquireThrottle(address)
    await router.push({ name: 'throttle', params: { address } })
  }

  function openGlobal() {
    globalDialogOpen.value = true
  }

  function closeGlobal() {
    globalDialogOpen.value = false
  }

  function registerGlobalShortcut() {
    function handler(e: KeyboardEvent) {
      if (e.key !== 't') return
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return
      const target = e.target as HTMLElement | null
      if (target) {
        const tag = target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return
      }
      e.preventDefault()
      openGlobal()
    }
    onMounted(() => window.addEventListener('keydown', handler))
    onUnmounted(() => window.removeEventListener('keydown', handler))
  }

  return { open, openGlobal, closeGlobal, registerGlobalShortcut, globalDialogOpen }
}

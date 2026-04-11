import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCommandPalette } from './useCommandPalette'

const CHORD_TIMEOUT_MS = 1000

// 🎹 Module-scoped ref so the chord indicator chip can import it directly
export const chordKey = ref<string | null>(null)

export function useGlobalKeybindings() {
  const router = useRouter()
  const palette = useCommandPalette()
  let chordTimer: ReturnType<typeof setTimeout> | null = null

  function clearChord() {
    chordKey.value = null
    if (chordTimer !== null) {
      clearTimeout(chordTimer)
      chordTimer = null
    }
  }

  function runChord(first: string, second: string): boolean {
    if (first !== 'g') return false
    const routeName = (() => {
      switch (second) {
        case 'r':
          return 'roster'
        case 't':
          return 'throttles'
        case 'c':
          return 'conductor'
        case 'u':
          return 'turnouts'
        case 's':
          return 'signals'
        case 'e':
          return 'effects'
        case ',':
          return 'settings'
        default:
          return null
      }
    })()
    if (!routeName) return false
    router.push({ name: routeName })
    return true
  }

  function isEditable(target: EventTarget | null): boolean {
    const el = target as HTMLElement | null
    if (!el) return false
    const tag = el.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
    if (el.isContentEditable) return true
    return false
  }

  function handler(e: KeyboardEvent) {
    // ⌘K / Ctrl+K — always active, even in inputs
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault()
      palette.open()
      clearChord()
      return
    }

    // Escape — close palette or pop stack (only when open)
    if (e.key === 'Escape' && palette.isOpen.value) {
      e.preventDefault()
      if (palette.stack.value.length > 0) {
        palette.pop()
      } else {
        palette.close()
      }
      return
    }

    // All other shortcuts suppressed in editable elements or with modifiers
    if (isEditable(e.target)) return
    if (e.metaKey || e.ctrlKey || e.altKey) return

    // Chord second key
    if (chordKey.value) {
      const ran = runChord(chordKey.value, e.key)
      clearChord()
      if (ran) e.preventDefault()
      return
    }

    // Start a chord on 'g'
    if (e.key === 'g') {
      chordKey.value = 'g'
      chordTimer = setTimeout(clearChord, CHORD_TIMEOUT_MS)
      return
    }
  }

  onMounted(() => window.addEventListener('keydown', handler))
  onUnmounted(() => {
    window.removeEventListener('keydown', handler)
    clearChord()
  })
}

import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCommandPalette } from './useCommandPalette'

const CHORD_TIMEOUT_MS = 1000

// Module-scoped so the chord indicator chip can import chordKey and so the
// timer stays paired with chordKey even if useGlobalKeybindings is ever
// called from more than one place.
export const chordKey = ref<string | null>(null)
let chordTimer: ReturnType<typeof setTimeout> | null = null

function clearChord() {
  chordKey.value = null
  if (chordTimer !== null) {
    clearTimeout(chordTimer)
    chordTimer = null
  }
}

export function useGlobalKeybindings() {
  const router = useRouter()
  const palette = useCommandPalette()

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
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault()
      palette.open()
      clearChord()
      return
    }

    if (e.key === 'Escape' && palette.isOpen.value) {
      e.preventDefault()
      if (palette.stack.value.length > 0) {
        palette.pop()
      } else {
        palette.close()
      }
      return
    }

    if (isEditable(e.target)) return
    if (e.metaKey || e.ctrlKey || e.altKey) return

    if (chordKey.value) {
      const ran = runChord(chordKey.value, e.key)
      clearChord()
      if (ran) e.preventDefault()
      return
    }

    if (e.key === 'g') {
      chordKey.value = 'g'
      chordTimer = setTimeout(clearChord, CHORD_TIMEOUT_MS)
    }
  }

  onMounted(() => window.addEventListener('keydown', handler))
  onUnmounted(() => {
    window.removeEventListener('keydown', handler)
    clearChord()
  })
}

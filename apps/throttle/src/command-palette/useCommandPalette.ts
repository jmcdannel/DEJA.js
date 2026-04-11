import { ref, type Ref } from 'vue'

interface CommandPaletteState {
  isOpen: Ref<boolean>
  query: Ref<string>
  activeIndex: Ref<number>
  /**
   * 🧭 Drill-down path of command ids. Each entry is the id of the command
   * whose children form the next level. Resolution happens in
   * `CommandPalette.vue` against the live `rootViewCommands` tree so that
   * a state flip on a leaf (turnout, effect, …) re-renders in place.
   */
  stack: Ref<string[]>
  open: (initialQuery?: string) => void
  close: () => void
  push: (id: string) => void
  pop: () => void
}

const isOpen = ref(false)
const query = ref('')
const activeIndex = ref(0)
const stack = ref<string[]>([])

export function useCommandPalette(): CommandPaletteState {
  function open(initialQuery = '') {
    query.value = initialQuery
    activeIndex.value = 0
    stack.value = []
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    query.value = ''
    activeIndex.value = 0
    stack.value = []
  }

  function push(id: string) {
    stack.value.push(id)
    query.value = ''
    activeIndex.value = 0
  }

  function pop() {
    stack.value.pop()
    query.value = ''
    activeIndex.value = 0
  }

  return { isOpen, query, activeIndex, stack, open, close, push, pop }
}

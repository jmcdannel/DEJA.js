import { ref, computed } from 'vue'
import type { CommandStack } from './types'

const isOpen = ref(false)
const query = ref('')
const activeIndex = ref(0)
const stack = ref<CommandStack[]>([])

export function useCommandPalette() {
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

  function push(level: CommandStack) {
    stack.value.push(level)
    query.value = ''
    activeIndex.value = 0
  }

  function pop() {
    stack.value.pop()
    query.value = ''
    activeIndex.value = 0
  }

  const currentLevelTitle = computed(() =>
    stack.value.length > 0 ? stack.value[stack.value.length - 1].title : null,
  )

  return { isOpen, query, activeIndex, stack, currentLevelTitle, open, close, push, pop }
}

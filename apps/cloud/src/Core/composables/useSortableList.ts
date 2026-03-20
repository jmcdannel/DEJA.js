import { ref, watch, type Ref } from 'vue'

interface Sortable {
  id: string
  order?: number
}

export function useSortableList<T extends Sortable>(
  source: Ref<T[]> | Ref<T[] | null | undefined> | { value: unknown[] },
  saveFn: (id: string, data: { order: number }) => Promise<unknown>
) {
  const list = ref<T[]>([]) as Ref<T[]>
  const dragging = ref(false)

  watch(() => (source as Ref<T[] | null | undefined>).value, (newVal) => {
    if (!newVal) return
    if (dragging.value) return
    list.value = ([...newVal] as T[]).sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
  }, { immediate: true })

  async function onDragEnd() {
    dragging.value = false
    await Promise.all(
      list.value.map((item, index) => saveFn(item.id, { order: index }))
    )
  }

  function onDragStart() {
    dragging.value = true
  }

  return { list, dragging, onDragStart, onDragEnd }
}

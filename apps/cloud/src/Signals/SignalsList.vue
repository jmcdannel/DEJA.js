<script setup lang="ts">
import { computed, ref, type PropType } from 'vue'
import draggable from 'vuedraggable'
import { useSignals, type Signal, type SignalAspect } from '@repo/modules/signals'
import { useSortableList } from '@/Core/composables/useSortableList'
import EmptyState from '@/Core/UI/EmptyState.vue'

defineEmits(['edit'])
const props = defineProps({
  filteredList: { type: Array as PropType<Signal[]>, default: undefined },
})

const { getSignals, setSignalAspect, setSignal, deleteSignal } = useSignals()
const signals = getSignals()

const color = ref('cyan')
const confirmDelete = ref('')
const aspectLabels: Record<Exclude<SignalAspect, null>, string> = {
  red: 'Red',
  yellow: 'Yellow',
  green: 'Green',
}

const { list: sortableList, onDragStart, onDragEnd } = useSortableList<Signal>(signals as any, (id, data) => setSignal(id, data as any))

const list = computed(() => props.filteredList ?? sortableList.value)

function canToggle(signal: Signal, aspect: Exclude<SignalAspect, null>): boolean {
  const pinMap: Record<Exclude<SignalAspect, null>, number | undefined> = {
    red: signal.red,
    yellow: signal.yellow,
    green: signal.green,
  }
  return typeof pinMap[aspect] === 'number'
}

async function toggleAspect(signal: Signal, aspect: Exclude<SignalAspect, null>) {
  if (!canToggle(signal, aspect)) return
  const nextAspect: SignalAspect = signal.aspect === aspect ? null : aspect
  await setSignalAspect(signal.id, nextAspect)
}

const wiring = (signal: Signal) => signal.commonAnode ? 'Common Anode' : 'Common Cathode'
</script>
<template>
  <v-container v-if="list?.length">
    <draggable
      :list="list"
      item-key="id"
      handle=".drag-handle"
      ghost-class="ghost"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
      @start="onDragStart"
      @end="onDragEnd"
    >
      <template #header>
        <div>
          <slot name="prepend"></slot>
        </div>
      </template>
      <template #item="{ element: item }">
        <div>
          <v-card
            class="mx-auto w-full h-full justify-between flex flex-col"
            :color="color"
            variant="tonal"
            density="compact">
            <v-card-title class="flex items-center justify-between text-sm py-1">
              <div class="flex items-center gap-1">
                <v-icon class="drag-handle cursor-grab active:cursor-grabbing opacity-40 hover:opacity-100" size="small">mdi-drag</v-icon>
                <span>{{ item.name || item.id }}</span>
              </div>
            </v-card-title>
            <v-card-text class="py-2">
              <div class="flex flex-wrap gap-4 items-center">
                <div class="flex items-center gap-3">
                  <div class="flex flex-col items-center p-2 rounded-lg bg-neutral-900 border border-neutral-700" style="width: 64px;">
                    <v-btn
                      icon="mdi-circle"
                      size="x-small"
                      :color="item.aspect === 'red' ? 'red-darken-1' : 'red'"
                      :variant="item.aspect === 'red' ? 'flat' : 'tonal'"
                      :disabled="!canToggle(item, 'red')"
                      @click="toggleAspect(item, 'red')"
                    />
                    <v-btn
                      icon="mdi-circle"
                      class="my-1"
                      size="x-small"
                      :color="item.aspect === 'yellow' ? 'amber-darken-2' : 'amber'"
                      :variant="item.aspect === 'yellow' ? 'flat' : 'tonal'"
                      :disabled="!canToggle(item, 'yellow')"
                      @click="toggleAspect(item, 'yellow')"
                    />
                    <v-btn
                      icon="mdi-circle"
                      size="x-small"
                      :color="item.aspect === 'green' ? 'green-darken-2' : 'green'"
                      :variant="item.aspect === 'green' ? 'flat' : 'tonal'"
                      :disabled="!canToggle(item, 'green')"
                      @click="toggleAspect(item, 'green')"
                    />
                  </div>
                  <div>
                    <div class="text-xs opacity-70">Pins</div>
                    <ul class="text-xs m-0 p-0 space-y-0.5">
                      <li>R: {{ item.red ?? '-' }}</li>
                      <li>Y: {{ item.yellow ?? '-' }}</li>
                      <li>G: {{ item.green ?? '-' }}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </v-card-text>
            <v-card-actions class="py-1">
              <template v-if="confirmDelete === item?.id">
                <v-btn
                  class="ma-1"
                  text="Cancel"
                  variant="outlined"
                  size="x-small"
                  @click="confirmDelete = ''" />
                <v-btn
                  class="ma-1"
                  text="Confirm"
                  variant="tonal"
                  size="x-small"
                  prepend-icon="mdi-delete"
                  @click="deleteSignal(item?.id)" />
              </template>
              <v-btn
                v-else
                class="ma-1"
                icon="mdi-delete"
                variant="tonal"
                size="x-small"
                @click="confirmDelete = item?.id"
              ></v-btn>
              <v-spacer></v-spacer>

              <v-btn
                text="Edit"
                variant="tonal"
                prepend-icon="mdi-pencil"
                size="x-small"
                @click="$emit('edit', item)"
              ></v-btn>
            </v-card-actions>
          </v-card>
        </div>
      </template>
    </draggable>
  </v-container>
  <EmptyState
    v-if="!list?.length"
    icon="mdi-traffic-light"
    color="emerald"
    title="No Signals Yet"
    description="Configure signal heads with red, yellow, and green aspects to manage block protection and interlocking on your layout."
    :use-cases="[{ icon: 'mdi-shield-check', text: 'Block signal protection' }, { icon: 'mdi-lock', text: 'Interlocking control' }, { icon: 'mdi-lightbulb-on', text: 'Approach lighting' }]"
    action-label="Add Your First Signal"
    action-to="/signals/new"
  />
</template>
<style scoped>
.ghost {
  opacity: 0.5;
}
</style>

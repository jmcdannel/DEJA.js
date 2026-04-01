<script setup lang="ts">
import { computed, type PropType } from 'vue'
import draggable from 'vuedraggable'
import { useTurnouts, type Turnout } from '@repo/modules'
import { useSortableList } from '@/Core/composables/useSortableList'
import TurnoutListItem from '@/Turnouts/TurnoutListItem.vue'
import ViewJson from '@/Core/UI/ViewJson.vue'
import LcdDisplay from '@/Core/UI/LcdDisplay.vue'

defineEmits(['edit'])
const props = defineProps({
  viewAs: { type: String, default: 'card' },
  filteredList: { type: Array as PropType<Turnout[]>, default: undefined },
})

const { getTurnouts, setTurnout } = useTurnouts()
const rawList = getTurnouts()
const { list: sortableList, dragging, onDragStart, onDragEnd } = useSortableList<Turnout>(rawList as any, (id, data) => setTurnout(id, data))

const list = computed(() => props.filteredList ?? sortableList.value)
</script>
<template>
  <v-container v-if="list?.length">
      <template v-if="viewAs === 'card'">
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
          <template #item="{ element }">
            <div>
              <TurnoutListItem
                :state="element.state"
                :turnout="element as Turnout"
                :turnoutId="element.id"
                @edit="$emit('edit', element)"
              />
            </div>
          </template>
        </draggable>
      </template>
      <template v-else-if="viewAs === 'device'">

      </template>
      <template v-else>
        <LcdDisplay
          :content="list.map(item => `${item.name}: ${item.state} (${item.straight}, ${item.divergent})`)"
          title="TURNOUTS LIST"
          color="green"
          size="sm"
          :max-lines="15"
        />
      </template>
  </v-container>
  <ViewJson :json="list" label="Turnouts"></ViewJson>
  <div v-if="!list?.length" class="flex flex-col items-center justify-center py-12 px-4">
    <v-icon size="48" class="opacity-30 mb-3">mdi-magnify-close</v-icon>
    <p class="text-sm opacity-60">No turnouts match your filters.</p>
  </div>
</template>
<style scoped>
.ghost {
  opacity: 0.5;
}
</style>

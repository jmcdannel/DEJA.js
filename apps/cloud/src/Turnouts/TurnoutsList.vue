<script setup lang="ts">
import { computed, type PropType } from 'vue'
import draggable from 'vuedraggable'
import { useTurnouts, type Turnout } from '@repo/modules'
import { useSortableList } from '@/Core/composables/useSortableList'
import TurnoutListItem from '@/Turnouts/TurnoutListItem.vue'
import ViewJson from '@/Core/UI/ViewJson.vue'
import LcdDisplay from '@/Core/UI/LcdDisplay.vue'
import EmptyState from '@/Core/UI/EmptyState.vue'

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
  <EmptyState
    v-if="!list?.length"
    icon="mdi-call-split"
    color="amber"
    title="No Turnouts Yet"
    description="Define your track switches and control them remotely. Map each turnout to its DCC address for seamless operation."
    :use-cases="[{ icon: 'mdi-swap-horizontal', text: 'Yard switching' }, { icon: 'mdi-source-fork', text: 'Mainline junctions' }, { icon: 'mdi-warehouse', text: 'Staging areas' }]"
    action-label="Add Your First Turnout"
    action-to="/turnouts/new"
  />
</template>
<style scoped>
.ghost {
  opacity: 0.5;
}
</style>

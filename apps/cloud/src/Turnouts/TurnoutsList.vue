<script setup lang="ts">
import { computed } from 'vue'
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import { useTurnouts, type Turnout } from '@repo/modules'
import TurnoutListItem from '@/Turnouts/TurnoutListItem.vue'
import ViewJson from '@/Core/UI/ViewJson.vue'
import LcdDisplay from '@/Core/UI/LcdDisplay.vue'
import EmptyState from '@/Core/UI/EmptyState.vue'

defineEmits(['edit'])
defineProps<{
  viewAs: string
}>()

const { getTurnouts } = useTurnouts()
const list = getTurnouts()
</script>
<template>
  <v-container v-if="list?.length">
      <template v-if="viewAs === 'card'">
        <v-row v-auto-animate>
          <v-col cols="12" xs="12" sm="6" lg="4">
            <slot name="prepend"></slot>
          </v-col>
            <v-col v-for="item in list" :key="item.id" cols="12" xs="12"  sm="6" lg="4">
              <TurnoutListItem 
                :state="item.state"
                :turnout="item as Turnout" 
                :turnoutId="item.id" 
                @edit="$emit('edit', item)" 
              />
            </v-col>
        </v-row>
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
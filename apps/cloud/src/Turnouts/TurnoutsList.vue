<script setup lang="ts">
import { computed } from 'vue'
import { useTurnouts, type Turnout } from '@repo/modules/turnouts'
import { useLayout } from '@repo/modules/layouts'
import TurnoutListItem from '@/Turnouts/TurnoutListItem.vue'
import ViewJson from '@/Core/UI/ViewJson.vue'

defineEmits(['edit'])
defineProps<{
  viewAs: string
}>()

const { getTurnouts } = useTurnouts()
const { getDevices } = useLayout()
const list = getTurnouts()
const devices = getDevices()

// Group products by category
const listByDevice = computed(() => list.value ? Object.groupBy(list.value, t => t.device) : null)

</script>
<template>
  <v-container>
      <template v-if="viewAs === 'card'">
        <v-row>
          <v-col cols="12" xs="12" sm="6" lg="4">
            <slot name="prepend"></slot>
          </v-col>
            <v-col v-for="item in list" :key="item.id" cols="12" xs="12"  sm="6" lg="4">
              <TurnoutListItem 
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
        <pre>{{ list }}</pre>
      </template>
  </v-container>
  <ViewJson :json="listByDevice || {}" label="Turnouts By Device"></ViewJson>
  <ViewJson :json="list" label="Turnouts"></ViewJson>
</template>
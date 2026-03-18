<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAutomations, type SensorAutomation } from '@repo/modules/sensors'
import EmptyState from '@/Core/UI/EmptyState.vue'

defineEmits(['edit'])

const { getAutomations, deleteAutomation } = useAutomations()
const automations = getAutomations()

const color = ref('teal')
const confirmDelete = ref('')

const list = computed(() => automations.value || [])

function getTriggerLabel(trigger: string): string {
  const labels: Record<string, string> = {
    activate: 'On Activate',
    deactivate: 'On Deactivate',
    both: 'Both',
  }
  return labels[trigger] ?? trigger
}
</script>
<template>
  <v-container v-if="list?.length">
    <v-row>
      <v-col
        cols="12"
        xs="12"
        sm="6"
        lg="4">
        <slot name="prepend"></slot>
      </v-col>
      <v-col v-for="item in list" :key="item.id"
        cols="12"
        xs="12"
        sm="6"
        lg="4">
        <v-card
          class="mx-auto w-full h-full justify-between flex flex-col"
          :color="color"
          variant="tonal"
          density="compact">
          <v-card-title class="flex items-center justify-between">
            <span>{{ item.name || item.id }}</span>
            <v-chip
              :color="item.enabled !== false ? 'green' : 'grey'"
              variant="flat"
              size="x-small"
            >
              {{ item.enabled !== false ? 'Enabled' : 'Disabled' }}
            </v-chip>
          </v-card-title>
          <v-card-text>
            <div class="flex flex-wrap gap-2 items-center mb-3">
              <v-chip variant="tonal" :color="color" prepend-icon="mdi-access-point">
                {{ item.sensorId }}
              </v-chip>
              <v-chip variant="tonal" color="blue-grey">
                {{ getTriggerLabel(item.triggerOn) }}
              </v-chip>
            </div>
            <div class="text-sm opacity-70">
              {{ item.actions?.length ?? 0 }} action{{ (item.actions?.length ?? 0) === 1 ? '' : 's' }}
              <span v-if="item.delay"> | {{ item.delay }}ms delay</span>
            </div>
          </v-card-text>
          <v-card-actions>
            <template v-if="confirmDelete === item?.id">
              <v-btn
                class="ma-2"
                text="Cancel"
                variant="outlined"
                size="small"
                @click="confirmDelete = ''" />
              <v-btn
                class="ma-2"
                text="Confirm"
                variant="tonal"
                size="small"
                prepend-icon="mdi-delete"
                @click="deleteAutomation(item?.id)" />
            </template>
            <v-btn
              v-else
              class="ma-2"
              icon="mdi-delete"
              variant="tonal"
              size="small"
              @click="confirmDelete = item?.id"
            ></v-btn>
            <v-spacer></v-spacer>

            <v-btn
              text="Edit"
              variant="tonal"
              prepend-icon="mdi-pencil"
              size="small"
              @click="$emit('edit', item)"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
  <EmptyState
    v-if="!list?.length"
    icon="mdi-robot"
    color="teal"
    title="No Automations Yet"
    description="Create automations to trigger actions when sensors detect changes on your layout."
    :use-cases="[{ icon: 'mdi-flash', text: 'Trigger effects automatically' }, { icon: 'mdi-call-split', text: 'Auto-throw turnouts' }, { icon: 'mdi-traffic-light', text: 'Signal interlocking' }]"
    action-label="Add Your First Automation"
    action-to="/sensors/automations/new"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTurnouts, type Turnout } from '@repo/modules'
import { useLayout, type Tag } from '@repo/modules'
import List from '../ModuleList/List.vue'
import { type ListFilter } from '../ModuleList/types'
import CTCSwitch from './CTCSwitch.vue'

const {  getTurnouts, setTurnout } = useTurnouts()
const { getDevices, getLayout } = useLayout()
const devices = getDevices()
const layout = getLayout()
const turnouts = getTurnouts()
const turnoutsList = computed(() => turnouts?.value ? turnouts.value.map((turnout) => ({...turnout, id: turnout.id,icon: 'mdi-call-split' })) : [])
const deviceOptions = computed(() => devices?.value ? devices.value.map((device) => ({ label: device.id, value: device.id })) : [])
const tagOptions = computed(() =>
  layout?.value?.tags
    ? layout.value.tags.map((tag: Tag) => ({ label: tag.name, value: tag.id }))
    : []
)

async function handleTurnout(turnout: Turnout) {
  await setTurnout(turnout.id, turnout)
}

const filters = computed<ListFilter[]>(() => [
  { type: 'device', label: 'Device', options: deviceOptions.value },
  { type: 'tags', label: 'Tags', options: tagOptions.value },
])

</script>

<template>
  
    <List 
      module-name="turnouts"
      color="purple-darken-4"
      title="Turnouts"
      icon="mdi-call-split"
      :list="turnoutsList"
      :filters="filters"
      :view-options="[
        { label: 'CTC Switch', value: 'ctc-switch' },
        { label: 'Switch', value: 'switch' },
        { label: 'Button', value: 'button' },
        { label: 'Card', value: 'card' },
        { label: 'Table', value: 'table' },
        { label: 'Raw', value: 'raw' }
      ]"
      @update:state="handleTurnout"
    >
      <template #item="{ item }">
        <CTCSwitch 
          :turnout="item as Turnout" 
          :turnout-id="item?.id" 
          :state="item.state"
          class="w-24 sm:w-32 md:w-36"
        />
      </template>
    </List>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { efxTypes, useEfx, type Effect } from '@repo/modules/effects'
import { useLayout, type Tag } from '@repo/modules'
import List from '../ModuleList/List.vue'
import { type ListFilter } from '../ModuleList/types'

const { getEffects, runEffect } = useEfx()
const { getDevices, getLayout } = useLayout()
const devices = getDevices()
const layout = getLayout()
const effects = getEffects()
const effectsList = computed(() => effects?.value ? effects.value.map((effect) => ({...effect, id: effect.id,icon: efxTypes.find((type) => type.value === effect.type)?.icon || 'mdi-help'})) : [])
const deviceOptions = computed(() => devices?.value ? devices.value.map((device) => ({ label: device.id, value: device.id })) : [])
const tagOptions = computed(() =>
  layout?.value?.tags
    ? layout.value.tags.map((tag: Tag) => ({ label: tag.name, value: tag.id }))
    : []
)
const typeOptions = [...new Set(efxTypes.map((type) => ({ label: type.label, value: type.value })))]

const filters = computed<ListFilter[]>(() => [
  { type: 'device', label: 'Device', options: deviceOptions.value },
  { type: 'type', label: 'Type', options: typeOptions },
  { type: 'tags', label: 'Tags', options: tagOptions.value },
])

async function handleEffect(effect: Effect, newState: boolean) {
  await runEffect({...effect, state: newState})
}

const cols = {
    xs: 12,
    sm: 6,
    md: 4,
    lg: 4,
    xl: 3,
    xxl: 2,
  }

</script>
<template>
    <List 
      module-name="effects"
      color="purple-darken-4"
      title="Effects"
      icon="mdi-lightning-bolt"
      :list="effectsList"
      :filters="filters"
      @update:state="handleEffect"
    />
</template>
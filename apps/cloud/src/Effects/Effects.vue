<script setup lang="ts">
import { computed } from 'vue'
import type { Effect } from '@repo/modules'
import { efxTypes, useEfx } from '@repo/modules/effects'
import { useLayout, type Tag } from '@repo/modules'
import { useRouter } from 'vue-router'
import { PageHeader, ListControlBar, useListControls } from '@repo/ui'
import type { ListFilter } from '@repo/ui'
import EffectsList from '@/Effects/EffectsList.vue'

const router = useRouter()
const { getEffects } = useEfx()
const { getDevices, getLayout } = useLayout()
const devices = getDevices()
const layout = getLayout()
const effects = getEffects()

const effectsList = computed(() =>
  effects?.value
    ? effects.value.map((effect) => ({ ...effect, id: effect.id }))
    : []
)

const deviceOptions = computed(() =>
  devices?.value ? devices.value.map((d) => ({ label: d.id, value: d.id })) : []
)
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

const sortOptions = [
  { value: 'order', label: 'Default' },
  { value: 'name', label: 'Name' },
  { value: 'device', label: 'Device' },
  { value: 'type', label: 'Type' },
]

const controls = useListControls('effects', {
  list: effectsList,
  filters: filters.value,
  sortOptions,
})

function handleEdit(effect: Effect) {
  router.push({ name: 'Edit Effect', params: { effectId: effect.id } })
}

function handleAdd() {
  router.push({ name: 'Add Effect' })
}
</script>
<template>
  <PageHeader title="Effects" icon="mdi-rocket-launch" color="indigo" subtitle="Manage lighting, sound, and special effects for your layout.">
    <template #actions>
      <v-btn
        prepend-icon="mdi-plus"
        color="indigo"
        variant="flat"
        @click="handleAdd"
      >
        New Effect
      </v-btn>
    </template>
    <template #controls>
      <ListControlBar
        :controls="controls"
        color="indigo"
        :sort-options="sortOptions"
        :filters="filters"
        :show-view="false"
        search-placeholder="Search effects..."
      />
    </template>
  </PageHeader>

  <EffectsList :filtered-list="controls.filteredList.value" @edit="handleEdit" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Effect } from '@repo/modules'
import { efxTypes, useEfx } from '@repo/modules/effects'
import { useLayout, type Tag, useSubscription, PLAN_DISPLAY } from '@repo/modules'
import { useRouter } from 'vue-router'
import { ListControlBar, useListControls } from '@repo/ui'
import type { ListFilter } from '@repo/ui'
import EffectsList from '@/Effects/EffectsList.vue'
import ListPage from '@/Core/UI/ListPage.vue'
import EmptyState from '@/Core/UI/EmptyState.vue'

const router = useRouter()
const { getEffects } = useEfx()
const { getDevices, getLayout } = useLayout()
const { plan } = useSubscription()
const devices = getDevices()
const layout = getLayout()
const effects = getEffects()

// 🔄 Loading state
const isLoaded = ref(false)
let loadingTimeout: ReturnType<typeof setTimeout> | undefined
onMounted(async () => {
  loadingTimeout = setTimeout(() => { isLoaded.value = true }, 3000)
  try {
    await (effects as any).promise
  } finally {
    clearTimeout(loadingTimeout)
    isLoaded.value = true
  }
})
onUnmounted(() => clearTimeout(loadingTimeout))

const isLoading = computed(() => !isLoaded.value)
const isFreePlan = computed(() => plan.value === 'hobbyist')

const effectsList = computed(() =>
  effects?.value
    ? (effects.value as Effect[]).map((effect) => ({ ...effect, id: effect.id }))
    : []
)

const hasItems = computed(() => isLoaded.value && effectsList.value.length > 0)

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
</script>
<template>
  <ListPage
    title="Effects"
    icon="mdi-rocket-launch"
    color="indigo"
    subtitle="Manage lighting, sound, and special effects for your layout."
    :add-to="{ name: 'Add Effect' }"
    add-label="New Effect"
    :loading="isLoading"
    :empty="isLoaded && effectsList.length === 0"
  >
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

    <EffectsList :filtered-list="controls.filteredList.value" @edit="handleEdit" />

    <template #empty-state>
      <EmptyState
        icon="mdi-rocket-launch"
        color="indigo"
        title="No Effects Yet"
        :description="isFreePlan
          ? `Upgrade to ${PLAN_DISPLAY.engineer.name} to create lighting, sound, and animation effects for your layout.`
          : 'Create lighting, sound, and animation effects to bring your layout to life with immersive scenery and interactive elements.'"
        :use-cases="[
          { icon: 'mdi-volume-high', text: 'Ambient sounds & audio' },
          { icon: 'mdi-led-on', text: 'LED animations & lighting' },
          { icon: 'mdi-play-circle', text: 'Triggered sequences' },
        ]"
        :action-label="isFreePlan ? `Upgrade to ${PLAN_DISPLAY.engineer.name}` : 'Create Your First Effect'"
        :action-to="isFreePlan ? '/upgrade' : '/effects/new'"
      />
    </template>
  </ListPage>
</template>

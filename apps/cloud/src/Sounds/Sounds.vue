<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSubscription, PLAN_DISPLAY } from '@repo/modules'
import ListPage from '@/Core/UI/ListPage.vue'
import { soundFileService, type SoundFile } from '@/Effects/Sounds/SoundFileService'
import SoundList from '@/Sounds/SoundList.vue'
import { EmptyState } from '@repo/ui'

const { plan } = useSubscription()

const soundFiles = ref<SoundFile[]>([])
const isLoaded = ref(false)
const isFreePlan = computed(() => plan.value === 'hobbyist')
const isLoading = computed(() => !isLoaded.value)

let loadingTimeout: ReturnType<typeof setTimeout> | undefined
onMounted(async () => {
  loadingTimeout = setTimeout(() => { isLoaded.value = true }, 5000)
  try {
    soundFiles.value = await soundFileService.listSoundFiles()
  } finally {
    clearTimeout(loadingTimeout)
    isLoaded.value = true
  }
})
onUnmounted(() => clearTimeout(loadingTimeout))
</script>
<template>
  <ListPage
    title="Sounds"
    icon="mdi-volume-high"
    color="sky"
    subtitle="Upload and manage audio files for layout effects."
    :add-to="{ name: 'Add Sound' }"
    add-label="New Sound"
    :loading="isLoading"
    :empty="isLoaded && soundFiles.length === 0"
  >
    <SoundList :initial-sounds="soundFiles" />

    <template #empty-state>
      <EmptyState
        icon="mdi-volume-high"
        color="sky"
        title="No Sounds Yet"
        :description="isFreePlan
          ? `Upgrade to ${PLAN_DISPLAY.engineer.name} to upload sounds and create immersive audio effects for your layout.`
          : 'Upload audio files to build your sound library. Sounds can be used in effects to trigger audio playback on your layout.'"
        :use-cases="[
          { icon: 'mdi-train', text: 'Train whistles' },
          { icon: 'mdi-bullhorn', text: 'Station announcements' },
          { icon: 'mdi-nature', text: 'Ambient sounds' },
          { icon: 'mdi-cog', text: 'Mechanical effects' },
        ]"
        :action-label="isFreePlan ? `Upgrade to ${PLAN_DISPLAY.engineer.name}` : 'Upload Your First Sound'"
        :action-to="isFreePlan ? '/upgrade' : '/sounds/new'"
      />
    </template>
  </ListPage>
</template>

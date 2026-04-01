<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSubscription, PLAN_DISPLAY } from '@repo/modules'
import { PageHeader } from '@repo/ui'
import { soundFileService, type SoundFile } from '@/Effects/Sounds/SoundFileService'
import SoundList from '@/Sounds/SoundList.vue'
import EmptyState from '@/Core/UI/EmptyState.vue'

const router = useRouter()
const { plan } = useSubscription()

const soundFiles = ref<SoundFile[]>([])
const isLoaded = ref(false)
const isFreePlan = computed(() => plan.value === 'hobbyist')
const isLoading = computed(() => !isLoaded.value)
const hasItems = computed(() => isLoaded.value && soundFiles.value.length > 0)

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

function handleAdd() {
  router.push({ name: 'Add Sound' })
}
</script>
<template>
  <!-- 🔄 Loading -->
  <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
    <v-skeleton-loader v-for="n in 6" :key="n" type="card" />
  </div>

  <!-- ✅ Has items -->
  <template v-else-if="hasItems">
    <PageHeader title="Sounds" icon="mdi-volume-high" color="sky" subtitle="Upload and manage audio files for layout effects.">
      <template #actions>
        <v-btn prepend-icon="mdi-plus" color="sky" variant="flat" @click="handleAdd">
          New Sound
        </v-btn>
      </template>
    </PageHeader>

    <SoundList :initial-sounds="soundFiles" />
  </template>

  <!-- 📭 Empty -->
  <EmptyState
    v-else
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

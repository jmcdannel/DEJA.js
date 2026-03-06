<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { DocumentData } from 'firebase/firestore'
import { vAutoAnimate } from '@formkit/auto-animate/vue'

const props = defineProps<{
  logs: DocumentData[]
}>()

const TIMEOUT = 30000
const efxThrownCount = ref(0)
const router = useRouter()

watch(() => props.logs, () => {
  if (props.logs.length > 0) {
    setTimeout(() => {
      efxThrownCount.value++
    }, TIMEOUT)
  }
}, { deep: true })

function openFullScreen() {
  router.push({ name: 'log-view', params: { logType: 'effects' } })
}
</script>

<template>
  <v-card class="flex flex-col flex flex-col min-h-0 overflow-auto flex-1">
    <template #title>
      <div class="monitor-card__header">
        <span class="monitor-card__title">Effect Logs</span>
        <v-spacer />
        <v-btn
          icon="mdi-arrow-expand"
          variant="text"
          size="small"
          density="comfortable"
          class="monitor-card__icon-btn"
          aria-label="Open effect logs in full screen"
          @click="openFullScreen"
        />
      </div>
    </template>
    <v-card-text v-auto-animate class="monitor-card__body flex flex-1 flex-col-reverse gap-1">
      <v-alert
        v-for="log in logs"
        :key="log.id"
        :color="log?.color || 'info'"
        variant="tonal"
        class="monitor-card__alert"
      >
        <div class="flex items-center gap-x-8">
          <v-icon
            :color="log.state ? 'green' : 'red'"
            :icon="log.state ? 'mdi-toggle-switch' : 'mdi-toggle-switch-off'"
            size="32" 
          />
          <span class="font-semibold text-xm">{{ log.name }}</span>
          <!-- <span class="text-sm">{{ log.state ? 'On' : 'Off' }}</span> -->
          <v-spacer></v-spacer>
          <v-chip class="monitor-chip">{{ log.device }}</v-chip>
        </div>
      </v-alert>
    </v-card-text>
  </v-card>
</template>
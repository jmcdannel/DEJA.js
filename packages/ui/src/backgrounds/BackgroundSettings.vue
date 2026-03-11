<script setup lang="ts">
import { computed } from 'vue'
import { useUserPreferences } from '@repo/modules'
import { backgrounds } from './registry'
import BackgroundThumbnail from './BackgroundThumbnail.vue'

const props = defineProps<{
  appName: string
  pages?: Array<{ path: string; label: string; icon?: string }>
}>()

const { preferences, getBackground, setAppBackground, setPageBackground, clearPageBackground } =
  useUserPreferences()

const appDefault = computed(
  () => preferences.value?.backgrounds?.[props.appName]?.default ?? 'none',
)

// All background IDs including 'none'
const allOptions = computed(() => ['none', ...backgrounds.map((bg) => bg.id)])

function selectAppDefault(bgId: string) {
  setAppBackground(props.appName, bgId)
}

function selectPageBackground(path: string, bgId: string) {
  if (bgId === 'app-default') {
    clearPageBackground(props.appName, path)
  } else {
    setPageBackground(props.appName, path, bgId)
  }
}

function getPageSelection(path: string): string {
  const pref = getBackground(props.appName, path)
  const hasPageOverride =
    preferences.value?.backgrounds?.[props.appName]?.pages?.[path]
  return hasPageOverride ? pref.value : 'app-default'
}
</script>

<template>
  <v-card variant="outlined" class="bg-slate-900/50">
    <v-card-title class="text-sm font-semibold flex items-center gap-2">
      <v-icon size="20">mdi-wallpaper</v-icon>
      Page Backgrounds
    </v-card-title>

    <v-card-text>
      <!-- App-wide default -->
      <div class="mb-4">
        <div class="text-xs text-slate-400 uppercase tracking-wider mb-2 font-medium">
          App Default
        </div>
        <div class="flex flex-wrap gap-2">
          <BackgroundThumbnail
            v-for="bgId in allOptions"
            :key="bgId"
            :background-id="bgId"
            :selected="appDefault === bgId"
            @click="selectAppDefault(bgId)"
          />
        </div>
      </div>

      <!-- Per-page overrides -->
      <v-expansion-panels v-if="pages?.length" variant="accordion" class="mt-4">
        <v-expansion-panel
          v-for="page in pages"
          :key="page.path"
          bg-color="transparent"
        >
          <v-expansion-panel-title class="text-sm py-2">
            <v-icon v-if="page.icon" size="18" class="mr-2">{{ page.icon }}</v-icon>
            {{ page.label }}
            <template #actions="{ expanded }">
              <v-icon :icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="20" />
            </template>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="flex flex-wrap gap-2">
              <!-- "Use App Default" option -->
              <div
                class="relative w-24 h-16 rounded-lg overflow-hidden cursor-pointer border-2 transition-all duration-150 flex items-center justify-center bg-slate-800"
                :class="
                  getPageSelection(page.path) === 'app-default'
                    ? 'border-sky-400 ring-2 ring-sky-400/40 scale-105'
                    : 'border-slate-700 hover:border-slate-500'
                "
                @click="selectPageBackground(page.path, 'app-default')"
              >
                <div class="text-center">
                  <v-icon size="16" color="grey">mdi-undo</v-icon>
                  <div class="text-[10px] text-slate-300">App Default</div>
                </div>
              </div>

              <BackgroundThumbnail
                v-for="bgId in allOptions"
                :key="bgId"
                :background-id="bgId"
                :selected="getPageSelection(page.path) === bgId"
                @click="selectPageBackground(page.path, bgId)"
              />
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
  </v-card>
</template>

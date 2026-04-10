<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTheme as useVuetifyTheme } from 'vuetify'
import { useUserPreferences } from '@repo/modules'
import { backgrounds } from './registry'
import BackgroundThumbnail from './BackgroundThumbnail.vue'

const props = defineProps<{
  appName: string
  pages?: Array<{ path: string; label: string; icon?: string }>
}>()

const vuetifyTheme = useVuetifyTheme()

const isDark = computed(() => vuetifyTheme?.global?.name?.value === 'dark')
const customizePerPage = ref(false)

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
  <div class="bg-settings">
    <!-- 🌞/⬛⬜ Not dark mode — backgrounds are disabled -->
    <v-alert
      v-if="!isDark"
      type="info"
      variant="tonal"
      density="compact"
    >
      Backgrounds are only visible in dark mode.
    </v-alert>

    <!-- 🌙 Dark mode — show background picker -->
    <template v-else>
      <div class="flex flex-wrap gap-2">
        <BackgroundThumbnail
          v-for="bgId in allOptions"
          :key="bgId"
          :background-id="bgId"
          :selected="appDefault === bgId"
          @click="selectAppDefault(bgId)"
        />
      </div>

      <!-- Per-page overrides — opt-in toggle -->
      <div v-if="pages?.length" class="mt-3">
        <v-checkbox
          v-model="customizePerPage"
          label="Customize per page"
          density="compact"
          hide-details
          color="primary"
          class="text-sm"
        />
        <v-expand-transition>
          <v-expansion-panels v-if="customizePerPage" variant="accordion" class="mt-2">
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
                    class="bg-default-tile"
                    :class="getPageSelection(page.path) === 'app-default' ? 'bg-default-tile--selected' : ''"
                    @click="selectPageBackground(page.path, 'app-default')"
                  >
                    <v-icon size="16" color="grey">mdi-undo</v-icon>
                    <div class="text-[10px] opacity-70">App Default</div>
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
        </v-expand-transition>
      </div>
    </template>
  </div>
</template>

<style scoped>
.bg-default-tile {
  position: relative;
  width: 6rem;
  height: 4rem;
  border-radius: 0.5rem;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid rgba(var(--v-theme-on-surface), 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(var(--v-theme-surface-variant), 0.5);
  transition: all 150ms ease;
}
.bg-default-tile:hover {
  border-color: rgba(var(--v-theme-on-surface), 0.3);
}
.bg-default-tile--selected {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.3);
  transform: scale(1.05);
}
</style>

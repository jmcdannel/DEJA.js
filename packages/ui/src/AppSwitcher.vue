<script setup lang="ts">
import { computed } from 'vue'
import { DEJA_APPS, type DejaAppKey } from './appConfig'

interface Props {
  /** Which apps to exclude (e.g. the current app). */
  exclude?: DejaAppKey[]
  /** Layout direction. */
  direction?: 'row' | 'column'
  /** Show app label text under icons. */
  showLabels?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  exclude: () => [],
  direction: 'row',
  showLabels: false,
})

const visibleApps = computed(() =>
  Object.entries(DEJA_APPS)
    .filter(([key]) => !props.exclude.includes(key as DejaAppKey))
    .map(([key, app]) => ({ key, ...app })),
)
</script>

<template>
  <div
    class="flex items-center gap-1"
    :class="direction === 'column' ? 'flex-col' : 'flex-row justify-around'"
  >
    <v-tooltip
      v-for="app in visibleApps"
      :key="app.key"
      :text="app.label"
      location="top"
    >
      <template #activator="{ props: tooltipProps }">
        <a
          v-bind="tooltipProps"
          :href="app.href"
          target="_blank"
          rel="noopener"
          class="app-switcher-link flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-all duration-150 hover:bg-white/5"
        >
          <img
            :src="app.icon"
            :alt="app.label"
            class="w-5 h-5 object-contain"
          />
          <span
            v-if="showLabels"
            class="text-[10px] font-medium tracking-wide"
            :style="{ color: app.color }"
          >
            {{ app.label }}
          </span>
        </a>
      </template>
    </v-tooltip>
  </div>
</template>

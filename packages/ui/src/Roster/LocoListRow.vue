<script setup lang="ts">
import { computed } from 'vue'
import type { Loco } from '@repo/modules/locos'
import { ROADNAMES } from '@repo/modules'
import LocoNumberPlate from './LocoNumberPlate.vue'
import { getRoadnameMedia } from './roadnameLogos'

interface Props {
  loco: Loco
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [loco: Loco]
}>()

// 🚂 Roadname entry from ROADNAMES constant
const roadname = computed(() =>
  ROADNAMES.find((r) => r.value === props.loco.meta?.roadname),
)

// 🎨 Media (logo + fallback) for the roadname
const media = computed(() => getRoadnameMedia(props.loco.meta?.roadname))

// 🎨 Plate color pulled from roadname, default yellow
const plateColor = computed(() => roadname.value?.color || 'yellow')

// 🚃 Consist count — how many extra units are attached
const consistCount = computed(() => props.loco.consist?.length ?? 0)

// 🎨 Color map — roadname color keys to hex values for inline styles
const ROADNAME_COLOR_HEX: Record<string, string> = {
  orange: '#e87020',
  sky: '#80b0e8',
  yellow: '#e8c840',
  red: '#e04040',
  indigo: '#5878d8',
  zinc: '#b0b0b0',
  blue: '#6090cc',
  green: '#50a850',
}

// 🎨 Inline color style for the roadname label column
const roadnameColorStyle = computed(() => {
  const color = roadname.value?.color
  if (!color) return {}
  const hex = ROADNAME_COLOR_HEX[color]
  return hex ? { color: hex } : {}
})
</script>

<template>
  <div
    class="grid items-center border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer py-2.5 px-3"
    style="grid-template-columns: 90px 28px 1fr 140px 80px 60px;"
    @click="emit('click', loco)"
  >
    <!-- 🔢 Number plate — sm size -->
    <div class="flex items-center">
      <LocoNumberPlate
        :address="loco.address"
        :color="plateColor"
        size="sm"
      />
    </div>

    <!-- 🖼️ Railroad logo — tiny -->
    <div class="flex items-center justify-center">
      <img
        v-if="media?.logo"
        :src="media.logo"
        :alt="roadname?.label ?? ''"
        class="object-contain pointer-events-none select-none"
        style="width: 18px; height: 18px;"
      />
    </div>

    <!-- 🚂 Loco name — truncated primary text -->
    <div class="text-sm font-semibold truncate px-2">
      {{ loco.name }}
    </div>

    <!-- 🗺️ Roadname label — colored -->
    <div
      class="text-xs font-medium truncate"
      :style="roadnameColorStyle"
    >
      {{ roadname?.label ?? '' }}
    </div>

    <!-- 🔢 DCC address — muted, centered -->
    <div class="text-xs text-medium-emphasis text-center opacity-70">
      {{ loco.address }}
    </div>

    <!-- 🚃 Consist chip or dash -->
    <div class="flex items-center justify-center">
      <v-chip
        v-if="consistCount > 0"
        color="pink"
        size="x-small"
        variant="tonal"
        class="font-semibold"
      >
        {{ consistCount }}
      </v-chip>
      <span v-else class="text-xs opacity-30">—</span>
    </div>
  </div>
</template>

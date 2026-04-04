<script setup lang="ts">
import { computed } from 'vue'
import type { Loco, ConsistLoco } from '@repo/modules/locos'
import { ROADNAMES } from '@repo/modules'
import LocoNumberPlate from './LocoNumberPlate.vue'
import placeholderLoco from '../assets/placeholder-loco.png'
import placeholderPurple from '../assets/placeholder-loco-purple.png'
import placeholderBlue from '../assets/placeholder-loco-blue.png'
import placeholderGreen from '../assets/placeholder-loco-green.png'
import placeholderOrange from '../assets/placeholder-loco-orange.png'
import placeholderDarkBlue from '../assets/placeholder-loco-dark-blue.png'
import placeholderPurpleGray from '../assets/placeholder-loco-purple-gray.png'
import placeholderGray from '../assets/placeholder-loco-gray.png'
import placeholderGrayBlue from '../assets/placeholder-loco-gray-blue.png'
import placeholderRedBrown from '../assets/placeholder-loco-red-brown.png'
import placeholderBrown from '../assets/placeholder-loco-brown.png'
import placeholderGrayGreen from '../assets/placeholder-loco-gray-green.png'
import placeholderBrownRed from '../assets/placeholder-loco-brown-red.png'

const PLACEHOLDERS = [
  placeholderLoco, placeholderPurple, placeholderBlue, placeholderGreen,
  placeholderOrange, placeholderDarkBlue, placeholderPurpleGray, placeholderGray,
  placeholderGrayBlue, placeholderRedBrown, placeholderBrown, placeholderGrayGreen,
  placeholderBrownRed,
]

interface Props {
  loco: Loco
  /** Fallback image URL when loco has no meta.imageUrl */
  placeholderImage?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [loco: Loco]
}>()

const roadname = computed(() =>
  ROADNAMES.find((r) => r.value === props.loco.meta?.roadname),
)

const imageUrl = computed(() => props.loco.meta?.imageUrl || props.placeholderImage || PLACEHOLDERS[props.loco.address % PLACEHOLDERS.length])
const plateColor = computed(() => roadname.value?.color || 'yellow')

function badgeBg(cloco: ConsistLoco): string {
  return cloco.direction ? 'rgba(5,150,105,0.3)' : 'rgba(220,38,38,0.3)'
}
function badgeColor(cloco: ConsistLoco): string {
  return cloco.direction ? '#059669' : '#dc2626'
}
function arrowColor(cloco: ConsistLoco): string {
  return cloco.direction ? '#6ee7b7' : '#fca5a5'
}
</script>

<template>
  <v-card
    class="loco-card overflow-hidden cursor-pointer"
    rounded="lg"
    @click="emit('click', loco)"
  >
    <!-- 🖼️ Image area -->
    <div class="relative overflow-hidden" style="min-height: 200px;">
      <!-- 🖼️ Loco image (real photo or placeholder fallback) -->
      <img
        :src="imageUrl"
        :alt="loco.name"
        class="w-full h-full object-contain bg-white/5"
        style="min-height: 200px;"
      />

      <!-- 🎯 Number plate — absolute bottom-right -->
      <div class="absolute bottom-2 right-2">
        <LocoNumberPlate
          :address="loco.address"
          :color="plateColor"
          size="lg"
        />
      </div>

      <!-- 🚃 Mini consist indicator — top-right -->
      <div
        v-if="loco.consist?.length"
        class="absolute top-2 right-2 flex items-center gap-0.5 py-0.5 px-1.5 rounded-xl"
        style="background: rgba(124,58,237,0.25); border: 1px solid rgba(124,58,237,0.35)"
      >
        <span class="text-[8px] font-semibold tracking-wide mr-0.5" style="color: #7c3aed">EZ</span>
        <!-- Lead -->
        <div class="flex items-center gap-px rounded-full py-px pl-1 pr-0.5" style="background: rgba(124,58,237,0.3)">
          <span class="text-[8px]" style="color: #c4b5fd">◀</span>
          <div class="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style="background: #7c3aed">{{ loco.address }}</div>
        </div>
        <!-- Members -->
        <div
          v-for="cloco in loco.consist"
          :key="cloco.address"
          class="flex items-center gap-px rounded-full py-px"
          :class="cloco.direction ? 'pl-1 pr-0.5' : 'pl-0.5 pr-1'"
          :style="{ background: badgeBg(cloco) }"
        >
          <span v-if="cloco.direction" class="text-[8px]" :style="{ color: arrowColor(cloco) }">◀</span>
          <div class="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-semibold text-white" :style="{ background: badgeColor(cloco) }">{{ cloco.address }}</div>
          <span v-if="!cloco.direction" class="text-[8px]" :style="{ color: arrowColor(cloco) }">▶</span>
        </div>
      </div>
    </div>

    <!-- 📋 Info strip -->
    <div class="px-3 py-2">
      <div class="text-sm font-semibold leading-tight truncate">
        {{ loco.name || `Loco ${loco.address}` }}
      </div>
      <div class="text-xs text-medium-emphasis mt-0.5 truncate">
        <span v-if="roadname">{{ roadname.label }}</span>
        <span v-if="roadname" class="mx-1 opacity-50">·</span>
        <span class="opacity-70">#{{ loco.address }}</span>
      </div>
    </div>
  </v-card>
</template>

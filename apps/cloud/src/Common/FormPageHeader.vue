<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  icon: string
  title: string
  subtitle?: string
  color: string
  backLabel: string
  backRoute: Record<string, unknown>
}>()

const gradientBg = computed(() =>
  `linear-gradient(135deg, color-mix(in srgb, ${props.color} 8%, transparent), transparent)`
)
const borderColor = computed(() =>
  `color-mix(in srgb, ${props.color} 15%, transparent)`
)
const avatarBg = computed(() =>
  `color-mix(in srgb, ${props.color} 80%, black)`
)
</script>

<template>
  <div
    class="flex items-center gap-4 p-5 rounded-[14px] border"
    :style="{ background: gradientBg, borderColor }"
  >
    <div
      class="w-14 h-14 rounded-[14px] flex items-center justify-center flex-shrink-0"
      :style="{ background: avatarBg }"
    >
      <v-icon size="28" color="white">{{ icon }}</v-icon>
    </div>
    <div class="flex-1 min-w-0">
      <h1 class="text-xl font-bold text-white/95 tracking-tight">{{ title }}</h1>
      <div v-if="subtitle || $slots.subtitle" class="flex items-center gap-2.5 mt-1">
        <slot name="subtitle">
          <span class="text-xs text-white/45">{{ subtitle }}</span>
        </slot>
      </div>
    </div>
    <v-btn variant="outlined" size="small" class="text-none" :to="backRoute">
      <v-icon start size="16">mdi-arrow-left</v-icon>
      {{ backLabel }}
    </v-btn>
  </div>
</template>

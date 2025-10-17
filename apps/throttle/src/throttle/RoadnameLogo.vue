<script setup lang="ts">
import { computed } from 'vue'
import { ROADNAMES } from '@repo/modules/locos'
import { getRoadnameMedia } from '@/throttle/roadnameLogos'

const props = defineProps<{ roadname?: string | null, size?: 'sm'|'md'|'lg'|'xl'|'2xl'|'3xl' }>()

const sizeMap: Record<string, string> = {
  sm: 'h-6 md:h-8',
  md: 'h-12 md:h-16',
  lg: 'h-16 md:h-20',
  xl: 'h-20 md:h-24',
  '2xl': 'h-24 md:h-28',
  '3xl': 'h-48 md:h-72'
}

const sizeClass = computed(() => sizeMap[props.size ?? 'md'] || sizeMap.md)

const normalized = computed(() => props.roadname?.trim().toLowerCase())

const roadname = computed(() => {
  if (!normalized.value) return undefined
  return ROADNAMES.find(
    (road) =>
      road.value === normalized.value || road.label.toLowerCase() === normalized.value
  )
})

const media = computed(() => getRoadnameMedia(roadname.value?.value ?? normalized.value))

const label = computed(() => roadname.value?.label ?? props.roadname ?? '')

const fallbackClass = computed(
  () => media.value?.fallbackClass ?? 'bg-slate-700/80 text-white border border-slate-400/70'
)
</script>

<template>
  <div v-if="props.roadname" class="flex flex-col items-center gap-1">
    <img
      v-if="media?.logo"
      :src="media.logo"
      :alt="`${label} logo`"
      :class="`${sizeClass} w-auto object-contain drop-shadow bg-gray-900 p-2 rounded`"
      loading="lazy"
    />
    <span
      v-else
      :class="`${fallbackClass} px-3 py-1 rounded-md text-xs md:text-sm font-semibold uppercase tracking-wide border ${sizeClass}`"
    >
      {{ label }}
    </span>
  </div>
</template>

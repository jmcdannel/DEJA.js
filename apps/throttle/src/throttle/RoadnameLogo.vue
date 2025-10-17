<script setup lang="ts">
import { computed } from 'vue'
import { ROADNAMES } from '@repo/modules/locos'
import { getRoadnameMedia } from '@/throttle/roadnameLogos'

const props = defineProps<{ roadname?: string | null }>()

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
      class="h-10 md:h-12 w-auto object-contain drop-shadow"
      loading="lazy"
    />
    <span
      v-else
      class="px-3 py-1 rounded-md text-xs md:text-sm font-semibold uppercase tracking-wide border"
      :class="fallbackClass"
    >
      {{ label }}
    </span>
  </div>
</template>

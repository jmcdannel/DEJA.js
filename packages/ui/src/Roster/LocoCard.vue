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

// 🎨 Media (logo + fallback gradient class) for the roadname
const media = computed(() => getRoadnameMedia(props.loco.meta?.roadname))

// 🖼️ Whether a real image URL is available
const hasImage = computed(() => !!props.loco.meta?.imageUrl)

// 🚃 Consist count — how many extra units are attached
const consistCount = computed(() => props.loco.consist?.length ?? 0)

// 🎨 Plate color pulled from roadname, default yellow
const plateColor = computed(() => roadname.value?.color || 'yellow')
</script>

<template>
  <v-card
    class="loco-card overflow-hidden cursor-pointer"
    rounded="lg"
    @click="emit('click', loco)"
  >
    <!-- 🖼️ Image area -->
    <div class="relative" style="height: 160px; overflow: hidden">
      <!-- Real photo when available -->
      <img
        v-if="hasImage"
        :src="loco.meta!.imageUrl"
        :alt="loco.name"
        class="w-full h-full object-cover"
      />

      <!-- 🎨 Roadname-colored fallback gradient with watermark logo -->
      <div
        v-else
        class="w-full h-full flex items-center justify-center"
        :class="media?.fallbackClass ?? 'bg-zinc-700/80 border border-zinc-500/60'"
      >
        <!-- Railroad logo watermark -->
        <img
          v-if="media?.logo"
          :src="media.logo"
          :alt="roadname?.label ?? ''"
          class="h-20 w-auto object-contain opacity-30 pointer-events-none select-none"
        />
      </div>

      <!-- 🎯 Number plate — absolute bottom-right -->
      <div class="absolute bottom-2 right-2">
        <LocoNumberPlate
          :address="loco.address"
          :color="plateColor"
          size="sm"
        />
      </div>

      <!-- 🚃 Consist badge — top-right, only when consist is present -->
      <div v-if="consistCount > 0" class="absolute top-2 right-2">
        <v-chip
          color="pink"
          size="x-small"
          variant="elevated"
          class="font-semibold"
        >
          consist · {{ consistCount }}
        </v-chip>
      </div>
    </div>

    <!-- 📋 Info strip -->
    <div class="px-3 py-2">
      <!-- Loco name — primary -->
      <div class="text-sm font-semibold leading-tight truncate">
        {{ loco.name }}
      </div>
      <!-- Roadname + address — secondary muted -->
      <div class="text-xs text-medium-emphasis mt-0.5 truncate">
        <span v-if="roadname">{{ roadname.label }}</span>
        <span v-if="roadname" class="mx-1 opacity-50">·</span>
        <span class="opacity-70">#{{ loco.address }}</span>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Loco } from '@repo/modules/locos'
import { ROADNAMES } from '@repo/modules'
import { LocoFront } from '../LocoFront'
import LocoNumberPlate from './LocoNumberPlate.vue'
import { getRoadnameMedia } from './roadnameLogos'

interface Props {
  loco: Loco
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [loco: Loco]
}>()

const roadname = computed(() =>
  ROADNAMES.find((r) => r.value === props.loco.meta?.roadname),
)

const media = computed(() => getRoadnameMedia(props.loco.meta?.roadname))
const hasImage = computed(() => !!props.loco.meta?.imageUrl)
const consistCount = computed(() => props.loco.consist?.length ?? 0)
const plateColor = computed(() => roadname.value?.color || 'yellow')
</script>

<template>
  <v-card
    class="loco-card overflow-hidden cursor-pointer"
    rounded="lg"
    @click="emit('click', loco)"
  >
    <!-- 🖼️ Image area -->
    <div class="relative overflow-hidden" style="min-height: 200px;">
      <!-- Real photo when available -->
      <img
        v-if="hasImage"
        :src="loco.meta!.imageUrl"
        :alt="loco.name"
        class="w-full h-full object-contain bg-white/5"
        style="min-height: 200px;"
      />

      <!-- 🚂 Fallback: LocoFront SVG centered on dark background -->
      <div
        v-else
        class="w-full flex items-center justify-center py-4"
        style="min-height: 200px; background: rgba(15,15,20,0.8);"
      >
        <LocoFront
          :roadname="loco.meta?.roadname"
          :road-number="loco.address"
          :logo-src="media?.logo"
          :size="180"
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

      <!-- 🚃 Consist badge — top-right -->
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

<script setup lang="ts">

import { useLocos, type Loco } from '@repo/modules/locos'
import { ROADNAME_MEDIA } from '@/throttle/roadnameLogos'
import { ROADNAMES } from '@repo/modules/locos'


const { getLocos } = useLocos()

let locos = getLocos()
const entries = Object.entries(ROADNAME_MEDIA).map(([key, media]) => ({ key, media, label: (ROADNAMES.find(r => r.value === key)?.label ?? key) }))
</script>

<template>
  <main class="p-4">
    <h1 class="text-2xl font-bold mb-4">Roadname Logos</h1>
    <p class="mb-4 text-sm text-slate-500">A gallery of roadname logos and their fallback styles.</p>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="entry in entries" :key="entry.key" class="flex flex-col items-center space-y-2 p-3 rounded shadow">
        <div class="w-full flex items-center justify-center">
          <img v-if="entry.media.logo" :src="entry.media.logo" :alt="`${entry.label} logo`" class="h-24 w-auto object-contain" />
          <div v-else :class="`${entry.media.fallbackClass} px-4 py-2 rounded text-sm font-semibold`">{{ entry.label }}</div>
        </div>
        <div class="text-xs text-slate-600">{{ entry.key }}</div>
      </div>
    </div>
    <h2 class="text-xl font-bold mt-8 mb-4">Locos with Roadname Logos</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div v-for="loco in locos" :key="loco.id" class="flex flex-col items-center space-y-2 p-3 rounded shadow">
        <div class="w-full flex items-center justify-center">
          <img v-if="loco.meta?.roadname && ROADNAME_MEDIA[loco.meta.roadname]?.logo" :src="ROADNAME_MEDIA[loco.meta.roadname].logo" :alt="`${loco.name} logo`" class="h-24 w-auto object-contain" />
          <div v-else :class="`${loco.meta?.roadname && ROADNAME_MEDIA[loco.meta.roadname]?.fallbackClass ? ROADNAME_MEDIA[loco.meta.roadname].fallbackClass : 'bg-gray-300'} px-4 py-2 rounded text-sm font-semibold`">{{ loco.name }}</div>
        </div>
        <div class="text-xs text-slate-600">{{ loco.name }} ({{ loco.address }}) [{{loco.meta.roadname}}]</div>
      </div>
    </div>
  </main>
</template>

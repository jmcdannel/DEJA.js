<script setup lang="ts">
import { toRef } from 'vue'
import type { Loco } from '@repo/modules/locos'
import { ROADNAMES } from '@repo/modules/locos'
import { useListControls } from '../composables/useListControls'
import type { ViewOption } from '../ListControls/types'
import { LocoFront } from '../LocoFront'
import { getRoadnameMedia } from './roadnameLogos'
import LocoNumberPlate from './LocoNumberPlate.vue'
import LocoCard from './LocoCard.vue'
import LocoListRow from './LocoListRow.vue'

interface Props {
  locos: Loco[]
  defaultView?: 'cab' | 'avatar' | 'plate' | 'card' | 'table' | 'raw'
  moduleName?: string
}

const props = withDefaults(defineProps<Props>(), {
  defaultView: 'card',
  moduleName: 'roster',
})

const emit = defineEmits<{
  select: [loco: Loco]
}>()

// 🎨 Get roadname color for a loco
function getRoadnameColor(loco: Loco): string {
  const rn = loco.meta?.roadname ? ROADNAMES.find((r) => r.value === loco.meta?.roadname) : null
  return rn?.color || 'yellow'
}

// 🗂️ View options: Cab, Avatar, Plate, Card, Table, Raw
const viewOptions: ViewOption[] = [
  { value: 'cab', icon: 'mdi-train-car-flatbed', label: 'Cab' },
  { value: 'avatar', icon: 'mdi-view-module', label: 'Avatar' },
  { value: 'plate', icon: 'mdi-card-text-outline', label: 'Plate' },
  { value: 'card', icon: 'mdi-view-grid-outline', label: 'Card' },
  { value: 'table', icon: 'mdi-table', label: 'Table' },
  { value: 'raw', icon: 'mdi-code-json', label: 'Raw' },
]

// 🎛️ List controls — only viewAs is used; parent handles filtering/sorting
const locosRef = toRef(props, 'locos')
const controls = useListControls(props.moduleName, {
  list: locosRef as any,
  viewOptions,
  defaultView: props.defaultView,
})

// 🔓 Expose to parent so ListControlBar can bind viewAs + viewOptions
defineExpose({ viewAs: controls.viewAs, viewOptions })
</script>

<template>
  <!-- 🚫 Empty state -->
  <div
    v-if="locos.length === 0"
    class="flex flex-col items-center justify-center py-16 gap-3"
  >
    <v-icon size="48" class="opacity-30">mdi-train</v-icon>
    <span class="text-sm text-medium-emphasis">No locomotives in roster.</span>
  </div>

  <template v-else>
    <!-- 🚂 Cab view — LocoFront SVG illustrations (large) -->
    <div v-if="controls.viewAs.value === 'cab'" class="grid gap-6 p-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      <div
        v-for="loco in locos"
        :key="loco.address"
        class="flex flex-col items-center gap-2 cursor-pointer"
        @click="emit('select', loco)"
      >
        <v-badge
          v-if="loco.consist && loco.consist.length > 0"
          :content="loco.consist.length"
          color="pink"
          overlap
        >
          <LocoFront
            :roadname="loco.meta?.roadname"
            :road-number="loco.address"
            :logo-src="getRoadnameMedia(loco.meta?.roadname)?.logo"
            :size="280"
          />
        </v-badge>
        <LocoFront
          v-else
          :roadname="loco.meta?.roadname"
          :road-number="loco.address"
          :logo-src="getRoadnameMedia(loco.meta?.roadname)?.logo"
          :size="180"
        />
        <span class="text-xs text-gray-400">{{ loco.name || `Loco ${loco.address}` }}</span>
      </div>
    </div>

    <!-- 🖼️ Avatar view — LocoFront medium grid (4-5 per row) -->
    <div v-else-if="controls.viewAs.value === 'avatar'" class="grid gap-4 p-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      <div
        v-for="loco in locos"
        :key="loco.address"
        class="flex flex-col items-center gap-1 cursor-pointer"
        @click="emit('select', loco)"
      >
        <v-badge
          v-if="loco.consist && loco.consist.length > 0"
          :content="loco.consist.length"
          color="pink"
          overlap
        >
          <LocoFront
            :roadname="loco.meta?.roadname"
            :road-number="loco.address"
            :logo-src="getRoadnameMedia(loco.meta?.roadname)?.logo"
            :size="200"
          />
        </v-badge>
        <LocoFront
          v-else
          :roadname="loco.meta?.roadname"
          :road-number="loco.address"
          :logo-src="getRoadnameMedia(loco.meta?.roadname)?.logo"
          :size="200"
        />
        <span class="text-xs text-gray-400 truncate max-w-full">{{ loco.name || `Loco ${loco.address}` }}</span>
      </div>
    </div>

    <!-- 🔩 Plate view — number plates grid -->
    <div v-else-if="controls.viewAs.value === 'plate'" class="flex flex-wrap gap-4 p-4">
      <div
        v-for="loco in locos"
        :key="loco.address"
        class="cursor-pointer"
        @click="emit('select', loco)"
      >
        <v-badge
          v-if="loco.consist && loco.consist.length > 0"
          :content="loco.consist.length"
          color="pink"
          overlap
        >
          <LocoNumberPlate
            :address="loco.address"
            :color="getRoadnameColor(loco)"
            size="lg"
            :show-label="true"
            :label="loco.name"
          />
        </v-badge>
        <LocoNumberPlate
          v-else
          :address="loco.address"
          :color="getRoadnameColor(loco)"
          size="lg"
          :show-label="true"
          :label="loco.name"
        />
      </div>
    </div>

    <!-- 🃏 Card view — responsive CSS grid -->
    <div
      v-else-if="controls.viewAs.value === 'card'"
      class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4"
    >
      <LocoCard
        v-for="loco in locos"
        :key="loco.address"
        :loco="loco"
        @click="emit('select', loco)"
      />
    </div>

    <!-- 📋 Table view — header + rows -->
    <div v-else-if="controls.viewAs.value === 'table'" class="p-4">
      <div
        class="grid px-3 py-1.5"
        style="grid-template-columns: 90px 28px 1fr 140px 80px 60px;"
      >
        <div />
        <div />
        <div class="text-xs uppercase tracking-wider text-gray-500 px-2">Name</div>
        <div class="text-xs uppercase tracking-wider text-gray-500">Road</div>
        <div class="text-xs uppercase tracking-wider text-gray-500 text-center">Addr</div>
        <div class="text-xs uppercase tracking-wider text-gray-500 text-center">Consist</div>
      </div>
      <LocoListRow
        v-for="loco in locos"
        :key="loco.address"
        :loco="loco"
        @click="emit('select', loco)"
      />
    </div>

    <!-- 🔧 Raw view — JSON debug -->
    <div v-else-if="controls.viewAs.value === 'raw'" class="p-4">
      <pre class="text-xs text-gray-400 bg-gray-900 rounded-lg p-4 overflow-auto max-h-[600px]">{{ JSON.stringify(locos, null, 2) }}</pre>
    </div>
  </template>
</template>

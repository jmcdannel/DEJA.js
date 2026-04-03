<script setup lang="ts">
import { toRef } from 'vue'
import type { Loco } from '@repo/modules/locos'
import { ROADNAMES } from '@repo/modules/locos'
import { useListControls } from '../composables/useListControls'
import type { ViewOption } from '../ListControls/types'
import LocoNumberPlate from './LocoNumberPlate.vue'
import LocoCard from './LocoCard.vue'
import LocoListRow from './LocoListRow.vue'

interface Props {
  locos: Loco[]
  defaultView?: 'avatar' | 'card' | 'list'
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

// 🗂️ View options exposed to parent for ListControlBar
const viewOptions: ViewOption[] = [
  { value: 'avatar', icon: 'mdi-view-module', label: 'Avatar' },
  { value: 'card', icon: 'mdi-view-grid-outline', label: 'Card' },
  { value: 'list', icon: 'mdi-view-list', label: 'List' },
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
    <!-- 🖼️ Avatar view — flex-wrap grid of LocoNumberPlate -->
    <div v-if="controls.viewAs.value === 'avatar'" class="flex flex-wrap gap-4 p-2">
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
            size="md"
            :show-label="true"
            :label="loco.name"
          />
        </v-badge>
        <LocoNumberPlate
          v-else
          :address="loco.address"
          :color="getRoadnameColor(loco)"
          size="md"
          :show-label="true"
          :label="loco.name"
        />
      </div>
    </div>

    <!-- 🃏 Card view — responsive CSS grid -->
    <div
      v-else-if="controls.viewAs.value === 'card'"
      class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <LocoCard
        v-for="loco in locos"
        :key="loco.address"
        :loco="loco"
        @click="emit('select', loco)"
      />
    </div>

    <!-- 📋 List view — table with header + rows -->
    <div v-else-if="controls.viewAs.value === 'list'">
      <!-- Header row -->
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

      <!-- Loco rows -->
      <LocoListRow
        v-for="loco in locos"
        :key="loco.address"
        :loco="loco"
        @click="emit('select', loco)"
      />
    </div>
  </template>
</template>

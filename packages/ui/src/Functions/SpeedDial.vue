<!-- packages/ui/src/Functions/SpeedDial.vue -->
<script setup lang="ts">
import { ref, computed, type PropType } from 'vue'
import { useDisplay } from 'vuetify'
import FunctionButton from './FunctionButton.vue'
import SoundButton from './SoundButton.vue'
import FunctionList from './FunctionList.vue'
import type { Loco, LocoFunction } from '@repo/modules/locos'
import { soundSlotDefaults, type SoundSlot } from '@repo/modules/locos'

type DccSlot = { kind: 'dcc'; func: LocoFunction }
type SoundSlotItem = { kind: 'sound'; slot: SoundSlot }
type SpeedDialSlot = DccSlot | SoundSlotItem

const props = defineProps({
  loco: {
    type: Object as PropType<Loco>,
    required: true,
  },
})

defineEmits(['saveLoco'])

const { mobile } = useDisplay()
const listRef = ref<{ showModal: () => void } | null>(null)

function openAllFunctions() {
  listRef?.value?.showModal()
}

defineExpose({
  openAll: () => listRef?.value?.showModal(),
})

const slots = computed<SpeedDialSlot[]>(() => {
  const favorites = props.loco.functions?.filter(f => f.isFavorite) ?? []

  if (props.loco.hasSound) {
    // Sound loco: show all favorited DCC functions
    return favorites.map(func => ({ kind: 'dcc' as const, func }))
  }

  // Silent loco: DCC favorites + pad with sound slots up to 9 total
  const dccSlots: SpeedDialSlot[] = favorites.map(func => ({ kind: 'dcc' as const, func }))
  const soundPadding = Math.max(0, 9 - dccSlots.length)
  const soundSlots: SpeedDialSlot[] = soundSlotDefaults
    .slice(0, soundPadding)
    .map(slot => ({ kind: 'sound' as const, slot }))
  return [...dccSlots, ...soundSlots]
})
</script>

<template>
  <template v-if="loco">
    <section class="flex flex-col flex-grow justify-center">
      <ul
        :class="[
          'grid',
          mobile ? 'grid-cols-2' : 'grid-cols-3',
          'justify-center',
          'mx-2',
          'items-center',
          'gap-1',
        ]"
      >
        <li v-for="(item, idx) in slots" :key="idx">
          <FunctionButton
            v-if="item.kind === 'dcc'"
            :func="item.func"
            :address="loco.address"
            class="w-full"
          />
          <SoundButton
            v-else
            :sound-slot="item.slot"
            class="w-full"
          />
        </li>

        <!-- "..." button — col-span-2 on mobile, col-span-3 on desktop, centered -->
        <li :class="mobile ? 'col-span-2 flex justify-center' : 'col-span-3 flex justify-center'">
          <v-btn
            icon="mdi-dots-horizontal"
            class="rounded-full border border-cyan-400/60 fn-btn-bg w-12 h-12"
            @click="openAllFunctions()"
          />
        </li>
      </ul>
    </section>

    <FunctionList ref="listRef" :loco="loco" />
  </template>
</template>

<style scoped>
.fn-btn-bg {
  background: rgba(var(--v-theme-surface), 0.8);
}
</style>

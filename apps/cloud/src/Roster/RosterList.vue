<script setup lang="ts">
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import RosterItem from '@/Roster/RosterItem.vue'
import { useLocos, type Loco } from '@repo/modules/locos'

const emit = defineEmits(['edit'])

const { getLocos } = useLocos()

let locos = getLocos()

function handleEdit(loco: Loco) {
  console.log('handleEdit', loco)
  emit('edit', loco)
}

</script>
<template>
  <div v-auto-animate class="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
    <slot name="prepend"></slot>
    <template v-if="locos?.length">
      <RosterItem v-for="loco in locos" :key="loco.id" :loco="loco as Loco" @edit="handleEdit"></RosterItem>
    </template>
  </div>
</template>

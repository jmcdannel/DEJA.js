<script setup lang="ts">
import EmptyState from '@/Core/UI/EmptyState.vue'
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
  <div v-if="locos?.length" class="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
    <slot name="prepend"></slot>
    <RosterItem v-for="loco in locos" :key="loco.id" :loco="loco as Loco" @edit="handleEdit"></RosterItem>
  </div>
  <EmptyState
    v-if="!locos?.length"
    icon="mdi-train"
    color="pink"
    title="No Locomotives Yet"
    description="Build your digital roster by adding locomotives with their DCC addresses, decoder functions, and custom configurations."
    :useCases="[{ icon: 'mdi-memory', text: 'Program DCC decoders' }, { icon: 'mdi-tune', text: 'Configure functions & lights' }, { icon: 'mdi-train-car', text: 'Build consists' }]"
    actionLabel="Add Your First Loco"
    actionTo="/locos/new"
  />
</template>

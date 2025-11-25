<script setup lang="ts">
import RosterList from '@/roster/RosterList.vue';
import { useLayout, type Tag } from '@repo/modules'
import { LocoAvatar } from '@repo/ui'
import { useLocos, type Loco } from '@repo/modules/locos'
import ModuleList from '@repo/ui/src/ModuleList/List.vue'

const { getLocos } = useLocos()

const locos = getLocos()

function handleSelectLoco(loco: Loco): void {
  console.log('Selected loco:', loco)
}

function getLocoFromItem(item: Loco): Loco {
  const loco = locos.value.find((loco) => loco.id === item.id)
  return loco || item
}

</script>
<template>
  <main class="@container min-h-screen forest-background bg-opacity-50 bg-fixed overflow-auto p-2 md:p-4">
    <!-- <RosterList /> -->
    <ModuleList 
      module-name="locos"
      color="purple-darken-4"
      title="Loco Roster"
      icon="mdi-lightning-bolt"
      :list="locos"
      @update:state="handleSelectLoco"
      :view-options="[
        { label: 'Avatar', value: 'avatar' },
        { label: 'Card', value: 'card' },
        { label: 'Table', value: 'table' },
        { label: 'Raw', value: 'raw' }
      ]"
      :sort-options="[
        { label: 'Default', value: 'order' },
        { label: 'Name', value: 'name' },
        { label: 'Address', value: 'address' }
      ]"
    >
    <template #item="{ item }">      
        <LocoAvatar :loco="getLocoFromItem(item as Loco)" :size="48" />
    </template>
  </ModuleList>
  </main>
</template>

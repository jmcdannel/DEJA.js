<script setup lang="ts">
import {  useRouter } from 'vue-router'
import type { Loco } from '@repo/modules/locos'
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
import RosterList from '@/Roster/RosterList.vue'
import AddTile from '@/Core/UI/AddTile.vue'

const router = useRouter()

function handleEditLoco(loco: Loco) {
  router.push({ name: 'Edit Loco', params: { address: loco.address}})
}
function handleAddLoco() {
  router.push({ name: 'Add Loco' })
}

</script>
<template>
  <ModuleTitle menu="Loco Roster" />
  <RosterList @edit="handleEditLoco">
    <template #prepend>
      <AddTile @click="handleAddLoco" />
    </template>
  </RosterList>
</template>
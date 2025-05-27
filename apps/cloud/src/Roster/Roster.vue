<script setup lang="ts">
import { ref } from 'vue'
import type { Loco } from '@repo/modules/locos'
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
import AddLoco from '@/Roster/AddLoco.vue'
import EditLoco from '@/Roster/EditLoco.vue'
import RosterList from '@/Roster/RosterList.vue'
import AddTile from '@/Core/UI/AddTile.vue'

const showAddLoco = ref(false)
const showEditLoco = ref(false)
const editLoco = ref<Loco | null>(null)

function handleEdit(loco: Loco) {
  console.log('handleEdit', loco)
  editLoco.value = loco
  showEditLoco.value = true
}

</script>
<template>
  <ModuleTitle menu="Roster" />
  <AddLoco v-if="showAddLoco" @close="showAddLoco = false" />
  <EditLoco v-else-if="showEditLoco" @close="showEditLoco = false" :loco="editLoco as Loco" />
  <RosterList v-else-if="!showAddLoco && !showEditLoco" @edit="handleEdit" @add="showAddLoco = true" :allowEdit="!showEditLoco">
    <template #prepend>
      <AddTile color="pink" @click="showAddLoco = true" />
    </template>
  </RosterList>
  <!-- <pre>
    {{  locos }}
  </pre> -->
</template>
<style>

.slide-move,
.slide-leave-active,
.slide-enter-active {
  transition: .5s;
}
.slide-enter {
  transform: translateX(100%);
  opacity: 0;
}
.slide-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.slide-leave-active {
  position: absolute;
}
</style>
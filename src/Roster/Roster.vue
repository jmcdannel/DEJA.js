<script setup lang="ts">
import { ref } from 'vue'
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
import AddLoco from '@/Roster/AddLoco.vue'
import EditLoco from '@/Roster/EditLoco.vue'
import RosterList from '@/Roster/RosterList.vue'
import AddTile from '@/Core/UI/AddTile.vue'

const showAddLoco = ref(false)
const showEditLoco = ref(false)
const editLoco = ref(null)

function handleEdit(loco) {
  console.log('handleEdit', loco)
  editLoco.value = loco
  showEditLoco.value = true
}

</script>
<template>
  <ModuleTitle menu="Roster" />
  <Transition name="slide">
    <AddLoco v-if="showAddLoco" @close="showAddLoco = false" :layoutId="layoutId" />
    <EditLoco v-else-if="showEditLoco" @close="showEditLoco = false" :layoutId="layoutId" :loco="editLoco" />
    <RosterList v-else-if="!showAddLoco && !showEditLoco" @edit="handleEdit" @add="showAddLoco = true" :allowEdit="!showEditLoco">
      <template #prepend>
        <AddTile color="pink" @click="showAddLoco = true" />
      </template>
    </RosterList>
  </Transition>
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
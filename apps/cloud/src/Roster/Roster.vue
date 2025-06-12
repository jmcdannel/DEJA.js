<script setup lang="ts">
import { ref } from 'vue'
import type { Loco } from '@repo/modules/locos'
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
import AddLoco from '@/Roster/AddLoco.vue'
import EditLoco from '@/Roster/EditLoco.vue'
import RosterList from '@/Roster/RosterList.vue'
import AddTile from '@/Core/UI/AddTile.vue'

const editLoco = ref(<Loco | null>null)
const addLoco = ref(false)

</script>
<template>
  <ModuleTitle menu="Loco Roster" />
  <AddLoco v-if="addLoco" @close="addLoco = false" />
  <Transition v-else name="slide">
    <EditLoco v-if="editLoco" v-show="editLoco" @close="editLoco = null" :loco="editLoco" />
    <RosterList v-else @edit="loco => editLoco = loco">
      <template #prepend>
        <AddTile @click="addLoco = true" color="purple" />
      </template>
    </RosterList>
  </Transition>
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
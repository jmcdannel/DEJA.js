<script setup lang="ts">
import { ref } from 'vue'
import type { Effect } from '@repo/modules'
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
import RouteForm from '@/Routes/RouteForm.vue'
import RoutesList from '@/Routes/RoutesList.vue'
import AddTile from '@/Core/UI/AddTile.vue'

const editEffect = ref(<Effect | null>null)
const newEfx = {}

</script>
<template>
  <ModuleTitle menu="Routes" />
  <Transition name="slide">
    <RouteForm v-if="editEffect" v-show="editEffect" @close="editEffect = null" :efx="editEffect" />
    <RoutesList v-else @edit="efx => editEffect = efx">
      <template #prepend>
        <AddTile @click="editEffect = {...newEfx} as Effect" color="purple" />
      </template>
    </RoutesList>
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
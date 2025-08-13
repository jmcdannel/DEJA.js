<script setup lang="ts">
import { ref } from 'vue'
import type { Effect } from '@repo/modules'
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
import EffectForm from '@/Effects/EffectForm.vue'
import EffectsList from '@/Effects/EffectsList.vue'
import AddTile from '@/Core/UI/AddTile.vue'
import { ListMenu } from '@repo/ui'

const editEffect = ref(<Effect | null>null)
const newEfx = {}

</script>
<template>
  <ModuleTitle menu="Effects">
    <ListMenu :disabledMenus="['view']" :module-name="'effects'" />
  </ModuleTitle>
  <Transition name="slide">
    <EffectForm v-if="editEffect" v-show="editEffect" @close="editEffect = null" :efx="editEffect" />
    <EffectsList v-else @edit="efx => editEffect = efx">
      <template #prepend>
        <AddTile @click="editEffect = {type: '', state: false, id: '', ...newEfx}" color="purple" />
      </template>
    </EffectsList>
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
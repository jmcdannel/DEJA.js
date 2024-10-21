<script setup lang="ts">
import { ref } from 'vue'
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
import EffectForm from '@/Effects/EffectForm.vue'
import EffectsList from '@/Effects/EffectsList.vue'
import AddTile from '@/Core/UI/AddTile.vue'

const showForm = ref(false)
const editEffect = ref(null)

function handleEdit(efx) {
  console.log('handleEdit', efx)
  editEffect.value = efx
  showForm.value = true
}

function handleClose() {
  showForm.value = false
  editEffect.value = null
}
</script>
<template>
  <ModuleTitle menu="Effects" />
  <Transition name="slide">
    <EffectForm v-if="showForm" v-show="showForm" @close="handleClose" :efx="editEffect" />
    <EffectsList v-else @edit="handleEdit">
      <template #prepend>
        <AddTile @click="showForm = true" color="purple" />
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
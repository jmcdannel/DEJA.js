<script setup lang="ts">
import { ref } from 'vue'
import type { Turnout } from '@repo/modules/turnouts'
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
import TurnoutsList from '@/Turnouts/TurnoutsList.vue'
import TurnoutForm from '@/Turnouts/TurnoutForm.vue'
import Addtile from '@/Core/UI/AddTile.vue'

const showForm = ref(false)
const editTurnout = ref<Turnout | null>(null)

function handleEdit(turnout: Turnout | null) {
  console.log('handleEdit', turnout)
  editTurnout.value = turnout ? { ...turnout } : null
  showForm.value = true
}
function handleClose() {
  showForm.value = false
  editTurnout.value = null
}

</script>
<template>
  <ModuleTitle menu="Turnouts" />
  <TurnoutForm v-if="showForm" v-show="showForm" @close="handleClose" :turnout="editTurnout" />
  <TurnoutsList v-else @edit="handleEdit">
    <template #prepend>
      <Addtile @click="showForm = true" color="yellow" />
    </template>
  </TurnoutsList>
</template>
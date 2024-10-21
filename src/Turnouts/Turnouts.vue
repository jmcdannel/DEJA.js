<script setup lang="ts">
import { ref } from 'vue'
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
import TurnoutsList from '@/Turnouts/TurnoutsList.vue'
import AddTurnout from '@/Turnouts/AddTurnout.vue'
import TurnoutForm from '@/Turnouts/TurnoutForm.vue'
import Addtile from '@/Core/UI/AddTile.vue'

const showForm = ref(false)
const editTurnout = ref(null)

function handleEdit(turnout) {
  console.log('handleEdit', turnout)
  editTurnout.value = turnout
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
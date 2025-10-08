<script setup lang="ts">
import { useRouter } from 'vue-router'
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
import TurnoutForm from '@/Turnouts/TurnoutForm.vue'

const router = useRouter()

function handleClose() {
  router.push({ name: 'Turnouts' })
}
</script>
<template>
  <ModuleTitle menu="Turnouts" />
  <TurnoutForm :turnout="null" @close="handleClose" />
</template>

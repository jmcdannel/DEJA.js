<script setup lang="ts">
import { useRouter } from 'vue-router'
import PageHeader from '@/Core/UI/PageHeader.vue'
import TurnoutForm from '@/Turnouts/TurnoutForm.vue'

const router = useRouter()

function handleClose() {
  router.push({ name: 'Turnouts' })
}
</script>
<template>
  <PageHeader menu="Turnouts" />
  <TurnoutForm :turnout="null" @close="handleClose" />
</template>

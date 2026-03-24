<script setup lang="ts">
import { useRouter } from 'vue-router'
import { PageHeader } from '@repo/ui'
import TurnoutForm from '@/Turnouts/TurnoutForm.vue'

const router = useRouter()

function handleClose() {
  router.push({ name: 'Turnouts' })
}
</script>
<template>
  <PageHeader title="Turnouts" icon="mdi-call-split" color="amber" />
  <TurnoutForm :turnout="null" @close="handleClose" />
</template>

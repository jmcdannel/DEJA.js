<script setup lang="ts">
import { useRouter } from 'vue-router'
import TurnoutForm from '@/Turnouts/TurnoutForm.vue'
import FormPageHeader from '@/Common/FormPageHeader.vue'

const router = useRouter()

function handleClose() {
  router.push({ name: 'Turnouts' })
}
</script>

<template>
  <div class="animate-fade-in-up space-y-4 max-w-[800px] px-4">
    <FormPageHeader
      icon="mdi-call-split"
      title="New Turnout"
      subtitle="Add a turnout to your layout"
      color="#f59e0b"
      back-label="Turnouts"
      :back-route="{ name: 'Turnouts' }"
    />

    <TurnoutForm :turnout="null" @close="handleClose" />
  </div>
</template>

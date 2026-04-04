<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import SignalForm from '@/Signals/SignalForm.vue'
import FormPageHeader from '@/Common/FormPageHeader.vue'
import type { Signal } from '@repo/modules/signals'

const router = useRouter()
const defaultSignal = computed<Signal>(() => ({
  id: '',
  name: '',
  device: '',
  red: undefined,
  yellow: undefined,
  green: undefined,
  aspect: null,
  commonAnode: false,
}))

function handleClose() {
  router.push({ name: 'Signals' })
}
</script>
<template>
  <div class="animate-fade-in-up space-y-4 max-w-[800px] px-4">
    <FormPageHeader
      icon="mdi-traffic-light"
      title="New Signal"
      subtitle="Add a signal to your layout"
      color="#10b981"
      back-label="Signals"
      :back-route="{ name: 'Signals' }"
    />

    <SignalForm :signal="defaultSignal" @close="handleClose" />
  </div>
</template>

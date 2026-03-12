<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/Core/UI/PageHeader.vue'
import SignalForm from '@/Signals/SignalForm.vue'
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
  <PageHeader menu="Signals" />
  <SignalForm :signal="defaultSignal" @close="handleClose" />
</template>

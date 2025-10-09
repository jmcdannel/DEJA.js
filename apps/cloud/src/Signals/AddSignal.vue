<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
import EffectForm from '@/Effects/EffectForm.vue'
import type { Effect } from '@repo/modules/effects'

const router = useRouter()
const defaultSignal = computed<Effect>(() => ({
  id: '',
  name: '',
  type: 'signal',
  color: 'emerald',
  tags: [],
  allowGuest: false,
  state: false,
}))

function handleClose() {
  router.push({ name: 'Signals' })
}
</script>
<template>
  <ModuleTitle menu="Signals" />
  <EffectForm :efx="defaultSignal" @close="handleClose" />
</template>

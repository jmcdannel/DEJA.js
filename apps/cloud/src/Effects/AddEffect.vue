<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { PageHeader } from '@repo/ui'
import EffectForm from '@/Effects/EffectForm.vue'
import type { Effect } from '@repo/modules'

const router = useRouter()
const defaultEffect = computed<Effect>(() => ({
  id: '',
  name: '',
  type: '',
  color: 'purple',
  tags: [],
  allowGuest: false,
  state: false,
}))

function handleClose() {
  router.push({ name: 'Effects' })
}
</script>
<template>
  <PageHeader title="Effects" icon="mdi-rocket-launch" color="indigo" />
  <EffectForm :efx="defaultEffect" @close="handleClose" />
</template>

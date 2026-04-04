<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import EffectForm from '@/Effects/EffectForm.vue'
import FormPageHeader from '@/Common/FormPageHeader.vue'
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
  <div class="animate-fade-in-up space-y-4 max-w-[800px] px-4">
    <FormPageHeader
      icon="mdi-rocket-launch"
      title="New Effect"
      subtitle="Add an effect to your layout"
      color="#6366f1"
      back-label="Effects"
      :back-route="{ name: 'Effects' }"
    />

    <EffectForm :efx="defaultEffect" @close="handleClose" />
  </div>
</template>

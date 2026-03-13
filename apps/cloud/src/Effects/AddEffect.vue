<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/Core/UI/PageHeader.vue'
import EffectForm from '@/Effects/EffectForm.vue'
import type { Effect } from '@repo/modules'
import { ListMenu } from '@repo/ui'

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
  <PageHeader menu="Effects">
    <ListMenu :disabledMenus="['view']" :module-name="'effects'" />
  </PageHeader>
  <EffectForm :efx="defaultEffect" @close="handleClose" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'
import EffectForm from '@/Effects/EffectForm.vue'
import type { Effect } from '@repo/modules'
import { useEfx } from '@repo/modules'
import { ListMenu } from '@repo/ui'

const route = useRoute()
const router = useRouter()
const { getEffect } = useEfx()
const effect = ref<Effect | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

async function loadEffect() {
  loading.value = true
  error.value = null
  const effectId = route.params.effectId as string
  try {
    const result = await getEffect(effectId)
    if (result) {
      effect.value = result
    } else {
      error.value = 'Effect not found.'
    }
  } catch (err) {
    console.error(err)
    error.value = 'Unable to load effect.'
  } finally {
    loading.value = false
  }
}

function handleClose() {
  router.push({ name: 'Effects' })
}

onMounted(loadEffect)
</script>
<template>
  <ModuleTitle menu="Effects">
    <ListMenu :disabledMenus="['view']" :module-name="'effects'" />
  </ModuleTitle>
  <div v-if="loading" class="p-6 flex justify-center">
    <v-progress-circular indeterminate color="purple" />
  </div>
  <v-alert v-else-if="error" type="error" class="ma-4" :text="error" closable @click:close="handleClose" />
  <EffectForm v-else-if="effect" :efx="effect" @close="handleClose" />
</template>

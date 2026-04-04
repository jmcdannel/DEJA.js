<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createLogger } from '@repo/utils'
import EffectForm from '@/Effects/EffectForm.vue'
import FormPageHeader from '@/Common/FormPageHeader.vue'
import type { Effect } from '@repo/modules'
import { useEfx } from '@repo/modules'

const log = createLogger('EditEffect')

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
    log.error(err)
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
  <div class="animate-fade-in-up space-y-4 max-w-[800px] px-4">
    <FormPageHeader
      icon="mdi-rocket-launch"
      :title="effect?.name || 'Edit Effect'"
      color="#6366f1"
      back-label="Effects"
      :back-route="{ name: 'Effects' }"
    >
      <template #subtitle>
        <span v-if="effect?.type" class="text-xs text-white/45 bg-white/6 px-2 py-0.5 rounded font-mono">{{ effect.type }}</span>
      </template>
    </FormPageHeader>

    <div v-if="loading" class="p-6 flex justify-center">
      <v-progress-circular indeterminate color="indigo" />
    </div>
    <v-alert v-else-if="error" type="error" class="ma-4" :text="error" closable @click:close="handleClose" />
    <EffectForm v-else-if="effect" :efx="effect" @close="handleClose" />
  </div>
</template>

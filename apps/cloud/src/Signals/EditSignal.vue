<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createLogger } from '@repo/utils'
import SignalForm from '@/Signals/SignalForm.vue'
import FormPageHeader from '@/Common/FormPageHeader.vue'
import type { Signal } from '@repo/modules/signals'
import { useSignals } from '@repo/modules/signals'
import { useNotification } from '@repo/ui'

const log = createLogger('EditSignal')

const route = useRoute()
const router = useRouter()
const { getSignal } = useSignals()
const { notify } = useNotification()
const signal = ref<Signal | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

async function loadSignal() {
  loading.value = true
  error.value = null
  const signalId = route.params.signalId as string
  try {
    const result = await getSignal(signalId)
    if (result) {
      signal.value = result
    } else {
      error.value = 'Signal not found.'
    }
  } catch (err) {
    log.error(err)
    notify.error('Unable to load signal.')
    error.value = 'Unable to load signal.'
  } finally {
    loading.value = false
  }
}

function handleClose() {
  router.push({ name: 'Signals' })
}

onMounted(loadSignal)
</script>
<template>
  <div class="animate-fade-in-up space-y-4 max-w-[800px] px-4">
    <FormPageHeader
      icon="mdi-traffic-light"
      :title="signal?.name || 'Edit Signal'"
      color="#10b981"
      back-label="Signals"
      :back-route="{ name: 'Signals' }"
    />

    <div v-if="loading" class="p-6 flex justify-center">
      <v-progress-circular indeterminate color="emerald" />
    </div>
    <v-alert v-else-if="error" type="error" class="ma-4" :text="error" closable @click:close="handleClose" />
    <SignalForm v-else-if="signal" :signal="signal" @close="handleClose" />
  </div>
</template>

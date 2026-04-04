<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createLogger } from '@repo/utils'
import SignalForm from '@/Signals/SignalForm.vue'
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
    <!-- ═══ HERO HEADER ═══ -->
    <div
      class="flex items-center gap-4 p-5 rounded-[14px] border"
      style="background: linear-gradient(135deg, rgba(16,185,129,0.08), transparent); border-color: rgba(16,185,129,0.15);"
    >
      <div class="w-14 h-14 rounded-[14px] flex items-center justify-center flex-shrink-0 bg-emerald-500/80">
        <v-icon size="28" color="white">mdi-traffic-light</v-icon>
      </div>
      <div class="flex-1 min-w-0">
        <h1 class="text-xl font-bold text-white/95 tracking-tight">{{ signal?.name || 'Edit Signal' }}</h1>
        <span class="text-xs text-white/45">Signal configuration</span>
      </div>
      <v-btn variant="outlined" size="small" class="text-none" @click="handleClose">
        <v-icon start size="16">mdi-arrow-left</v-icon> Signals
      </v-btn>
    </div>

    <div v-if="loading" class="p-6 flex justify-center">
      <v-progress-circular indeterminate color="emerald" />
    </div>
    <v-alert v-else-if="error" type="error" class="ma-4" :text="error" closable @click:close="handleClose" />
    <SignalForm v-else-if="signal" :signal="signal" @close="handleClose" />
  </div>
</template>

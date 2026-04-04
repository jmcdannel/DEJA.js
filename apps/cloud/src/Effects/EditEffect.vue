<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createLogger } from '@repo/utils'
import EffectForm from '@/Effects/EffectForm.vue'
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
    <!-- ═══ HERO HEADER ═══ -->
    <div
      class="flex items-center gap-4 p-5 rounded-[14px] border"
      style="
        background: linear-gradient(135deg, rgba(99,102,241,0.08), transparent);
        border-color: rgba(99,102,241,0.15);
      "
    >
      <div class="w-14 h-14 rounded-[14px] flex items-center justify-center flex-shrink-0 bg-indigo-500/80">
        <v-icon size="28" color="white">mdi-rocket-launch</v-icon>
      </div>
      <div class="flex-1 min-w-0">
        <h1 class="text-xl font-bold text-white/95 tracking-tight">{{ effect?.name || 'Edit Effect' }}</h1>
        <div class="flex items-center gap-2.5 mt-1">
          <span v-if="effect?.type" class="text-xs text-white/45 bg-white/6 px-2 py-0.5 rounded font-mono">{{ effect.type }}</span>
        </div>
      </div>
      <v-btn variant="outlined" size="small" class="text-none" @click="router.push({ name: 'Effects' })">
        <v-icon start size="16">mdi-arrow-left</v-icon>
        Effects
      </v-btn>
    </div>

    <div v-if="loading" class="p-6 flex justify-center">
      <v-progress-circular indeterminate color="indigo" />
    </div>
    <v-alert v-else-if="error" type="error" class="ma-4" :text="error" closable @click:close="handleClose" />
    <EffectForm v-else-if="effect" :efx="effect" @close="handleClose" />
  </div>
</template>

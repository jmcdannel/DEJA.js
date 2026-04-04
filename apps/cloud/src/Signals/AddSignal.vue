<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
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
        <h1 class="text-xl font-bold text-white/95 tracking-tight">New Signal</h1>
        <span class="text-xs text-white/45">Add a signal to your layout</span>
      </div>
      <v-btn variant="outlined" size="small" class="text-none" @click="handleClose">
        <v-icon start size="16">mdi-arrow-left</v-icon> Signals
      </v-btn>
    </div>

    <SignalForm :signal="defaultSignal" @close="handleClose" />
  </div>
</template>

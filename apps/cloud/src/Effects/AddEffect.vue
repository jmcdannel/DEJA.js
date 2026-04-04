<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
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
        <h1 class="text-xl font-bold text-white/95 tracking-tight">New Effect</h1>
        <div class="flex items-center gap-2.5 mt-1">
          <span class="text-xs text-white/45">Add an effect to your layout</span>
        </div>
      </div>
      <v-btn variant="outlined" size="small" class="text-none" @click="router.push({ name: 'Effects' })">
        <v-icon start size="16">mdi-arrow-left</v-icon>
        Effects
      </v-btn>
    </div>

    <EffectForm :efx="defaultEffect" @close="handleClose" />
  </div>
</template>

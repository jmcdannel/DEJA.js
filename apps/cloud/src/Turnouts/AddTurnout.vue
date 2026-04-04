<script setup lang="ts">
import { useRouter } from 'vue-router'
import TurnoutForm from '@/Turnouts/TurnoutForm.vue'

const router = useRouter()

function handleClose() {
  router.push({ name: 'Turnouts' })
}
</script>

<template>
  <div class="animate-fade-in-up space-y-4 max-w-[800px] px-4">
    <!-- ═══ HERO HEADER ═══ -->
    <div
      class="flex items-center gap-4 p-5 rounded-[14px] border"
      style="
        background: linear-gradient(135deg, rgba(245,158,11,0.08), transparent);
        border-color: rgba(245,158,11,0.15);
      "
    >
      <div class="w-14 h-14 rounded-[14px] flex items-center justify-center flex-shrink-0 bg-amber-500/80">
        <v-icon size="28" color="white">mdi-call-split</v-icon>
      </div>
      <div class="flex-1 min-w-0">
        <h1 class="text-xl font-bold text-white/95 tracking-tight">New Turnout</h1>
        <div class="flex items-center gap-2.5 mt-1">
          <span class="text-xs text-white/45">Add a turnout to your layout</span>
        </div>
      </div>
      <v-btn variant="outlined" size="small" class="text-none" @click="router.push({ name: 'Turnouts' })">
        <v-icon start size="16">mdi-arrow-left</v-icon>
        Turnouts
      </v-btn>
    </div>

    <TurnoutForm :turnout="null" @close="handleClose" />
  </div>
</template>

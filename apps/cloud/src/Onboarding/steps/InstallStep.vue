<script setup lang="ts">
import { QuickStart } from '@repo/ui'

defineProps<{
  uid?: string | null
  layoutId?: string
}>()

const emit = defineEmits<{
  complete: []
}>()
</script>

<template>
  <div class="install-step">
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-sky-100 mb-2">Install the DEJA Server</h2>
      <p class="text-slate-400 text-sm">
        Run the installer on the machine connected to your DCC-EX Command Station — a Raspberry Pi,
        Mac, or Linux box. Your account and layout are linked automatically via the URL below.
      </p>
    </div>

    <div class="glass-card mb-8">
      <QuickStart :completed="[1]" :uid="uid" :layout-id="layoutId" />
    </div>

    <div class="flex gap-3">
      <v-btn
        color="primary"
        size="large"
        class="text-none font-weight-bold flex-1"
        prepend-icon="mdi-arrow-right"
        @click="emit('complete')"
      >
        Continue to Dashboard
      </v-btn>
      <v-btn
        variant="text"
        size="large"
        class="text-none text-slate-400"
        @click="emit('complete')"
      >
        Skip for Now
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.install-step {
  max-width: 560px;
  margin: 0 auto;
}

.glass-card {
  position: relative;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(16px);
  border-radius: 16px;
  padding: 28px;
  border: 1px solid transparent;
  background-clip: padding-box;
}
.glass-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 17px;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.3), rgba(148, 163, 184, 0.1) 40%, rgba(20, 184, 166, 0.2));
  z-index: -1;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  padding: 1px;
}
</style>

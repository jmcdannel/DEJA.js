<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  token?: string
  uid?: string | null
  layoutId?: string
}>()

const copiedInstall = ref(false)

const installCommand = computed(() => {
  if (props.token) {
    return `curl -fsSL https://install.dejajs.com | bash -s -- --token ${props.token}`
  }
  const params = new URLSearchParams()
  if (props.uid) params.set('uid', props.uid)
  if (props.layoutId) params.set('layout', props.layoutId)
  const qs = params.toString()
  const url = qs
    ? `https://install.dejajs.com?${qs}`
    : 'https://install.dejajs.com'
  return `curl -fsSL "${url}" | bash`
})

async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text)
  copiedInstall.value = true
  setTimeout(() => { copiedInstall.value = false }, 2000)
}
</script>

<template>
  <div class="setup-row setup-row--block">
    <div class="setup-row__label mb-3">
      <span class="setup-row__name">Install Command</span>
      <span class="setup-row__desc">Run this on the machine connected to your DCC-EX Command Station. Your account and layout are linked automatically.</span>
    </div>
    <div class="setup-install">
      <code class="setup-install__text">{{ installCommand }}</code>
      <v-btn variant="text" size="x-small" :icon="copiedInstall ? 'mdi-check' : 'mdi-content-copy'" :color="copiedInstall ? 'success' : undefined" @click="copyToClipboard(installCommand)" />
    </div>
  </div>
</template>

<style scoped>
.setup-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  gap: 16px;
}
.setup-row:last-child { border-bottom: none; }
.setup-row--block { flex-direction: column; align-items: stretch; }

.setup-row__label { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.setup-row__name { font-size: 0.875rem; font-weight: 500; color: rgba(var(--v-theme-on-surface), 0.8); }
.setup-row__desc { font-size: 0.75rem; color: rgba(var(--v-theme-on-surface), 0.5); }
.setup-install {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(var(--v-theme-surface-variant), 0.6);
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.setup-install__text {
  flex: 1;
  font-family: 'Roboto Mono', 'Fira Code', monospace;
  font-size: 0.8rem;
  color: rgb(var(--v-theme-primary));
  word-break: break-all;
  user-select: all;
}
</style>

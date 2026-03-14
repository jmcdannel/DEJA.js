<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  uid?: string | null
  layoutId?: string
}>()

const copiedUid = ref(false)
const copiedLayoutId = ref(false)
const copiedInstall = ref(false)
const installCommand = 'curl -fsSL https://install.dejajs.com | bash'

async function copyToClipboard(text: string, flag: 'uid' | 'layoutId' | 'install') {
  await navigator.clipboard.writeText(text)
  if (flag === 'uid') {
    copiedUid.value = true
    setTimeout(() => { copiedUid.value = false }, 2000)
  } else if (flag === 'layoutId') {
    copiedLayoutId.value = true
    setTimeout(() => { copiedLayoutId.value = false }, 2000)
  } else {
    copiedInstall.value = true
    setTimeout(() => { copiedInstall.value = false }, 2000)
  }
}
</script>

<template>
  <div class="setup-row">
    <div class="setup-row__label">
      <span class="setup-row__name">User UID</span>
      <span class="setup-row__desc">Your Firebase user identifier — needed for the install script</span>
    </div>
    <div class="setup-row__value flex items-center gap-2">
      <code class="setup-mono">{{ uid || '—' }}</code>
      <v-btn v-if="uid" variant="text" size="x-small" :icon="copiedUid ? 'mdi-check' : 'mdi-content-copy'" :color="copiedUid ? 'success' : undefined" @click="copyToClipboard(uid, 'uid')" />
    </div>
  </div>
  <div class="setup-row">
    <div class="setup-row__label">
      <span class="setup-row__name">Layout ID</span>
      <span class="setup-row__desc">Your layout identifier — needed for the install script</span>
    </div>
    <div class="setup-row__value flex items-center gap-2">
      <code class="setup-mono">{{ layoutId || '—' }}</code>
      <v-btn v-if="layoutId" variant="text" size="x-small" :icon="copiedLayoutId ? 'mdi-check' : 'mdi-content-copy'" :color="copiedLayoutId ? 'success' : undefined" @click="copyToClipboard(layoutId, 'layoutId')" />
    </div>
  </div>
  <div class="setup-row setup-row--block">
    <div class="setup-row__label mb-3">
      <span class="setup-row__name">Install Command</span>
      <span class="setup-row__desc">Run this on the machine connected to your DCC-EX Command Station. The installer will prompt for your UID and Layout ID.</span>
    </div>
    <div class="setup-install">
      <code class="setup-install__text">{{ installCommand }}</code>
      <v-btn variant="text" size="x-small" :icon="copiedInstall ? 'mdi-check' : 'mdi-content-copy'" :color="copiedInstall ? 'success' : undefined" @click="copyToClipboard(installCommand, 'install')" />
    </div>
  </div>
</template>

<style scoped>
.setup-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.06);
  gap: 16px;
}
.setup-row:last-child { border-bottom: none; }
.setup-row--block { flex-direction: column; align-items: stretch; }

.setup-row__label { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.setup-row__name { font-size: 0.875rem; font-weight: 500; color: #cbd5e1; }
.setup-row__desc { font-size: 0.75rem; color: rgba(148, 163, 184, 0.6); }
.setup-row__value { flex-shrink: 0; }

.setup-mono {
  font-family: 'Roboto Mono', 'Fira Code', monospace;
  font-size: 0.8rem;
  color: #e0f2fe;
  background: rgba(2, 6, 23, 0.5);
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  user-select: all;
}

.setup-install {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(2, 6, 23, 0.6);
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.setup-install__text {
  flex: 1;
  font-family: 'Roboto Mono', 'Fira Code', monospace;
  font-size: 0.8rem;
  color: #22d3ee;
  word-break: break-all;
  user-select: all;
}
</style>

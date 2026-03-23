<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'
import { useDocument } from 'vuefire'
import { doc } from 'firebase/firestore'
import { db } from '@repo/firebase-config'
import { useDcc } from '@repo/dccex/useDcc'
import type { CommandButtonConfig } from './composables/types'

const { sendDccCommand } = useDcc()
const layoutId = useStorage('@DEJA/layoutId', '')

// Read layout doc for dccEx.power state (used by Power toggle)
const layoutDoc = useDocument(
  computed(() => layoutId.value ? doc(db, 'layouts', layoutId.value) : null)
)
const isPowerOn = computed(() => layoutDoc.value?.dccEx?.power ?? false)

// Prompt dialog state
const promptDialog = ref(false)
const promptLabel = ref('')
const promptValue = ref('')
const pendingTemplate = ref('')

// Confirm dialog state
const confirmDialog = ref(false)
const confirmLabel = ref('')
const pendingConfirmPayload = ref('')

const commands: CommandButtonConfig[] = [
  { id: 'power', label: 'Power', icon: 'mdi-flash', payload: '1', payloadOff: '0', accentColor: '#4ade80', mode: 'toggle' },
  { id: 'main-trk', label: 'Main Trk', icon: 'mdi-ray-start-arrow', payload: '1 MAIN', accentColor: '#22d3ee', mode: 'one-shot' },
  { id: 'prog-trk', label: 'Prog Trk', icon: 'mdi-cog', payload: '1 PROG', accentColor: '#a78bfa', mode: 'one-shot' },
  { id: 'join-trks', label: 'Join Trks', icon: 'mdi-link-variant', payload: '1 JOIN', accentColor: '#86efac', mode: 'one-shot' },
  { id: 'e-stop', label: 'E-Stop All', icon: 'mdi-alert-octagon', payload: '!', accentColor: '#f87171', mode: 'one-shot' },
  { id: 'stop-loco', label: 'Stop Loco', icon: 'mdi-stop', payload: '', accentColor: '#fb923c', mode: 'prompt', promptLabel: 'Loco Address', promptTemplate: 't {value} 0 1' },
  { id: 'status', label: 'Status', icon: 'mdi-information-outline', payload: 's', accentColor: '#38bdf8', mode: 'one-shot' },
  { id: 'reset', label: 'Reset', icon: 'mdi-refresh', payload: 'D RESET', accentColor: '#fbbf24', mode: 'confirm' },
  { id: 'turnouts', label: 'Turnouts', icon: 'mdi-call-split', payload: 'T', accentColor: '#38bdf8', mode: 'one-shot' },
  { id: 'locos', label: 'Locos', icon: 'mdi-train', payload: 'JR', accentColor: '#38bdf8', mode: 'one-shot' },
  { id: 'save', label: 'Save', icon: 'mdi-content-save', payload: 'E', accentColor: '#a78bfa', mode: 'one-shot' },
  { id: 'outputs', label: 'Outputs', icon: 'mdi-format-list-bulleted', payload: 'Z', accentColor: '#94a3b8', mode: 'one-shot' },
  { id: 'forget-all', label: 'Forget All', icon: 'mdi-delete-sweep', payload: '-', accentColor: '#a78bfa', mode: 'confirm' },
  { id: 'read-cv', label: 'Read CV', icon: 'mdi-magnify', payload: '', accentColor: '#a78bfa', mode: 'prompt', promptLabel: 'CV Number', promptTemplate: 'R {value}' },
]

async function handleCommand(cmd: CommandButtonConfig) {
  switch (cmd.mode) {
    case 'toggle': {
      const payload = isPowerOn.value ? (cmd.payloadOff ?? '0') : cmd.payload
      await sendDccCommand({ action: 'dcc', payload })
      break
    }
    case 'one-shot':
      await sendDccCommand({ action: 'dcc', payload: cmd.payload })
      break
    case 'prompt':
      promptLabel.value = cmd.promptLabel ?? 'Value'
      pendingTemplate.value = cmd.promptTemplate ?? '{value}'
      promptValue.value = ''
      promptDialog.value = true
      break
    case 'confirm':
      confirmLabel.value = cmd.label
      pendingConfirmPayload.value = cmd.payload
      confirmDialog.value = true
      break
  }
}

async function submitPrompt() {
  const val = promptValue.value.trim()
  if (!val) return
  const payload = pendingTemplate.value.replace('{value}', val)
  await sendDccCommand({ action: 'dcc', payload })
  promptDialog.value = false
  promptValue.value = ''
}

async function submitConfirm() {
  await sendDccCommand({ action: 'dcc', payload: pendingConfirmPayload.value })
  confirmDialog.value = false
}

function isActive(cmd: CommandButtonConfig): boolean {
  return cmd.mode === 'toggle' && cmd.id === 'power' && isPowerOn.value
}
</script>

<template>
  <div class="command-panel">
    <div class="command-panel-title">Commands</div>
    <div class="command-grid">
      <button
        v-for="cmd in commands"
        :key="cmd.id"
        class="command-btn"
        :style="{
          borderColor: isActive(cmd) ? cmd.accentColor : `${cmd.accentColor}40`,
          boxShadow: isActive(cmd) ? `0 0 8px ${cmd.accentColor}30` : 'none',
        }"
        @click="handleCommand(cmd)"
      >
        <v-icon :color="cmd.accentColor" size="18">{{ cmd.icon }}</v-icon>
        <span class="command-btn-label" :style="{ color: cmd.accentColor }">{{ cmd.label }}</span>
      </button>
    </div>
  </div>

  <!-- Prompt Dialog -->
  <v-dialog v-model="promptDialog" max-width="320">
    <v-card color="surface" class="border border-opacity-20">
      <v-card-title class="text-sm text-cyan-400">{{ promptLabel }}</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="promptValue"
          :label="promptLabel"
          variant="outlined"
          density="compact"
          autofocus
          hide-details
          @keyup.enter="submitPrompt"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="promptDialog = false">Cancel</v-btn>
        <v-btn color="cyan" variant="tonal" @click="submitPrompt">Send</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Confirm Dialog -->
  <v-dialog v-model="confirmDialog" max-width="320">
    <v-card color="surface" class="border border-opacity-20">
      <v-card-title class="text-sm text-amber-400">Confirm {{ confirmLabel }}</v-card-title>
      <v-card-text>
        Are you sure you want to execute <strong>{{ confirmLabel }}</strong>?
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="confirmDialog = false">Cancel</v-btn>
        <v-btn color="amber" variant="tonal" @click="submitConfirm">Confirm</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.command-panel {
  background: rgba(var(--v-theme-surface-variant), 0.55);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(var(--v-border-color), 0.18);
  border-radius: 12px;
  padding: 14px;
}

.command-panel-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #38bdf8;
  margin-bottom: 12px;
  font-weight: 600;
}

.command-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.command-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid;
  border-radius: 8px;
  padding: 10px 8px;
  cursor: pointer;
  transition: all 150ms ease;
}

.command-btn:hover {
  transform: translateY(-1px);
  background: rgba(var(--v-theme-on-surface), 0.08);
}

.command-btn-label {
  font-size: 10px;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
}
</style>

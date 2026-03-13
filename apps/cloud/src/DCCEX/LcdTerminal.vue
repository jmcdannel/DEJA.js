<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useDcc } from '@repo/dccex/useDcc'
import type { DccLogEntry } from './composables/types'

const props = defineProps<{
  entries: DccLogEntry[]
  isConnected: boolean
  version?: string
}>()

const { sendDccCommand } = useDcc()
const commandInput = ref('')
const logContainer = ref<HTMLElement | null>(null)

/** Color map for log entry types */
const typeColors: Record<DccLogEntry['type'], { color: string; glow: string }> = {
  'cmd-out': { color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.2)' },
  'cmd-in': { color: '#4ade80', glow: 'rgba(74, 222, 128, 0.2)' },
  'info': { color: '#86efac', glow: 'rgba(134, 239, 172, 0.15)' },
  'error': { color: '#f87171', glow: 'rgba(248, 113, 113, 0.2)' },
  'system': { color: '#2d6a4f', glow: 'none' },
}

function getEntryStyle(type: DccLogEntry['type']) {
  const { color, glow } = typeColors[type]
  return {
    color,
    textShadow: glow !== 'none' ? `0 0 3px ${glow}` : 'none',
  }
}

function formatTimestamp(ts: number): string {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

/** Auto-scroll to bottom when new entries arrive */
watch(
  () => props.entries.length,
  async () => {
    await nextTick()
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    }
  }
)

async function sendCommand() {
  const raw = commandInput.value.trim()
  if (!raw) return

  // Strip angle brackets if user typed them
  const payload = raw.replace(/^<|>$/g, '').trim()
  if (!payload) return

  await sendDccCommand({ action: 'dcc', payload })
  commandInput.value = ''
}
</script>

<template>
  <div class="lcd-terminal">
    <!-- Scan line overlay -->
    <div class="lcd-scanlines" />

    <!-- Header bar -->
    <div class="lcd-header">
      <div class="lcd-header-left">
        <div
          class="lcd-status-dot"
          :class="isConnected ? 'lcd-status-online' : 'lcd-status-offline'"
        />
        <span class="lcd-header-label">DCC-EX Terminal</span>
      </div>
      <span class="lcd-header-version">{{ version || '' }}</span>
    </div>

    <!-- Log body -->
    <div ref="logContainer" class="lcd-log-body">
      <div
        v-for="(entry, idx) in entries"
        :key="idx"
        class="lcd-log-line"
      >
        <span class="lcd-timestamp">{{ formatTimestamp(entry.timestamp) }}</span>
        <span v-if="entry.type === 'cmd-out'" class="lcd-prompt">&gt; </span>
        <span :style="getEntryStyle(entry.type)">{{ entry.message }}</span>
      </div>

      <!-- Empty state -->
      <div v-if="entries.length === 0" class="lcd-log-line">
        <span style="color: #2d6a4f;">&gt; Waiting for data...</span>
      </div>

      <!-- Blinking cursor -->
      <div class="lcd-log-line">
        <span class="lcd-cursor">_</span>
      </div>
    </div>

    <!-- Command input -->
    <div class="lcd-input-area">
      <span class="lcd-input-prompt">&gt;</span>
      <input
        v-model="commandInput"
        class="lcd-input"
        placeholder="type command..."
        @keyup.enter="sendCommand"
      />
      <button class="lcd-send-btn" @click="sendCommand">
        SEND
      </button>
    </div>
  </div>
</template>

<style scoped>
.lcd-terminal {
  font-family: 'Courier New', monospace;
  background: linear-gradient(180deg, #050a05 0%, #0a120a 100%);
  border: 2px solid #1a3a2a;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 0 40px rgba(74, 222, 128, 0.06), inset 0 2px 4px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  min-height: 300px;
}

.lcd-scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 3px,
    rgba(0, 0, 0, 0.06) 3px,
    rgba(0, 0, 0, 0.06) 4px
  );
  pointer-events: none;
  z-index: 2;
}

.lcd-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(74, 222, 128, 0.15);
  position: relative;
  z-index: 1;
}

.lcd-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lcd-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.lcd-status-online {
  background: #4ade80;
  box-shadow: 0 0 6px #4ade80;
}

.lcd-status-offline {
  background: #ef4444;
  box-shadow: 0 0 6px #ef4444;
}

.lcd-header-label {
  color: #4ade80;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  text-shadow: 0 0 4px rgba(74, 222, 128, 0.3);
}

.lcd-header-version {
  color: #22543d;
  font-size: 9px;
}

.lcd-log-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  max-height: 500px;
  position: relative;
  z-index: 1;
}

.lcd-log-line {
  font-size: 13px;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-all;
}

.lcd-timestamp {
  color: #22543d;
  font-size: 10px;
  margin-right: 8px;
}

.lcd-prompt {
  color: #fbbf24;
  text-shadow: 0 0 3px rgba(251, 191, 36, 0.2);
}

.lcd-cursor {
  color: #4ade80;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.lcd-input-area {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-top: 1px solid rgba(74, 222, 128, 0.15);
  position: relative;
  z-index: 1;
}

.lcd-input-prompt {
  color: #4ade80;
  font-size: 13px;
  text-shadow: 0 0 3px rgba(74, 222, 128, 0.2);
  flex-shrink: 0;
}

.lcd-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #4ade80;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  caret-color: #4ade80;
}

.lcd-input::placeholder {
  color: #22543d;
}

.lcd-send-btn {
  background: transparent;
  border: 1px solid rgba(74, 222, 128, 0.3);
  color: #4ade80;
  font-family: 'Courier New', monospace;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 150ms ease;
  flex-shrink: 0;
}

.lcd-send-btn:hover {
  background: rgba(74, 222, 128, 0.1);
  border-color: rgba(74, 222, 128, 0.5);
}

/* Scrollbar styling for the log body */
.lcd-log-body::-webkit-scrollbar {
  width: 4px;
}

.lcd-log-body::-webkit-scrollbar-track {
  background: transparent;
}

.lcd-log-body::-webkit-scrollbar-thumb {
  background: rgba(74, 222, 128, 0.2);
  border-radius: 2px;
}
</style>

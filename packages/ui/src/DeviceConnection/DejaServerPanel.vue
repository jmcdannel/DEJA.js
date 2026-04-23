<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Device } from '@repo/modules'
import { useServerStatus } from '@repo/modules'
import StatusPulse from '../animations/StatusPulse.vue'

interface DejaServerPanelProps {
  /** Full device list so we can show "N of M devices connected". */
  devices?: Device[]
  /** Optional: jump to server details (hidden if not provided). */
  onNavigate?: (deviceId: string) => void
}

const props = withDefaults(defineProps<DejaServerPanelProps>(), {
  devices: () => [],
  onNavigate: undefined,
})

const emit = defineEmits<{
  navigate: [deviceId: string]
}>()

const { serverStatus } = useServerStatus()

const isOnline = computed(() => serverStatus.value?.online ?? false)

const version = computed(() => serverStatus.value?.version ?? null)
const ip = computed(() => serverStatus.value?.ip ?? null)

const uptime = computed(() => {
  if (!isOnline.value || !serverStatus.value?.lastSeen) return null
  const elapsed = Date.now() - Number(serverStatus.value.lastSeen)
  if (elapsed < 0) return null
  const mins = Math.floor(elapsed / 60_000)
  const hrs = Math.floor(mins / 60)
  const days = Math.floor(hrs / 24)
  if (days > 0) return `${days}d ${hrs % 24}h`
  if (hrs > 0) return `${hrs}h ${mins % 60}m`
  if (mins > 0) return `${mins}m`
  return '<1m'
})

const connectedCount = computed(
  () => props.devices.filter((d) => d.type !== 'deja-server' && d.isConnected).length,
)
const totalCount = computed(
  () => props.devices.filter((d) => d.type !== 'deja-server').length,
)

const serverDevice = computed(() =>
  props.devices.find((d) => d.type === 'deja-server'),
)

// 📋 copy `deja start` to clipboard with brief feedback
const copied = ref(false)
async function copyDejaStart() {
  try {
    await navigator.clipboard.writeText('deja start')
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 1800)
  } catch {
    // Silent fallback for insecure contexts
  }
}

function handleNavigate() {
  if (serverDevice.value) emit('navigate', serverDevice.value.id)
}
</script>

<template>
  <section
    class="deja-server-panel"
    :class="{ 'deja-server-panel--online': isOnline }"
  >
    <!-- Ambient glow -->
    <div class="deja-server-panel__glow" aria-hidden="true" />

    <div class="deja-server-panel__body">
      <!-- ── Brand + status ─────────────────────────────────────── -->
      <div class="deja-server-panel__brand">
        <div class="deja-server-panel__logo">
          <v-icon
            :icon="isOnline ? 'mdi-server-network' : 'mdi-server-network-off'"
            size="28"
          />
        </div>

        <div class="min-w-0">
          <div class="flex items-baseline gap-2 flex-wrap">
            <h3 class="deja-server-panel__title">DEJA Server</h3>
            <span
              v-if="version"
              class="text-[0.65rem] uppercase tracking-[0.12em] text-slate-400 font-mono"
            >
              v{{ version }}
            </span>
          </div>
          <div class="flex items-center gap-2 mt-0.5">
            <StatusPulse
              :status="isOnline ? 'connected' : 'disconnected'"
              size="sm"
            />
            <span
              class="text-xs font-medium"
              :class="isOnline ? 'text-emerald-400' : 'text-red-400'"
            >
              {{ isOnline ? 'Online' : 'Offline' }}
            </span>
            <span v-if="isOnline && ip" class="text-xs text-slate-500 font-mono">
              · {{ ip }}
            </span>
          </div>
        </div>

        <v-spacer />

        <v-btn
          v-if="serverDevice"
          variant="text"
          size="small"
          class="opacity-70 hover:opacity-100"
          @click="handleNavigate"
        >
          Details
          <v-icon end icon="mdi-arrow-right" size="14" />
        </v-btn>
      </div>

      <!-- ── Online: stats ─────────────────────────────────────── -->
      <div v-if="isOnline" class="deja-server-panel__stats">
        <div class="deja-server-panel__stat">
          <div class="deja-server-panel__stat-label">Uptime</div>
          <div class="deja-server-panel__stat-value">{{ uptime || '—' }}</div>
        </div>
        <div class="deja-server-panel__stat">
          <div class="deja-server-panel__stat-label">Devices</div>
          <div class="deja-server-panel__stat-value">
            <span class="text-emerald-400">{{ connectedCount }}</span>
            <span class="text-slate-500"> / {{ totalCount }}</span>
          </div>
        </div>
        <div v-if="ip" class="deja-server-panel__stat">
          <div class="deja-server-panel__stat-label">Address</div>
          <div class="deja-server-panel__stat-value font-mono text-xs">
            {{ ip }}
          </div>
        </div>
        <div v-if="serverStatus?.mqttEnabled !== undefined || serverStatus?.wsEnabled !== undefined" class="deja-server-panel__stat">
          <div class="deja-server-panel__stat-label">Services</div>
          <div class="deja-server-panel__stat-value flex gap-1 flex-wrap">
            <span v-if="serverStatus?.wsEnabled !== undefined" class="deja-server-panel__service" :class="serverStatus.wsEnabled ? 'deja-server-panel__service--on' : 'deja-server-panel__service--off'">
              <v-icon size="10">mdi-lan</v-icon> WS
            </span>
            <span v-if="serverStatus?.mqttEnabled !== undefined" class="deja-server-panel__service" :class="serverStatus.mqttEnabled ? 'deja-server-panel__service--on' : 'deja-server-panel__service--off'">
              <v-icon size="10">mdi-access-point</v-icon> MQTT
            </span>
          </div>
        </div>
      </div>

      <!-- ── Offline: CLI prompt ───────────────────────────────── -->
      <div v-else class="deja-server-panel__offline">
        <div class="deja-server-panel__offline-copy">
          <div class="text-sm text-slate-200 font-medium">
            Start the DEJA server to connect your devices
          </div>
          <div class="text-xs text-slate-400 mt-1">
            Run the command below in a terminal on the machine where your DCC‑EX
            command station is connected.
          </div>
        </div>

        <div class="deja-server-panel__cli">
          <code class="deja-server-panel__cli-prompt">$</code>
          <code class="deja-server-panel__cli-command">deja start</code>
          <v-btn
            size="x-small"
            variant="text"
            :icon="copied ? 'mdi-check' : 'mdi-content-copy'"
            :color="copied ? 'success' : undefined"
            class="deja-server-panel__cli-copy"
            @click="copyDejaStart"
          />
        </div>

        <div class="deja-server-panel__tips">
          <div class="deja-server-panel__tip">
            <v-icon icon="mdi-console" size="12" />
            <span>
              Need to install the CLI? Run
              <code>curl -fsSL https://install.dejajs.com | bash</code>
            </span>
          </div>
          <div class="deja-server-panel__tip">
            <v-icon icon="mdi-text-box-search-outline" size="12" />
            <span>
              Troubleshoot with <code>deja logs</code> or
              <code>deja status</code>
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.deja-server-panel {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  background: linear-gradient(
    135deg,
    rgba(15, 23, 42, 0.85) 0%,
    rgba(15, 23, 42, 0.65) 100%
  );
  border: 1px solid rgba(148, 163, 184, 0.18);
  backdrop-filter: blur(8px);
  box-shadow: 0 14px 40px -28px rgba(148, 163, 184, 0.45);
  transition: border-color 220ms ease, box-shadow 220ms ease;
}

.deja-server-panel--online {
  border-color: rgba(56, 189, 248, 0.35);
  box-shadow: 0 18px 48px -28px rgba(56, 189, 248, 0.55);
}

.deja-server-panel__glow {
  position: absolute;
  inset: -40%;
  background: radial-gradient(
    circle at 15% 20%,
    rgba(56, 189, 248, 0.18),
    transparent 55%
  );
  pointer-events: none;
  opacity: 0.6;
}

.deja-server-panel--online .deja-server-panel__glow {
  background: radial-gradient(
    circle at 15% 20%,
    rgba(56, 189, 248, 0.28),
    transparent 55%
  );
  opacity: 1;
}

.deja-server-panel__body {
  position: relative;
  padding: 1.1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.deja-server-panel__brand {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.deja-server-panel__logo {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    rgba(56, 189, 248, 0.22),
    rgba(147, 51, 234, 0.22)
  );
  color: #e0f2fe;
  border: 1px solid rgba(56, 189, 248, 0.3);
  flex-shrink: 0;
}

.deja-server-panel--online .deja-server-panel__logo {
  background: linear-gradient(
    135deg,
    rgba(56, 189, 248, 0.35),
    rgba(34, 211, 238, 0.35)
  );
  box-shadow: 0 0 24px -4px rgba(56, 189, 248, 0.5);
}

.deja-server-panel__title {
  font-size: 1rem;
  font-weight: 700;
  color: #f8fafc;
  letter-spacing: 0.01em;
}

/* ── Stats (online) ───────────────────────────────────────── */

.deja-server-panel__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
}

.deja-server-panel__stat {
  background: rgba(148, 163, 184, 0.06);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
}

.deja-server-panel__stat-label {
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: rgba(148, 163, 184, 0.7);
  margin-bottom: 0.15rem;
}

.deja-server-panel__stat-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #f8fafc;
}

/* ── Offline CTA ──────────────────────────────────────────── */

.deja-server-panel__offline {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.deja-server-panel__cli {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.75rem;
  background: rgba(2, 6, 23, 0.75);
  border: 1px solid rgba(56, 189, 248, 0.22);
  border-radius: 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.deja-server-panel__cli-prompt {
  color: rgba(56, 189, 248, 0.7);
  user-select: none;
}

.deja-server-panel__cli-command {
  color: #e0f2fe;
  font-weight: 600;
  font-size: 0.875rem;
  flex: 1;
}

.deja-server-panel__cli-copy {
  margin-left: auto;
}

.deja-server-panel__tips {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.deja-server-panel__tip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.72rem;
  color: rgba(148, 163, 184, 0.85);
}

.deja-server-panel__tip code {
  background: rgba(148, 163, 184, 0.12);
  padding: 0.05rem 0.35rem;
  border-radius: 4px;
  font-size: 0.7rem;
  color: #bae6fd;
}

.deja-server-panel__service {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 1px 5px;
  border-radius: 4px;
}
.deja-server-panel__service--on {
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.25);
}
.deja-server-panel__service--off {
  background: rgba(148, 163, 184, 0.08);
  color: rgba(148, 163, 184, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.12);
}
</style>

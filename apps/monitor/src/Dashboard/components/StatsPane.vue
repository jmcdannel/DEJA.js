<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useLayout, useLocos, useTurnouts, useEfx, useSignals } from '@repo/modules'
import { Doughnut, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)

const { getDevices } = useLayout()
const { getThrottles } = useLocos()
const { getTurnouts } = useTurnouts()
const { getEffects } = useEfx()
const { getSignals } = useSignals()

const devices = getDevices()
const throttles = getThrottles()
const turnouts = getTurnouts()
const effects = getEffects()
const signals = getSignals()

function toArray(ref: unknown): unknown[] {
  if (Array.isArray(ref)) return ref
  const candidate = ref as { value?: unknown }
  if (candidate && Array.isArray(candidate.value)) return candidate.value
  return []
}

const resolvedDevices = computed(() => toArray(devices))
const resolvedThrottles = computed(() => toArray(throttles))
const resolvedTurnouts = computed(() => toArray(turnouts))
const resolvedEffects = computed(() => toArray(effects))
const resolvedSignals = computed(() => toArray(signals))

const connectedDeviceCount = computed(() =>
  resolvedDevices.value.filter((d) => (d as Record<string, unknown>).connected).length
)

const activeLocos = computed(() =>
  resolvedThrottles.value.filter((t) => ((t as Record<string, unknown>).speed as number) > 0).length
)

const uptime = ref('0:00:00')
let uptimeInterval: ReturnType<typeof setInterval>
const startTime = Date.now()

function updateUptime() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000)
  const h = Math.floor(elapsed / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  const s = elapsed % 60
  uptime.value = `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

onMounted(() => {
  uptimeInterval = setInterval(updateUptime, 1000)
})

onUnmounted(() => {
  clearInterval(uptimeInterval)
})

const doughnutData = computed(() => ({
  labels: ['Locos', 'Turnouts', 'Effects', 'Signals'],
  datasets: [{
    data: [
      resolvedThrottles.value.length,
      resolvedTurnouts.value.length,
      resolvedEffects.value.length,
      resolvedSignals.value.length,
    ],
    backgroundColor: [
      'rgba(234, 179, 8, 0.7)',
      'rgba(34, 197, 94, 0.7)',
      'rgba(249, 115, 22, 0.7)',
      'rgba(168, 85, 247, 0.7)',
    ],
    borderColor: [
      'rgb(234, 179, 8)',
      'rgb(34, 197, 94)',
      'rgb(249, 115, 22)',
      'rgb(168, 85, 247)',
    ],
    borderWidth: 1,
  }],
}))

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(2, 6, 23, 0.9)',
      borderColor: 'rgba(148, 163, 184, 0.2)',
      borderWidth: 1,
      titleFont: { family: 'Roboto Mono', size: 11 },
      bodyFont: { family: 'Roboto Mono', size: 11 },
    },
  },
}

const barData = computed(() => ({
  labels: ['Active', 'Idle'],
  datasets: [{
    label: 'Locos',
    data: [activeLocos.value, resolvedThrottles.value.length - activeLocos.value],
    backgroundColor: ['rgba(56, 189, 248, 0.6)', 'rgba(148, 163, 184, 0.15)'],
    borderColor: ['rgb(56, 189, 248)', 'rgba(148, 163, 184, 0.3)'],
    borderWidth: 1,
    borderRadius: 3,
  }],
}))

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y' as const,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(2, 6, 23, 0.9)',
      borderColor: 'rgba(148, 163, 184, 0.2)',
      borderWidth: 1,
      titleFont: { family: 'Roboto Mono', size: 11 },
      bodyFont: { family: 'Roboto Mono', size: 11 },
    },
  },
  scales: {
    x: {
      display: false,
      grid: { display: false },
    },
    y: {
      ticks: {
        color: 'rgba(148, 163, 184, 0.6)',
        font: { family: 'Roboto Mono', size: 10 },
      },
      grid: { display: false },
    },
  },
}

interface StatCard {
  label: string
  icon: string
  color: string
  value: string | number
}

const statCards = computed<StatCard[]>(() => [
  { label: 'Active Locos', icon: 'mdi-train', color: 'rgb(234, 179, 8)', value: `${activeLocos.value}/${resolvedThrottles.value.length}` },
  { label: 'Devices', icon: 'mdi-devices', color: 'rgb(56, 189, 248)', value: `${connectedDeviceCount.value}/${resolvedDevices.value.length}` },
  { label: 'Turnouts', icon: 'mdi-source-branch', color: 'rgb(34, 197, 94)', value: resolvedTurnouts.value.length },
  { label: 'Effects', icon: 'mdi-lightbulb-on', color: 'rgb(249, 115, 22)', value: resolvedEffects.value.length },
  { label: 'Signals', icon: 'mdi-traffic-light', color: 'rgb(168, 85, 247)', value: resolvedSignals.value.length },
  { label: 'Uptime', icon: 'mdi-timer-outline', color: 'rgb(148, 163, 184)', value: uptime.value },
])
</script>

<template>
  <div class="flex flex-col gap-2 p-3 h-full overflow-y-auto font-mono">
    <!-- Stat cards row -->
    <div class="grid grid-cols-3 gap-1.5">
      <div
        v-for="(stat, i) in statCards"
        :key="stat.label"
        class="stats-card"
        :style="{ animationDelay: `${i * 60}ms` }"
      >
        <v-icon :icon="stat.icon" size="14" :style="{ color: stat.color }" />
        <div class="flex flex-col ml-1.5 min-w-0">
          <span class="text-[0.55rem] uppercase tracking-wider text-slate-500 truncate">{{ stat.label }}</span>
          <span class="text-lg font-extrabold tabular-nums" :style="{ color: stat.color }">{{ stat.value }}</span>
        </div>
      </div>
    </div>

    <!-- Charts row -->
    <div class="grid grid-cols-2 gap-2 flex-1 min-h-0">
      <div class="stats-chart-card">
        <span class="text-[0.55rem] uppercase tracking-widest text-slate-500 mb-1">Layout Objects</span>
        <div class="flex-1 min-h-0 relative">
          <Doughnut :data="doughnutData" :options="doughnutOptions" />
        </div>
      </div>
      <div class="stats-chart-card">
        <span class="text-[0.55rem] uppercase tracking-widest text-slate-500 mb-1">Loco Status</span>
        <div class="flex-1 min-h-0 relative">
          <Bar :data="barData" :options="barOptions" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-card {
  display: flex;
  align-items: center;
  padding: 0.375rem 0.5rem;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.08);
  animation: stats-slide-in 0.4s ease both;
}

.stats-chart-card {
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.08);
  animation: stats-slide-in 0.5s ease both;
  animation-delay: 0.3s;
}

@keyframes stats-slide-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

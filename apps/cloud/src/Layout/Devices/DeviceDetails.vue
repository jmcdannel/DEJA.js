<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useCollection } from 'vuefire'
import { useRouter } from 'vue-router'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@repo/firebase-config'
import { useStorage, useClipboard } from '@vueuse/core'
import { useColors } from '@/Core/UI/useColors'
import { deviceTypes, useTurnouts, useEfx, useLayout, useLocos, useSignals, useSensors, type Device, type Effect, type Loco, type Turnout, type Signal, type Sensor, efxTypes } from '@repo/modules'
import { StatusPulse, TrackOutputConfig } from '@repo/ui'
import { useTrackOutputs, type TrackOutput } from '@repo/dccex'
import { useNotification } from '@repo/ui'
import { useDeviceConfig } from './useDeviceConfig'

const { getDevice, getDevices } = useLayout()
const { getTurnoutsByDevice } = useTurnouts()
const { getEffectsByDevice } = useEfx()
const { getSensorsByDevice } = useSensors()
const { getSignalsByDevice } = useSignals()
const { getLocos } = useLocos()
const { colors, DEFAULT_COLOR } = useColors()
const { notify } = useNotification()

const route = useRouter()
const deviceIdParam = route.currentRoute.value.params.deviceId || ''
const deviceId = Array.isArray(deviceIdParam) ? deviceIdParam[0] : deviceIdParam
const turnouts = useCollection(getTurnoutsByDevice(deviceId))
const effects = useCollection(getEffectsByDevice(deviceId))
const sensors = getSensorsByDevice(deviceId)
const signals = getSignalsByDevice(deviceId)
const locos = getLocos()

const layoutId = useStorage<string | null>('@DEJA/layoutId', null)
const device = ref(null as Device | null)

onMounted(async () => {
  if (deviceId) {
    device.value = await getDevice(deviceId) as Device
  }
})

const deviceType = computed(() => deviceTypes.find((type) => type.value === device.value?.type))

// 🔀 Client-side sorting (Firestore composite indexes aren't deployed for these)
const sortedSensors = computed<Sensor[]>(() =>
  [...((sensors?.value ?? []) as Sensor[])].sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
)
const sortedSignals = computed<Signal[]>(() =>
  [...((signals?.value ?? []) as Signal[])].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
)

const { isArduino, isPicoW, isDccEx, arduinoConfigH, picoConfigJson, dccExAutomationH } = useDeviceConfig({
  device,
  effects: computed(() => (effects.value ?? []) as Effect[]),
  turnouts: computed(() => (turnouts.value ?? []) as Turnout[]),
  sensors: sortedSensors,
  signals: sortedSignals,
  locos: computed(() => (locos.value ?? []) as Loco[]),
  layoutId: computed(() => layoutId.value ?? ''),
})

// 📄 The single config file this device needs for manual install
const deploymentConfig = computed<{ filename: string; content: string; language: string } | null>(() => {
  if (isArduino.value) return { filename: 'config.h', content: arduinoConfigH.value, language: 'cpp' }
  if (isPicoW.value) return { filename: 'config.json', content: picoConfigJson.value, language: 'json' }
  if (isDccEx.value) return { filename: 'myAutomation.h', content: dccExAutomationH.value, language: 'cpp' }
  return null
})

// Track outputs composable for reactive updates
const { trackOutputs, maxOutputs } = useTrackOutputs(() => deviceId)

// Determine if this is Device 1 (first dcc-ex device by document ID)
const allDevices = getDevices()
const isDevice1 = computed(() => {
  if (!isDccEx.value || !allDevices.value) return false
  const dccExDevices = allDevices.value
    .filter((d: Device) => d.type === 'dcc-ex')
    .sort((a: Device, b: Device) => a.id.localeCompare(b.id))
  return dccExDevices.length > 0 && dccExDevices[0].id === deviceId
})

async function handleSaveTrackOutputs(outputs: Record<string, TrackOutput>) {
  if (!layoutId.value || !deviceId) return
  try {
    await setDoc(
      doc(db, `layouts/${layoutId.value}/devices`, deviceId),
      { trackOutputs: outputs, timestamp: serverTimestamp() },
      { merge: true },
    )
    notify?.success('Track configuration saved. Restart the server to apply.')
  } catch (err) {
    notify?.error('Failed to save track configuration')
  }
}
const color = computed(() => colors[deviceType.value?.color || DEFAULT_COLOR])

// 📋 Copy the active deployment config to clipboard (for manual installs)
const configSource = computed(() => deploymentConfig.value?.content ?? '')
const { copy: copyConfig, copied: configCopied } = useClipboard({ source: configSource })

// 💾 Direct single-file download for users who prefer manual install over the guided flow
function handleDownloadConfigFile() {
  if (!deploymentConfig.value) return
  const { filename, content } = deploymentConfig.value
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// 📘 Deep link into the deploy docs
const DEPLOY_DOCS_URL = 'https://dejajs.com/docs/io/deploy'

// 💻 `deja deploy` command preview, tailored to the device id so users can copy-run it
const dejaDeployCommand = computed(() => device.value?.id ? `deja deploy ${device.value.id}` : 'deja deploy')

// 📋 Copy the `deja deploy` command to clipboard
const { copy: copyDejaCmd, copied: dejaCmdCopied } = useClipboard({ source: dejaDeployCommand })

// 📝 Per-device-type manual install hint (where to put the file after download)
const manualInstallHint = computed(() => {
  if (isArduino.value) return 'Save into your Arduino sketch folder next to deja-arduino.ino, then upload via Arduino IDE.'
  if (isPicoW.value) return 'Copy onto the CIRCUITPY drive on your Pico W — it reboots automatically.'
  if (isDccEx.value) return 'Save into your CommandStation EX sketch folder next to CommandStation-EX.ino, then upload via Arduino IDE.'
  return ''
})

function getEffectDetails(type: string | undefined) {
  const def = efxTypes.find(t => t.value === type)
  return {
    icon: def?.icon || 'mdi-lightbulb',
    color: def?.color || 'yellow'
  }
}

function handleBack() {
  route.push({ name: 'Devices' })
}
</script>

<template>
  <v-card
    class="mx-auto w-full h-full flex flex-col"
    :class="color.border"
    :color="color.value"
    variant="tonal"
  >
    <!-- Header -->
    <v-card-item class="pb-0" :class="color.value ? `bg-${color.value}-darken-1` : 'bg-grey-darken-3'">
      <template #prepend>
        <img v-if="deviceType?.image" :src="deviceType.image" alt="Device Logo" class="w-16 h-16 mr-4 bg-white rounded shadow" />
        <v-icon v-else :icon="deviceType?.icon || 'mdi-help'" class="w-16 h-16 mr-4 border rounded shadow bg-white text-grey-darken-4 text-h4" />
      </template>
      <v-card-title class="text-h5 font-weight-bold">
        {{ device?.id || deviceId }}
      </v-card-title>
      <v-card-subtitle class="text-subtitle-1 text-uppercase font-weight-bold opacity-80">
        {{ device?.type || 'Unknown Type' }}
      </v-card-subtitle>
      
      <template #append>
        <v-btn icon="mdi-close" variant="text" @click="handleBack"></v-btn>
      </template>
    </v-card-item>

    <v-card-text class="flex-grow-1 overflow-y-auto pa-4" style="background-color: rgb(var(--v-theme-surface)); color: rgb(var(--v-theme-on-surface));">
      
      <!-- Connection Details (Condensed) -->
      <div class="d-flex flex-wrap gap-2 mb-6">
        <v-chip
          size="small"
          prepend-icon="mdi-usb"
          :color="color.value"
          variant="flat"
          class="font-weight-medium"
        >
          {{ device?.connection?.toUpperCase() || 'UNKNOWN' }}
        </v-chip>
        <v-chip
          v-if="device?.port"
          size="small"
          :color="color.value"
          prepend-icon="mdi-memory"
          variant="outlined"
        >
          Port: {{ device?.port }}
        </v-chip>
        <v-chip
          v-if="device?.topic"
          size="small"
          :color="color.value"
          prepend-icon="mdi-wifi"
          variant="outlined"
        >
          Topic: {{ device?.topic }}
        </v-chip>
        <!-- Connection Status -->
        <v-chip
          v-if="['usb', 'wifi'].includes(device?.connection || '')"
          size="small"
          :variant="device?.isConnected ? 'elevated' : 'outlined'"
          :color="device?.isConnected ? 'success' : 'grey'"
          :prepend-icon="device?.connection === 'wifi' ? 'mdi-wifi' : 'mdi-memory'"
        >
          <template #append>
            <span v-if="device?.isConnected" class="ml-2 d-flex align-center">
              <StatusPulse status="connected" size="sm" />
            </span>
          </template>
          {{ device?.isConnected ? 'Connected' : 'Disconnected' }}
        </v-chip>
      </div>
      
      <v-divider class="mb-6"></v-divider>

      <!-- 🔧 Track Output Configuration (DCC-EX devices only) -->
      <TrackOutputConfig
        v-if="isDccEx"
        :track-outputs="trackOutputs"
        :max-outputs="maxOutputs"
        :is-device1="isDevice1"
        :disabled="false"
        @save="handleSaveTrackOutputs"
      />

      <!-- 📦 Deployment — always visible, above the Turnouts/Effects lists -->
      <div v-if="deploymentConfig" class="mb-6 border rounded bg-grey-darken-4/60 pa-4">
        <div class="d-flex align-center flex-wrap gap-2 mb-3">
          <v-icon icon="mdi-package-down" class="mr-1" :color="color.value" />
          <h3 class="text-h6 font-weight-medium">Deployment</h3>
          <v-chip size="x-small" variant="tonal" color="green" class="ml-1 font-mono">
            {{ deploymentConfig.filename }}
          </v-chip>
          <v-spacer />
          <v-btn
            size="small"
            variant="text"
            color="blue-lighten-2"
            :href="DEPLOY_DOCS_URL"
            target="_blank"
            rel="noopener noreferrer"
            prepend-icon="mdi-book-open-variant"
            append-icon="mdi-open-in-new"
          >
            Deployment docs
          </v-btn>
        </div>

        <!-- Two paths: recommended (deja CLI) + manual -->
        <v-row dense>
          <!-- ⚡ Recommended: deja deploy -->
          <v-col cols="12" md="6">
            <div class="border border-green-lighten-2/30 rounded pa-3 h-full bg-black/30">
              <div class="d-flex align-center mb-2">
                <v-icon icon="mdi-rocket-launch" color="green-lighten-2" size="small" class="mr-2" />
                <span class="text-body-2 font-weight-bold text-green-lighten-2">Recommended · deja CLI</span>
              </div>
              <p class="text-caption text-grey-lighten-1 mb-2">
                Generates <code class="text-green-lighten-2">{{ deploymentConfig.filename }}</code> from this device&apos;s live Firebase config and flashes it to the connected board.
              </p>
              <div class="d-flex align-center gap-2 bg-black/60 rounded pa-2 ring-1 ring-white/10 font-mono text-caption text-green-lighten-2">
                <span class="text-grey mr-1">$</span>
                <span class="flex-grow-1 overflow-x-auto">{{ dejaDeployCommand }}</span>
                <v-btn
                  size="x-small"
                  variant="text"
                  :icon="dejaCmdCopied ? 'mdi-check' : 'mdi-content-copy'"
                  :color="dejaCmdCopied ? 'green' : 'grey-lighten-1'"
                  @click="copyDejaCmd()"
                />
              </div>
              <p class="text-caption text-grey mt-2 mb-0">
                Don&apos;t have the CLI? See <a :href="DEPLOY_DOCS_URL" target="_blank" rel="noopener noreferrer" class="text-blue-lighten-2">deployment docs</a> for install instructions.
              </p>
            </div>
          </v-col>

          <!-- 🛠 Manual install -->
          <v-col cols="12" md="6">
            <div class="border border-white/10 rounded pa-3 h-full bg-black/30">
              <div class="d-flex align-center mb-2">
                <v-icon icon="mdi-wrench" color="grey-lighten-1" size="small" class="mr-2" />
                <span class="text-body-2 font-weight-bold">Manual install</span>
              </div>
              <p class="text-caption text-grey-lighten-1 mb-2">
                {{ manualInstallHint }}
              </p>
              <div class="d-flex gap-2 flex-wrap">
                <v-btn
                  size="small"
                  variant="tonal"
                  color="green"
                  :prepend-icon="configCopied ? 'mdi-check' : 'mdi-content-copy'"
                  @click="copyConfig()"
                >
                  {{ configCopied ? 'Copied' : `Copy ${deploymentConfig.filename}` }}
                </v-btn>
                <v-btn
                  size="small"
                  variant="elevated"
                  :color="color.value"
                  prepend-icon="mdi-download"
                  @click="handleDownloadConfigFile"
                >
                  Download {{ deploymentConfig.filename }}
                </v-btn>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Config preview, collapsed by default -->
        <v-expansion-panels variant="accordion" class="mt-3">
          <v-expansion-panel bg-color="grey-darken-4">
            <v-expansion-panel-title class="text-caption font-weight-medium">
              <v-icon icon="mdi-file-code-outline" size="small" class="mr-2" />
              Preview {{ deploymentConfig.filename }}
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <pre class="overflow-x-auto text-caption font-mono text-grey-lighten-1 bg-black/40 pa-3 ring-1 ring-white/10 rounded-md" style="max-height: 480px;">{{ deploymentConfig.content }}</pre>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>

      <!-- Condensed Lists -->
      <v-row>
        <!-- Turnouts List -->
        <v-col cols="12" md="6">
          <div class="d-flex align-center mb-3">
            <v-icon icon="mdi-directions-fork" class="mr-2" :color="color.value"></v-icon>
            <h3 class="text-h6 font-weight-medium">Turnouts</h3>
            <v-chip size="x-small" class="ml-2" variant="tonal" :color="color.value">
              {{ turnouts ? turnouts.length : 0 }}
            </v-chip>
          </div>
          
          <v-table density="compact" hover v-if="turnouts && turnouts.length > 0" class="border rounded text-caption">
            <thead class="bg-grey-darken-4">
              <tr>
                <th class="text-left py-1 px-2 font-weight-bold">Idx</th>
                <th class="text-left py-1 px-2 font-weight-bold">Name</th>
                <th class="text-center py-1 px-2 font-weight-bold">Pins</th>
                <th class="text-center py-1 px-2 font-weight-bold">Type</th>
                <th class="text-center py-1 px-2 font-weight-bold">State</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="turnout in turnouts" :key="turnout?.turnoutIdx" class="cursor-pointer hover:bg-white/5">
                <td class="font-mono text-grey py-1 px-2">{{ turnout?.turnoutIdx }}</td>
                <td class="font-weight-medium py-1 px-2 truncate max-w-[120px]" :title="turnout?.name">{{ turnout?.name || 'Unnamed' }}</td>
                <td class="text-center py-1 px-2 font-mono text-grey-lighten-1">
                  <span class="text-green-lighten-2">{{ turnout?.straight }}</span>/<span class="text-orange-lighten-2">{{ turnout?.divergent }}</span>
                </td>
                <td class="text-center py-1 px-2">
                  <v-chip size="x-small" variant="tonal" class="text-uppercase">{{ turnout?.type || 'DEFAULT' }}</v-chip>
                </td>
                <td class="text-center py-1 px-2">
                  <v-icon
                    :color="turnout?.state === true ? 'green' : turnout?.state === false ? 'orange' : 'grey'"
                    size="small"
                  >
                    {{ turnout?.state === true ? 'mdi-arrow-up' : turnout?.state === false ? 'mdi-arrow-bottom-right' : 'mdi-help' }}
                  </v-icon>
                </td>
              </tr>
            </tbody>
          </v-table>
          <div v-else class="text-caption text-grey italic pa-2 border rounded bg-white/5">
            No turnouts configured.
          </div>
        </v-col>

        <!-- Effects List -->
        <v-col cols="12" md="6">
          <div class="d-flex align-center mb-3">
            <v-icon icon="mdi-lightbulb" class="mr-2 text-yellow"></v-icon>
            <h3 class="text-h6 font-weight-medium">Effects</h3>
            <v-chip size="x-small" class="ml-2" variant="tonal" color="yellow">
              {{ effects ? effects.length : 0 }}
            </v-chip>
          </div>

          <v-table density="compact" hover v-if="effects && effects.length > 0" class="border rounded text-caption">
            <thead class="bg-grey-darken-4">
              <tr>
                <th class="text-left py-1 px-2 font-weight-bold">Name</th>
                <th class="text-left py-1 px-2 font-weight-bold">ID</th>
                <th class="text-center py-1 px-2 font-weight-bold">Type</th>
                <th class="text-center py-1 px-2 font-weight-bold">Pin</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="effect in effects" :key="effect?.id" class="cursor-pointer hover:bg-white/5">
                <td class="font-weight-medium py-1 px-2 truncate max-w-[120px]" :title="effect?.name">
                  <v-avatar color="grey-darken-4" size="28" class="mr-2 border border-white/10">
                    <v-icon :color="getEffectDetails(effect?.type).color" size="small">{{ getEffectDetails(effect?.type).icon }}</v-icon>
                  </v-avatar>
                  {{ effect?.name || 'Unnamed' }}
                </td>
                <td class="font-mono text-grey-lighten-1 py-1 px-2">{{ effect?.id }}</td>
                <td class="text-center text-capitalize py-1 px-2">{{ effect?.type || 'Standard' }}</td>
                <td class="text-center font-mono py-1 px-2">{{ effect?.pin || '--' }}</td>
              </tr>
            </tbody>
          </v-table>
          <div v-else class="text-caption text-grey italic pa-2 border rounded bg-white/5">
            No effects configured.
          </div>
        </v-col>

        <!-- Sensors List -->
        <v-col cols="12" md="6">
          <div class="d-flex align-center mb-3">
            <v-icon icon="mdi-radar" class="mr-2 text-cyan"></v-icon>
            <h3 class="text-h6 font-weight-medium">Sensors</h3>
            <v-chip size="x-small" class="ml-2" variant="tonal" color="cyan">
              {{ sortedSensors.length }}
            </v-chip>
          </div>

          <v-table density="compact" hover v-if="sortedSensors.length > 0" class="border rounded text-caption">
            <thead class="bg-grey-darken-4">
              <tr>
                <th class="text-left py-1 px-2 font-weight-bold">Idx</th>
                <th class="text-left py-1 px-2 font-weight-bold">Name</th>
                <th class="text-center py-1 px-2 font-weight-bold">Pin</th>
                <th class="text-center py-1 px-2 font-weight-bold">Type</th>
                <th class="text-center py-1 px-2 font-weight-bold">State</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sensor in sortedSensors" :key="sensor?.id" class="cursor-pointer hover:bg-white/5">
                <td class="font-mono text-grey py-1 px-2">{{ sensor?.index ?? '--' }}</td>
                <td class="font-weight-medium py-1 px-2 truncate max-w-[120px]" :title="sensor?.name">{{ sensor?.name || 'Unnamed' }}</td>
                <td class="text-center font-mono text-grey-lighten-1 py-1 px-2">{{ sensor?.pin ?? '--' }}</td>
                <td class="text-center py-1 px-2">
                  <v-chip size="x-small" variant="tonal" class="text-uppercase">{{ sensor?.type || '--' }}</v-chip>
                </td>
                <td class="text-center py-1 px-2">
                  <v-icon
                    :color="sensor?.state ? 'green' : 'grey'"
                    size="small"
                  >
                    {{ sensor?.state ? 'mdi-checkbox-marked-circle' : 'mdi-circle-outline' }}
                  </v-icon>
                </td>
              </tr>
            </tbody>
          </v-table>
          <div v-else class="text-caption text-grey italic pa-2 border rounded bg-white/5">
            No sensors configured.
          </div>
        </v-col>

        <!-- Signals List -->
        <v-col cols="12" md="6">
          <div class="d-flex align-center mb-3">
            <v-icon icon="mdi-traffic-light" class="mr-2 text-red"></v-icon>
            <h3 class="text-h6 font-weight-medium">Signals</h3>
            <v-chip size="x-small" class="ml-2" variant="tonal" color="red">
              {{ sortedSignals.length }}
            </v-chip>
          </div>

          <v-table density="compact" hover v-if="sortedSignals.length > 0" class="border rounded text-caption">
            <thead class="bg-grey-darken-4">
              <tr>
                <th class="text-left py-1 px-2 font-weight-bold">Name</th>
                <th class="text-center py-1 px-2 font-weight-bold">Pins (R/Y/G)</th>
                <th class="text-center py-1 px-2 font-weight-bold">Aspect</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="signal in sortedSignals" :key="signal?.id" class="cursor-pointer hover:bg-white/5">
                <td class="font-weight-medium py-1 px-2 truncate max-w-[140px]" :title="signal?.name">{{ signal?.name || 'Unnamed' }}</td>
                <td class="text-center py-1 px-2 font-mono text-grey-lighten-1">
                  <span class="text-red-lighten-2">{{ signal?.red ?? '-' }}</span>/<span class="text-yellow-lighten-2">{{ signal?.yellow ?? '-' }}</span>/<span class="text-green-lighten-2">{{ signal?.green ?? '-' }}</span>
                </td>
                <td class="text-center py-1 px-2">
                  <v-icon
                    size="small"
                    :color="signal?.aspect === 'red' ? 'red' : signal?.aspect === 'yellow' ? 'yellow' : signal?.aspect === 'green' ? 'green' : 'grey'"
                  >
                    mdi-circle
                  </v-icon>
                </td>
              </tr>
            </tbody>
          </v-table>
          <div v-else class="text-caption text-grey italic pa-2 border rounded bg-white/5">
            No signals configured.
          </div>
        </v-col>
      </v-row>

    </v-card-text>

    <v-divider></v-divider>
    <!-- Footer Actions -->
    <v-card-actions class="pa-4 bg-grey-darken-4">
      <v-btn
        @click="handleBack"
        color="grey-lighten-1"
        variant="tonal"
        valigned="center"
        prepend-icon="mdi-arrow-left"
      >
        Back to Devices
      </v-btn>
      <v-spacer></v-spacer>
    </v-card-actions>
  </v-card>
</template>


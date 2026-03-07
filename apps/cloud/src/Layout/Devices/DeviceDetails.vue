<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useCollection } from 'vuefire'
import { useRouter } from 'vue-router'
import { useColors } from '@/Core/UI/useColors'
import { deviceTypes, useTurnouts, useEfx, useLayout, type Device } from '@repo/modules/index.ts'
import { StatusPulse } from '@repo/ui'
import LcdDisplay from '@/Core/UI/LcdDisplay.vue'

const { getDevice } = useLayout()
const { getTurnoutsByDevice } = useTurnouts()
const { getEffectsByDevice } = useEfx()
const { colors, DEFAULT_COLOR } = useColors()

const route = useRouter()
const deviceIdParam = route.currentRoute.value.params.deviceId || '' 
const deviceId = Array.isArray(deviceIdParam) ? deviceIdParam[0] : deviceIdParam
const turnouts = useCollection(getTurnoutsByDevice(deviceId))
const effects = useCollection(getEffectsByDevice(deviceId))

const device = ref(null as Device | null)
const tab = ref('overview')

onMounted(async () => {
  if (deviceId) {
    device.value = await getDevice(deviceId) as Device
  }
})

const deviceType = computed(() => deviceTypes.find((type) => type.value === device.value?.type))
const color = computed(() => colors[deviceType.value?.color || DEFAULT_COLOR])

const effectNames = computed(() => effects.value ? effects.value.map(effect => effect.name) : [])
const turnoutNames = computed(() => turnouts.value ? turnouts.value.map(turnout => turnout.name) : [])
const turnoutPins = computed(() => turnouts.value ? turnouts.value.map(turnout => `${turnout.straight}, ${turnout.divergent}`) : [])
const turnoutPulsers = computed(() => turnouts.value ? turnouts.value.map(turnout => `TurnoutPulser(${turnout.straight}, ${turnout.divergent})`) : [])
const outPins = computed(() => effects.value ? effects.value.map(effect => effect.pin) : [])

function handleBack() {
  route.push({ name: 'home' }) // or specific layout back route
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
                  <v-icon :color="turnout?.state === 1 ? 'green' : 'orange'" size="small">
                    {{ turnout?.state === 1 ? 'mdi-arrow-up' : turnout?.state === 0 ? 'mdi-arrow-bottom-right' : 'mdi-help' }}
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
                <td class="font-weight-medium py-1 px-2 truncate max-w-[120px]" :title="effect?.name">{{ effect?.name || 'Unnamed' }}</td>
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
      </v-row>

      <v-divider class="my-6"></v-divider>

      <!-- Developer Configuration Section -->
      <v-expansion-panels v-if="['dcc-ex', 'deja-arduino'].includes(device?.type || '')" variant="accordion" class="border rounded">
        <v-expansion-panel bg-color="grey-darken-4">
          <v-expansion-panel-title class="font-weight-medium text-green-lighten-2">
            <v-icon icon="mdi-code-braces" class="mr-2"></v-icon> Developer Configuration
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="mb-4 relative bg-black/40 p-3 ring-1 ring-white/10 rounded-md shadow-inner">
              <h4 class="text-body-2 mb-2 text-green-lighten-2 font-mono">config.h</h4>
              <pre class="overflow-x-auto text-caption font-mono text-grey-lighten-1">
#include &lt;TurnoutPulser.h&gt;

#define DEVICE_ID "{{ device?.id }}"
#define ENABLE_PWM false
#define ENABLE_OUTPUTS {{ effects && effects.length > 0 ? 'true' : 'false' }}
#define ENABLE_SIGNALS false
#define ENABLE_TURNOUTS {{ turnouts && turnouts.length > 0 ? 'true' : 'false' }}
#define ENABLE_SENSORS false

#define SERVOMIN 150
#define SERVOMAX 600
#define MIN_PULSE_WIDTH 650
#define MAX_PULSE_WIDTH 2350
#define USMIN 600
#define USMAX 2400
#define SERVO_FREQ 50
#define SERVO_COUNT 16

int OUTPINS[] = { {{ outPins.join(', ') }} };
int SIGNALPINS[] = {};
int SENSORPINS[] = {A4, A8, A9};

TurnoutPulser turnouts[] = {};
              </pre>
            </div>
            
            <v-row class="mt-2">
              <v-col cols="12" md="6" v-if="turnoutPulsers.length > 0">
                <LcdDisplay 
                  :content="turnoutPulsers"
                  title="PULSER CODE"
                  color="blue"
                  size="sm"
                  :max-lines="10"
                />
              </v-col>
              <v-col cols="12" md="6" v-if="turnoutPins.length > 0">
                <LcdDisplay 
                  :content="turnoutPins"
                  title="PIN CONFIG"
                  color="green"
                  size="sm"
                  :max-lines="8"
                />
              </v-col>
              <v-col cols="12" md="6" v-if="turnoutNames.length > 0">
                <LcdDisplay 
                  :content="turnoutNames"
                  title="TURNOUT LABELS"
                  color="blue"
                  size="sm"
                  :max-lines="turnoutNames.length"
                />
              </v-col>
              <v-col cols="12" md="6" v-if="effectNames.length > 0">
                <LcdDisplay 
                  :content="effectNames"
                  title="EFFECT LABELS"
                  color="blue"
                  size="sm"
                  :max-lines="effectNames.length"
                />
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
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
        Back to Setup
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn
         v-if="['dcc-ex', 'deja-arduino'].includes(device?.type || '')"
        text="Deploy Code"
        :color="color.value"
        variant="elevated"
        prepend-icon="mdi-usb"
      ></v-btn>
    </v-card-actions>
  </v-card>
</template>

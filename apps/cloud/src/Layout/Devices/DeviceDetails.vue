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

    <!-- Tabs Navigation -->
    <v-tabs
      v-model="tab"
      :color="color.value"
      class="border-b border-white/10"
    >
      <v-tab value="overview">Overview</v-tab>
      <v-tab value="turnouts" :disabled="!turnouts || turnouts.length === 0">
        Turnouts <v-chip size="x-small" class="ml-2" v-if="turnouts">{{ turnouts.length }}</v-chip>
      </v-tab>
      <v-tab value="effects" :disabled="!effects || effects.length === 0">
        Effects <v-chip size="x-small" class="ml-2" v-if="effects">{{ effects.length }}</v-chip>
      </v-tab>
      <v-tab value="developer" v-if="['dcc-ex', 'deja-arduino'].includes(device?.type || '')">Developer</v-tab>
    </v-tabs>

    <!-- Tabs Content -->
    <v-card-text class="flex-grow-1 overflow-y-auto pa-4" style="background-color: rgb(var(--v-theme-surface)); color: rgb(var(--v-theme-on-surface));">
      <!-- OVERVIEW TAB -->
      <v-window v-model="tab" >
        <v-window-item value="overview">
          <h3 class="text-h6 mb-4">Connection Details</h3>
          <div class="d-flex flex-wrap gap-2 mb-6">
            <v-chip
              size="large"
              prepend-icon="mdi-usb"
              :color="color.value"
              variant="flat"
              class="font-weight-medium"
            >
              {{ device?.connection?.toUpperCase() || 'UNKNOWN' }}
            </v-chip>
            
            <v-chip
              v-if="device?.port"
              size="large"
              :color="color.value"
              prepend-icon="mdi-memory"
              variant="outlined"
            >
              Port: {{ device?.port }}
            </v-chip>
            
            <v-chip
              v-if="device?.topic"
              size="large"
              :color="color.value"
              prepend-icon="mdi-wifi"
              variant="outlined"
            >
              Topic: {{ device?.topic }}
            </v-chip>
            
            <!-- Connection Status -->
            <v-chip
              v-if="['usb', 'wifi'].includes(device?.connection || '')"
              size="large"
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
          
          <v-divider class="my-6"></v-divider>
          
          <div class="text-body-1 text-medium-emphasis">
            <p>This page provides a detailed view of the configuration for <strong>{{ device?.id || deviceId }}</strong>.</p>
            <p class="mt-2">Use the tabs above to view specific device elements like Turnouts or Effects, or generate connection code in the Developer tab.</p>
          </div>
        </v-window-item>

        <!-- TURNOUTS TAB -->
        <v-window-item value="turnouts">
          <v-table hover v-if="turnouts && turnouts.length > 0" class="border rounded">
            <thead class="bg-grey-darken-4">
              <tr>
                <th class="text-left font-weight-bold">Index</th>
                <th class="text-left font-weight-bold">Name</th>
                <th class="text-left font-weight-bold">ID</th>
                <th class="text-center font-weight-bold" colspan="2">Pins (Straight / Div)</th>
                <th class="text-left font-weight-bold">Type</th>
                <th class="text-center font-weight-bold">Live State</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="turnout in turnouts" :key="turnout?.turnoutIdx" class="cursor-pointer hover:bg-white/5">
                <td class="font-mono text-grey">{{ turnout?.turnoutIdx }}</td>
                <td class="font-weight-medium">{{ turnout?.name || 'Unnamed' }}</td>
                <td class="text-grey-lighten-1">{{ turnout?.id }}</td>
                <td class="text-right pr-1 font-mono text-green-lighten-2">{{ turnout?.straight }}</td>
                <td class="text-left pl-1 font-mono text-orange-lighten-2">{{ turnout?.divergent }}</td>
                <td>{{ turnout?.type || 'Default' }}</td>
                <td class="text-center">
                  <v-chip size="small" :color="turnout?.state === 1 ? 'green' : 'orange'" variant="flat">
                    {{ turnout?.state === 1 ? 'Straight' : turnout?.state === 0 ? 'Divergent' : 'Unknown' }}
                  </v-chip>
                </td>
              </tr>
            </tbody>
          </v-table>
          <v-alert v-else type="info" variant="tonal" class="mt-4">
            No turnouts configured for this device.
          </v-alert>
        </v-window-item>

        <!-- EFFECTS TAB -->
        <v-window-item value="effects">
          <v-row v-if="effects && effects.length > 0">
            <v-col v-for="effect in effects" :key="effect?.id" cols="12" sm="6" md="4">
              <v-card variant="outlined" class="h-100 hover:border-primary transition-all">
                <v-card-title class="d-flex align-center">
                  <v-icon icon="mdi-lightbulb" size="small" class="mr-2 text-yellow"></v-icon>
                  {{ effect.name || 'Unnamed Effect' }}
                </v-card-title>
                <v-card-subtitle class="font-mono">{{ effect.id }}</v-card-subtitle>
                <v-card-text>
                  <div class="d-flex justify-space-between mt-2">
                    <span class="text-grey">Type:</span>
                    <span class="font-weight-medium text-capitalize">{{ effect.type || 'Standard' }}</span>
                  </div>
                  <div class="d-flex justify-space-between mt-1">
                    <span class="text-grey">Control Pin:</span>
                    <span class="font-mono">{{ effect.pin || '--' }}</span>
                  </div>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions class="bg-grey-darken-4 opacity-50">
                  <span class="text-caption px-2">State view only</span>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
          <v-alert v-else type="info" variant="tonal" class="mt-4">
            No effects configured for this device.
          </v-alert>
        </v-window-item>

        <!-- DEVELOPER TAB -->
        <v-window-item value="developer" v-if="['dcc-ex', 'deja-arduino'].includes(device?.type || '')">
          <div class="mb-6 relative bg-grey-darken-4 p-4 ring-1 ring-white/10 rounded-md shadow-inner">
            <h3 class="text-h6 mb-2 text-green-lighten-2 font-mono">config.h</h3>
            <pre class="overflow-x-auto text-caption font-mono text-grey-lighten-2 p-2">
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
          
          <v-row>
            <v-col cols="12" md="6" v-if="turnoutPulsers.length > 0">
              <LcdDisplay 
                :content="turnoutPulsers"
                title="PULSER CODE"
                color="blue"
                size="md"
                :max-lines="10"
              />
            </v-col>
            <v-col cols="12" md="6" v-if="turnoutPins.length > 0">
              <LcdDisplay 
                :content="turnoutPins"
                title="PIN CONFIG"
                color="green"
                size="md"
                :max-lines="8"
              />
            </v-col>
            <v-col cols="12" md="6" v-if="turnoutNames.length > 0">
              <LcdDisplay 
                :content="turnoutNames"
                title="TURNOUT LABELS"
                color="blue"
                size="md"
                :max-lines="turnoutNames.length"
              />
            </v-col>
            <v-col cols="12" md="6" v-if="effectNames.length > 0">
              <LcdDisplay 
                :content="effectNames"
                title="EFFECT LABELS"
                color="blue"
                size="md"
                :max-lines="effectNames.length"
              />
            </v-col>
          </v-row>
        </v-window-item>
      </v-window>
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

<script setup lang="ts">
import { ref, watch, onErrorCaptured, computed } from 'vue'
import { useEfx, useLayout, type Device, type Effect, type EffectType, type MacroItem } from '@repo/modules'
import { efxTypes } from '@repo/modules/effects/constants'
import { createLogger } from '@repo/utils'
import { DevicePickerChip, DevicePickerGrid } from '@repo/ui'
import ViewJson from '@/Core/UI/ViewJson.vue'
import MacroForm from '@/Effects/MacroForm.vue'
import IALEDForm from '@/Effects/IALEDForm.vue'
import LcdDisplay from '@/Core/UI/LcdDisplay.vue'
import ColorPickerRow from '@/Common/Color/ColorPickerRow.vue'
import TagPicker from '@/Common/Tags/TagPicker.vue'
import SoundFileList from '@/Effects/Sounds/SoundFileList.vue'
import DevicePicker from '@/Layout/Devices/DevicePicker.vue'
import { WledEffectForm } from '@repo/wled/components'

const log = createLogger('EffectForm')
// TODO: icon picker

// Error handling
onErrorCaptured((error, instance, info) => {
  log.error('EffectForm: Error captured:', error)
  log.error('EffectForm: Instance:', instance)
  log.error('EffectForm: Info:', info)
  return false // Prevent error from propagating
})

interface ValidationRules {
  required: ((val: unknown) => boolean | string)[];
}

const props = defineProps<{
  efx: Effect
}>()

const emit = defineEmits(['close'])
const DEFAULT_DEVICE = 'dccex'
let getDevices: ReturnType<typeof useLayout>['getDevices']

try {
  const layoutHook = useLayout()
  getDevices = layoutHook.getDevices
  log.debug('EffectForm: useLayout hook loaded successfully')
} catch (error) {
  log.error('EffectForm: Failed to load useLayout hook:', error)
  getDevices = (() => []) as unknown as ReturnType<typeof useLayout>['getDevices']
}

let setEfx: ReturnType<typeof useEfx>['setEfx']
let getEfxType: ReturnType<typeof useEfx>['getEfxType']

try {
  const efxHook = useEfx()
  setEfx = efxHook.setEfx
  getEfxType = efxHook.getEfxType
  log.debug('EffectForm: useEfx hook loaded successfully')
} catch (error) {
  log.error('EffectForm: Failed to load useEfx hook:', error)
  setEfx = () => Promise.resolve(false)
  getEfxType = () => undefined as EffectType | undefined
}

// Debug imports
log.debug('EffectForm: Imports check:', {
  useEfx: !!useEfx,
  efxTypes: !!efxTypes,
  useLayout: !!useLayout
})

log.debug('EffectForm: efxTypes value:', efxTypes)
log.debug('EffectForm: Component mounting with props:', props.efx)

const device = ref(props.efx?.device || DEFAULT_DEVICE)
const name = ref(props.efx?.name || '')
const pin = ref(props.efx?.pin)
const macroOn = ref(props.efx?.on || [])
const macroOff = ref(props.efx?.off || [])
const pattern = ref(props.efx?.pattern || undefined)
const range = ref(props.efx?.range || undefined)
const config = ref(props.efx?.config || undefined)
const wledConfig = ref(props.efx?.wled ?? undefined)
const efxType = ref(props.efx?.type)
const efxTypeObj = ref(props.efx?.type ? getEfxType(props.efx?.type) : undefined)
const color = ref(props.efx?.color || efxTypeObj.value?.color || 'purple')
const tags = ref<string[]>(props.efx?.tags || [])
const allowGuest = ref<boolean>(props.efx?.allowGuest || false)

// 📦 Add-vs-edit drives the device picker presentation — grid inline for add
// so the user can scan all options, compact chip + dialog for edit so the
// (often long) effect form stays dense.
const isEdit = computed(() => !!props.efx?.id)
const showDevicePickerDialog = ref(false)
const loading = ref(false)
const selectedSoundFile = ref<string>(props.efx?.sound || '')
const showSoundDialog = ref(false)
const rules: ValidationRules = {
  required: [(val) => !!val || 'Required.']
}

// Validation for device when required
const deviceRules = computed(() => {
  if (efxTypeObj.value?.require?.includes('device')) {
    return [(val: unknown) => !!val || 'Device is required for this effect type.']
  }
  return []
})

// Validation for sound file when required
const soundFileRules = computed(() => {
  if (efxType.value === 'sound') {
    return [(val: unknown) => !!val || 'Sound file is required for sound effects.']
  }
  return []
})
const devices = getDevices()
log.debug('EffectForm initialized with:', {
  props: props.efx,
  devices,
  efxType: efxType.value,
  efxTypeObj: efxTypeObj.value
})


watch(efxType, (newType) => {
  if (newType) {
    efxTypeObj.value = getEfxType(newType)
    // Set default device if the effect type has one and no device is currently set
    if (efxTypeObj.value?.defaultDevice && !props.efx?.device) {
      device.value = efxTypeObj.value.defaultDevice
    }
  } else {
    efxTypeObj.value = undefined
  }
})

async function submit () {
  loading.value = true

  // Validate device is selected when required
  if (efxTypeObj.value?.require?.includes('device') && !device.value) {
    log.error('Device is required for this effect type')
    loading.value = false
    return
  }

  // Validate sound file is selected for sound effects
  if (efxType.value === 'sound' && !selectedSoundFile.value) {
    log.error('Sound file is required for sound effects')
    loading.value = false
    return
  }

  const newEfx: Effect = {
    name: name.value,
    type: efxType.value || '',
    color: color.value,
    tags: tags.value,
    allowGuest: allowGuest.value,
    state: false,
    id: props.efx?.id || ''
  }
  // set device
  if (efxTypeObj.value?.require?.includes('device')) {
    newEfx.device = device.value
  }
  //  set pin
  if (efxTypeObj.value?.require?.includes('pin') && pin.value) {
    newEfx.pin = parseInt(pin.value as unknown as string)
  }
  //  set macro
  if (efxType.value === 'macro') {
    newEfx.on = macroOn.value
    newEfx.off = macroOff.value
  }
  //  set ialed
  if (efxType.value === 'ialed') {
    newEfx.pin = pin.value
    newEfx.pattern = pattern.value
    newEfx.range = range.value
    newEfx.config = config.value
  }

  // set sound file for sound effects
  if (efxType.value === 'sound') {
    newEfx.sound = selectedSoundFile.value
  }

  // set wled config
  if (efxType.value === 'wled' && wledConfig.value) {
    newEfx.wled = wledConfig.value
  }

  await setEfx(props.efx?.id || '', newEfx)
  loading.value = false
  emit('close')
}

function handleMacro({on , off}: {on: MacroItem[], off: MacroItem[]}) {
  macroOn.value = on
  macroOff.value = off
}

function handleIALED(ialedEffectConfig: {
    pattern: string;
    range: string;
    config: string;
  }): void {
  pattern.value = ialedEffectConfig.pattern
  range.value = ialedEffectConfig.range
  config.value = ialedEffectConfig.config
}

function handleSoundFileSelect(soundFile: string) {
  selectedSoundFile.value = soundFile
  showSoundDialog.value = false
}
</script>
<template>
  <v-form validate-on="submit lazy" @submit.prevent="submit">

    <!-- ═══ SECTION 1: IDENTITY ═══ -->
    <div class="form-section mb-4" :style="{ '--form-accent': color }">
      <div class="form-section__header">
        <v-icon size="18" class="form-section__header-icon">mdi-label</v-icon>
        <span class="form-section__title">Identity</span>
        <v-chip v-if="efxTypeObj" size="x-small" :color="efxTypeObj.color || 'indigo'" variant="tonal" class="ml-2">
          <v-icon v-if="efxTypeObj.icon" start size="14">{{ efxTypeObj.icon }}</v-icon>
          {{ efxType }}
        </v-chip>
      </div>

      <!-- Name -->
      <div class="form-section__grid">
        <div>
          <label class="form-section__input-label">Name <span class="text-red-400">*</span></label>
          <v-text-field
            v-model="name"
            variant="outlined"
            density="compact"
            :color="color"
            :rules="rules.required"
            hide-details="auto"
            placeholder="Crossing Lights"
          />
          <div class="form-section__input-hint">Display name for this effect</div>
        </div>
      </div>

      <!-- Tags -->
      <div class="form-section__row form-section__row--block">
        <span class="form-section__row-name mb-2">Tags</span>
        <TagPicker v-model="tags" />
      </div>

      <ColorPickerRow v-model="color" :default-color="props.efx?.color ?? 'purple'" description="Theme color for this effect in the UI" />

      <!-- Guest Access toggle -->
      <div class="form-section__row">
        <div class="form-section__row-label">
          <span class="form-section__row-name">Guest Access</span>
          <span class="form-section__row-desc">Allow visitors to control this effect in the tour app</span>
        </div>
        <v-switch
          v-model="allowGuest"
          :color="color"
          hide-details
          density="compact"
        >
          <template #label>
            <v-icon :icon="allowGuest ? 'mdi-account-check' : 'mdi-account-off'" class="mr-2" />
            {{ allowGuest ? 'Enabled' : 'Disabled' }}
          </template>
        </v-switch>
      </div>
    </div>

    <!-- ═══ SECTION 2: CONFIGURATION ═══ -->
    <div class="form-section" :style="{ '--form-accent': color }">
      <div class="form-section__header">
        <v-icon size="18" class="form-section__header-icon">mdi-cog</v-icon>
        <span class="form-section__title">Configuration</span>
      </div>

      <!-- Type picker (only shown when no type is set yet) -->
      <template v-if="!efx.type">
        <div class="form-section__row form-section__row--block">
          <div class="form-section__row-label mb-2">
            <span class="form-section__row-name">Effect Type</span>
          </div>
          <v-btn-toggle v-model="efxType" divided class="flex-wrap h-auto" size="x-large">
            <v-btn
              v-for="efxOpt in efxTypes"
              :value="efxOpt.value"
              :key="efxOpt.value"
              class="min-h-48 min-w-48 border"
              :color="color"
            >
              <div class="flex flex-col">
                <v-icon v-if="efxOpt.icon" size="32" :color="efxOpt.color" class="stroke-none">{{ efxOpt.icon }}</v-icon>
                <div class="mt-4">{{ efxOpt.label }}</div>
              </div>
            </v-btn>
          </v-btn-toggle>
        </div>
      </template>

      <!-- Device selector — grid inline for add, chip + dialog for edit -->
      <template v-if="efxTypeObj?.require?.includes('device')">
        <div class="form-section__row form-section__row--block">
          <template v-if="!isEdit">
            <div class="form-section__row-label mb-2">
              <span class="form-section__row-name">Device</span>
              <span v-if="efxTypeObj?.defaultDevice" class="form-section__row-desc">
                Default: {{ efxTypeObj.defaultDevice }}
              </span>
            </div>
            <DevicePickerGrid
              v-model="device"
              :devices="(devices ?? []) as Device[]"
            />
          </template>
          <DevicePickerChip
            v-else
            :device-id="device"
            :devices="(devices ?? []) as Device[]"
            label="Device"
            :description="efxTypeObj?.defaultDevice ? `Default: ${efxTypeObj.defaultDevice}` : 'Controller device'"
            @click="showDevicePickerDialog = true"
          />
        </div>
      </template>

      <!-- Sound file selection -->
      <template v-if="efxType === 'sound'">
        <div class="form-section__row form-section__row--block">
          <div class="form-section__row-label mb-2">
            <span class="form-section__row-name">Sound File <span class="text-red-400">*</span></span>
            <span class="form-section__row-desc">Select a sound file to play when this effect is triggered</span>
          </div>

          <!-- Selected sound file display -->
          <div v-if="selectedSoundFile" class="mb-4 p-3 rounded-lg border flex items-center justify-between"
            style="background: rgba(99,102,241,0.06); border-color: rgba(99,102,241,0.2)">
            <div class="flex items-center gap-2">
              <v-icon icon="mdi-check-circle" :color="color" />
              <span class="text-sm text-white/80">{{ selectedSoundFile.split('/').pop() }}</span>
            </div>
            <v-btn size="small" variant="text" color="red" @click="selectedSoundFile = ''" title="Clear selection">
              <v-icon icon="mdi-close" />
            </v-btn>
          </div>

          <v-btn
            class="min-h-48 min-w-48 border flex"
            :color="color"
            @click="showSoundDialog = true"
          >
            <div class="relative flex flex-col justify-center items-center">
              <v-icon size="64">mdi-volume-high</v-icon>
              <div class="mt-4">{{ selectedSoundFile ? 'Change Sound File' : 'Select Sound File' }}</div>
            </div>
          </v-btn>
        </div>
      </template>

      <!-- Macro form -->
      <template v-if="efxType === 'macro'">
        <div class="form-section__row form-section__row--block">
          <MacroForm @change="handleMacro" :on="macroOn" :off="macroOff" />
        </div>
      </template>

      <!-- IALED form -->
      <template v-if="efxType === 'ialed'">
        <div class="form-section__row form-section__row--block">
          <IALEDForm
            @change="handleIALED"
            :efx="efx"
            :color="color"
            :device="device"
            v-model:pattern="pattern"
            v-model:range="range"
            v-model:config="config"
            v-model:strip="pin"
          />
          <LcdDisplay
            :content="config ? JSON.stringify(config, null, 2).split('\n') : []"
            title="CONFIG"
            color="amber"
            size="sm"
            :max-lines="10"
            class="mt-4"
          />
        </div>
      </template>

      <!-- WLED form -->
      <template v-if="efxType === 'wled'">
        <div class="form-section__row form-section__row--block">
          <WledEffectForm v-model="wledConfig" />
        </div>
      </template>

      <!-- Pin (when required, non-ialed) -->
      <template v-if="efxTypeObj?.require?.includes('pin') && efxType !== 'ialed'">
        <div class="form-section__grid" style="grid-template-columns: 160px 1fr">
          <div>
            <label class="form-section__input-label">Pin</label>
            <v-text-field
              v-model="pin"
              variant="outlined"
              density="compact"
              :color="color"
              hide-details="auto"
              placeholder="13"
            />
            <div class="form-section__input-hint">Arduino pin number</div>
          </div>
        </div>
      </template>

      <!-- Save footer -->
      <div class="form-section__footer">
        <v-btn variant="tonal" size="small" class="text-none" @click="$emit('close')">Cancel</v-btn>
        <v-btn variant="tonal" :color="color" size="small" type="submit" :loading="loading" class="text-none">Save</v-btn>
      </div>
    </div>

    <!-- Sound File Selection Dialog -->
    <v-dialog max-width="90vw" v-model="showSoundDialog">
      <v-card>
        <v-card-title class="flex items-center justify-between">
          <span>Select Sound File</span>
          <v-btn icon @click="showSoundDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <SoundFileList
            :selection-mode="true"
            :selected-sound="selectedSoundFile"
            @select="handleSoundFileSelect"
          />
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="tonal" @click="showSoundDialog = false">Cancel</v-btn>
          <v-btn :color="color" @click="showSoundDialog = false" :disabled="!selectedSoundFile">Confirm Selection</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ViewJson :json="efx" label="Efx" />
    <ViewJson :json="efxTypeObj" label="efxTypeObj" />
    <ViewJson :json="efxTypes" label="efxTypes" />
  </v-form>

  <v-dialog v-model="showDevicePickerDialog" max-width="80vw">
    <DevicePicker
      v-model="device"
      :color="color"
      @select="showDevicePickerDialog = false"
      @cancel="showDevicePickerDialog = false; device = props?.efx?.device ?? DEFAULT_DEVICE"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import {
  ARDUINO_CONFIG_DEFAULTS,
  type ArduinoAdvancedConfig,
  type Device,
} from '@repo/modules'

/**
 * 🛠️ Editable accordion that persists `device.config.arduino` to Firestore.
 *
 * Every field is optional — saving a blank field deletes the override so the
 * firmware falls back to the baked-in default. Changes don't take effect on
 * the hardware until the firmware is re-deployed (`deja deploy <id>`).
 */
interface ArduinoAdvancedConfigProps {
  device: Device | null
  color?: string
}

const props = withDefaults(defineProps<ArduinoAdvancedConfigProps>(), {
  color: 'cyan',
})

const emit = defineEmits<{
  /** Emitted with a fully-merged `ArduinoAdvancedConfig` ready to setDoc. */
  save: [config: ArduinoAdvancedConfig]
}>()

interface FormState {
  baudRate: string
  servoMin: string
  servoMax: string
  minPulseWidth: string
  maxPulseWidth: string
  usMin: string
  usMax: string
  servoFreq: string
  servoCount: string
  pwmOscillatorFreq: string
  pca9685Address: string
  sensorDebounceMs: string
  pca9685SdaPin: string
  pca9685SclPin: string
}

const emptyForm = (): FormState => ({
  baudRate: '',
  servoMin: '',
  servoMax: '',
  minPulseWidth: '',
  maxPulseWidth: '',
  usMin: '',
  usMax: '',
  servoFreq: '',
  servoCount: '',
  pwmOscillatorFreq: '',
  pca9685Address: '',
  sensorDebounceMs: '',
  pca9685SdaPin: '',
  pca9685SclPin: '',
})

const form = reactive<FormState>(emptyForm())

// 🔄 Pull saved overrides into the form when the device loads/changes.
watch(
  () => props.device?.config?.arduino,
  (adv) => {
    Object.assign(form, emptyForm())
    if (!adv) return
    if (adv.baudRate != null) form.baudRate = String(adv.baudRate)
    if (adv.servoMin != null) form.servoMin = String(adv.servoMin)
    if (adv.servoMax != null) form.servoMax = String(adv.servoMax)
    if (adv.minPulseWidth != null) form.minPulseWidth = String(adv.minPulseWidth)
    if (adv.maxPulseWidth != null) form.maxPulseWidth = String(adv.maxPulseWidth)
    if (adv.usMin != null) form.usMin = String(adv.usMin)
    if (adv.usMax != null) form.usMax = String(adv.usMax)
    if (adv.servoFreq != null) form.servoFreq = String(adv.servoFreq)
    if (adv.servoCount != null) form.servoCount = String(adv.servoCount)
    if (adv.pwmOscillatorFreq != null) form.pwmOscillatorFreq = String(adv.pwmOscillatorFreq)
    if (adv.pca9685Address != null) form.pca9685Address = `0x${adv.pca9685Address.toString(16).toUpperCase()}`
    if (adv.sensorDebounceMs != null) form.sensorDebounceMs = String(adv.sensorDebounceMs)
    if (adv.pca9685SdaPin != null) form.pca9685SdaPin = String(adv.pca9685SdaPin)
    if (adv.pca9685SclPin != null) form.pca9685SclPin = String(adv.pca9685SclPin)
  },
  { immediate: true },
)

/** Parse a decimal or 0x-prefixed hex int; blank / NaN → undefined. */
function parseIntOrUndef(val: string): number | undefined {
  const trimmed = val.trim()
  if (!trimmed) return undefined
  const parsed = /^0x/i.test(trimmed) ? parseInt(trimmed, 16) : parseInt(trimmed, 10)
  return Number.isFinite(parsed) ? parsed : undefined
}

/** Build the config object — only includes fields the user actually set. */
function buildConfig(): ArduinoAdvancedConfig {
  const out: ArduinoAdvancedConfig = {}
  const keys: (keyof ArduinoAdvancedConfig)[] = [
    'baudRate',
    'servoMin',
    'servoMax',
    'minPulseWidth',
    'maxPulseWidth',
    'usMin',
    'usMax',
    'servoFreq',
    'servoCount',
    'pwmOscillatorFreq',
    'pca9685Address',
    'sensorDebounceMs',
    'pca9685SdaPin',
    'pca9685SclPin',
  ]
  for (const k of keys) {
    const v = parseIntOrUndef(form[k])
    if (v !== undefined) (out[k] as number) = v
  }
  return out
}

const hasOverrides = computed(() =>
  Object.values(form).some((v) => v.trim() !== ''),
)

/**
 * 🔎 Resolve the value currently *running* on the device for a given field:
 * the saved override if present, otherwise the baked-in firmware default.
 * Lets users see what the firmware is actually using without flipping between
 * the placeholder (which only shows when the input is empty).
 */
function currentValueFor(key: keyof FormState): {
  value: string
  source: 'default' | 'custom'
} {
  const override = props.device?.config?.arduino?.[key as keyof ArduinoAdvancedConfig]
  if (override != null) {
    // Hex-format the I²C address for readability.
    if (key === 'pca9685Address') {
      return { value: `0x${(override as number).toString(16).toUpperCase()}`, source: 'custom' }
    }
    return { value: String(override), source: 'custom' }
  }
  // No override — use the default. Some fields have no default (I²C pins).
  const defaults = ARDUINO_CONFIG_DEFAULTS as Record<string, number | undefined>
  const def = defaults[key]
  if (def == null) {
    return { value: 'board default', source: 'default' }
  }
  if (key === 'pca9685Address') {
    return { value: `0x${def.toString(16).toUpperCase()}`, source: 'default' }
  }
  return { value: String(def), source: 'default' }
}

// ⚠️ PCA9685 SDA/SCL pins must be set as a pair — if one is set but not the
// other, warn the user so they don't end up with a config.h that silently
// falls back to the board default.
const i2cPinPairError = computed(() => {
  const hasSda = form.pca9685SdaPin.trim() !== ''
  const hasScl = form.pca9685SclPin.trim() !== ''
  if (hasSda !== hasScl) {
    return 'Set both SDA and SCL pins — a single-sided override is ignored by the firmware.'
  }
  return null
})

const canSave = computed(() => !i2cPinPairError.value)

function handleSave() {
  if (!canSave.value) return
  emit('save', buildConfig())
}

function handleReset() {
  Object.assign(form, emptyForm())
  emit('save', {})
}

// ── Field metadata for the grouped form ──────────────────────────────
interface FieldDef {
  key: keyof FormState
  label: string
  placeholder: string
  hint?: string
  format?: 'hex' | 'decimal'
}

const serialFields: FieldDef[] = [
  {
    key: 'baudRate',
    label: 'Baud rate',
    placeholder: String(ARDUINO_CONFIG_DEFAULTS.baudRate),
    hint: 'Serial.begin() rate. Must match the deja server.',
  },
]

const servoFields: FieldDef[] = [
  {
    key: 'servoMin',
    label: 'SERVOMIN',
    placeholder: String(ARDUINO_CONFIG_DEFAULTS.servoMin),
    hint: 'Minimum PCA9685 pulse length count (0–4095).',
  },
  {
    key: 'servoMax',
    label: 'SERVOMAX',
    placeholder: String(ARDUINO_CONFIG_DEFAULTS.servoMax),
    hint: 'Maximum PCA9685 pulse length count (0–4095).',
  },
  {
    key: 'minPulseWidth',
    label: 'MIN_PULSE_WIDTH',
    placeholder: String(ARDUINO_CONFIG_DEFAULTS.minPulseWidth),
    hint: 'Microsecond pulse width at 0°.',
  },
  {
    key: 'maxPulseWidth',
    label: 'MAX_PULSE_WIDTH',
    placeholder: String(ARDUINO_CONFIG_DEFAULTS.maxPulseWidth),
    hint: 'Microsecond pulse width at 180°.',
  },
  {
    key: 'usMin',
    label: 'USMIN',
    placeholder: String(ARDUINO_CONFIG_DEFAULTS.usMin),
    hint: 'Rounded minimum microsecond length (Adafruit example parity).',
  },
  {
    key: 'usMax',
    label: 'USMAX',
    placeholder: String(ARDUINO_CONFIG_DEFAULTS.usMax),
    hint: 'Rounded maximum microsecond length (Adafruit example parity).',
  },
  {
    key: 'servoFreq',
    label: 'SERVO_FREQ',
    placeholder: String(ARDUINO_CONFIG_DEFAULTS.servoFreq),
    hint: 'PWM frequency in Hz. 50 Hz for analog servos, 1600 Hz max.',
  },
  {
    key: 'servoCount',
    label: 'SERVO_COUNT',
    placeholder: String(ARDUINO_CONFIG_DEFAULTS.servoCount),
    hint: 'Number of channels on the PCA9685 (always 16 for a single board).',
  },
  {
    key: 'pwmOscillatorFreq',
    label: 'PWM oscillator freq',
    placeholder: String(ARDUINO_CONFIG_DEFAULTS.pwmOscillatorFreq),
    hint: 'PCA9685 internal oscillator trim in Hz. Leave at 27 MHz unless you’ve calibrated your board.',
  },
]

const i2cFields: FieldDef[] = [
  {
    key: 'pca9685Address',
    label: 'PCA9685 address',
    placeholder: `0x${ARDUINO_CONFIG_DEFAULTS.pca9685Address.toString(16).toUpperCase()}`,
    hint: 'I²C address (hex). Change if you have multiple PCA9685 boards or address jumpers soldered.',
    format: 'hex',
  },
  {
    key: 'pca9685SdaPin',
    label: 'Custom SDA pin',
    placeholder: 'board default',
    hint: 'Only honored on ESP32 / RP2040 boards. Classic AVR (Uno/Mega) ignores this.',
  },
  {
    key: 'pca9685SclPin',
    label: 'Custom SCL pin',
    placeholder: 'board default',
    hint: 'Only honored on ESP32 / RP2040 boards. Classic AVR (Uno/Mega) ignores this.',
  },
]

const sensorFields: FieldDef[] = [
  {
    key: 'sensorDebounceMs',
    label: 'Sensor debounce (ms)',
    placeholder: String(ARDUINO_CONFIG_DEFAULTS.sensorDebounceMs),
    hint: 'Ignore sensor state changes faster than this to filter contact bounce.',
  },
]
</script>

<template>
  <v-expansion-panels variant="accordion" class="mt-4">
    <v-expansion-panel bg-color="grey-darken-4">
      <v-expansion-panel-title>
        <v-icon icon="mdi-tune-vertical" size="small" class="mr-2" :color="color" />
        <span class="font-weight-medium">Advanced Configuration</span>
        <v-chip
          v-if="hasOverrides"
          size="x-small"
          variant="tonal"
          :color="color"
          class="ml-3"
        >
          overrides active
        </v-chip>
      </v-expansion-panel-title>

      <v-expansion-panel-text>
        <v-alert
          type="info"
          variant="tonal"
          density="compact"
          class="mb-4 text-caption"
          icon="mdi-restart"
        >
          Changes only take effect after re-deploying the firmware
          (<code>deja deploy {{ device?.id || '<device>' }}</code>). Blank fields fall back to the built-in defaults.
        </v-alert>

        <!-- Serial -->
        <div class="text-caption font-weight-bold text-grey-lighten-2 mb-2 uppercase tracking-wider">
          Serial
        </div>
        <v-row dense class="mb-2">
          <v-col v-for="field in serialFields" :key="field.key" cols="12" sm="6" md="4">
            <div class="adv-cfg-field">
              <div class="adv-cfg-field__header">
                <span class="adv-cfg-field__label">{{ field.label }}</span>
                <span
                  class="adv-cfg-field__effective"
                  :class="`adv-cfg-field__effective--${currentValueFor(field.key).source}`"
                >
                  {{ currentValueFor(field.key).value }}
                  <span class="adv-cfg-field__source">
                    {{ currentValueFor(field.key).source }}
                  </span>
                </span>
              </div>
              <v-text-field
                v-model="form[field.key]"
                :placeholder="field.placeholder"
                :hint="field.hint"
                persistent-hint
                density="compact"
                variant="outlined"
                type="number"
                hide-details="auto"
              />
            </div>
          </v-col>
        </v-row>

        <v-divider class="my-4 opacity-50" />

        <!-- Servo / PWM -->
        <div class="text-caption font-weight-bold text-grey-lighten-2 mb-2 uppercase tracking-wider">
          Servo / PWM
        </div>
        <v-row dense class="mb-2">
          <v-col v-for="field in servoFields" :key="field.key" cols="12" sm="6" md="4">
            <div class="adv-cfg-field">
              <div class="adv-cfg-field__header">
                <span class="adv-cfg-field__label">{{ field.label }}</span>
                <span
                  class="adv-cfg-field__effective"
                  :class="`adv-cfg-field__effective--${currentValueFor(field.key).source}`"
                >
                  {{ currentValueFor(field.key).value }}
                  <span class="adv-cfg-field__source">
                    {{ currentValueFor(field.key).source }}
                  </span>
                </span>
              </div>
              <v-text-field
                v-model="form[field.key]"
                :placeholder="field.placeholder"
                :hint="field.hint"
                persistent-hint
                density="compact"
                variant="outlined"
                type="number"
                hide-details="auto"
              />
            </div>
          </v-col>
        </v-row>

        <v-divider class="my-4 opacity-50" />

        <!-- PCA9685 I²C -->
        <div class="text-caption font-weight-bold text-grey-lighten-2 mb-2 uppercase tracking-wider">
          PCA9685 I²C bus
        </div>
        <v-row dense class="mb-2">
          <v-col v-for="field in i2cFields" :key="field.key" cols="12" sm="6" md="4">
            <div class="adv-cfg-field">
              <div class="adv-cfg-field__header">
                <span class="adv-cfg-field__label">{{ field.label }}</span>
                <span
                  class="adv-cfg-field__effective"
                  :class="`adv-cfg-field__effective--${currentValueFor(field.key).source}`"
                >
                  {{ currentValueFor(field.key).value }}
                  <span class="adv-cfg-field__source">
                    {{ currentValueFor(field.key).source }}
                  </span>
                </span>
              </div>
              <v-text-field
                v-model="form[field.key]"
                :placeholder="field.placeholder"
                :hint="field.hint"
                persistent-hint
                density="compact"
                variant="outlined"
                hide-details="auto"
              />
            </div>
          </v-col>
        </v-row>
        <v-alert
          v-if="i2cPinPairError"
          type="warning"
          variant="tonal"
          density="compact"
          class="mb-2 text-caption"
        >
          {{ i2cPinPairError }}
        </v-alert>

        <v-divider class="my-4 opacity-50" />

        <!-- Sensors -->
        <div class="text-caption font-weight-bold text-grey-lighten-2 mb-2 uppercase tracking-wider">
          Sensors
        </div>
        <v-row dense class="mb-2">
          <v-col v-for="field in sensorFields" :key="field.key" cols="12" sm="6" md="4">
            <div class="adv-cfg-field">
              <div class="adv-cfg-field__header">
                <span class="adv-cfg-field__label">{{ field.label }}</span>
                <span
                  class="adv-cfg-field__effective"
                  :class="`adv-cfg-field__effective--${currentValueFor(field.key).source}`"
                >
                  {{ currentValueFor(field.key).value }}
                  <span class="adv-cfg-field__source">
                    {{ currentValueFor(field.key).source }}
                  </span>
                </span>
              </div>
              <v-text-field
                v-model="form[field.key]"
                :placeholder="field.placeholder"
                :hint="field.hint"
                persistent-hint
                density="compact"
                variant="outlined"
                type="number"
                hide-details="auto"
              />
            </div>
          </v-col>
        </v-row>

        <div class="d-flex gap-2 justify-end mt-4">
          <v-btn
            variant="text"
            size="small"
            :disabled="!hasOverrides"
            @click="handleReset"
          >
            Reset to defaults
          </v-btn>
          <v-btn
            :color="color"
            variant="flat"
            size="small"
            prepend-icon="mdi-content-save"
            :disabled="!canSave"
            @click="handleSave"
          >
            Save configuration
          </v-btn>
        </div>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<style scoped>
.adv-cfg-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.adv-cfg-field__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  min-width: 0;
}

.adv-cfg-field__label {
  font-size: 0.72rem;
  font-weight: 600;
  color: rgba(226, 232, 240, 0.85);
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.adv-cfg-field__effective {
  display: inline-flex;
  align-items: baseline;
  gap: 0.35rem;
  padding: 0.15rem 0.5rem;
  border-radius: 0.4rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.7rem;
  font-weight: 700;
  border: 1px solid transparent;
  transition: border-color 150ms ease, background 150ms ease;
}

.adv-cfg-field__effective--default {
  background: rgba(148, 163, 184, 0.1);
  border-color: rgba(148, 163, 184, 0.22);
  color: rgba(226, 232, 240, 0.85);
}

.adv-cfg-field__effective--custom {
  background: rgba(56, 189, 248, 0.14);
  border-color: rgba(56, 189, 248, 0.42);
  color: rgb(186, 230, 253);
}

.adv-cfg-field__source {
  font-size: 0.58rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.65;
}
</style>

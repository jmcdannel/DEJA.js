<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useLayout } from '@repo/modules'
import { useSensors, type Sensor, sensorTypes, sensorInputTypes } from '@repo/modules/sensors'
import { createLogger } from '@repo/utils'
import { useNotification } from '@repo/ui'
import ColorPicker from '@/Common/Color/ColorPicker.vue'
import TagPicker from '@/Common/Tags/TagPicker.vue'

const log = createLogger('SensorForm')

const props = defineProps<{ sensor: Sensor | null }>()
const emit = defineEmits(['close'])

const { getDevices } = useLayout()
const { setSensor } = useSensors()
const { notify } = useNotification()

const devices = getDevices()

const editColor = ref(false)
const name = ref(props.sensor?.name ?? '')
const device = ref(props.sensor?.device ?? '')
const index = ref<number | string | undefined>(props.sensor?.index)
const pin = ref<number | string | undefined>(props.sensor?.pin)
const type = ref(props.sensor?.type ?? 'digital')
const inputType = ref(props.sensor?.inputType ?? 'normally-open')
const debounceMs = ref<number | string | undefined>(props.sensor?.debounceMs)
const cooldownMs = ref<number | string | undefined>(props.sensor?.cooldownMs)
const maxRetries = ref<number | string | undefined>(props.sensor?.maxRetries)
const retryWindowMs = ref<number | string | undefined>(props.sensor?.retryWindowMs)
const invertState = ref(Boolean(props.sensor?.invertState))
const pullup = ref(Boolean(props.sensor?.pullup))
const analogThreshold = ref<number | string | undefined>(props.sensor?.analogThreshold)
const effectId = ref(props.sensor?.effectId ?? '')
const automationId = ref(props.sensor?.automationId ?? '')
const description = ref(props.sensor?.description ?? '')
const tags = ref<string[]>(props.sensor?.tags ?? [])
const color = ref((props.sensor as Sensor & { color?: string })?.color ?? 'teal')
const loading = ref(false)
const error = ref<string | null>(null)

const deviceRules = computed(() => {
  return [(val: unknown) => !!val || 'Device is required.']
})

watch(() => props.sensor, (next) => {
  name.value = next?.name ?? ''
  device.value = next?.device ?? ''
  index.value = next?.index
  pin.value = next?.pin
  type.value = next?.type ?? 'digital'
  inputType.value = next?.inputType ?? 'normally-open'
  debounceMs.value = next?.debounceMs
  cooldownMs.value = next?.cooldownMs
  maxRetries.value = next?.maxRetries
  retryWindowMs.value = next?.retryWindowMs
  invertState.value = Boolean(next?.invertState)
  pullup.value = Boolean(next?.pullup)
  analogThreshold.value = next?.analogThreshold
  effectId.value = next?.effectId ?? ''
  automationId.value = next?.automationId ?? ''
  description.value = next?.description ?? ''
  tags.value = next?.tags ?? []
  color.value = (next as Sensor & { color?: string })?.color ?? 'teal'
}, { immediate: true })

watch(devices, (list) => {
  if (!device.value && Array.isArray(list) && list.length > 0) {
    const first = list[0]
    if (first?.id) {
      device.value = first.id
    }
  }
}, { immediate: true })

const isAnalog = computed(() => type.value === 'analog')

const sensorColor = computed(() => (props.sensor as Sensor & { color?: string })?.color ?? 'teal')

async function submit() {
  loading.value = true
  error.value = null

  if (!name.value) {
    error.value = 'Name is required.'
    loading.value = false
    return
  }

  if (!device.value) {
    error.value = 'A device is required to read the sensor.'
    loading.value = false
    return
  }

  try {
    const payload: Record<string, unknown> = {
      name: name.value,
      device: device.value,
      type: type.value,
      inputType: inputType.value,
      invertState: invertState.value,
      pullup: pullup.value,
    }
    if (index.value !== '' && index.value !== undefined) {
      payload.index = Number(index.value)
    }
    if (pin.value !== '' && pin.value !== undefined) {
      payload.pin = Number(pin.value)
    }
    if (debounceMs.value !== '' && debounceMs.value !== undefined) {
      payload.debounceMs = Number(debounceMs.value)
    }
    if (cooldownMs.value !== '' && cooldownMs.value !== undefined) {
      payload.cooldownMs = Number(cooldownMs.value)
    }
    if (maxRetries.value !== '' && maxRetries.value !== undefined) {
      payload.maxRetries = Number(maxRetries.value)
    }
    if (retryWindowMs.value !== '' && retryWindowMs.value !== undefined) {
      payload.retryWindowMs = Number(retryWindowMs.value)
    }
    if (isAnalog.value && analogThreshold.value !== '' && analogThreshold.value !== undefined) {
      payload.analogThreshold = Number(analogThreshold.value)
    }
    if (effectId.value) {
      payload.effectId = effectId.value
    }
    if (automationId.value) {
      payload.automationId = automationId.value
    }
    if (description.value) {
      payload.description = description.value
    }
    if (tags.value.length > 0) {
      payload.tags = tags.value
    }
    if (color.value) {
      payload.color = color.value
    }

    await setSensor(props.sensor?.id || '', payload as unknown as import('@repo/modules/sensors').SensorInput)
    emit('close')
  } catch (err) {
    log.error('Failed to save sensor', err)
    notify.error('Unable to save sensor.')
    error.value = 'Unable to save sensor.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-form @submit.prevent="submit">
    <!-- ═══ IDENTITY SECTION ═══ -->
    <div class="form-section mb-4" :style="{ '--form-accent': sensorColor }">
      <div class="form-section__header">
        <v-icon size="18" class="form-section__header-icon">mdi-label</v-icon>
        <span class="form-section__title">Identity</span>
      </div>

      <div class="form-section__grid" style="grid-template-columns: 1fr 120px 120px">
        <div>
          <label class="form-section__input-label">Sensor Name</label>
          <v-text-field
            v-model="name"
            variant="outlined"
            density="compact"
            color="teal"
            hide-details="auto"
            required
          />
          <div class="form-section__input-hint">Display name for this sensor</div>
        </div>
        <div>
          <label class="form-section__input-label">Index</label>
          <v-text-field
            v-model="index"
            type="number"
            variant="outlined"
            density="compact"
            color="teal"
            hide-details="auto"
          />
          <div class="form-section__input-hint">Sensor index on the device</div>
        </div>
        <div>
          <label class="form-section__input-label">Pin</label>
          <v-text-field
            v-model="pin"
            type="number"
            variant="outlined"
            density="compact"
            color="teal"
            hide-details="auto"
          />
          <div class="form-section__input-hint">GPIO pin number</div>
        </div>
      </div>

      <div class="form-section__row--block px-5 pb-4">
        <label class="form-section__input-label">Description</label>
        <v-textarea
          v-model="description"
          rows="3"
          auto-grow
          variant="outlined"
          density="compact"
          color="teal"
          hide-details="auto"
        />
      </div>

      <div class="form-section__row">
        <div class="form-section__row-label">
          <span class="form-section__row-name">Color</span>
          <span class="form-section__row-desc">Theme color for this sensor</span>
        </div>
        <div
          class="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors"
          style="border-color: rgba(var(--v-theme-on-surface), 0.08); background: rgba(var(--v-theme-on-surface), 0.03)"
          @click="editColor = true"
        >
          <div class="w-6 h-6 rounded-full border-2 border-white/12" :style="{ background: color }"></div>
          <span class="text-sm text-white/60 capitalize">{{ color }}</span>
          <v-icon size="14" class="text-white/25">mdi-chevron-right</v-icon>
        </div>
      </div>
      <v-dialog v-model="editColor" max-width="80vw">
        <ColorPicker v-model="color" @select="editColor = false" @cancel="editColor = false; color = sensorColor" />
      </v-dialog>

      <div class="form-section__row--block px-5 pb-4">
        <label class="form-section__input-label mb-2">Tags</label>
        <TagPicker v-model="tags" />
      </div>
    </div>

    <!-- ═══ CONFIGURATION SECTION ═══ -->
    <div class="form-section mb-4" :style="{ '--form-accent': sensorColor }">
      <div class="form-section__header">
        <v-icon size="18" class="form-section__header-icon">mdi-tune</v-icon>
        <span class="form-section__title">Configuration</span>
      </div>

      <div class="px-5 py-4">
        <label class="form-section__input-label">Select Device</label>
        <v-btn-toggle v-model="device" divided class="flex-wrap h-auto" size="x-large" :rules="deviceRules">
          <v-btn
            v-for="deviceOpt in devices"
            :value="deviceOpt.id"
            :key="deviceOpt.id"
            class="min-h-24 min-w-48 border"
            color="teal"
          >
            {{ deviceOpt.id }}
          </v-btn>
        </v-btn-toggle>
        <div class="form-section__input-hint">Select the hardware device that reads this sensor</div>
      </div>

      <div class="form-section__grid" style="grid-template-columns: 1fr 1fr">
        <div>
          <label class="form-section__input-label">Sensor Type</label>
          <v-select
            v-model="type"
            :items="sensorTypes"
            variant="outlined"
            density="compact"
            color="teal"
            hide-details="auto"
          />
          <div class="form-section__input-hint">Type of sensor hardware</div>
        </div>
        <div>
          <label class="form-section__input-label">Input Type</label>
          <v-select
            v-model="inputType"
            :items="sensorInputTypes"
            variant="outlined"
            density="compact"
            color="teal"
            hide-details="auto"
          />
          <div class="form-section__input-hint">Electrical input configuration</div>
        </div>
      </div>

      <div class="form-section__row--block px-5 pt-2 pb-0">
        <v-expansion-panels variant="accordion">
          <v-expansion-panel title="Timing &amp; Retries">
            <v-expansion-panel-text>
              <div class="form-section__grid" style="grid-template-columns: 1fr 1fr 1fr 1fr">
                <div>
                  <label class="form-section__input-label">Debounce (ms)</label>
                  <v-text-field
                    v-model="debounceMs"
                    type="number"
                    variant="outlined"
                    density="compact"
                    color="teal"
                    hide-details="auto"
                  />
                  <div class="form-section__input-hint">Debounce interval</div>
                </div>
                <div>
                  <label class="form-section__input-label">Cooldown (ms)</label>
                  <v-text-field
                    v-model="cooldownMs"
                    type="number"
                    variant="outlined"
                    density="compact"
                    color="teal"
                    hide-details="auto"
                  />
                  <div class="form-section__input-hint">Cooldown after activation</div>
                </div>
                <div>
                  <label class="form-section__input-label">Max Retries</label>
                  <v-text-field
                    v-model="maxRetries"
                    type="number"
                    variant="outlined"
                    density="compact"
                    color="teal"
                    hide-details="auto"
                  />
                  <div class="form-section__input-hint">Maximum retry attempts</div>
                </div>
                <div>
                  <label class="form-section__input-label">Retry Window (ms)</label>
                  <v-text-field
                    v-model="retryWindowMs"
                    type="number"
                    variant="outlined"
                    density="compact"
                    color="teal"
                    hide-details="auto"
                  />
                  <div class="form-section__input-hint">Time window for retries</div>
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>

      <div class="form-section__row">
        <div class="form-section__row-label">
          <span class="form-section__row-name">Invert State</span>
          <span class="form-section__row-desc">Swap active/inactive readings</span>
        </div>
        <v-switch v-model="invertState" color="teal" hide-details density="compact" />
      </div>

      <div class="form-section__row">
        <div class="form-section__row-label">
          <span class="form-section__row-name">Internal Pullup</span>
          <span class="form-section__row-desc">Enable internal pull-up resistor</span>
        </div>
        <v-switch v-model="pullup" color="teal" hide-details density="compact" />
      </div>

      <div v-if="isAnalog" class="form-section__grid px-5 pb-4" style="grid-template-columns: 1fr">
        <div>
          <label class="form-section__input-label">Analog Threshold</label>
          <v-text-field
            v-model="analogThreshold"
            type="number"
            variant="outlined"
            density="compact"
            color="teal"
            hide-details="auto"
          />
          <div class="form-section__input-hint">Activation threshold for analog input</div>
        </div>
      </div>

      <div class="form-section__grid" style="grid-template-columns: 1fr 1fr">
        <div>
          <label class="form-section__input-label">Linked Effect ID</label>
          <v-text-field
            v-model="effectId"
            variant="outlined"
            density="compact"
            color="teal"
            hide-details="auto"
          />
          <div class="form-section__input-hint">Effect to trigger when sensor activates</div>
        </div>
        <div>
          <label class="form-section__input-label">Linked Automation ID</label>
          <v-text-field
            v-model="automationId"
            variant="outlined"
            density="compact"
            color="teal"
            hide-details="auto"
          />
          <div class="form-section__input-hint">Automation to run when sensor activates</div>
        </div>
      </div>

      <!-- ═══ ERROR + FOOTER ═══ -->
      <v-alert
        v-if="error"
        type="error"
        class="mx-5 mb-4"
        :text="error"
      />

      <div class="form-section__footer">
        <v-btn variant="text" size="small" class="text-none" @click="emit('close')">Cancel</v-btn>
        <v-btn variant="tonal" color="teal" size="small" type="submit" :loading="loading" class="text-none">
          Save
        </v-btn>
      </div>
    </div>
  </v-form>
</template>

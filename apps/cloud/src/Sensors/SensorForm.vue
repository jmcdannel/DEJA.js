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
  <div class="p-6">
    <v-form @submit.prevent="submit">
      <v-label class="m-2 text-4xl">
        {{ sensor ? 'Edit' : 'Add'}} Sensor
      </v-label>
      <v-divider class="my-4 border-opacity-100" color="teal"></v-divider>
      <v-label class="m-2">
        Device
      </v-label>
      <v-divider class="my-4 border-opacity-100" color="teal"></v-divider>
      <v-btn-toggle v-model="device" divided class="flex-wrap h-auto" size="x-large" :rules="deviceRules">
          <v-btn v-for="deviceOpt in devices" :value="deviceOpt.id" :key="deviceOpt.id"
            class="min-h-24 min-w-48 border"
            color="teal" >
              {{ deviceOpt.id }}
          </v-btn>
      </v-btn-toggle>
      <v-divider class="my-4 border-opacity-100" color="teal"></v-divider>
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="name"
            label="Sensor name"
            required
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model="index"
            label="Index"
            type="number"
            variant="outlined"
            hint="Sensor index on the device"
          />
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model="pin"
            label="Pin"
            type="number"
            variant="outlined"
            hint="GPIO pin number"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="6">
          <v-select
            v-model="type"
            :items="sensorTypes"
            label="Sensor type"
            variant="outlined"
            hint="Type of sensor hardware"
            persistent-hint
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            v-model="inputType"
            :items="sensorInputTypes"
            label="Input type"
            variant="outlined"
            hint="Electrical input configuration"
            persistent-hint
          />
        </v-col>
      </v-row>

      <v-divider class="my-4 border-opacity-100" color="teal"></v-divider>
      <v-expansion-panels variant="accordion" class="mb-4">
        <v-expansion-panel title="Advanced Configuration">
          <v-expansion-panel-text>
            <v-row>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="debounceMs"
                  label="Debounce (ms)"
                  type="number"
                  variant="outlined"
                  hint="Debounce interval in milliseconds"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="cooldownMs"
                  label="Cooldown (ms)"
                  type="number"
                  variant="outlined"
                  hint="Cooldown period after activation"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="maxRetries"
                  label="Max retries"
                  type="number"
                  variant="outlined"
                  hint="Maximum retry attempts"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="retryWindowMs"
                  label="Retry window (ms)"
                  type="number"
                  variant="outlined"
                  hint="Time window for retries"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="4">
                <v-switch
                  v-model="invertState"
                  color="teal"
                  label="Invert state"
                  hint="Swap active/inactive readings"
                  persistent-hint
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-switch
                  v-model="pullup"
                  color="teal"
                  label="Internal pullup"
                  hint="Enable internal pull-up resistor"
                  persistent-hint
                  density="comfortable"
                />
              </v-col>
              <v-col v-if="isAnalog" cols="12" md="4">
                <v-text-field
                  v-model="analogThreshold"
                  label="Analog threshold"
                  type="number"
                  variant="outlined"
                  hint="Activation threshold for analog input"
                />
              </v-col>
            </v-row>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <v-divider class="my-4 border-opacity-100" color="teal"></v-divider>
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="effectId"
            label="Linked effect ID"
            variant="outlined"
            hint="Effect to trigger when sensor activates"
            persistent-hint
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="automationId"
            label="Linked automation ID"
            variant="outlined"
            hint="Automation to run when sensor activates"
            persistent-hint
          />
        </v-col>
      </v-row>

      <v-row class="items-center">
        <v-col cols="12" md="6">
          <v-textarea
            v-model="description"
            label="Description"
            rows="3"
            auto-grow
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" md="6">
          <!-- color -->
          <section class="h-auto my-4">
            <v-btn
              class="min-h-48 min-w-48 border flex"
              :color="color"
              @click="editColor = true" >
              <div class="relative flex flex-col justify-center items-center">
                <v-icon size="64">mdi-palette</v-icon>
                <div class="mt-4">Color [{{ color }}]</div>
              </div>
            </v-btn>
          </section>
          <v-dialog max-width="80vw" v-model="editColor">
            <ColorPicker v-model="color" @select="editColor = false" @cancel="editColor = false; color = 'teal'"></ColorPicker>
          </v-dialog>
        </v-col>
      </v-row>

      <v-divider class="my-4 border-opacity-100" color="teal"></v-divider>
      <TagPicker class="my-4" v-model="tags"></TagPicker>

      <v-alert
        v-if="error"
        type="error"
        class="mb-4"
        :text="error"
      />

      <div class="flex justify-end gap-2 mt-4">
        <v-btn variant="text" @click="emit('close')">
          Cancel
        </v-btn>
        <v-btn
          color="teal"
          type="submit"
          :loading="loading"
        >
          Save Sensor
        </v-btn>
      </div>
    </v-form>
  </div>
</template>

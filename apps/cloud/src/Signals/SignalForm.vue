<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useLayout } from '@repo/modules'
import { useSignals, type Signal } from '@repo/modules/signals'
import { createLogger } from '@repo/utils'
import { useNotification } from '@repo/ui'
import ColorPicker from '@/Common/Color/ColorPicker.vue'
import TagPicker from '@/Common/Tags/TagPicker.vue'

const log = createLogger('SignalForm')

interface ValidationRules {
  required: ((val: unknown) => boolean | string)[];
}

const props = defineProps<{ signal: Signal | null }>()
const emit = defineEmits(['close'])

const { getDevices } = useLayout()
const { setSignal } = useSignals()
const { notify } = useNotification()

const devices = getDevices()

const editColor = ref(false)
const name = ref(props.signal?.name ?? '')
const device = ref(props.signal?.device ?? '')
const red = ref<number | string | undefined>(props.signal?.red)
const yellow = ref<number | string | undefined>(props.signal?.yellow)
const green = ref<number | string | undefined>(props.signal?.green)
const aspect = ref(props.signal?.aspect ?? null)
const commonAnode = ref(Boolean(props.signal?.commonAnode))
const description = ref(props.signal?.description ?? '')
const tags = ref<string[]>(props.signal?.tags ?? [])
const loading = ref(false)
const error = ref<string | null>(null)
const color = ref('cyan')

// Validation for device when required
const deviceRules = computed(() => {
  return [(val: unknown) => !!val || 'Device is required for this effect type.']
})

watch(() => props.signal, (next) => {
  name.value = next?.name ?? ''
  device.value = next?.device ?? ''
  red.value = next?.red
  yellow.value = next?.yellow
  green.value = next?.green
  aspect.value = next?.aspect ?? null
  commonAnode.value = Boolean(next?.commonAnode)
  description.value = next?.description ?? ''
  tags.value = next?.tags ?? []
}, { immediate: true })

watch(devices, (list) => {
  if (!device.value && Array.isArray(list) && list.length > 0) {
    const first = list[0]
    if (first?.id) {
      device.value = first.id
    }
  }
}, { immediate: true })

const wiringLabel = computed(() => commonAnode.value ? 'Common Anode' : 'Common Cathode')

async function submit() {
  loading.value = true
  error.value = null

  if (!name.value) {
    error.value = 'Name is required.'
    loading.value = false
    return
  }

  if (!device.value) {
    error.value = 'A device is required to control the signal.'
    loading.value = false
    return
  }

  try {
    const payload = {
      name: name.value,
      device: device.value,
      commonAnode: commonAnode.value,
    }
    if (red.value !== '' && red.value !== undefined) {
      Object.assign(payload, { red: Number(red.value) })
    }
    if (yellow.value !== '' && yellow.value !== undefined) {
      Object.assign(payload, { yellow: Number(yellow.value) })
    }
    if (green.value !== '' && green.value !== undefined) {
      Object.assign(payload, { green: Number(green.value) })
    }
    if (aspect.value !== null) {
      Object.assign(payload, { aspect: aspect.value })
    } else {
      Object.assign(payload, { aspect: null })
    }
    if (description.value) {
      Object.assign(payload, { description: description.value })
    }
    if (tags.value.length > 0) {
      Object.assign(payload, { tags: tags.value })
    }

    await setSignal(props.signal?.id || '', payload)
    emit('close')
  } catch (err) {
    log.error('Failed to save signal', err)
    notify.error('Unable to save signal.')
    error.value = 'Unable to save signal.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-form @submit.prevent="submit" class="space-y-4">

    <!-- ═══ IDENTITY SECTION ═══ -->
    <div class="form-section" :style="{ '--form-accent': color }">
      <div class="form-section__header">
        <v-icon size="18" class="form-section__header-icon">mdi-label</v-icon>
        <span class="form-section__title">Identity</span>
      </div>

      <!-- Name + Aspect grid -->
      <div class="form-section__grid" style="grid-template-columns: 1fr 1fr">
        <div>
          <label class="form-section__input-label">Signal Name</label>
          <v-text-field
            v-model="name"
            variant="outlined"
            density="compact"
            color="emerald"
            hide-details="auto"
            placeholder="Signal A"
            required
          />
          <div class="form-section__input-hint">Display name for this signal</div>
        </div>
        <div>
          <label class="form-section__input-label">Default Aspect</label>
          <v-select
            v-model="aspect"
            :items="[
              { title: 'Off', value: null },
              { title: 'Red', value: 'red' },
              { title: 'Yellow', value: 'yellow' },
              { title: 'Green', value: 'green' },
            ]"
            variant="outlined"
            density="compact"
            color="emerald"
            hide-details="auto"
          />
          <div class="form-section__input-hint">Aspect applied when the signal is saved</div>
        </div>
      </div>

      <!-- Device row -->
      <div class="form-section__row form-section__row--block">
        <span class="form-section__row-name mb-2">Device</span>
        <v-btn-toggle v-model="device" divided class="flex-wrap h-auto" size="large" :rules="deviceRules">
          <v-btn
            v-for="deviceOpt in devices"
            :value="deviceOpt.id"
            :key="deviceOpt.id"
            class="min-h-14 min-w-36 border text-none"
            color="emerald"
          >
            {{ deviceOpt.id }}
          </v-btn>
        </v-btn-toggle>
        <div class="form-section__input-hint mt-1">Hardware device that controls this signal</div>
      </div>

      <!-- Description row -->
      <div class="form-section__row form-section__row--block">
        <label class="form-section__input-label">Description</label>
        <v-textarea
          v-model="description"
          rows="3"
          auto-grow
          variant="outlined"
          density="compact"
          color="emerald"
          hide-details="auto"
        />
        <div class="form-section__input-hint">Optional notes about this signal's location or wiring</div>
      </div>

      <!-- Color picker row -->
      <div class="form-section__row">
        <div class="form-section__row-label">
          <span class="form-section__row-name">Color</span>
          <span class="form-section__row-desc">Theme color for UI display</span>
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
        <ColorPicker v-model="color" @select="editColor = false" @cancel="editColor = false; color = props.signal?.color ?? 'emerald'" />
      </v-dialog>

      <!-- Tags row -->
      <div class="form-section__row form-section__row--block">
        <span class="form-section__row-name mb-2">Tags</span>
        <TagPicker v-model="tags" />
      </div>
    </div>

    <!-- ═══ CONFIGURATION SECTION ═══ -->
    <div class="form-section" :style="{ '--form-accent': color }">
      <div class="form-section__header">
        <v-icon size="18" class="form-section__header-icon">mdi-electric-switch</v-icon>
        <span class="form-section__title">Configuration</span>
      </div>

      <!-- Pin inputs grid -->
      <div class="form-section__grid" style="grid-template-columns: repeat(3, 1fr)">
        <div>
          <label class="form-section__input-label">Red Pin</label>
          <v-text-field
            v-model="red"
            type="number"
            variant="outlined"
            density="compact"
            color="red"
            hide-details="auto"
          >
            <template #prepend-inner>
              <v-icon icon="mdi-circle" color="red" size="16" />
            </template>
          </v-text-field>
          <div class="form-section__input-hint">Pin number for the red LED</div>
        </div>
        <div>
          <label class="form-section__input-label">Yellow Pin</label>
          <v-text-field
            v-model="yellow"
            type="number"
            variant="outlined"
            density="compact"
            color="yellow"
            hide-details="auto"
          >
            <template #prepend-inner>
              <v-icon icon="mdi-circle" color="yellow" size="16" />
            </template>
          </v-text-field>
          <div class="form-section__input-hint">Pin number for the yellow LED</div>
        </div>
        <div>
          <label class="form-section__input-label">Green Pin</label>
          <v-text-field
            v-model="green"
            type="number"
            variant="outlined"
            density="compact"
            color="green"
            hide-details="auto"
          >
            <template #prepend-inner>
              <v-icon icon="mdi-circle" color="green" size="16" />
            </template>
          </v-text-field>
          <div class="form-section__input-hint">Pin number for the green LED</div>
        </div>
      </div>

      <!-- Wiring toggle row -->
      <div class="form-section__row">
        <div class="form-section__row-label">
          <span class="form-section__row-name">Wiring Type</span>
          <span class="form-section__row-desc">{{ wiringLabel }}</span>
        </div>
        <v-switch v-model="commonAnode" color="emerald" hide-details density="compact" />
      </div>

      <!-- Error alert -->
      <v-alert
        v-if="error"
        type="error"
        class="mt-2"
        :text="error"
      />

      <!-- Footer -->
      <div class="form-section__footer">
        <v-btn variant="text" size="small" class="text-none" @click="emit('close')">Cancel</v-btn>
        <v-btn
          variant="tonal"
          color="emerald"
          size="small"
          type="submit"
          :loading="loading"
          class="text-none"
        >
          Save
        </v-btn>
      </div>
    </div>

  </v-form>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTurnouts, type Turnout } from '@repo/modules'
import { useLayout } from '@repo/modules'
// import { useEfx } from '@repo/modules/effects'
import { slugify, createLogger } from '@repo/utils'
import TurnoutTypePicker from '@/Turnouts/TurnoutTypePicker.vue'
import DevicePicker from '@/Layout/Devices/DevicePicker.vue'
import EffectPicker from '@/Effects/EffectPicker.vue'
import ColorPickerRow from '@/Common/Color/ColorPickerRow.vue'
import TagPicker from '@/Common/Tags/TagPicker.vue'
import ViewJson from '@/Core/UI/ViewJson.vue'

const log = createLogger('TurnoutForm')

interface ValidationRules {
  required: ((val: unknown) => boolean | string)[];
}

const props = defineProps<{
  turnout: Turnout | null
}>()
const emit = defineEmits(['close'])
const DEFAULT_DEVICE = 'dccex'
const DEFAULT_TYPE = 'kato'

// const { getEffects } = useEfx()
const { getDevices } = useLayout()
const { setTurnout } = useTurnouts()

const devices = getDevices()
// const effects = getEffects()

const editEffect = ref(false)
const editType = ref(false)
const editDevice = ref(false)

const name = ref(props.turnout?.name || '')
const desc = ref(props.turnout?.desc || '')
const index = ref(props.turnout?.turnoutIdx)
const effectId = ref(props.turnout?.effectId)
const device = ref(props.turnout?.device || DEFAULT_DEVICE)
const straight = ref<number | undefined>(props.turnout?.straight)
const divergent = ref<number | undefined>(props.turnout?.divergent)
const color = ref(props.turnout?.color || 'yellow')
const tags = ref<string[]>(props.turnout?.tags || [])
const turnoutType = ref(props.turnout?.type || DEFAULT_TYPE)
const loading = ref(false)
const rules: ValidationRules = {
  required: [(val: unknown) => (val === 0 || !!val) || 'Required.']
}

function autoId() {
  log.debug('autoId', name.value, device.value, index.value)
  return name.value && device.value && index.value
    ? `${slugify(name.value)}-${slugify(index.value.toString())}-${slugify(device.value)}`
    : ''
}

async function submit(e: Promise<{ valid: boolean }>): Promise<void> {
  loading.value = true
  const results = await e
  const turnoutId = props.turnout?.id || autoId()
  if (results.valid) {
    const turnout: Turnout = {
      device: device.value,
      id: turnoutId,
      name: name.value,
      desc: desc.value,
      type: turnoutType.value,
      tags: tags.value,
      state: false,
      color: color.value,
    }
    if (straight.value) {
      turnout.straight = Number(straight.value)
    }
    if (divergent.value) {
      turnout.divergent = Number(divergent.value)
    }
    if (index.value) {
      turnout.turnoutIdx = Number(index.value)
    }
    if (effectId.value) {
      turnout.effectId = effectId.value
    }
    await setTurnout(turnoutId, turnout)
    loading.value = false
    reset()
    emit('close')
  } else {
    log.debug('invalid form', results)
    loading.value = false
  }
}

function handleClose() {
  reset()
  emit('close')
}

function reset() {
  name.value = ''
  desc.value = ''
  color.value = ''
  tags.value = []
  index.value = undefined
  effectId.value = ''
  device.value = DEFAULT_DEVICE
  straight.value = undefined
  divergent.value = undefined
  turnoutType.value = DEFAULT_TYPE
}

const title = computed(() => props.turnout ? `Edit Turnout: ${props.turnout.name}` : 'Add Turnout')
</script>

<template>
  <v-form validate-on="submit lazy" @submit.prevent="submit">
    <div class="space-y-4">

      <!-- ═══ IDENTITY ═══ -->
      <div class="form-section" :style="{ '--form-accent': color }">
        <div class="form-section__header">
          <v-icon size="18" class="form-section__header-icon">mdi-tag-outline</v-icon>
          <span class="form-section__title">Identity</span>
        </div>

        <div class="form-section__grid" style="grid-template-columns: 1fr 120px">
          <div>
            <label class="form-section__input-label">Name</label>
            <v-text-field v-model="name" variant="outlined" density="compact" color="amber" :rules="rules.required" hide-details="auto" placeholder="Main Yard Lead" />
          </div>
          <div>
            <label class="form-section__input-label">Index</label>
            <v-text-field v-model="index" variant="outlined" density="compact" color="amber" :rules="rules.required" hide-details="auto" placeholder="1" type="number" />
          </div>
        </div>

        <div class="form-section__row form-section__row--block">
          <label class="form-section__input-label">Description</label>
          <v-text-field v-model="desc" variant="outlined" density="compact" color="amber" hide-details="auto" placeholder="Optional description" />
        </div>

        <!-- Color -->
        <ColorPickerRow v-model="color" :default-color="props.turnout?.color ?? 'yellow'" description="Theme color in the UI" />

        <!-- Tags -->
        <div class="form-section__row form-section__row--block">
          <span class="form-section__row-name mb-2">Tags</span>
          <TagPicker v-model="tags" />
        </div>
      </div>

      <!-- ═══ CONFIGURATION ═══ -->
      <div class="form-section" :style="{ '--form-accent': color }">
        <div class="form-section__header">
          <v-icon size="18" class="form-section__header-icon">mdi-cog-outline</v-icon>
          <span class="form-section__title">Configuration</span>
        </div>

        <div class="form-section__grid" style="grid-template-columns: 1fr 1fr">
          <div>
            <label class="form-section__input-label">Straight</label>
            <v-text-field v-model="straight" variant="outlined" density="compact" color="amber" :rules="rules.required" hide-details="auto" placeholder="0" type="number" />
            <div class="form-section__input-hint">Value for straight position</div>
          </div>
          <div>
            <label class="form-section__input-label">Divergent</label>
            <v-text-field v-model="divergent" variant="outlined" density="compact" color="amber" :rules="rules.required" hide-details="auto" placeholder="90" type="number" />
            <div class="form-section__input-hint">Value for divergent position</div>
          </div>
        </div>

        <!-- Type -->
        <div class="form-section__row">
          <div class="form-section__row-label">
            <span class="form-section__row-name">Type</span>
            <span class="form-section__row-desc">Turnout mechanism</span>
          </div>
          <div class="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border cursor-pointer" style="border-color: rgba(var(--v-theme-on-surface), 0.08); background: rgba(var(--v-theme-on-surface), 0.03)" @click="editType = true">
            <span class="text-sm text-white/60 capitalize">{{ turnoutType }}</span>
            <v-icon size="14" class="text-white/25">mdi-chevron-right</v-icon>
          </div>
        </div>

        <!-- Device -->
        <div class="form-section__row">
          <div class="form-section__row-label">
            <span class="form-section__row-name">Device</span>
            <span class="form-section__row-desc">Controller device</span>
          </div>
          <div class="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border cursor-pointer" style="border-color: rgba(var(--v-theme-on-surface), 0.08); background: rgba(var(--v-theme-on-surface), 0.03)" @click="editDevice = true">
            <span class="text-sm text-white/60">{{ device }}</span>
            <v-icon size="14" class="text-white/25">mdi-chevron-right</v-icon>
          </div>
        </div>

        <!-- Effect -->
        <div class="form-section__row">
          <div class="form-section__row-label">
            <span class="form-section__row-name">Effect</span>
            <span class="form-section__row-desc">Sound or light on throw</span>
          </div>
          <div class="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border cursor-pointer" style="border-color: rgba(var(--v-theme-on-surface), 0.08); background: rgba(var(--v-theme-on-surface), 0.03)" @click="editEffect = true">
            <span class="text-sm text-white/60 truncate max-w-[120px]">{{ effectId || 'None' }}</span>
            <v-icon size="14" class="text-white/25">mdi-chevron-right</v-icon>
          </div>
        </div>

        <div class="form-section__footer">
          <v-btn variant="tonal" size="small" class="text-none" type="button" @click="handleClose">Cancel</v-btn>
          <v-btn :loading="loading" variant="tonal" color="amber" size="small" type="submit" class="text-none">Save</v-btn>
        </div>
      </div>

    </div>
  </v-form>

  <!-- Pickers rendered as dialogs -->
  <v-dialog v-model="editType" max-width="80vw">
    <TurnoutTypePicker
      v-model="turnoutType"
      :color="color"
      @select="editType = false"
      @cancel="editType = false; turnoutType = props?.turnout?.type ?? 'kato'"
    />
  </v-dialog>

  <v-dialog v-model="editDevice" max-width="80vw">
    <DevicePicker
      v-model="device"
      :color="color"
      @select="editDevice = false"
      @cancel="editDevice = false; device = props?.turnout?.device ?? DEFAULT_DEVICE"
    />
  </v-dialog>

  <v-dialog v-model="editEffect" max-width="80vw">
    <EffectPicker
      v-model="effectId"
      :color="color"
      @select="editEffect = false"
      @cancel="editEffect = false; effectId = props?.turnout?.effectId"
    />
  </v-dialog>

  <ViewJson :json="turnout || {}" />
  <ViewJson :json="devices" />
</template>

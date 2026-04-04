<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSensors, useAutomations, sensorActionTypes, type SensorAutomation, type SensorAction } from '@repo/modules/sensors'
import { createLogger } from '@repo/utils'
import { useNotification } from '@repo/ui'

const log = createLogger('AutomationForm')

const route = useRoute()
const router = useRouter()
const { getSensors } = useSensors()
const { getAutomation, setAutomation } = useAutomations()
const { notify } = useNotification()

const sensors = getSensors()
const automationId = computed(() => route.params.automationId as string | undefined)
const isEdit = computed(() => !!automationId.value)

const triggerConditions = [
  { title: 'Activate', value: 'activate' },
  { title: 'Deactivate', value: 'deactivate' },
  { title: 'Both', value: 'both' },
]

const name = ref('')
const sensorId = ref('')
const trigger = ref('activate')
const delay = ref<number | string | undefined>(undefined)
const actions = ref<SensorAction[]>([])
const enabled = ref(true)
const loading = ref(false)
const loadingData = ref(false)
const error = ref<string | null>(null)

const sensorItems = computed(() => {
  return (sensors.value || []).map((s) => ({
    title: s.name || s.id,
    value: s.id,
  }))
})

function addAction() {
  actions.value.push({
    type: 'effect',
    id: '',
    state: true,
  })
}

function removeAction(idx: number) {
  actions.value.splice(idx, 1)
}

function showStateField(actionType: string): boolean {
  return ['effect', 'turnout', 'output', 'signal'].includes(actionType)
}

function showSpeedField(actionType: string): boolean {
  return actionType === 'throttle'
}

function showAspectField(actionType: string): boolean {
  return actionType === 'signal'
}

async function loadAutomation() {
  if (!automationId.value) return
  loadingData.value = true
  error.value = null
  try {
    const result = await getAutomation(automationId.value)
    if (result) {
      name.value = result.name ?? ''
      sensorId.value = result.sensorId ?? ''
      trigger.value = result.triggerOn ?? 'activate'
      delay.value = result.delay
      actions.value = result.actions ?? []
      enabled.value = result.enabled !== false
    } else {
      error.value = 'Automation not found.'
    }
  } catch (err) {
    log.error(err)
    notify.error('Unable to load automation.')
    error.value = 'Unable to load automation.'
  } finally {
    loadingData.value = false
  }
}

async function submit() {
  loading.value = true
  error.value = null

  if (!name.value) {
    error.value = 'Name is required.'
    loading.value = false
    return
  }

  if (!sensorId.value) {
    error.value = 'A sensor is required.'
    loading.value = false
    return
  }

  try {
    const payload: Record<string, unknown> = {
      name: name.value,
      sensorId: sensorId.value,
      trigger: trigger.value,
      actions: actions.value,
      enabled: enabled.value,
    }
    if (delay.value !== '' && delay.value !== undefined) {
      payload.delay = Number(delay.value)
    }

    await setAutomation(automationId.value || '', payload as unknown as import('@repo/modules/sensors').SensorAutomationInput)
    router.push({ name: 'Automations' })
  } catch (err) {
    log.error('Failed to save automation', err)
    notify.error('Unable to save automation.')
    error.value = 'Unable to save automation.'
  } finally {
    loading.value = false
  }
}

function handleCancel() {
  router.push({ name: 'Automations' })
}

onMounted(loadAutomation)
</script>

<template>
  <div class="animate-fade-in-up space-y-4 max-w-[800px] px-4">
    <!-- ═══ HERO HEADER ═══ -->
    <div
      class="flex items-center gap-4 p-5 rounded-[14px] border"
      style="background: linear-gradient(135deg, rgba(20,184,166,0.08), transparent); border-color: rgba(20,184,166,0.15);"
    >
      <div class="w-14 h-14 rounded-[14px] flex items-center justify-center flex-shrink-0 bg-teal-500/80">
        <v-icon size="28" color="white">mdi-access-point</v-icon>
      </div>
      <div class="flex-1 min-w-0">
        <h1 class="text-xl font-bold text-white/95 tracking-tight">{{ isEdit ? 'Edit Automation' : 'New Automation' }}</h1>
        <span class="text-xs text-white/45">Configure sensor automation rules</span>
      </div>
      <v-btn variant="outlined" size="small" class="text-none" @click="handleCancel">
        <v-icon start size="16">mdi-arrow-left</v-icon> Sensors
      </v-btn>
    </div>

    <div v-if="loadingData" class="p-6 flex justify-center">
      <v-progress-circular indeterminate color="teal" />
    </div>
    <v-alert v-else-if="error && isEdit" type="error" class="ma-4" :text="error" closable @click:close="handleCancel" />

    <v-form v-else @submit.prevent="submit">
      <!-- ═══ IDENTITY SECTION ═══ -->
      <div class="form-section mb-4" :style="{ '--form-accent': 'teal' }">
        <div class="form-section__header">
          <v-icon size="18" class="form-section__header-icon">mdi-label</v-icon>
          <span class="form-section__title">Identity</span>
        </div>

        <div class="form-section__grid" style="grid-template-columns: 1fr 1fr">
          <div>
            <label class="form-section__input-label">Automation Name</label>
            <v-text-field
              v-model="name"
              variant="outlined"
              density="compact"
              color="teal"
              hide-details="auto"
              required
            />
            <div class="form-section__input-hint">Display name for this automation</div>
          </div>
          <div>
            <label class="form-section__input-label">Sensor</label>
            <v-select
              v-model="sensorId"
              :items="sensorItems"
              variant="outlined"
              density="compact"
              color="teal"
              hide-details="auto"
            />
            <div class="form-section__input-hint">Sensor that triggers this automation</div>
          </div>
        </div>
      </div>

      <!-- ═══ TRIGGER SECTION ═══ -->
      <div class="form-section mb-4" :style="{ '--form-accent': 'teal' }">
        <div class="form-section__header">
          <v-icon size="18" class="form-section__header-icon">mdi-lightning-bolt</v-icon>
          <span class="form-section__title">Trigger</span>
        </div>

        <div class="form-section__grid" style="grid-template-columns: 1fr 1fr">
          <div>
            <label class="form-section__input-label">Trigger Condition</label>
            <v-select
              v-model="trigger"
              :items="triggerConditions"
              variant="outlined"
              density="compact"
              color="teal"
              hide-details="auto"
            />
            <div class="form-section__input-hint">When should the automation fire</div>
          </div>
          <div>
            <label class="form-section__input-label">Delay (ms)</label>
            <v-text-field
              v-model="delay"
              type="number"
              variant="outlined"
              density="compact"
              color="teal"
              hide-details="auto"
            />
            <div class="form-section__input-hint">Delay before executing actions</div>
          </div>
        </div>

        <div class="form-section__row">
          <div class="form-section__row-label">
            <span class="form-section__row-name">Enabled</span>
            <span class="form-section__row-desc">Activate or pause this automation</span>
          </div>
          <v-switch v-model="enabled" color="teal" hide-details density="compact" />
        </div>
      </div>

      <!-- ═══ ACTIONS SECTION ═══ -->
      <div class="form-section mb-4" :style="{ '--form-accent': 'teal' }">
        <div class="form-section__header">
          <v-icon size="18" class="form-section__header-icon">mdi-play-circle</v-icon>
          <span class="form-section__title">Actions</span>
          <v-btn
            color="teal"
            variant="tonal"
            prepend-icon="mdi-plus"
            size="x-small"
            class="text-none ml-auto"
            @click="addAction"
          >
            Add Action
          </v-btn>
        </div>

        <div class="px-5 pb-4">
          <v-alert
            v-if="actions.length === 0"
            type="info"
            variant="tonal"
            class="mb-2"
            text="No actions configured. Add at least one action for this automation."
          />

          <v-card
            v-for="(action, idx) in actions"
            :key="idx"
            class="mb-3 pa-4"
            variant="outlined"
            color="teal"
          >
            <div class="form-section__grid" style="grid-template-columns: auto 1fr auto auto auto">
              <div>
                <label class="form-section__input-label">Action Type</label>
                <v-select
                  v-model="action.type"
                  :items="sensorActionTypes"
                  variant="outlined"
                  density="compact"
                  color="teal"
                  hide-details="auto"
                  style="min-width: 140px"
                />
              </div>
              <div>
                <label class="form-section__input-label">Target ID</label>
                <v-text-field
                  v-model="action.id"
                  variant="outlined"
                  density="compact"
                  color="teal"
                  hide-details="auto"
                  placeholder="effect, turnout, etc."
                />
              </div>
              <div v-if="showStateField(action.type)">
                <label class="form-section__input-label">State</label>
                <v-switch v-model="action.state" color="teal" density="compact" hide-details class="mt-1" />
              </div>
              <div v-if="showSpeedField(action.type)">
                <label class="form-section__input-label">Speed</label>
                <v-text-field
                  v-model="action.speed"
                  type="number"
                  variant="outlined"
                  density="compact"
                  color="teal"
                  hide-details="auto"
                  style="min-width: 90px"
                />
              </div>
              <div v-if="showAspectField(action.type)">
                <label class="form-section__input-label">Aspect</label>
                <v-select
                  v-model="action.aspect"
                  :items="[
                    { title: 'Red', value: 'red' },
                    { title: 'Yellow', value: 'yellow' },
                    { title: 'Green', value: 'green' },
                  ]"
                  variant="outlined"
                  density="compact"
                  color="teal"
                  hide-details="auto"
                  style="min-width: 110px"
                />
              </div>
              <div class="flex items-end pb-1">
                <v-btn
                  icon="mdi-delete"
                  variant="tonal"
                  size="small"
                  color="red"
                  @click="removeAction(idx)"
                />
              </div>
            </div>
          </v-card>
        </div>
      </div>

      <!-- ═══ ERROR + FOOTER ═══ -->
      <v-alert
        v-if="error"
        type="error"
        class="mb-4"
        :text="error"
      />

      <div class="form-section" :style="{ '--form-accent': 'teal' }">
        <div class="form-section__footer">
          <v-btn variant="text" size="small" class="text-none" @click="handleCancel">Cancel</v-btn>
          <v-btn variant="tonal" color="teal" size="small" type="submit" :loading="loading" class="text-none">
            Save Automation
          </v-btn>
        </div>
      </div>
    </v-form>
  </div>
</template>

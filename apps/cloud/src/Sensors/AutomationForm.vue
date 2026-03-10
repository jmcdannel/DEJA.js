<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSensors, sensorActionTypes, type Automation, type AutomationAction } from '@repo/modules/sensors'
import { createLogger } from '@repo/utils'
import { useNotification } from '@repo/ui'
import ModuleTitle from '@/Core/UI/ModuleTitle.vue'

const log = createLogger('AutomationForm')

const route = useRoute()
const router = useRouter()
const { getSensors, getAutomation, setAutomation } = useSensors()
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
const actions = ref<AutomationAction[]>([])
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
      trigger.value = result.trigger ?? 'activate'
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

    await setAutomation(automationId.value || '', payload)
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
  <ModuleTitle menu="Sensors" color="teal" />
  <div v-if="loadingData" class="p-6 flex justify-center">
    <v-progress-circular indeterminate color="teal" />
  </div>
  <v-alert v-else-if="error && isEdit" type="error" class="ma-4" :text="error" closable @click:close="handleCancel" />
  <div v-else class="p-6">
    <v-form @submit.prevent="submit">
      <v-label class="m-2 text-4xl">
        {{ isEdit ? 'Edit' : 'Add' }} Automation
      </v-label>
      <v-divider class="my-4 border-opacity-100" color="teal"></v-divider>

      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="name"
            label="Automation name"
            required
            variant="outlined"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            v-model="sensorId"
            :items="sensorItems"
            label="Sensor"
            variant="outlined"
            hint="Sensor that triggers this automation"
            persistent-hint
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="6">
          <v-select
            v-model="trigger"
            :items="triggerConditions"
            label="Trigger condition"
            variant="outlined"
            hint="When should the automation fire"
            persistent-hint
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="delay"
            label="Delay (ms)"
            type="number"
            variant="outlined"
            hint="Delay before executing actions"
            persistent-hint
          />
        </v-col>
      </v-row>

      <v-divider class="my-4 border-opacity-100" color="teal"></v-divider>
      <div class="flex items-center justify-between mb-4">
        <v-label class="m-2 text-xl">Actions</v-label>
        <v-btn
          color="teal"
          variant="tonal"
          prepend-icon="mdi-plus"
          size="small"
          @click="addAction"
        >
          Add Action
        </v-btn>
      </div>

      <v-card
        v-for="(action, idx) in actions"
        :key="idx"
        class="mb-4 pa-4"
        variant="outlined"
        color="teal"
      >
        <v-row>
          <v-col cols="12" md="3">
            <v-select
              v-model="action.type"
              :items="sensorActionTypes"
              label="Action type"
              variant="outlined"
              density="compact"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="action.id"
              label="Target ID"
              variant="outlined"
              density="compact"
              hint="ID of the target (effect, turnout, etc.)"
            />
          </v-col>
          <v-col v-if="showStateField(action.type)" cols="12" md="2">
            <v-switch
              v-model="action.state"
              color="teal"
              label="State"
              density="compact"
            />
          </v-col>
          <v-col v-if="showSpeedField(action.type)" cols="12" md="2">
            <v-text-field
              v-model="action.speed"
              label="Speed"
              type="number"
              variant="outlined"
              density="compact"
            />
          </v-col>
          <v-col v-if="showAspectField(action.type)" cols="12" md="2">
            <v-select
              v-model="action.aspect"
              :items="[
                { title: 'Red', value: 'red' },
                { title: 'Yellow', value: 'yellow' },
                { title: 'Green', value: 'green' },
              ]"
              label="Aspect"
              variant="outlined"
              density="compact"
            />
          </v-col>
          <v-col cols="12" md="2" class="flex items-center">
            <v-btn
              icon="mdi-delete"
              variant="tonal"
              size="small"
              color="red"
              @click="removeAction(idx)"
            />
          </v-col>
        </v-row>
      </v-card>

      <v-alert
        v-if="actions.length === 0"
        type="info"
        variant="tonal"
        class="mb-4"
        text="No actions configured. Add at least one action for this automation."
      />

      <v-divider class="my-4 border-opacity-100" color="teal"></v-divider>
      <v-switch
        v-model="enabled"
        color="teal"
        label="Enabled"
        density="comfortable"
      />

      <v-alert
        v-if="error"
        type="error"
        class="mb-4"
        :text="error"
      />

      <div class="flex justify-end gap-2 mt-4">
        <v-btn variant="text" @click="handleCancel">
          Cancel
        </v-btn>
        <v-btn
          color="teal"
          type="submit"
          :loading="loading"
        >
          Save Automation
        </v-btn>
      </div>
    </v-form>
  </div>
</template>

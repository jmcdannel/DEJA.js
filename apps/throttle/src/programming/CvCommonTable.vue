<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CvProgrammingMode, CvResponse } from '@repo/modules'
import { COMMON_CVS } from '@repo/modules'

const props = defineProps<{
  mode: CvProgrammingMode
  isBusy: boolean
  isConnected: boolean
  batchProgress: number
  batchTotal: number
}>()

const emit = defineEmits<{
  read: [cv: number]
  write: [cv: number, value: number]
  batchRead: []
  factoryReset: []
}>()

const cvValues = ref<Map<number, number | null>>(new Map())
const cvStatuses = ref<Map<number, 'idle' | 'pending' | 'success' | 'error'>>(new Map())
const editingCv = ref<number | null>(null)
const editValue = ref(0)
const showResetDialog = ref(false)
const isBatchReading = ref(false)

const canRead = computed(() => props.mode === 'service' && props.isConnected && !props.isBusy)
const canWrite = computed(() => props.isConnected && !props.isBusy)

const batchPercent = computed(() =>
  props.batchTotal > 0 ? Math.round((props.batchProgress / props.batchTotal) * 100) : 0
)

const tableItems = computed(() =>
  COMMON_CVS.map((def) => ({
    ...def,
    value: cvValues.value.get(def.cv) ?? null,
    status: cvStatuses.value.get(def.cv) ?? 'idle',
  }))
)

async function handleReadSingle(cv: number) {
  cvStatuses.value.set(cv, 'pending')
  try {
    const response = await (emit('read', cv) as unknown as Promise<CvResponse>)
    if (response?.success && response.value !== undefined) {
      cvValues.value.set(cv, response.value)
      cvStatuses.value.set(cv, 'success')
    } else {
      cvStatuses.value.set(cv, 'error')
    }
  } catch {
    cvStatuses.value.set(cv, 'error')
  }
}

async function handleWriteSingle(cv: number) {
  const value = cvValues.value.get(cv)
  if (value === null || value === undefined) return
  cvStatuses.value.set(cv, 'pending')
  try {
    const response = await (emit('write', cv, value) as unknown as Promise<CvResponse>)
    cvStatuses.value.set(cv, response?.success ? 'success' : 'error')
  } catch {
    cvStatuses.value.set(cv, 'error')
  }
}

async function handleBatchRead() {
  isBatchReading.value = true
  try {
    const results = await (emit('batchRead') as unknown as Promise<Map<number, CvResponse>>)
    if (results) {
      for (const [cv, response] of results) {
        if (response.success && response.value !== undefined) {
          cvValues.value.set(cv, response.value)
          cvStatuses.value.set(cv, 'success')
        } else {
          cvStatuses.value.set(cv, 'error')
        }
      }
    }
  } finally {
    isBatchReading.value = false
  }
}

function startEdit(cv: number) {
  editingCv.value = cv
  editValue.value = cvValues.value.get(cv) ?? 0
}

function saveEdit(cv: number) {
  cvValues.value.set(cv, editValue.value)
  editingCv.value = null
}

function cancelEdit() {
  editingCv.value = null
}

async function handleFactoryReset() {
  showResetDialog.value = false
  await (emit('factoryReset') as unknown as Promise<CvResponse>)
}
</script>

<template>
  <v-card-text class="space-y-4">
    <!-- Actions bar -->
    <div class="flex items-center gap-3">
      <v-btn
        color="info"
        variant="flat"
        :disabled="!canRead || isBatchReading"
        :loading="isBatchReading"
        prepend-icon="mdi-book-open-variant"
        @click="handleBatchRead"
      >
        Read All
      </v-btn>

      <v-btn
        color="error"
        variant="outlined"
        :disabled="!canWrite || mode !== 'service'"
        prepend-icon="mdi-restore"
        @click="showResetDialog = true"
      >
        Factory Reset
      </v-btn>
    </div>

    <!-- Batch progress -->
    <v-progress-linear
      v-if="batchTotal > 0"
      :model-value="batchPercent"
      color="info"
      height="6"
      rounded
    >
      <template #default>
        <span class="text-xs">{{ batchProgress }} / {{ batchTotal }}</span>
      </template>
    </v-progress-linear>

    <!-- CV table -->
    <v-table density="comfortable" hover>
      <thead>
        <tr>
          <th>CV</th>
          <th>Name</th>
          <th>Value</th>
          <th>Status</th>
          <th class="text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in tableItems" :key="item.cv">
          <td class="font-mono">{{ item.cv }}</td>
          <td>
            <div>{{ item.name }}</div>
            <div class="text-xs text-slate-400">{{ item.description }}</div>
          </td>
          <td>
            <template v-if="editingCv === item.cv">
              <div class="flex items-center gap-2">
                <v-text-field
                  v-model.number="editValue"
                  type="number"
                  :min="item.min"
                  :max="item.max"
                  density="compact"
                  variant="outlined"
                  hide-details
                  style="max-width: 100px"
                  autofocus
                  @keyup.enter="saveEdit(item.cv)"
                  @keyup.escape="cancelEdit"
                />
                <v-btn icon size="x-small" color="success" @click="saveEdit(item.cv)">
                  <v-icon>mdi-check</v-icon>
                </v-btn>
                <v-btn icon size="x-small" @click="cancelEdit">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </div>
            </template>
            <template v-else>
              <span
                v-if="item.value !== null"
                class="font-mono cursor-pointer"
                :class="{ 'opacity-50': item.readOnly }"
                @click="!item.readOnly && startEdit(item.cv)"
              >
                {{ item.value }}
              </span>
              <span v-else class="text-slate-500">—</span>
            </template>
          </td>
          <td>
            <v-icon
              v-if="item.status === 'success'"
              color="success"
              size="small"
            >
              mdi-check-circle
            </v-icon>
            <v-icon
              v-else-if="item.status === 'error'"
              color="error"
              size="small"
            >
              mdi-alert-circle
            </v-icon>
            <v-progress-circular
              v-else-if="item.status === 'pending'"
              size="16"
              width="2"
              indeterminate
              color="info"
            />
          </td>
          <td class="text-right">
            <v-btn
              v-if="mode === 'service'"
              icon
              size="x-small"
              variant="text"
              :disabled="!canRead"
              @click="handleReadSingle(item.cv)"
            >
              <v-icon>mdi-book-open-variant</v-icon>
              <v-tooltip activator="parent">Read</v-tooltip>
            </v-btn>
            <v-btn
              v-if="!item.readOnly && item.value !== null"
              icon
              size="x-small"
              variant="text"
              :disabled="!canWrite"
              @click="handleWriteSingle(item.cv)"
            >
              <v-icon>mdi-content-save</v-icon>
              <v-tooltip activator="parent">Write</v-tooltip>
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>

    <!-- Factory Reset Dialog -->
    <v-dialog v-model="showResetDialog" max-width="400">
      <v-card>
        <v-card-title class="flex items-center gap-2">
          <v-icon color="error">mdi-alert</v-icon>
          Factory Reset
        </v-card-title>
        <v-card-text>
          This will write <strong>8</strong> to <strong>CV8</strong>, resetting the decoder to factory defaults.
          All custom CV values will be lost. This cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showResetDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" @click="handleFactoryReset">Reset Decoder</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card-text>
</template>

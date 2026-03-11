<script setup lang="ts">
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { useLayout } from '@repo/modules'

const emit = defineEmits<{
  complete: []
}>()

const { updateLayout } = useLayout()
const storedLayoutId = useStorage('@DEJA/layoutId', '')

const serverType = ref<'deja-server' | 'withrottle'>('deja-server')
const loading = ref(false)
const error = ref<string | null>(null)

async function handleSave() {
  if (!storedLayoutId.value) return
  loading.value = true
  error.value = null
  try {
    await updateLayout(storedLayoutId.value, {
      throttleConnection: { type: serverType.value }
    })
    emit('complete')
  } catch (err: unknown) {
    const fbErr = err as { message?: string }
    error.value = fbErr.message || 'Failed to update layout'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-card flat class="bg-transparent">
    <v-card-text>
      <p class="text-body-1 mb-4">
        DEJA Apps can connect to either the DEJA.js Server or another WiThrottle compatible server. 
        Don't worry, you can easily change this later in settings.
      </p>

      <v-alert v-if="error" type="error" class="mb-4" closable @click:close="error = null">
        {{ error }}
      </v-alert>

      <v-radio-group v-model="serverType" class="mb-4">
        <v-radio value="deja-server" color="primary">
          <template #label>
            <div>
              <div class="font-weight-bold">DEJA.js Server</div>
              <div class="text-caption text-medium-emphasis">Use the modern DEJA.js Server connected directly to your DCC-EX Command Station via USB.</div>
            </div>
          </template>
        </v-radio>
        <v-radio value="withrottle" color="primary" class="mt-4">
          <template #label>
            <div>
              <div class="font-weight-bold">WiThrottle Server</div>
              <div class="text-caption text-medium-emphasis">Connect to an existing WiThrottle server on your network (like DCC-EX WiFi or JMRI).</div>
            </div>
          </template>
        </v-radio>
      </v-radio-group>

      <v-btn
        @click="handleSave"
        :loading="loading"
        color="primary"
        class="mt-4"
      >
        Complete Setup
      </v-btn>
    </v-card-text>
  </v-card>
</template>

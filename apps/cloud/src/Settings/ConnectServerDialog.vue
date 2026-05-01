<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCurrentUser } from 'vuefire'
import { getIdToken } from 'firebase/auth'

const props = defineProps<{ modelValue: boolean; layoutId?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const user = useCurrentUser()

const step = ref<1 | 2>(1)
const name = ref(`${props.layoutId || 'server'}-deja`)
const customToken = ref('')
const loading = ref(false)
const errorMsg = ref('')

const apiBase = import.meta.env.VITE_INSTALL_API_BASE || 'https://install.dejajs.com'

watch(() => props.modelValue, (open) => {
  if (open) {
    step.value = 1
    name.value = `${props.layoutId || 'server'}-deja`
    customToken.value = ''
    errorMsg.value = ''
  }
})

async function generate() {
  if (!user.value) return
  loading.value = true
  errorMsg.value = ''
  try {
    const idToken = await getIdToken(user.value)
    const res = await fetch(`${apiBase}/api/cli-auth/mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ name: name.value, layoutId: props.layoutId }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error ?? `Server returned ${res.status}`)
    }
    const data = (await res.json()) as { customToken: string; serverId: string }
    customToken.value = data.customToken
    step.value = 2
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}

const installCommand = computed(() => `curl -fsSL https://install.dejajs.com | bash -s -- --token ${customToken.value}`)
const loginCommand = computed(() => `deja login --token ${customToken.value}`)

async function copyInstall() {
  await navigator.clipboard.writeText(installCommand.value)
}

async function copyLogin() {
  await navigator.clipboard.writeText(loginCommand.value)
}

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="close"
    max-width="600"
  >
    <v-card>
      <v-card-title>
        {{ step === 1 ? 'Connect a new server' : 'Run this on your server' }}
      </v-card-title>
      <v-card-text>
        <template v-if="step === 1">
          <v-text-field
            v-model="name"
            label="Server name"
            placeholder="e.g. Basement Pi"
            :counter="60"
            maxlength="60"
            autofocus
          />
          <v-alert v-if="errorMsg" type="error" variant="tonal" class="mt-2">
            {{ errorMsg }}
          </v-alert>
        </template>
        <template v-else>
          <p class="mb-2 font-weight-medium">New install? Run this on your server:</p>
          <v-textarea
            :model-value="installCommand"
            readonly
            rows="2"
            variant="outlined"
            class="font-mono mb-4"
          />
          <p class="mb-2 text-medium-emphasis text-body-2">Already installed? Just log in:</p>
          <v-textarea
            :model-value="loginCommand"
            readonly
            rows="1"
            variant="outlined"
            class="font-mono"
          />
          <v-alert type="warning" variant="tonal" class="mt-2">
            This token can't be retrieved again. If you lose it, generate a new server credential.
          </v-alert>
        </template>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <template v-if="step === 1">
          <v-btn variant="text" @click="close">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="loading"
            :disabled="!name.trim()"
            @click="generate"
          >
            Generate
          </v-btn>
        </template>
        <template v-else>
          <v-btn variant="text" @click="copyInstall">Copy install</v-btn>
          <v-btn variant="text" @click="copyLogin">Copy login</v-btn>
          <v-btn color="primary" @click="close">Done</v-btn>
        </template>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

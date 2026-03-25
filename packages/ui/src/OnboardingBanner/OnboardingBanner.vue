<script setup lang="ts">
import type { OnboardingState } from '@repo/modules'

interface Props {
  state: OnboardingState
  locoCount: number
  variant?: 'cloud' | 'throttle'
  installCommand?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'cloud',
  installCommand: 'curl -fsSL https://install.dejajs.com | bash',
})

const emit = defineEmits<{
  'add-loco': []
  'open-throttle': []
  'open-cloud-setup': []
  'dismiss': []
}>()
</script>

<template>
  <!-- State 1: Server never started — prompt to install -->
  <v-banner
    v-if="!state.serverStarted"
    lines="two"
    color="info"
    density="comfortable"
    class="text-body-2"
    icon="mdi-download"
  >
    <template #text>
      <template v-if="variant === 'cloud'">
        <strong>🚂 Install & start your server</strong> to connect your railroad.
        <span class="text-medium-emphasis ml-1">
          Run the install command on the machine connected to your CommandStation.
        </span>
      </template>
      <template v-else>
        <strong>🚂 Connect your server</strong> to start driving.
        <span class="text-medium-emphasis ml-1">
          Set up your server in DEJA Cloud to get started.
        </span>
      </template>
    </template>
    <template #actions>
      <v-btn
        v-if="variant === 'throttle'"
        variant="tonal"
        size="small"
        color="info"
        @click="emit('open-cloud-setup')"
      >
        Open Cloud Setup
      </v-btn>
    </template>
  </v-banner>

  <!-- State 2: Server started but no locos — prompt to add -->
  <v-banner
    v-else-if="locoCount === 0"
    lines="one"
    color="warning"
    density="comfortable"
    class="text-body-2"
    icon="mdi-train"
  >
    <template #text>
      <strong>Add your first locomotive</strong> to get started.
      <span class="text-medium-emphasis ml-1">
        You just need a DCC address and a name.
      </span>
    </template>
    <template #actions>
      <v-btn
        variant="tonal"
        size="small"
        color="warning"
        @click="emit('add-loco')"
      >
        Add Loco
      </v-btn>
    </template>
  </v-banner>

  <!-- State 3: Server started + locos exist — ready to drive! -->
  <v-banner
    v-else-if="variant === 'cloud'"
    lines="one"
    color="success"
    density="comfortable"
    class="text-body-2"
    icon="mdi-check-circle"
  >
    <template #text>
      🎉 <strong>Your railroad is ready!</strong> Open the Throttle to start driving.
    </template>
    <template #actions>
      <v-btn
        variant="tonal"
        size="small"
        color="success"
        @click="emit('open-throttle')"
      >
        Open Throttle
      </v-btn>
      <v-btn
        variant="text"
        size="small"
        @click="emit('dismiss')"
      >
        Dismiss
      </v-btn>
    </template>
  </v-banner>
</template>

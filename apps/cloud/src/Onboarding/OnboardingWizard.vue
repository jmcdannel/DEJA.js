<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import WelcomeStep from './steps/WelcomeStep.vue'
import LayoutStep from './steps/LayoutStep.vue'
import ServerStep from './steps/ServerStep.vue'

const router = useRouter()
const currentStep = ref(1)

function handleLayoutComplete() {
  currentStep.value = 3
}

function handleServerComplete() {
  router.push({ name: 'pending-approval' })
}
</script>

<template>
  <v-container class="max-w-3xl mx-auto py-8">
    <v-stepper-vertical v-model="currentStep">
      <v-stepper-vertical-item title="Welcome" :value="1">
        <WelcomeStep />
        <template #actions="{ next }">
          <v-btn color="primary" @click="next">Get Started</v-btn>
        </template>
      </v-stepper-vertical-item>

      <v-stepper-vertical-item title="Create Your Layout" :value="2">
        <LayoutStep @complete="handleLayoutComplete" />
      </v-stepper-vertical-item>

      <v-stepper-vertical-item title="Server Preference" :value="3">
        <ServerStep @complete="handleServerComplete" />
      </v-stepper-vertical-item>
    </v-stepper-vertical>
  </v-container>
</template>

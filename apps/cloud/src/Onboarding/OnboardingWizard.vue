<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCurrentUser } from 'vuefire'
import { useUserProfile } from '@repo/modules'
import WelcomeStep from './steps/WelcomeStep.vue'
import LayoutStep from './steps/LayoutStep.vue'
import EnvironmentStep from './steps/EnvironmentStep.vue'
import CompletionStep from './steps/CompletionStep.vue'

const router = useRouter()
const user = useCurrentUser()
const { markOnboardingComplete } = useUserProfile()
const currentStep = ref(1)

async function handleComplete() {
  if (user.value) {
    await markOnboardingComplete(user.value.uid)
  }
  router.push({ name: 'home' })
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
        <LayoutStep />
        <template #actions="{ next, prev }">
          <v-btn variant="text" @click="prev">Back</v-btn>
          <v-btn color="primary" @click="next">Continue</v-btn>
        </template>
      </v-stepper-vertical-item>

      <v-stepper-vertical-item title="Environment Setup" :value="3">
        <EnvironmentStep />
        <template #actions="{ next, prev }">
          <v-btn variant="text" @click="prev">Back</v-btn>
          <v-btn color="primary" @click="next">Continue</v-btn>
        </template>
      </v-stepper-vertical-item>

      <v-stepper-vertical-item title="You're All Set!" :value="4">
        <CompletionStep />
        <template #actions="{ prev }">
          <v-btn variant="text" @click="prev">Back</v-btn>
          <v-btn color="primary" @click="handleComplete">Go to Dashboard</v-btn>
        </template>
      </v-stepper-vertical-item>
    </v-stepper-vertical>
  </v-container>
</template>

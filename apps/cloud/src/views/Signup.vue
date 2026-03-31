<script setup lang="ts">
import { Signup } from '@repo/auth'
import { useRouter } from 'vue-router'

const router = useRouter()

const steps = [
  { value: 0, title: 'Create Account', icon: 'mdi-account-plus-outline' },
  { value: 1, title: 'Name Layout', icon: 'mdi-map-marker-path' },
  { value: 2, title: 'Choose Plan', icon: 'mdi-tag-outline' },
  { value: 3, title: 'Install', icon: 'mdi-download-outline' },
]

function handleSignup() {
  router.push({ name: 'onboarding' })
}

function handleNavigateLogin() {
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="fill-height">
    <div class="stepper-container mx-auto pt-8 mb-0">
      <div class="stepper-track">
        <div
          v-for="(step, i) in steps"
          :key="step.value"
          class="stepper-step"
          :class="{
            'stepper-step--active': step.value === 0,
            'stepper-step--pending': step.value > 0,
          }"
        >
          <div class="stepper-icon">
            <v-icon :size="20">{{ step.icon }}</v-icon>
          </div>
          <span class="stepper-label">{{ step.title }}</span>
          <div v-if="i < steps.length - 1" class="stepper-connector" />
        </div>
      </div>
    </div>
    <Signup @signup="handleSignup" @navigate-login="handleNavigateLogin" />
  </div>
</template>

<style scoped>
.stepper-container {
  max-width: 640px;
  padding-bottom: 0;
}
.stepper-track {
  display: flex;
  align-items: flex-start;
  justify-content: center;
}
.stepper-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
  min-width: 0;
}
.stepper-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.6);
  color: rgba(148, 163, 184, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
}
.stepper-label {
  margin-top: 8px;
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(148, 163, 184, 0.4);
  text-align: center;
  white-space: nowrap;
}
.stepper-connector {
  position: absolute;
  top: 22px;
  left: calc(50% + 26px);
  right: calc(-50% + 26px);
  height: 2px;
  background: rgba(148, 163, 184, 0.15);
  z-index: 1;
}
.stepper-step--active .stepper-icon {
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.2);
  color: #e0f2fe;
  box-shadow: 0 0 20px rgba(56, 189, 248, 0.4), 0 0 8px rgba(56, 189, 248, 0.3);
  animation: step-pulse 2s ease-in-out infinite;
}
.stepper-step--active .stepper-label {
  color: #e0f2fe;
  font-weight: 600;
}
.stepper-step--pending .stepper-icon {
  border-color: rgba(148, 163, 184, 0.25);
  background: rgba(15, 23, 42, 0.5);
  color: rgba(148, 163, 184, 0.5);
}
.stepper-step--pending .stepper-label {
  color: rgba(148, 163, 184, 0.5);
}
@keyframes step-pulse {
  0%, 100% {
    box-shadow: 0 0 16px rgba(56, 189, 248, 0.3), 0 0 6px rgba(56, 189, 248, 0.2);
  }
  50% {
    box-shadow: 0 0 24px rgba(56, 189, 248, 0.5), 0 0 10px rgba(56, 189, 248, 0.35);
  }
}
</style>
